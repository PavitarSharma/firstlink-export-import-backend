import { adminService } from "../services/admin.service.js";
import { customerService } from "../services/customer.service.js";
import ErrorHandler from "../utils/ErrorHandler.js";

class AdminController {
  async getAllUsers(req, res, next) {
    const users = await adminService.getAllUsers(req.query);
    res.status(200).json(users);
  }

  async getAllProducts(req, res, next) {
    const products = await adminService.allProducts(req.query);
    res.status(200).json(products);
  }

  async getAllOrders(req, res, next) {
    const orders = await adminService.getAllOrders(req.query);
    res.status(200).json(orders);
  }

  async getAllContacts(req, res, next) {
    const contacts = await adminService.getAllContacts(req.query);
    res.status(200).json(contacts);
  }

  async updateUserRole(req, res, next) {
    const userId = req.user;
  
    const user = await customerService.findById(userId);
    if (user.role !== "Admin") {
      return next(
        new ErrorHandler("You are not authorized to perform this action", 400)
      );
    }
    const updateUserRole = await adminService.updateUserRole(req.body);
    res.status(200).json(updateUserRole);
  }

  async deleteUser(req, res, next) {
    const user = await adminService.deleteUser(req.params.id);
    res.status(200).json(user);
  }

  async createUser(req, res, next) {
    const userId = req.user;
  
    const user = await customerService.findById(userId);
    if (user.role !== "Admin") {
      return next(
        new ErrorHandler("You are not authorized to perform this action", 400)
      );
    }

    const existUser = await customerService.findByEmail(req.body.email)
    if (existUser) {
      return next(new ErrorHandler("User already exists", 400));
    }
    const newUser = await adminService.createUser(req.body)
    res.status(200).json(newUser);
  }

  async deleteContact(req, res, next) {
    const user = await adminService.deleteContact(req.params.id);
    res.status(200).json(user);
  }

  
}

export const adminController = new AdminController();
