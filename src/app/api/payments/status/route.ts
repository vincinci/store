import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

const MOMO_API_URL = process.env.MTN_MOMO_API_URL || "https://sandbox.momodeveloper.mtn.com";
const API_KEY = process.env.MTN_MOMO_API_KEY;
const USER_ID = process.env.MTN_MOMO_USER_ID;
const API_SECRET = process.env.MTN_MOMO_API_SECRET;

async function getAccessToken() {
  const auth = Buffer.from(\`\${USER_ID}:\${API_SECRET}\`).toString("base64");
  
  const response = await fetch(\`\${MOMO_API_URL}/collection/token/\`, {
    method: "POST",
    headers: {
      "Authorization": \`Basic \${auth}\`,
      "Ocp-Apim-Subscription-Key": API_KEY!,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get access token");
  }

  const data = await response.json();
  return data.access_token;
}

async function checkPaymentStatus(transactionId: string) {
  const accessToken = await getAccessToken();

  const response = await fetch(
    \`\${MOMO_API_URL}/collection/v1_0/requesttopay/\${transactionId}\`,
    {
      method: "GET",
      headers: {
        "Authorization": \`Bearer \${accessToken}\`,
        "X-Target-Environment": "sandbox",
        "Ocp-Apim-Subscription-Key": API_KEY!,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to check payment status");
  }

  const data = await response.json();
  return data.status;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json(
        { message: "Transaction ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find order by transaction ID
    const order = await Order.findOne({ momoTransactionId: transactionId });
    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Check payment status from MTN MOMO API
    const status = await checkPaymentStatus(transactionId);

    // Update order status if payment is successful
    if (status === "SUCCESSFUL" && order.paymentStatus !== "completed") {
      order.paymentStatus = "completed";
      order.orderStatus = "processing";
      await order.save();
    } else if (status === "FAILED" && order.paymentStatus !== "failed") {
      order.paymentStatus = "failed";
      await order.save();
    }

    return NextResponse.json({ status });
  } catch (error: any) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to check payment status" },
      { status: 500 }
    );
  }
}
