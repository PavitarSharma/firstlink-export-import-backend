import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '../config/environment.js';
import RazorpayInstance from '../utils/razorpay.js';
import dotenv from "dotenv"
dotenv.config()

const stripe = new Stripe(STRIPE_SECRET_KEY);

class PaymentController {
    async createPaymentIntent(req, res) {
        const { amount, receipt, currency } = req.body;
       

        const paymentData = {
          amount: amount * 100,
          currency: currency,
          receipt
        };
        const key = process.env.RAZORPAY_KEY_ID
        
      
        const payment = await RazorpayInstance.orders.create(paymentData);
        res.status(200).json({ key, data: paymentData, payment });
     
        // try {
            
        //     const paymentIntent = await stripe.paymentIntents.create({
        //         amount: req.body.amount * 100,
        //         currency: req.body.currency,
        //     });
        //     res.status(201).json(paymentIntent);
        // } catch (error) {
        //     console.log(error);
        //     res.status(500).json({ error: error.message });
        
    }
}

export const paymentController = new PaymentController()