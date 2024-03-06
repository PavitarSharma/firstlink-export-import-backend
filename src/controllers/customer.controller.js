import { CLIENT_URL } from "../config/environment.js";
import { logger } from "../config/logger.js";
import { Customer } from "../models/customer.model.js";
import { customerService } from "../services/customer.service.js";
import { mailService } from "../services/mail.service.js";
import { productService } from "../services/product.service.js";
import { tokenService } from "../services/token.service.js";
import ErrorHandler from "../utils/ErrorHandler.js";
class CustomerController {
  async register(req, res, next) {
    const { name, email, password, confirmPassword } = req.body;
    if (!name) return next(new ErrorHandler("Name is required", 400));
    if (!email) return next(new ErrorHandler("Email is required", 400));
    if (!password) return next(new ErrorHandler("Password is required", 400));
    if (!confirmPassword)
      return next(new ErrorHandler("Confirm password is required", 400));
    if (password !== confirmPassword)
      return next(new ErrorHandler("Passwords do not match", 400));

    const existingCustomer = await customerService.findByEmail(email);
    if (existingCustomer) {
      if (existingCustomer.verified) {
        return next(new ErrorHandler("Email is already registered", 400));
      } else {
        return next(
          new ErrorHandler("Email is already registered but not verified", 400)
        );
      }
    }
    if (existingCustomer) {
      return next(
        new ErrorHandler("Email is already registered but not verified", 400)
      );
    }

    await customerService.register(req.body);

    const ttl = 1000 * 60 * 10;
    const expires = Date.now() + ttl;
    const data = `${email}.${expires}`;
    const hash = customerService.hashVerificationToken(data);
    const verificationUrl = `${CLIENT_URL}/auth/verification?token=${`${hash}.${expires}`}&email=${email}`;
    await mailService.verificationMail(
      { ...req.body, href: verificationUrl },
      "activation-account-mail"
    );
    logger.info("Registration successful done");
    res.status(201).json({
      email,
      message: `An activation mail has been sent to ${email}`,
    });
  }

  async verifyEmail(req, res, next) {
    const { token, email } = req.body;

    if (!token)
      return next(new ErrorHandler("Verification token is required", 400));

    const [hashed, expires] = token.split(".");

    if (Date.now() > +expires) {
      return next(new ErrorHandler("Verification token has expired", 400));
    }

    const data = `${email}.${expires}`;
    const isValid = customerService.accountVerified(hashed, data);
    if (!isValid) {
      return next(new ErrorHandler("Verification token is invalid", 400));
    }

    const customer = await customerService.findByEmail(email);
    if (!customer) {
      return next(new ErrorHandler("User not found", 400));
    }

    if (customer.verified) {
      return next(new ErrorHandler("User is already verified", 400));
    }

    customer.verified = true;
    await customer.save();
    logger.info("Account verified");
    res.status(200).json({ message: "Account verified" });
  }

  async login(req, res, next) {
    const { email, password, device } = req.body;
    if (!email) return next(new ErrorHandler("Email is required", 400));
    if (!password) return next(new ErrorHandler("Password is required", 400));
    const customer = await customerService.findByEmail(email);
    if (!customer)
      return next(new ErrorHandler("Invalid email or password", 400));

    if (!customer.verified)
      return next(new ErrorHandler("User not verified", 400));

    const validPassword = await customer.comparePassword(password);
    if (!validPassword)
      return next(new ErrorHandler("Invalid email or password", 400));

    await customerService.updateLoginDevices(customer, device);
    const { access_token, refresh_token } = await tokenService.generateToken({
      id: customer._id,
    });
    res.cookie("first_link_exim_token", refresh_token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ access_token, customer });
  }

  async resendVerification(req, res, next) {
    const { email } = req.body;
    if (!email) return next(new ErrorHandler("Email is required", 400));

    const customer = await customerService.findByEmail(email);
    if (!customer) return next(new ErrorHandler("User does not exist", 404));

    const ttl = 1000 * 60 * 10;
    const expires = Date.now() + ttl;
    const data = `${email}.${expires}`;
    const hash = customerService.hashVerificationToken(data);
    const verificationUrl = `${CLIENT_URL}/auth/verification?token=${`${hash}.${expires}`}&email=${email}`;
    await mailService.resendVerificationMail(
      { email, name: customer.name, href: verificationUrl },
      "resend-verification-mail"
    );

    logger.info("Resend verification email");
    res.status(200).json({
      message: `An mail has been sent to ${email}`,
    });
  }

  async generateRefreshToken(req, res, next) {
    const cookies = req.cookies;
    if (!cookies.first_link_exim_token)
      return next(new ErrorHandler("Unauthorized", 401));
    const refreshToken = cookies.first_link_exim_token;
    const decoded = await tokenService.verifyRefreshToken(refreshToken);

    if (typeof decoded === "string")
      return next(new ErrorHandler("Unauthorized", 401));
    const customer = await customerService.findById(decoded.id);
    if (!customer) return next(new ErrorHandler("Unauthorized", 401));

    const { access_token } = await tokenService.generateToken({
      id: customer._id,
    });

    res.status(200).json({
      access_token,
      customer,
    });
  }

  async forgotPassword(req, res, next) {
    const { email } = req.body;
    if (!email) return next(new ErrorHandler("Email is required", 400));

    const customer = await customerService.findByEmail(email);
    if (!customer) return next(new ErrorHandler("User does not exist", 404));

    const resetToken = customer.getResetToken();
    await customer.save({
      validateBeforeSave: false,
    });

    const href = `${CLIENT_URL}/auth/reset-password?token=${`${resetToken}`}`;
    await mailService.forgotPasswordMail(
      { name: customer.name, email, href },
      "forgot-password-mail"
    );

    res.status(200).json({
      token: resetToken,
      message: `An mail has been sent to ${email} for reset password`,
    });
  }

  async resetPassword(req, res, next) {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token)
      return next(new ErrorHandler("Reset password token is required", 400));

    const resetPasswordToken = customerService.resetPasswordToken(token);

    const customer = await customerService.findResetPasswordToken(
      resetPasswordToken
    );
    if (!customer) {
      return next(
        new ErrorHandler(
          "Reset password url is invalid or has been expired",
          400
        )
      );
    }

    if (!newPassword)
      return next(new ErrorHandler("New password is required"), 400);
    if (!confirmPassword)
      return next(new ErrorHandler("Confirm password is required"), 400);
    if (newPassword !== confirmPassword)
      return next(new ErrorHandler("Passwords do not match"), 400);

    customer.password = newPassword;
    customer.resetPasswordToken = undefined;
    customer.resetPasswordTime = undefined;
    await customer.save();

    res.status(200).json({
      message: "Password updated successfully",
    });
  }

  async logout(req, res, next) {
    const cookies = req.cookies;
    if (!cookies.first_link_exim_token)
      return next(new ErrorHandler("No content", 204));

    res.clearCookie("first_link_exim_token", {
      httpOnly: true,
    });
    logger.info("Logout successfully done.");
    res.status(200).json({ message: "Logout successfully done." });
  }

  async customerProfile(req, res, next) {
    const userId = req.user;
    const customer = await customerService.findById(userId);
    res.status(200).json(customer);
  }

  async updateCustomerProfile(req, res, next) {
    const userId = req.user;
    if (!userId) {
      return next(new ErrorHandler("Unauthorized please login to access", 404));
    }

    const customer = await customerService.updateProfile(userId, req.body);
    logger.info("Update customer profile", customer);
    res.status(200).json(customer);
  }

  async updateProfilePicture(req, res, next) {
    const userId = req.user;
    if (!userId) {
      return next(new ErrorHandler("Unauthorized please login to access", 404));
    }

    const customer = await customerService.updateProfilePicture(
      userId,
      req.file
    );
    logger.info("Update customer profile picture", customer);
    res.status(200).json(customer);
  }

  async updatePassword(req, res, next) {
    const userId = req.user;
    if (!userId) {
      return next(new ErrorHandler("Unauthorized please login to access", 404));
    }

    const { newPassword, confirmPassword } = req.body;
    if (!newPassword)
      return next(new ErrorHandler("New password is required"), 400);
    if (!confirmPassword)
      return next(new ErrorHandler("Confirm password is required"), 400);
    if (newPassword !== confirmPassword)
      return next(new ErrorHandler("Passwords do not match"), 400);

    const customer = await customerService.updatePassword(userId, newPassword);
    logger.info("Update customer password", customer);
    res.status(200).json(customer);
  }

  // ------------------------  Addresses ------------------------
  async createAddress(req, res, next) {
    const userId = req.user;
    if (!userId) {
      return next(new ErrorHandler("Unauthorized please login to access", 404));
    }

    const customer = await customerService.createAddress(userId, req.body);
    logger.info("Update customer address", customer);
    res.status(200).json(customer);
  }

  async getAllAddresses(req, res, next) {
    const userId = req.user;
    if (!userId) {
      return next(new ErrorHandler("Unauthorized please login to access", 404));
    }

    const customer = await customerService.getAllAddresses(userId);
    logger.info("Get all customer addresses", customer);
    res.status(200).json(customer);
  }

  async getAddress(req, res, next) {
    const userId = req.user;
    if (!userId) {
      return next(new ErrorHandler("Unauthorized please login to access", 404));
    }

    const addressId = req.params.addressId;

    const customer = await customerService.getAddress(userId, addressId);
    logger.info("Get customer address", customer);
    res.status(200).json(customer);
  }

  async updateAddress(req, res, next) {
    const userId = req.user;
    if (!userId) {
      return next(new ErrorHandler("Unauthorized please login to access", 404));
    }

    const addressId = req.params.addressId;

    const customer = await customerService.updateAddress(
      userId,
      addressId,
      req.body
    );
    logger.info("Update customer address", customer);
    res.status(200).json(customer);
  }

  async deleteAddress(req, res, next) {
    const userId = req.user;
    if (!userId) {
      return next(new ErrorHandler("Unauthorized please login to access", 404));
    }

    const addressId = req.params.addressId;
    const customer = await customerService.deleteAddress(userId, addressId);
    logger.info("Delete customer address", customer);
    res.status(200).json(customer);
  }

  async activeAddress(req, res, next) {
    const userId = req.user;
    if (!userId) {
      return next(new ErrorHandler("Unauthorized please login to access", 404));
    }

    const addressId = req.params.addressId;
    const customer = await customerService.activeAddress(userId, addressId);
    logger.info("Active customer address", customer);
    res.status(200).json(customer);
  }

  // -------------------------- Product --------------------------------------------------

  async addToWishlist(req, res, next) {
    const customerId = req.user;

    if (!customerId) {
      return next(new ErrorHandler("User not found", 404));
    }

    const customer = await customerService.findById(customerId);
    if(!customer) {
      return next(new ErrorHandler("User not found", 404));
    }

    const { productId} = req.body

    const product = await productService.findProductById(productId)
    if(!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const alreadyAdded = customer.wishlists.find((id) => id.toString() === productId)

    if(alreadyAdded) {
      const user = await Customer.findByIdAndUpdate(customerId, {
        $pull: { wishlists: productId },
      }, {
        new: true,
      })
      logger.info("Remove from wishlist successfully", product._id);
      res.status(200).json({
        user,
        message: "Remove from wishlist successfully",
      })
    }else {
      const user = await Customer.findByIdAndUpdate(customerId, {
        $push: { wishlists: productId },
      }, {
        new: true,
      })
      logger.info("Add to wishlist successfully", product._id);
      res.status(200).json({
        user,
        message: "Add to wishlist successfully",
      })
    }
  }

  async getWishlist(req, res, next) {
    const customerId = req.user;

    if (!customerId) {
      return res.status(200).json([]);
    }

    const customer = await customerService.findById(customerId)
    if(!customer) {
      return res.json([])
    }

    const wishlists = await customerService.getWishlists(customerId)


    logger.info("Wishlists", customerId);
    res.status(200).json(wishlists);
  }

  async addToCart(req, res, next) {
    const customerId = req.user;
    if (!customerId) {
      return next(new ErrorHandler("Unauthorized please login to access", 404));
    }

    const { product: productCart, quantity } = req.body;
    const productId = productCart._id;

    const customer = await customerService.findById(customerId);
    if(!customer) {
      return next(new ErrorHandler("User not found", 404));
    }

    const product = await productService.findProductById(productId)
    if(!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const existingCartItem = customer.carts.find(
      (item) => item.product.toString() === productId
    );

    if (existingCartItem) {
      existingCartItem.quantity = quantity;
    } else {
      customer.carts.push({
        product: productCart,
        quantity: quantity,
      });
    }

    const cart = await customer.save();

    logger.info("Add to Cart", { prodictId: product._id, quantity });
    res.status(200).json(cart);
  }

  async removeFromCart(req, res, next) {
    const customerId = req.user;
    if (!customerId) {
      return next(new ErrorHandler("Unauthorized please login to access", 404));
    }

    const customer = await customerService.findById(customerId);
    if(!customer) {
      return next(new ErrorHandler("User not found", 404));
    }

    const { productId } = req.body;

    const product = await productService.findProductById(productId)
    if(!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    const productIndex = customer.carts.findIndex(
      (item) => item.product._id.toString() === productId
    );

    if (productIndex !== -1) {
      customer.carts.splice(productIndex, 1);
    }
    const cartResult = await customer.save();
    logger.info("Removing product from cart", productId);
    res.status(200).json(cartResult);
  }

  async increaseCartQuantity(req, res, next) {
    const customerId = req.user;
    if (!customerId) {
      return next(new ErrorHandler("Unauthorized please login to access", 404));
    }

    
    const customer = await customerService.findById(customerId);
    if(!customer) {
      return next(new ErrorHandler("User not found", 404));
    }

    const { productId } = req.body;

    const product = await productService.findProductById(productId)
    if(!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    const existingCartItem = customer.carts.find(
      (item) => item.product._id.toString() === productId
    );

    if (existingCartItem) {
      existingCartItem.quantity += 1;
    }
    const cartResult = await customer.save();
    logger.info("Increase quantity", productId);
    res.status(200).json(cartResult);
  }

  async decreaseCartQuantity(req, res, next) {
    const customerId = req.user;
    if (!customerId) {
      return next(new ErrorHandler("Unauthorized please login to access", 404));
    }

    const customer = await customerService.findById(customerId);
    if(!customer) {
      return next(new ErrorHandler("User not found", 404));
    }

    const { productId } = req.body;

    const product = await productService.findProductById(productId)
    if(!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    const existingCartItemIndex = customer.carts.findIndex(
      (item) => item.product._id.toString() === productId
    );

    if (existingCartItemIndex !== -1) {
      // Decrease quantity by 1
      customer.carts[existingCartItemIndex].quantity -= 1;

      // If quantity becomes zero, remove the cart item
      if (customer.carts[existingCartItemIndex].quantity === 0) {
        customer.carts.splice(existingCartItemIndex, 1);
      }
    }

    const cartResult = await customer.save();

    const carts =  cartResult.carts;

    logger.info("Decrease quantity", productId);
    res.status(200).json(carts);
  }

  async removeAllItemsFromCart(req, res, next) {
    const customerId = req.user;
    if (!customerId) {
      return next(new ErrorHandler("Unauthorized please login to access", 404));
    }

    const customer = await customerService.findById(customerId);
    if(!customer) {
      return next(new ErrorHandler("User not found", 404));
    }


    customer.carts = [];
    const cartResult = await customer.save();
    logger.info("Remove all items from cart", customerId);
    res.status(200).json(cartResult);
  }

  async getCart(req, res, next) {
    const customerId = req.user;

    if (!customerId) {
      return res.status(200).json([]);
    }

    const customer = await customerService.findById(customerId);
    const carts = await customer.populate("carts.product");
    logger.info("Carts", carts);
    res.status(200).json(carts.carts);
  }

  async getOrders(req, res, next) {
    const customerId = req.user;

    if (!customerId) {
      return res.status(200).json([]);
    }

    const customer = await customerService.findById(customerId);
    const orders = await customer.populate("orders");
    res.status(200).json(orders.orders)

  }

  async checkout(req, res, next) {}
}

export const customerController = new CustomerController();
