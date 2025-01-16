"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Analytics {
  salesOverTime: {
    labels: string[];
    data: number[];
  };
  topProducts: {
    labels: string[];
    data: number[];
  };
  ordersByStatus: {
    labels: string[];
    data: number[];
  };
  revenueByCategory: {
    labels: string[];
    data: number[];
  };
  customerStats: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    averageOrderValue: number;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7days");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(\`/api/admin/analytics?range=\${timeRange}\`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch analytics");
      }

      setAnalytics(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="animate-pulse space-y-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow p-6 space-y-4"
          >
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {analytics.customerStats.totalCustomers}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">New Customers</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            +{analytics.customerStats.newCustomers}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Returning Customers
          </h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {analytics.customerStats.returningCustomers}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Average Order Value
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            RWF {analytics.customerStats.averageOrderValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Sales Over Time */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Sales Over Time</h2>
        <div className="h-80">
          <Line
            data={{
              labels: analytics.salesOverTime.labels,
              datasets: [
                {
                  label: "Sales",
                  data: analytics.salesOverTime.data,
                  borderColor: "rgb(59, 130, 246)",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top" as const,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Top Products</h2>
          <div className="h-80">
            <Bar
              data={{
                labels: analytics.topProducts.labels,
                datasets: [
                  {
                    label: "Sales",
                    data: analytics.topProducts.data,
                    backgroundColor: "rgb(59, 130, 246)",
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Revenue by Category</h2>
          <div className="h-80">
            <Doughnut
              data={{
                labels: analytics.revenueByCategory.labels,
                datasets: [
                  {
                    data: analytics.revenueByCategory.data,
                    backgroundColor: [
                      "rgb(59, 130, 246)",
                      "rgb(16, 185, 129)",
                      "rgb(245, 158, 11)",
                      "rgb(239, 68, 68)",
                      "rgb(139, 92, 246)",
                    ],
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "right" as const,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Orders by Status</h2>
          <div className="h-80">
            <Bar
              data={{
                labels: analytics.ordersByStatus.labels,
                datasets: [
                  {
                    label: "Orders",
                    data: analytics.ordersByStatus.data,
                    backgroundColor: [
                      "rgb(245, 158, 11)",
                      "rgb(59, 130, 246)",
                      "rgb(139, 92, 246)",
                      "rgb(16, 185, 129)",
                      "rgb(239, 68, 68)",
                    ],
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
