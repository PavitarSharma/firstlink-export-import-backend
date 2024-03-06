import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { customerController } from "../controllers/customer.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/register", customerController.register);
router.post("/verify", customerController.verifyEmail);
router.post("/login", customerController.login);
router.post("/resend-verification", customerController.resendVerification);
router.get("/refresh", customerController.generateRefreshToken);
router.post("/forgot-password", customerController.forgotPassword);
router.patch("/reset-password", customerController.resetPassword);

router.use(isAuthenticated);
router.get("/wishlist", customerController.getWishlist);
router.get("/cart", customerController.getCart);
router.get("/profile", customerController.customerProfile);
router.get("/profile/address", customerController.getAllAddresses);
router.get("/profile/address/:addressId", customerController.getAddress);
router.get("/orders", customerController.getOrders)

router.patch("/profile", customerController.updateCustomerProfile);
router.patch(
  "/profile/picture",
  upload.single("profileImg"),
  customerController.updateProfilePicture
);
router.post("/profile/address", customerController.createAddress);
router.patch("/profile/address/:addressId", customerController.updateAddress);
router.patch("/profile/address/:addressId/active", customerController.activeAddress);
router.patch("/profile/update-password", customerController.updatePassword);
router.delete("/profile/address/:addressId", customerController.deleteAddress);

router.post("/logout", customerController.logout);
router.post("/wishlist", customerController.addToWishlist);
router.post("/cart/add", customerController.addToCart);
router.post("/cart/increase", customerController.increaseCartQuantity);
router.post("/cart/decrease", customerController.decreaseCartQuantity);
router.post("/cart/remove", customerController.removeFromCart);
router.delete("/cart/remove-all", customerController.removeAllItemsFromCart);

export default router;
