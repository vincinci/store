import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

// MTN MOMO API Configuration
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

async function initiatePayment(phoneNumber: string, amount: number, orderId: string) {
  const accessToken = await getAccessToken();
  const externalId = \`order_\${orderId}_\${Date.now()}\`;

  const response = await fetch(\`\${MOMO_API_URL}/collection/v1_0/requesttopay\`, {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${accessToken}\`,
      "X-Reference-Id": externalId,
      "X-Target-Environment": "sandbox",
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": API_KEY!,
    },
    body: JSON.stringify({
      amount: amount.toString(),
      currency: "RWF",
      externalId,
      payer: {
        partyIdType: "MSISDN",
        partyId: phoneNumber,
      },
      payerMessage: "Payment for order " + orderId,
      payeeNote: "MTN Store payment",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to initiate payment");
  }

  return externalId;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderId, phoneNumber, amount } = await request.json();

    if (!orderId || !phoneNumber || !amount) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Validate order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Format phone number (remove leading zero if present)
    const formattedPhone = phoneNumber.startsWith("0")
      ? "25" + phoneNumber.slice(1)
      : phoneNumber;

    // Initiate MTN MOMO payment
    const transactionId = await initiatePayment(
      formattedPhone,
      amount,
      orderId
    );

    // Update order with transaction ID
    order.momoTransactionId = transactionId;
    await order.save();

    return NextResponse.json({ transactionId });
  } catch (error: any) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { message: error.message || "Payment initiation failed" },
      { status: 500 }
    );
  }
}
