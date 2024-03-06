import { customerService } from "../services/customer.service.js";
import { productService } from "../services/product.service.js";
import ErrorHandler from "../utils/ErrorHandler.js";

class ProductController {
  async uploadProductMedia(req, res, next) {
    const file = req.files;

    if (!file) {
      return next(new ErrorHandler("No file uploaded", 400));
    }

    const uploadImage = await productService.uploadProductMedia(file);

    res.status(200).json(uploadImage);
  }

  async create(req, res, next) {
    const product = await productService.addProduct(req.body);
    res.status(200).json(product);
  }

  async allProducts(req, res, next) {
    const products = await productService.allProducts(req.query);
    res.status(200).json(products);
  }

  async getProduct(req, res, next) {
    const productId = req.params.id;
    const product = await productService.findProductById(productId);
    await product.calculateRating(); 
    res.status(200).json(product);
  }

  async updateProduct(req, res, next) {
    const productId = req.params.id;
    const product = await productService.updateProduct(productId, req.body);
    res.status(200).json(product);
  }

  async deleteProduct(req, res, next) {
    const productId = req.params.id;
    const product = await productService.deleteProduct(productId);
    res.status(200).json(product);
  }

  async getNewArrivals(req, res, next) {
    const products = await productService.getNewArrivals(req.query);
    res.status(200).json(products);
  }

  // --------------------- Reviews --------------------
  async createReview(req, res, next) {
    const customerId = req.user;
    if (!customerId) {
      return next(new ErrorHandler("Unauthorized please login to access", 404));
    }

    const { productId, message, rating } = req.body;
    const customer = await customerService.findById(customerId);
    if (!customer) {
      return next(new ErrorHandler("User not found", 404));
    }
    const product = await productService.findProductById(productId);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const newReview = {
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        profileImg: customer.profileImg,
      },
      rating,
      message,
    };

    product.reviews.push(newReview);
    await product.save();
    const newIndex = product.reviews.length - 1;

    const review = product.reviews[newIndex];
    res.status(200).json({
      message: "Review added successfully",
      review,
    });
  }

  async getReviews(req, res, next) {
    const productId = req.params.id;
    const product = await productService.findProductById(productId);
   
    const reviews =  product.reviews.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.status(200).json(reviews);
  }

  async updateReview(req, res, next) {
    const reviewId = req.params.reviewId;
    const productId = req.params.id;

    const product = await productService.findProductById(productId);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const reviewIndex = product.reviews.findIndex(
      (item) => item._id.toString() === reviewId
    );

    if (reviewIndex !== -1) {
      product.reviews[reviewIndex] = req.body;
    }
    await product.save();
    const review = product.reviews[reviewIndex]
    res.status(200).json(review);
  }

  async deleteReview(req, res, next) {
    const reviewId = req.params.reviewId;
    const productId = req.params.id;

    const product = await productService.findProductById(productId);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const reviewIndex = product.reviews.findIndex(
      (item) => item._id.toString() === reviewId
    );


    if (reviewIndex !== -1) {
      product.reviews.splice(reviewIndex, 1);
    }

    await product.save();
    const review = product.reviews
    res.status(200).json(review);
  }
}

export const productController = new ProductController();
