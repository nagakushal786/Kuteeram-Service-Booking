import express from "express";
import { buyerLogin, buyerSignup, checkAuthBuyer } from "../controllers/buyerController.js";
import { verifyTokenBuyer } from "../middlewares/verifyTokenBuyer.js";

const buyerRouter=express.Router();

buyerRouter.post("/signup", buyerSignup);
buyerRouter.post("/login", buyerLogin);
buyerRouter.post("/check-auth", verifyTokenBuyer, checkAuthBuyer);

export default buyerRouter;