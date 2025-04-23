import express from "express";
import { addService, getAllServices, updateAvailability, updateService } from "../controllers/serviceController.js";

const serviceRouter=express.Router();

serviceRouter.post("/add-service", addService);
serviceRouter.post("/update-avail", updateAvailability);
serviceRouter.post("/update-service", updateService);
serviceRouter.get("/get-services", getAllServices);

export default serviceRouter;