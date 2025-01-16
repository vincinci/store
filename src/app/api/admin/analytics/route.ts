import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";

function getDateRange(range: string) {
  const now = new Date();
  const start = new Date();

  switch (range) {
    case "7days":
      start.setDate(now.getDate() - 7);
      break;
    case "30days":
      start.setDate(now.getDate() - 30);
      break;
    case "90days":
      start.setDate(now.getDate() - 90);
      break;
    case "year":
      start.setFullYear(now.getFullYear(), 0, 1);
      break;
    default:
      start.setDate(now.getDate() - 7);
  }

  return { start, end: now };
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7days";
    const { start, end } = getDateRange(range);

    await connectDB();

    // Get sales over time
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          paymentStatus: "completed",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get top products
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          paymentStatus: "completed",
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get revenue by category
    const revenueByCategory = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          paymentStatus: "completed",
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Get customer stats
    const [customerStats] = await User.aggregate([
      {
        $facet: {
          total: [
            { $match: { role: "user" } },
            { $count: "count" },
          ],
          new: [
            {
              $match: {
                role: "user",
                createdAt: { $gte: start, $lte: end },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);

    const [orderStats] = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          paymentStatus: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          uniqueCustomers: { $addToSet: "$user" },
        },
      },
    ]);

    return NextResponse.json({
      salesOverTime: {
        labels: salesData.map((item) => item._id),
        data: salesData.map((item) => item.total),
      },
      topProducts: {
        labels: topProducts.map((item) => item.product.name),
        data: topProducts.map((item) => item.totalSold),
      },
      ordersByStatus: {
        labels: ordersByStatus.map((item) => item._id),
        data: ordersByStatus.map((item) => item.count),
      },
      revenueByCategory: {
        labels: revenueByCategory.map((item) => item._id),
        data: revenueByCategory.map((item) => item.revenue),
      },
      customerStats: {
        totalCustomers: customerStats.total[0]?.count || 0,
        newCustomers: customerStats.new[0]?.count || 0,
        returningCustomers: orderStats
          ? orderStats.uniqueCustomers.length
          : 0,
        averageOrderValue: orderStats
          ? Math.round(orderStats.totalRevenue / orderStats.totalOrders)
          : 0,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { message: "Error fetching analytics" },
      { status: 500 }
    );
  }
}
