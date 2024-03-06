import { Contact } from "../models/contact.model.js";
import { Customer } from "../models/customer.model.js";
import { Order } from "../models/order.model.js";
import { customerService } from "./customer.service.js";

class AdminService {
  async getAllUsers(params) {
    const {  q } = params;
    const page = Number(params.page) || 1
    const limit = Number(params.limit) || 10
    const query = {};
    if (q) {
      query.$or = [
        { name: { $regex: new RegExp(q, "i") } },
        { email: { $regex: new RegExp(q, "i") } },
        { phone: { $regex: new RegExp(q, "i") } },
      ];
    }

    const totalCount = await Customer.countDocuments(query);

    const users = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit);

    return { users, totalPages, totalCount };
  }

  async getAllContacts(params) {
    const {  q } = params;
    const page = Number(params.page) || 1
    const limit = Number(params.limit) || 10
    const query = {};
    if (q) {
      query.$or = [
        { name: { $regex: new RegExp(q, "i") } },
        { email: { $regex: new RegExp(q, "i") } },
        { phone: { $regex: new RegExp(q, "i") } },
      ];
    }

    const totalCount = await Contact.countDocuments(query);

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit);

    return { contacts, totalPages, totalCount };
  }

  async updateUserRole(body) {
    const user = await Customer.findById(body.id);
    user.role = body.role;
    return await user.save();
  }

  async deleteUser(userId) {
    const user = await Customer.findByIdAndDelete(userId);
    return user;
  }

  async createUser(body) {
    const username = await customerService.generateUsername(body.email);

    const data = {
      ...body,
      username,
    };
    return await Customer.create(data);
  }

  async deleteContact(id) {
    return await Contact.findByIdAndDelete(id);
  }

  async getAllOrders(params) {
    const { status, paymentStatus }= params
    console.log(status);
    const page = Number(params.page) || 1
    const limit = Number(params.limit) || 10
    let query = {}

    if(status){
      query.status = status
    }

    if(paymentStatus){
      query['paymentInfo.status'] = paymentStatus
    }
    const totalCount = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit);

    return { orders, totalPages, totalCount };
  }
}

export const adminService = new AdminService();
