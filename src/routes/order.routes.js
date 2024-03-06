import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import { orderController } from '../controllers/order.controller.js';
const router = express.Router();

router.use(isAuthenticated)
router.post("/create-order", orderController.createOrder)
router.get("/", orderController.getAllOrders)
router.get("/:id", orderController.getOrder)
router.post("/cancel-order/:id", orderController.cancelOrder)

export default router