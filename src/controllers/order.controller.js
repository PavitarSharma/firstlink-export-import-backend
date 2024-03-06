import { orderService } from "../services/order.service.js"

class OrderController {
    async createOrder(req, res, next) {
        const order = await orderService.createOrder(req.user, req.body)
        res.status(201).json(order)
    }

    async getAllOrders(req, res, next) {
        const orders = await orderService.getAllOrders(req.query)
        res.status(200).json(orders)
    }

    async getOrder(req, res, next) {
        const orderId = req.params.id
        const order = await orderService.getOrder(orderId)
        res.status(200).json(order)
    }

    async updateOrder(req, res, next) {
        const orderId = req.params.id
        const order = await orderService.updateOrder(orderId, req.body)
        res.status(200).json(order)
    }

    async deleteOrder(req, res, next) {
        const orderId = req.params.id
        const order = await orderService.deleteOrder(orderId)
        res.status(200).json(order)
    }

    async cancelOrder(req, res, next) {
        const orderId = req.params.id
        const order = await orderService.cancelOrder(orderId)
        res.status(200).json(order)
    }
}

export const orderController = new OrderController()