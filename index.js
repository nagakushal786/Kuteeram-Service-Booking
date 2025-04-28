import express from "express";
import {config} from "dotenv";
import connectDB from "./config/connectDB.js";
import cookieParser from "cookie-parser";
import buyerRouter from "./routes/buyerRouter.js";
import sellerRouter from "./routes/sellerRouter.js";
import lorryRouter from "./routes/lorryRouter.js";

config({path: "./env/config.env"});

const server=express();

server.use(express.json());
server.use(cookieParser());
connectDB();

server.use("/api/buyer", buyerRouter);
server.use("/api/seller", sellerRouter);
server.use("/api/lorry", lorryRouter);

server.get("/", (req, res)=> {
  res.send("Welcome to the kuteeram server");
});

server.listen(process.env.PORT, ()=> {
  console.log(`Server listening on port ${process.env.PORT}`);
});