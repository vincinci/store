"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store/cart";
import { toast } from "react-hot-toast";

interface CheckoutPageProps {
  params: {
    orderId: string;
  };
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const router = useRouter();
  const clearCart = useCart((state) => state.clearCart);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [params.orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(\`/api/orders/\${params.orderId}\`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch order");
      }

      setOrder(data);
    } catch (error) {
      toast.error("Failed to fetch order details");
      router.push("/cart");
    } finally {
      setLoading(false);
    }
  };

  const initiateMomoPayment = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payments/momo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: params.orderId,
          phoneNumber,
          amount: order.totalAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment initiation failed");
      }

      // Start polling for payment status
      startPolling(data.transactionId);
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  const startPolling = async (transactionId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          \`/api/payments/status?transactionId=\${transactionId}\`
        );
        const data = await response.json();

        if (data.status === "SUCCESSFUL") {
          clearInterval(pollInterval);
          setPaymentStatus("completed");
          clearCart();
          toast.success("Payment successful!");
          router.push(\`/orders/\${params.orderId}\`);
        } else if (data.status === "FAILED") {
          clearInterval(pollInterval);
          setPaymentStatus("failed");
          setLoading(false);
          toast.error("Payment failed. Please try again.");
        }
      } catch (error) {
        clearInterval(pollInterval);
        setLoading(false);
        toast.error("Failed to check payment status");
      }
    }, 5000); // Poll every 5 seconds

    // Clear interval after 2 minutes (timeout)
    setTimeout(() => {
      clearInterval(pollInterval);
      if (paymentStatus === "pending") {
        setPaymentStatus("failed");
        setLoading(false);
        toast.error("Payment timeout. Please try again.");
      }
    }, 120000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Checkout</h1>
          <div className="mb-6">
            <p className="text-gray-600 mb-2">Order Total:</p>
            <p className="text-2xl font-bold text-primary">
              RWF {order?.totalAmount?.toLocaleString()}
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              MTN Mobile Money Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g., 078XXXXXXX"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading || paymentStatus !== "pending"}
            />
          </div>

          <button
            onClick={initiateMomoPayment}
            disabled={loading || !phoneNumber || paymentStatus !== "pending"}
            className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading
              ? "Processing Payment..."
              : paymentStatus === "completed"
              ? "Payment Successful"
              : paymentStatus === "failed"
              ? "Payment Failed"
              : "Pay with MTN Mobile Money"}
          </button>

          {paymentStatus === "pending" && loading && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Please check your phone for the payment prompt
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
