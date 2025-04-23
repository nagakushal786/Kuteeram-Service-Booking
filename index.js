import express from "express";
import {config} from "dotenv";
import connectDB from "./config/connectDB.js";
import userRouter from "./routes/userRouter.js";
import cookieParser from "cookie-parser";
import serviceRouter from "./routes/serviceRouter.js";

config({path: "./env/config.env"});

const server=express();

server.use(express.json());
server.use(cookieParser());
connectDB();

server.use("/api/user", userRouter);
server.use("/api/service", serviceRouter);

server.get("/", (req, res)=> {
  res.send("Welcome to the server");
});

server.listen(process.env.PORT, ()=> {
  console.log(`Server listening on port ${process.env.PORT}`);
});