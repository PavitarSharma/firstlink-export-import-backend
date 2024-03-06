import express from "express";
import { adminController } from "../controllers/admin.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();
router.use(isAuthenticated)
router.get("/users", adminController.getAllUsers);
router.get("/products", adminController.getAllProducts);
router.get("/orders", adminController.getAllOrders);
router.get("/contacts", adminController.getAllContacts);

router.post("/users/role", adminController.updateUserRole)
router.post("/users/create-user", adminController.createUser)
router.delete("/users/:id", adminController.deleteUser)
router.delete("/contacts/:id", adminController.deleteContact)


export default router
