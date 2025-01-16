import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const order = await Order.findById(params.orderId)
      .populate("user", "name email phoneNumber")
      .populate("items.product", "name price image")
      .lean();

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { message: "Error fetching order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderStatus } = await request.json();

    if (!orderStatus) {
      return NextResponse.json(
        { message: "Order status is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findById(params.orderId);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Only allow updating order status if payment is completed
    if (order.paymentStatus !== "completed") {
      return NextResponse.json(
        { message: "Cannot update status of unpaid order" },
        { status: 400 }
      );
    }

    order.orderStatus = orderStatus;
    await order.save();

    return NextResponse.json({ message: "Order updated successfully" });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json(
      { message: "Error updating order" },
      { status: 500 }
    );
  }
}
