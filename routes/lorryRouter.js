import express from "express";
import { acceptDeliveryJob, confirmDelivery, createLorry, getLorryDetails, notifyNearbyLorries, updateLorryLocation, verifySellerOTP } from "../controllers/lorryController.js";
import { verifyTokenBuyer } from "../middlewares/verifyTokenBuyer.js";

const lorryRouter=express.Router();

lorryRouter.post("/create-lorry", createLorry);
lorryRouter.post("/notify-near-lorries", notifyNearbyLorries);
lorryRouter.post("/accept-delivery-job", acceptDeliveryJob);
lorryRouter.post("/update-lorry-location", updateLorryLocation);
lorryRouter.post("/verify-otp", verifySellerOTP);
lorryRouter.post("/confirm-delivery", verifyTokenBuyer, confirmDelivery);
lorryRouter.get("/get-lorry-details", getLorryDetails);

export default lorryRouter;