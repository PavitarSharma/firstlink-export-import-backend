import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto"
import { productSchema } from "./product.model.js";
const { model } = mongoose;

const Role = {
  Customer: "customer",
  Admin: "admin",
};

const addressSchema = new Schema(
  {
    address: String,
    city: String,
    state: String,
    country: String,
    zipcode: String,
    lat: String,
    lng: String,
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const customerSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    phone: String,
    bio: String,
    username: String,
    profileImg: {
      id: String,
      url: String,
    },
    verified: { type: Boolean, default: false },
    carts: [
      {
        product: Object,
        quantity: Number,
      },
    ],
    wishlists: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    role: {
      type: String,
      default: "User",
    },
    device: String,
    acceptTerms: { type: Boolean, default: false },
    addresses: [addressSchema],
    resetPasswordToken: String,
    resetPasswordTime: Date,
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordTime;
      },
    },
    timestamps: true,
  }
);

customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const hashedPassword = await bcrypt.hash(this.password, 10);
  this.password = hashedPassword;

  next();
});

customerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

customerSchema.methods.getResetToken = function () {
  // Generating token
  const resetToken = crypto.randomBytes(32).toString("hex");

  //    hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordTime = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

export const Customer = model("Customer", customerSchema);
