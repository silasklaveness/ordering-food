import mongoose, { model, models, Schema } from "mongoose";

const ExtraPriceSchema = new Schema({
  name: String,
  price: Number,
});

const MenuItemSchema = new Schema(
  {
    image: { type: String },
    name: { type: String },
    description: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Add reference to Category model
      required: true, // Make it required if every item should have a category
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Reference the same Category model
      default: null,
    },
    basePrice: { type: Number },
    sizes: { type: [ExtraPriceSchema] },
    extraIngredientsPrices: { type: [ExtraPriceSchema] },
    restaurants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant", // Ensure this references the Restaurant schema
      },
    ],
  },
  { timestamps: true }
);

export const MenuItem = models?.MenuItem || model("MenuItem", MenuItemSchema);
