import express from "express";
import { productController } from "../controllers/product.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.middleware.js";


const router = express.Router();


router.get("/", productController.allProducts);
router.get("/new-arrivals", productController.getNewArrivals)
router.get("/:id", productController.getProduct);

router.post(
  "/upload-media",
  upload.array("file"),
  productController.uploadProductMedia
);
router.post("/", productController.create);
router.use(isAuthenticated);

router.post("/reviews", productController.createReview)
router.get("/:id/reviews", productController.getReviews)
router.patch("/:id/reviews/:reviewId", productController.updateReview)
router.delete("/:id/reviews/:reviewId", productController.deleteReview)
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);



export default router;
