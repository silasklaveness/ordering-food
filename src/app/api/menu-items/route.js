import mongoose from "mongoose";
import { MenuItem } from "../../models/MenuItem";

// POST request to create a new menu item
export async function POST(req) {
  await mongoose.connect(process.env.MONGO_URL);
  const data = await req.json();

  // Convert category and subcategory to ObjectId if they are not empty
  if (data.category && data.category !== "") {
    data.category = new mongoose.Types.ObjectId(data.category);
  } else {
    delete data.category; // Remove if it's an empty string
  }

  if (data.subcategory && data.subcategory !== "") {
    data.subcategory = new mongoose.Types.ObjectId(data.subcategory);
  } else {
    delete data.subcategory; // Remove if it's an empty string
  }

  try {
    const menuItemDoc = await MenuItem.create(data);
    return new Response(JSON.stringify(menuItemDoc), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating menu item:", error);
    return new Response(
      JSON.stringify({ error: "Error creating menu item", details: error }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// PUT request to update an existing menu item
export async function PUT(req) {
  await mongoose.connect(process.env.MONGO_URL);
  const { _id, ...data } = await req.json();

  // Convert category to ObjectId if it's not empty or null
  if (data.category && data.category !== "") {
    data.category = new mongoose.Types.ObjectId(data.category);
  } else {
    delete data.category; // Exclude empty category field
  }

  // Convert subcategory to ObjectId if it's not empty or null
  if (data.subcategory && data.subcategory !== "") {
    data.subcategory = new mongoose.Types.ObjectId(data.subcategory);
  } else {
    delete data.subcategory; // Exclude empty subcategory field
  }

  // Convert restaurants to array of ObjectIds if provided
  if (data.restaurants && Array.isArray(data.restaurants)) {
    data.restaurants = data.restaurants
      .filter((restaurantId) => restaurantId !== "") // Exclude empty strings
      .map((restaurantId) => new mongoose.Types.ObjectId(restaurantId));
  }

  try {
    await MenuItem.findByIdAndUpdate(_id, data, { new: true });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating menu item:", error);
    return new Response(JSON.stringify({ error: "Error updating menu item" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// GET request to fetch all menu items
export async function GET() {
  await mongoose.connect(process.env.MONGO_URL);

  try {
    const menuItems = await MenuItem.find(); // No changes to this logic

    return new Response(JSON.stringify(menuItems), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return new Response(
      JSON.stringify({ error: "Error fetching menu items" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// DELETE request to delete a menu item
export async function DELETE(req) {
  await mongoose.connect(process.env.MONGO_URL);
  const url = new URL(req.url);
  const _id = url.searchParams.get("_id");

  try {
    await MenuItem.deleteOne({ _id });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return new Response(JSON.stringify({ error: "Error deleting menu item" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
