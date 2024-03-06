import mongoose, { Schema } from "mongoose";

const { model, Schema: MongooseSchema } = mongoose;

export const reviewSchema = new Schema(
  {
    customer: Object,
    rating: { type: Number, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);


const imagesSchema = new Schema({
  medias: [
    {
      id: String,
      url: String,
    },
  ],
  color: String,
});

export const productSchema = new MongooseSchema(
  {
    title: String,
    description: String,
    price: Number,
    currency: String,
    stock: Number,
    descountType: String,
    discountPrice: Number,
    sku: String,
    barcode: String,
    sizes: [String],
    images: [imagesSchema],
    category: String,
    rating: {
      rate: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    visited: Number,
    shippingPrice: Number,
    purchased: { type: Number, default: 0 },
    condition: String,
    type: String,
    reviews: [reviewSchema],
    quality: String,
    name: String
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.reviews;
        delete ret.__v;
      },
    },
  }
);

productSchema.methods.calculateRating = function () {
  const totalReviews = this.reviews.length;
  if (totalReviews === 0) return;

  const totalRating = this.reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  const averageRating = totalRating / totalReviews;

  this.rating.rate = parseFloat(averageRating.toFixed(2));
  this.rating.count = totalReviews.toFixed(2);
};


productSchema.post("save", function () {
this.calculateRating();
});



export const Product = model("Product", productSchema);
