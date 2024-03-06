import { Order } from "../models/order.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { customerService } from "./customer.service.js"
import { productService } from "./product.service.js";

class OrderService {
    async createOrder(customerId,body) {
        const customer = await customerService.findById(customerId)
        if (!customer) {
            throw new ErrorHandler("User does not exist", 404);
        }
        const orderId = `order_${Math.floor(Math.random() * 899999999)+ 1000}`;
        for (const item of body.cart) {
            const productId = item.product._id
            const product = await productService.findProductById(productId);
            if (!product) {
              throw new ErrorHandler(`Product with ID ${item.productId} not found`, 404);
            }
            if (product.stock < item.quantity) {
              throw new ErrorHandler(`Insufficient stock for product ${product.title}`, 400);
            }
            product.stock -= item.quantity;
            product.purchased += item.quantity;
            await product.save();
          }

        const orderData = {
            ...body,
            orderId: body.orderId ? body.orderId : orderId,
        }

        const order = await Order.create(orderData)
        customer.carts = []
        customer.orders.push(order)
        await customer.save()
        return order

    }

    async getAllOrders(query) {
        const orders = await Order.find(query)
        return orders
    }

    async getOrder(orderId) {
        return await Order.findById(orderId)

    }

    async cancelOrder(orderId) {
        const order = await this.getOrder(orderId)
        if (!order) {
            throw new ErrorHandler("Order not found", 404);
        }

        // customer.orders = customer.orders.filter(order => order.toString() !== orderId);
        // await customer.save();

        for (const item of order.cart) {
            const productId = item.product._id;
    
            // Find the product in the database
            const product = await productService.findProductById(productId);
    
            // Check if the product exists
            if (!product) {
                throw new Error(`Product with ID ${productId} not found`);
            }
    
            // Increase the product's stock by the quantity in the order
            product.stock += item.quantity;
    
            // Decrease the product's total purchases by the same quantity
            product.purchased -= item.quantity;
    
            // Save the updated product
            await product.save();
        }

    
        order.status = "Canceled"
        await order.save()
        return order
    }
}

export const orderService = new OrderService()