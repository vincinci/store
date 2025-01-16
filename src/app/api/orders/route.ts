import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    await connectDB();

    const query: any = { user: session.user.id };
    if (status) {
      query.orderStatus = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("items.product", "name image price")
        .lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      orders,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { message: "Error fetching orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { items, totalAmount } = await request.json();

    if (!items?.length || !totalAmount) {
      return NextResponse.json(
        { message: "Invalid order data" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify product availability and prices
    const productIds = items.map((item: any) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { message: \`Product \${item.productId} not found\` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { message: \`Insufficient stock for \${product.name}\` },
          { status: 400 }
        );
      }
      if (product.price !== item.price) {
        return NextResponse.json(
          { message: "Product price has changed" },
          { status: 400 }
        );
      }
    }

    // Create order
    const order = await Order.create({
      user: session.user.id,
      items: items.map((item: any) => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    // Update product stock
    await Promise.all(
      items.map((item: any) =>
        Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        })
      )
    );

    return NextResponse.json(
      { message: "Order created successfully", orderId: order._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { message: "Error creating order" },
      { status: 500 }
    );
  }
}
