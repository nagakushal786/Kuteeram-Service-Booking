import buyerModel from "../models/buyerModel.js";
import generateTokenBuyer from "../utils/generateTokenBuyer.js";

export const buyerSignup=async (req, res)=> {
  const {name, phone}=req.body;
  if(!name || !phone){
    return res.status(400).json({
      success: false,
      message: "Please enter all the details!"
    });
  }

  const user=await buyerModel.findOne({phone});
  if(user){
    return res.status(400).json({
      success: false,
      message: `Buyer with phone ${phone} already exists!`
    });
  }

  const buyerData={
    name,
    phone
  };

  const newUser=new buyerModel(buyerData);
  await newUser.save();

  return res.status(200).json({
    success: true,
    message: `Buyer signed up with phone ${phone} successfully!`,
    buyer: newUser
  });
}

export const buyerLogin=async (req, res)=> {
  const {phone}=req.body;

  if(!phone){
    return res.status(400).json({
      success: false,
      message: "Enter the phone number to login!"
    });
  }

  const user=await buyerModel.findOne({phone});
  if(!user){
    return res.status(400).json({
      success: false,
      message: "Buyer with the phone number doesn't exist, please signup!"
    });
  }

  if(phone===user.phone){
    const token=generateTokenBuyer(res, user?._id);

    return res.status(200).json({
      success: true,
      message: "Buyer logged in successfully",
      token
    });
  }else{
    return res.status(400).json({
      success: false,
      message: "Invalid credentials!"
    });
  }
}

export const checkAuthBuyer=async (req, res)=> {
  const user=await buyerModel.findById(req.userId);
  
  if(!user){
    return res.status(400).json({
      message: "Buyer not found",
      success: false
    });
  }

  return res.status(200).json({
    buyer: user,
    success: true
  });
}