import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Restaurant } from "../../models/Restaurant"; // Ensure Restaurant model exists

// Ensure the connection to MongoDB is done once
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URL);
  }
}

// GET /api/restaurants
export async function GET() {
  try {
    await connectDB();
    const restaurants = await Restaurant.find({});
    return NextResponse.json(restaurants);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch restaurants." },
      { status: 500 }
    );
  }
}

// POST /api/restaurants
export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const restaurant = new Restaurant(data);
    const savedRestaurant = await restaurant.save();
    return NextResponse.json(savedRestaurant, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create restaurant." },
      { status: 500 }
    );
  }
}

// DELETE a restaurant
export async function DELETE(req) {
  try {
    await connectDB(); // Connect to MongoDB

    const url = new URL(req.url);
    const id = url.searchParams.get("id"); // Extract ID from query parameters

    if (!id) {
      return NextResponse.json(
        { error: "Restaurant ID is required" },
        { status: 400 }
      );
    }

    const deletedRestaurant = await Restaurant.findByIdAndDelete(id);

    if (!deletedRestaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete restaurant:", error);
    return NextResponse.json(
      { error: "Failed to delete restaurant" },
      { status: 500 }
    );
  }
}
