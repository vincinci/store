import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get total orders and revenue
    const [totalOrders, totalRevenue] = await Order.aggregate([
      {
        $match: {
          paymentStatus: "completed",
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]).exec();

    // Get total customers (excluding admins)
    const totalCustomers = await User.countDocuments({ role: "user" });

    // Get total products
    const totalProducts = await Product.countDocuments();

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .lean();

    return NextResponse.json({
      totalOrders: totalOrders?.[0]?.count || 0,
      totalRevenue: totalRevenue?.[0]?.revenue || 0,
      totalCustomers,
      totalProducts,
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { message: "Error fetching dashboard stats" },
      { status: 500 }
    );
  }
}
