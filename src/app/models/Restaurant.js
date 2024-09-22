import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  openingTimes: { type: String, required: true }, // Simple string for now
});

export const Restaurant =
  mongoose.models.Restaurant || mongoose.model("Restaurant", RestaurantSchema);
