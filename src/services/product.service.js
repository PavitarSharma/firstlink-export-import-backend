import { Product } from "../models/product.model.js";
import { generateUploadURLs } from "../utils/aws.js";
import { customerService } from "./customer.service.js";

class ProductService {
  async uploadProductMedia(file) {
    return await generateUploadURLs(file);
  }

  async addProduct(product) {
    return await Product.create(product);
  }

  async findProductById(id) {
    return await Product.findById(id);
  }

  async updateProduct(id, body){
    return await Product.findByIdAndUpdate(id, body, { new: true });
  }

  async deleteProduct(id) {
    return await Product.findByIdAndDelete(id);
  }

  async allProducts(params) {
    const { q, category, sortBy, size, color, type, price } = params;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;
    let query = {};
    if (category) {
      query.category = category;
    }
    if (q) {
      query.title = { $regex: new RegExp(q, "i") };
    }

    let sortCriteria = {};
    if (sortBy === "Date added, newest to oldest") {
      sortCriteria.createdAt = -1;
    } else if (sortBy === "Date added, oldest to newest") {
      sortCriteria.createdAt = 1;
    } else if (sortBy === "Name, A to Z") {
      sortCriteria.title = 1;
    } else if (sortBy === "Name, Z to A") {
      sortCriteria.title = -1;
    } else if (sortBy === "Price, low to high") {
      sortCriteria.price = 1;
    } else if (sortBy === "Price, high to low") {
      sortCriteria.price = -1;
    }

    if (size) {
      query.sizes = size;
    }

    if (color) {
      query["images.color"] = color;
    }

    if (type) {
      query.name = type;
    }

    if (price) {
      const [minPrice, maxPrice] = price
        .split("-")
        .map((p) => parseFloat(p.trim()));
      query.price = {
        $gte: isNaN(minPrice) ? Number.MIN_VALUE : minPrice,
        $lte: isNaN(maxPrice) ? Number.MAX_VALUE : maxPrice,
      };
    }

    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(limit).sort(sortCriteria).exec(),
      Product.countDocuments(query).exec(),
    ]);
    const totalPages = Math.ceil(total / limit);

    return { products, total, totalPages };
  }

  async getNewArrivals(params) {
    // const startDate = new Date();
    // const endDate = new Date();
    // endDate.setDate(endDate.getDate() + 7);

    const currentDate = new Date();
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() - 7);
    
    const { q, category, sortBy, size, color, type, price } = params;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;
    let query = {};

    if (category) {
      query.category = category;
    }
    if (q) {
      query.title = { $regex: new RegExp(q, "i") };
    }

    let sortCriteria = {};
    if (sortBy === "Date added, newest to oldest") {
      sortCriteria.createdAt = -1;
    } else if (sortBy === "Date added, oldest to newest") {
      sortCriteria.createdAt = 1;
    } else if (sortBy === "Name, A to Z") {
      sortCriteria.title = 1;
    } else if (sortBy === "Name, Z to A") {
      sortCriteria.title = -1;
    } else if (sortBy === "Price, low to high") {
      sortCriteria.price = 1;
    } else if (sortBy === "Price, high to low") {
      sortCriteria.price = -1;
    }

    if (size) {
      query.sizes = size;
    }

    if (color) {
      query["images.color"] = color;
    }

    if (type) {
      query.name = type;
    }

    if (price) {
      const [minPrice, maxPrice] = price
        .split("-")
        .map((p) => parseFloat(p.trim()));
      query.price = {
        $gte: isNaN(minPrice) ? Number.MIN_VALUE : minPrice,
        $lte: isNaN(maxPrice) ? Number.MAX_VALUE : maxPrice,
      };
    }

    query.createdAt = { $gte: endDate, $lte: currentDate };

    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(limit).sort(sortCriteria).exec(),
      Product.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);
    return { products, total, totalPages };
  }

  async addToWishlist(body, customerId) {
    const { productId, like } = body;
    const customer = await customerService.findById(customerId);
    if (!customer) {
      throw new ErrorHandler("Customer not found", 404);
    }
    const product = await Product.findById(productId);
    if (!product) {
      throw new ErrorHandler("Product not found", 404);
    }

    const wishlistProductIndex = customer.wishlists.findIndex(
      (item) => item && item._id && item._id.toString() === productId
    );

  
    if (like) {
      // If like is true, add the product to customer's wishlist
      if (wishlistProductIndex === -1) {
        customer.wishlists.push(product);
        await customer.save();
      }
    } else {
      // If like is false, remove the product from customer's wishlist
      if (wishlistProductIndex !== -1) {
        customer.wishlists.splice(wishlistProductIndex, 1);
        await customer.save();
      }
    }

    return product;
  }

}

export const productService = new ProductService();
