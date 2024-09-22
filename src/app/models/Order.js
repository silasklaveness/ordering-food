import { model, models, Schema } from "mongoose";

const OrderSchema = new Schema(
  {
    name: String,
    userEmail: String,
    phone: String,
    streetAddress: String,
    postalCode: String,
    city: String,
    country: String,
    cartProducts: Object,
    paid: { type: Boolean, default: false },
    scheduledTime: { type: Date },
    deliveryOption: {
      type: String,
      enum: ["delivery", "pickup"],
      required: true,
    },
    restaurant: { type: String, required: true }, // Corrected syntax here
    status: { type: String, enum: ["pending", "done"], default: "pending" },
  },
  { timestamps: true }
);

export const Order = models?.Order || model("Order", OrderSchema);
