import { Schema, model } from "mongoose";

const orderSchema = new Schema({
  customer: {
    type: Object,
  },
  cart: {
    type: Array,
    required: true,
  },
  orderId: String,
  totalPrice: Number,
  shippingAddress: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    default: "Processing",
  },
  paymentInfo: {
    id: {
      type: String,
    },
    status: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  paidAt: {
    type: Date,
    default: Date.now(),
  },
  deliveredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  orderDate: Date,
});

export const Order = model("Order", orderSchema);
