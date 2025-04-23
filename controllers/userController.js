import userModel from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import validator from "validator";
import generateTokenAndCookie from "../utils/generateTokenAndCookie.js";
import serviceModel from "../models/serviceModel.js";

export const userSignup=async (req, res)=> {
  const {name, email, password}=req.body;
  if(!name || !email || !password){
    return res.status(400).json({
      success: false,
      message: "Please enter all the details!"
    });
  }

  const user=await userModel.findOne({email});
  if(user){
    return res.status(400).json({
      success: false,
      message: "User with the email already exists!"
    });
  }

  if(!validator.isEmail(email)){
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email!"
    });
  }

  const salt=await bcryptjs.genSalt(10);
  const hashPassword=await bcryptjs.hash(password, salt);

  const userData={
    name,
    email,
    password: hashPassword
  };

  const newUser=new userModel(userData);
  await newUser.save();

  return res.status(200).json({
    success: true,
    message: "User signed up successfully"
  });
}

export const userLogin=async (req, res)=> {
  const {email, password}=req.body;

  if(!email || !password){
    return res.status(400).json({
      success: false,
      message: "Enter all the required details!"
    });
  }

  const user=await userModel.findOne({email});
  if(!user){
    return res.status(400).json({
      success: false,
      message: "User with the email doesn't exist, please signup!"
    });
  }

  const isMatch=await bcryptjs.compare(password, user.password);
  if(isMatch){
    const token=generateTokenAndCookie(res, user?._id);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token
    });
  }else{
    return res.status(400).json({
      success: false,
      message: "Invalid credentials!"
    });
  }
}

export const checkAuth=async (req, res)=> {
  const user=await userModel.findById(req.userId).select("-password");
  
  if(!user){
    return res.status(400).json({
      message: "User not found",
      success: false
    });
  }

  return res.status(200).json({
    data: user,
    success: true
  });
}

export const bookService=async (req, res)=> {
  try{
    const {name}=req.body;

    const service=await serviceModel.findOne({ name });
    if(!service){
      return res.status(404).json({
        message: "Service not found",
        success: false
      });
    }

    const user=await userModel.findById(req.userId);
    if(!user){
      return res.status(404).json({
        message: "User not found",
        success: false
      });
    }

    if(service.availability){
      user.services_booked[name]={
        serviceId: service._id,
        bookedAt: new Date().toISOString()
      };
    }else{
      return res.status(400).json({
        success: false,
        message: "Service not available, user can't book this service!"
      });
    }

    await user.save();

    res.status(200).json({
      message: "Service booked successfully",
      services_booked: user.services_booked,
      success: true
    });

  }catch (error){
    res.status(500).json({
      message: error.message || "Internal server error",
      success: false
    });
  }
};