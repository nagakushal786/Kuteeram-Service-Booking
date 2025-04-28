import express from "express";
import { acceptPendingOrder, addProduct, checkAuthSeller, getAllProducts, sellerLogin, sellerSignup, updateAvailability, updateProduct } from "../controllers/sellerController.js";
import { verifyTokenSeller } from "../middlewares/verifyTokenSeller.js";

const sellerRouter=express.Router();

sellerRouter.post("/signup", sellerSignup);
sellerRouter.post("/login", sellerLogin);
sellerRouter.post("/check-auth", verifyTokenSeller, checkAuthSeller);
sellerRouter.post("/add-product", verifyTokenSeller, addProduct);
sellerRouter.post("/update-product", verifyTokenSeller, updateProduct);
sellerRouter.post("/update-availability", verifyTokenSeller, updateAvailability);
sellerRouter.get("/all-products", verifyTokenSeller, getAllProducts);
sellerRouter.post("/update-order-status", verifyTokenSeller, acceptPendingOrder);

export default sellerRouter;