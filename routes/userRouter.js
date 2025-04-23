import express from "express";
import { bookService, checkAuth, userLogin, userSignup } from "../controllers/userController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const userRouter=express.Router();

userRouter.post("/signup", userSignup);
userRouter.post("/login", userLogin);
userRouter.post("/check-auth", verifyToken, checkAuth);
userRouter.post("/book-service", verifyToken, bookService);

export default userRouter;