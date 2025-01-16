import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");

    await connectDB();

    const query: any = { role: "user" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    // Get users with order statistics
    const [users, total] = await Promise.all([
      User.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "user",
            as: "orders",
          },
        },
        {
          $addFields: {
            ordersCount: { $size: "$orders" },
            totalSpent: {
              $sum: {
                $filter: {
                  input: "$orders.totalAmount",
                  as: "amount",
                  cond: { $eq: ["$$amount.paymentStatus", "completed"] },
                },
              },
            },
          },
        },
        {
          $project: {
            password: 0,
            orders: 0,
          },
        },
        { $skip: skip },
        { $limit: limit },
        { $sort: { createdAt: -1 } },
      ]),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      customers: users,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Customers fetch error:", error);
    return NextResponse.json(
      { message: "Error fetching customers" },
      { status: 500 }
    );
  }
}
