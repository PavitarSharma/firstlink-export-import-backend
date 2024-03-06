import express from "express";
import { paymentController } from "../controllers/payment.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";
const router = express.Router();

router.use(isAuthenticated)
router.post("/process", paymentController.createPaymentIntent)

export default router;