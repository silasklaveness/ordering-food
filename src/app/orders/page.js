// OrdersPage.js

"use client";

import { useEffect, useState } from "react";
import UserTabs from "@/components/layout/UserTabs";
import { UseProfile } from "@/components/UseProfile";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ClipboardList,
  Eye,
  Truck,
  Store,
  Calendar,
  CheckCircle,
  Filter,
  Grid,
  List,
  Maximize,
  Minimize,
} from "lucide-react";
import { dbTimeForHuman } from "@/libs/datetime";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Select } from "@/components/ui/select"; // Import your Select component
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const { loading, data: profile } = UseProfile();
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [isDateRange, setIsDateRange] = useState(false);

  // New state variables for admin functionality
  const [showUnpaid, setShowUnpaid] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // "table" or "card"
  const [isFullScreen, setIsFullScreen] = useState(false);

  // New state for selected restaurant and list of restaurants
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    // Fetch the list of restaurants
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then((data) => setRestaurants(data))
      .catch((error) => {
        console.error("Error fetching restaurants:", error);
        toast.error("Failed to load restaurants");
      });
  }, []);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    startDate,
    endDate,
    isDateRange,
    showUnpaid,
    showDone,
    viewMode,
    selectedRestaurant,
  ]);

  /**
   * Fetch orders based on filters (showDone, showUnpaid, date range, selectedRestaurant).
   */
  async function fetchOrders() {
    setLoadingOrders(true);

    const queryParams = new URLSearchParams();
    if (startDate) {
      queryParams.append("startDate", new Date(startDate).toISOString());
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      queryParams.append("endDate", end.toISOString());
    }

    // Filter by "done" status if showDone is true
    if (showDone) {
      queryParams.append("status", "done");
    } else {
      // Filter by paid/unpaid if not showing done orders
      queryParams.append("status", "pending");
      if (!showUnpaid) {
        queryParams.append("paid", true); // Show paid orders
      } else {
        queryParams.append("paid", false); // Show unpaid orders
      }
    }

    // Filter by selected restaurant if any
    if (selectedRestaurant) {
      queryParams.append("restaurant", selectedRestaurant);
    }

    try {
      const res = await fetch(`/api/orders?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }
      const fetchedOrders = await res.json();

      const sortedOrders = fetchedOrders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  }

  /**
   * Mark order as done (admin only).
   */
  async function markOrderAsDone(orderId) {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status: "done" }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update order");
      }

      const data = await res.json();
      toast.success("Order marked as done");

      // Update the local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: "done" } : order
        )
      );
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update order");
    }
  }

  function toggleFullScreen() {
    setIsFullScreen((prev) => !prev);
  }

  function toggleShowDone() {
    setShowDone((prev) => !prev);
    // Optionally, reset showUnpaid when toggling showDone
    if (!showDone) {
      setShowUnpaid(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col min-h-screen ${
        isFullScreen ? "fixed inset-0 bg-white z-50 overflow-auto" : ""
      }`}
    >
      <div className="flex-grow flex flex-col md:flex-row">
        <div
          className={`md:w-64 md:flex-shrink-0 ${isFullScreen ? "hidden" : ""}`}
        >
          <UserTabs isAdmin={profile.admin} />
        </div>
        <main
          className={`flex-grow p-4 md:p-6 lg:p-8 overflow-x-hidden ${
            isFullScreen ? "w-full" : ""
          }`}
        >
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <ClipboardList className="w-6 h-6" />
                  Orders
                  {profile.admin && (
                    <Button
                      onClick={toggleFullScreen}
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                    >
                      {isFullScreen ? (
                        <Minimize className="w-4 h-4" />
                      ) : (
                        <Maximize className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Date Selection */}
                <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4 items-start mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setEndDate(e.target.value);
                      }}
                      className="mt-1"
                    />
                  </div>
                  {isDateRange && profile.admin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                  {profile.admin && (
                    <Button
                      onClick={() => setIsDateRange(!isDateRange)}
                      variant="secondary"
                    >
                      {isDateRange ? "Select Single Date" : "Select Date Range"}
                    </Button>
                  )}
                  {/* Restaurant Selector */}
                  {profile.admin && (
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700">
                        Restaurant
                      </label>
                      <select
                        value={selectedRestaurant}
                        onChange={(e) => setSelectedRestaurant(e.target.value)}
                        className="mt-1 border-gray-300 focus:ring-primary focus:border-primary rounded-md shadow-sm"
                      >
                        <option value="">All Restaurants</option>
                        {restaurants.map((restaurant) => (
                          <option key={restaurant._id} value={restaurant.name}>
                            {restaurant.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Filters and View Toggles */}
                {profile.admin && (
                  <div className="flex flex-wrap justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      {!showDone && (
                        <Button
                          onClick={() => setShowUnpaid(!showUnpaid)}
                          variant={showUnpaid ? "default" : "outline"}
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Filter className="w-4 h-4" />
                          <span>
                            {showUnpaid ? "Show Paid" : "Show Unpaid"}
                          </span>
                        </Button>
                      )}
                      <Button
                        onClick={toggleShowDone}
                        variant={showDone ? "default" : "outline"}
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{showDone ? "Hide Done" : "Show Done"}</span>
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => setViewMode("table")}
                        variant={viewMode === "table" ? "default" : "outline"}
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <List className="w-4 h-4" />
                        <span>Table View</span>
                      </Button>
                      <Button
                        onClick={() => setViewMode("card")}
                        variant={viewMode === "card" ? "default" : "outline"}
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Grid className="w-4 h-4" />
                        <span>Card View</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Orders Display */}
                {loadingOrders ? (
                  <div className="text-center py-4">Loading orders...</div>
                ) : orders?.length > 0 ? (
                  viewMode === "table" ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Restaurant</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order._id}>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <div
                                    className={`px-3 py-1 rounded-full text-white text-sm font-medium inline-block shadow-md transition-all duration-200 ease-in-out ${
                                      order.status === "done"
                                        ? "bg-green-500 hover:bg-green-600"
                                        : "bg-yellow-500 hover:bg-yellow-600"
                                    }`}
                                  >
                                    {order.status === "done"
                                      ? "Done"
                                      : "Pending"}
                                  </div>
                                  {/* Paid/Unpaid Indicator */}
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      order.paid ? "bg-green-500" : "bg-red-500"
                                    }`}
                                    title={order.paid ? "Paid" : "Unpaid"}
                                  ></div>
                                </div>
                              </TableCell>
                              <TableCell>{order.restaurant || "N/A"}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {order.scheduledTime && (
                                    <span className="flex items-center text-purple-500">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      Scheduled
                                    </span>
                                  )}
                                  <span className="flex items-center">
                                    {order.deliveryOption === "delivery" ? (
                                      <>
                                        <Truck className="w-4 h-4 mr-1 text-blue-500" />
                                        <span className="text-blue-500">
                                          Delivery
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <Store className="w-4 h-4 mr-1 text-orange-500" />
                                        <span className="text-orange-500">
                                          Pickup
                                        </span>
                                      </>
                                    )}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {order.name ? order.name.split(" ")[0] : "N/A"}
                              </TableCell>
                              <TableCell>
                                {order.scheduledTime
                                  ? dbTimeForHuman(order.scheduledTime)
                                  : dbTimeForHuman(order.createdAt)}
                              </TableCell>
                              <TableCell className="text-right flex items-center justify-end space-x-2">
                                {order.status !== "done" &&
                                  profile.admin &&
                                  order.paid && (
                                    <Button
                                      variant="success"
                                      size="sm"
                                      onClick={() => markOrderAsDone(order._id)}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Mark as Done
                                    </Button>
                                  )}
                                <Button asChild variant="outline" size="sm">
                                  <Link href={`/orders/${order._id}`}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Show Order
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    // Card View
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {orders.map((order) => (
                        <Card key={order._id} className="shadow-lg">
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-xl font-semibold">
                                Order #{order._id.slice(-6)}
                              </CardTitle>
                              <div className="flex items-center space-x-1">
                                <div
                                  className={`px-2 py-1 rounded-full text-white text-xs font-medium inline-block shadow-md transition-all duration-200 ease-in-out ${
                                    order.status === "done"
                                      ? "bg-green-500"
                                      : "bg-yellow-500"
                                  }`}
                                >
                                  {order.status === "done" ? "Done" : "Pending"}
                                </div>
                                {/* Paid/Unpaid Indicator */}
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    order.paid ? "bg-green-500" : "bg-red-500"
                                  }`}
                                  title={order.paid ? "Paid" : "Unpaid"}
                                ></div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p>
                              <strong>Restaurant:</strong>{" "}
                              {order.restaurant || "N/A"}
                            </p>
                            <p>
                              <strong>Customer:</strong> {order.name || "N/A"}
                            </p>
                            <p>
                              <strong>Type:</strong>{" "}
                              {order.deliveryOption === "delivery"
                                ? "Delivery"
                                : "Pickup"}
                            </p>
                            {order.scheduledTime && (
                              <p>
                                <strong>Scheduled:</strong>{" "}
                                {dbTimeForHuman(order.scheduledTime)}
                              </p>
                            )}
                            <p>
                              <strong>Date:</strong>{" "}
                              {dbTimeForHuman(order.createdAt)}
                            </p>
                            <div className="mt-2 flex space-x-2">
                              {order.status !== "done" &&
                                profile.admin &&
                                order.paid && (
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => markOrderAsDone(order._id)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Mark as Done
                                  </Button>
                                )}
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/orders/${order._id}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Show
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No orders found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
