import express from "express";
import { buyerLogin, buyerSignup, checkAuthBuyer, createBid, getOrderSummary, proceedPayment, searchProduct, showNearbyRiceMills } from "../controllers/buyerController.js";
import { verifyTokenBuyer } from "../middlewares/verifyTokenBuyer.js";

const buyerRouter=express.Router();

buyerRouter.post("/signup", buyerSignup);
buyerRouter.post("/login", buyerLogin);
buyerRouter.post("/check-auth", verifyTokenBuyer, checkAuthBuyer);
buyerRouter.get("/search-product", verifyTokenBuyer, searchProduct);
buyerRouter.post("/get-near-ricemills", verifyTokenBuyer, showNearbyRiceMills);
buyerRouter.post("/create-bid", verifyTokenBuyer, createBid);
buyerRouter.post("/proceed-payment", verifyTokenBuyer, proceedPayment);
buyerRouter.get("/order-summary", verifyTokenBuyer, getOrderSummary);

export default buyerRouter;