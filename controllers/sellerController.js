import productModel from "../models/productModel.js";
import sellerModel from "../models/sellerModel.js";
import generateTokenSeller from "../utils/generateTokenSeller.js";
import orderModel from "../models/orderModel.js";


export const sellerSignup=async (req, res)=> {
  const {name, phone, riceMillName, city, gps}=req.body;
  if(!name || !phone || !riceMillName || !city || !gps){
    return res.status(400).json({
      success: false,
      message: "Please enter all the details!"
    });
  }

  const user=await sellerModel.findOne({phone});
  if(user){
    return res.status(400).json({
      success: false,
      message: `Seller with phone ${phone} already exists!`
    });
  }

  const sellerData={
    name,
    phone,
    riceMillName,
    city,
    gps
  };

  const newUser=new sellerModel(sellerData);
  await newUser.save();

  return res.status(200).json({
    success: true,
    message: `Seller signed up with phone ${phone} successfully!`,
    seller: newUser
  });
}

export const sellerLogin=async (req, res)=> {
  const {phone}=req.body;

  if(!phone){
    return res.status(400).json({
      success: false,
      message: "Enter the phone number to login!"
    });
  }

  const user=await sellerModel.findOne({phone});
  if(!user){
    return res.status(400).json({
      success: false,
      message: "Seller with the phone number doesn't exist, please signup!"
    });
  }

  if(phone===user.phone){
    const token=generateTokenSeller(res, user?._id);

    return res.status(200).json({
      success: true,
      message: "Seller logged in successfully",
      token
    });
  }else{
    return res.status(400).json({
      success: false,
      message: "Invalid credentials!"
    });
  }
}

export const checkAuthSeller=async (req, res)=> {
  const user=await sellerModel.findById(req.userId);
  
  if(!user){
    return res.status(400).json({
      message: "Seller not found",
      success: false
    });
  }

  return res.status(200).json({
    seller: user,
    success: true
  });
}

export const addProduct=async (req, res)=> {
  const {name, productType, quantity, price, minimumAcceptablePrice}=req.body;

  if(!name || !productType || !quantity || !price || !minimumAcceptablePrice){
    return res.status(400).json({
      success: false,
      message: "Please provide all details of the product!"
    });
  }

  const product=await productModel.findOne({name});
  if(product){
    return res.status(400).json({
      success: false,
      message: "Product already exists!"
    });
  }

  const productData={
    name,
    productType,
    quantity,
    price
  };

  const newProduct=new productModel(productData);
  await newProduct.save();

  const seller=await sellerModel.findById(req.userId);
  if(!seller){
    return res.status(400).json({
      success: false,
      message: "Seller not registered!"
    });
  }

  if (!seller.products) {
    seller.products = {};
  }

  seller.products[name]={
    type: productType,
    quantity,
    price,
    minimumAcceptablePrice,
    addedAt: new Date().toISOString()
  };

  seller.markModified('products');

  await seller.save();

  return res.status(200).json({
    success: true,
    message: "Product added successfully!",
    product: newProduct,
    seller
  });
}

export const updateProduct=async (req, res)=> {
  const {prodId, quantity, price}=req.body;

  const product=await productModel.findById(prodId);
  if(!product){
    return res.status(400).json({
      success: false,
      message: "Product doesn't exist!"
    });
  }

  if(!product.availability){
    return res.status(400).json({
      success: false,
      message: "Product not available!"
    });
  }

  if(quantity){
    product.quantity=quantity;
  }

  if(price){
    product.price=price;
  }

  const seller=await sellerModel.findById(req.userId);
  if(!seller){
    return res.status(400).json({
      success: false,
      message: "Seller not registered!"
    });
  }

  seller.products[product.name]={
    ...seller.products[product.name],
    quantity: quantity,
    price: price
  };

  await product.save();
  await seller.save();

  return res.status(200).json({
    success: true,
    message: "Product updated successfully!",
    product,
    seller
  });
}

export const updateAvailability=async (req, res)=> {
  const {prodId}=req.body;

  const product=await productModel.findById(prodId);
  if(!product){
    return res.status(400).json({
      success: false,
      message: "Product doesn't exist!"
    });
  }

  product.availability=!product.availability;

  await product.save();

  return res.status(200).json({
    success: true,
    message: product.availability ? "Product available" : "Product not available",
    available: product.availability
  });
}

export const getAllProducts=async (req, res)=> {
  const products=await productModel.find();

  return res.status(200).json({
    success: true,
    products
  });
}

export const acceptPendingOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Please provide orderId"
      });
    }

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot accept an order with status '${order.status}'`
      });
    }

    order.status = "Accepted";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order accepted successfully!",
      order
    });

  } catch (error) {
    console.error("Error in accepting pending order:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};