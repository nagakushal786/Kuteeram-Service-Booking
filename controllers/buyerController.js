import buyerModel from "../models/buyerModel.js";
import productModel from "../models/productModel.js";
import generateTokenBuyer from "../utils/generateTokenBuyer.js";
import sellerModel from "../models/sellerModel.js";
import orderModel from "../models/orderModel.js";

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

export const searchProduct=async (req, res)=> {
  const {productType, quantity}=req.body;

  const reqProducts=await productModel.find({productType, quantity});

  return res.status(200).json({
    success: true,
    products: reqProducts
  });
}

export const showNearbyRiceMills = async (req, res)=> {
  try {
    const { longitude, latitude } = req.body;

    if (typeof longitude !== "number" || typeof latitude !== "number") {
      return res.status(400).json({
        success: false,
        message: "Please provide valid longitude and latitude as numbers.",
      });
    }

    const nearestSellers = await sellerModel.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distance",
          spherical: true,
        },
      },
      { $sort: { distance: 1 } },
      { $limit: 3 },
      {
        $project: {
          _id: 0,
          riceMillName: 1,
          city: 1,
          phone: 1,
          products: 1,
          distanceInKm: { $divide: ["$distance", 1000] },
        },
      },
    ]);

    const millsWithPricing = nearestSellers.map((seller) => {
      const productDetails = Object.entries(seller.products || {}).map(
        ([productName, details]) => {
          const basePrice = details?.price || 0;
          const priceWithCommission = basePrice * 1.05;

          return {
            productName,
            stock: details?.stock || 0,
            priceWithCommission: parseFloat(priceWithCommission.toFixed(2)),
            transportCost: "To be calculated", // Placeholder
          };
        }
      );

      return {
        riceMillName: seller.riceMillName,
        city: seller.city,
        phone: seller.phone,
        distanceInKm: seller.distanceInKm.toFixed(2),
        products: productDetails,
      };
    });

    return res.status(200).json({
      success: true,
      nearestMills: millsWithPricing,
    });
  } catch (error) {
    console.error("Error in showNearbyRiceMills:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error occurred: " + error.message,
    });
  }
};

export const createBid = async (req, res) => {
  try {
    const { sellerId, productName, bidPrice } = req.body;

    if (!sellerId || !productName || !bidPrice) {
      return res.status(400).json({
        success: false,
        message: "Please provide sellerId, productName, and bidPrice"
      });
    }

    const seller = await sellerModel.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    const product = seller.products[productName];
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found with this seller"
      });
    }

    if (bidPrice >= product.minimumAcceptablePrice) {
      const order = new orderModel({
        buyerId: req.userId,
        sellerId: sellerId,
        productName,
        bidPrice,
        finalPrice: bidPrice,
        status: "Accepted"
      });

      await order.save();

      return res.status(200).json({
        success: true,
        message: "Bid accepted automatically!",
        order
      });
    } else {
      const order = new orderModel({
        buyerId: req.userId,
        sellerId: sellerId,
        productName,
        bidPrice,
        finalPrice: product.price,
        status: "Pending"
      });

      await order.save();

      return res.status(200).json({
        success: true,
        message: "Bid placed successfully! Waiting for seller confirmation",
        order
      });
    }
  } catch (error) {
    console.error("Error in createBid:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const proceedPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.buyerId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to make payment for this order"
      });
    }

    if (order.status !== "Accepted") {
      return res.status(400).json({
        success: false,
        message: "Order is not yet accepted"
      });
    }

    order.status = "Paid";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment successful!",
      order
    });
  } catch (error) {
    console.error("Error in proceedPayment:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getOrderSummary = async (req, res) => {
  try {
    const orders = await orderModel.find({ buyerId: req.userId }).populate("sellerId", "riceMillName city phone");

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("Error in getOrderSummary:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};