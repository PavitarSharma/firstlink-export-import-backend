import express from "express";
import customerRoutes from "./customer.routes.js";
import productRoutes  from "./product.routes.js";
import contactRoutes from "./contact.routes.js"
import orderRoutes from "./order.routes.js";
import paymentRoutes from "./payment.routes.js";
import adminRoutes from "./admin.routes.js";

const router = express.Router();

router.use("/customers", customerRoutes);
router.use("/products", productRoutes);
router.use("/contacts", contactRoutes);
router.use("/orders", orderRoutes);
router.use("/payment", paymentRoutes);
router.use("/admin", adminRoutes);

export default router;
