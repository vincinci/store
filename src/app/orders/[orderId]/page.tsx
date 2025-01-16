"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

interface OrderDetails {
  _id: string;
  items: {
    product: {
      _id: string;
      name: string;
      image: string;
      price: number;
    };
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  momoTransactionId?: string;
}

interface OrderDetailsPageProps {
  params: {
    orderId: string;
  };
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { data: session } = useSession();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchOrderDetails();
    }
  }, [session, params.orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(\`/api/orders/\${params.orderId}\`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch order details");
      }

      setOrder(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-500">Order not found</p>
          <Link
            href="/orders"
            className="text-primary hover:text-primary/90 mt-4 inline-block"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/orders"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Back to Orders
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Order #{order._id.slice(-8)}
                </h1>
                <p className="text-gray-500">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <span
                  className={\`px-3 py-1 text-sm font-medium rounded-full \${getStatusColor(
                    order.paymentStatus
                  )}\`}
                >
                  {order.paymentStatus}
                </span>
                <span
                  className={\`px-3 py-1 text-sm font-medium rounded-full \${getStatusColor(
                    order.orderStatus
                  )}\`}
                >
                  {order.orderStatus}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 py-6">
              <h2 className="text-lg font-medium mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex items-center space-x-4"
                  >
                    <div className="relative h-20 w-20">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-gray-500">Quantity: {item.quantity}</p>
                      <p className="text-gray-500">
                        Price: RWF {item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        RWF {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 py-6">
              <h2 className="text-lg font-medium mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>RWF {order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>RWF {order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {order.momoTransactionId && (
              <div className="border-t border-gray-200 py-6">
                <h2 className="text-lg font-medium mb-4">Payment Details</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Method</span>
                    <span>MTN Mobile Money</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transaction ID</span>
                    <span>{order.momoTransactionId}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 py-6">
              <h2 className="text-lg font-medium mb-4">Customer Details</h2>
              <div className="space-y-2">
                <p>
                  <span className="text-gray-500">Name:</span> {order.user.name}
                </p>
                <p>
                  <span className="text-gray-500">Email:</span> {order.user.email}
                </p>
                <p>
                  <span className="text-gray-500">Phone:</span>{" "}
                  {order.user.phoneNumber}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
