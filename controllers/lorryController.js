import lorryModel from "../models/lorryModel.js";
import orderModel from "../models/orderModel.js";
import sellerModel from "../models/sellerModel.js";

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const createLorry=async (req, res)=> {
  const {agencyName, phone, gps, vehicleNumber, driverName, driverPhone}=req.body;

  if(!agencyName || !phone || !gps || !vehicleNumber || !driverName || !driverPhone){
    return res.status(400).json({
      success: false,
      message: "Provide all details of the lorry!"
    });
  }

  const lorry=await lorryModel.findOne({vehicleNumber});
  if(lorry){
    return res.status(400).json({
      success: false,
      message: "Lorry already exists!"
    });
  }

  const lorryData={
    agencyName,
    phone,
    gps,
    vehicleNumber,
    driverName,
    driverPhone
  };

  const newLorry=new lorryModel(lorryData);
  await newLorry.save();

  return res.status(200).json({
    success: true,
    message: "Lorry registered successfully!",
    lorry: newLorry
  });
}

export const notifyNearbyLorries = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await orderModel.findById(orderId).populate("sellerId");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.status !== "Paid") {
      return res.status(400).json({
        success: false,
        message: "Order is not paid yet"
      });
    }

    const seller = await sellerModel.findById(order.sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found"
      });
    }

    const nearestLorries = await lorryModel.aggregate([
      {
        $geoNear: {
          near: { 
            type: "Point", 
            coordinates: seller.gps.coordinates 
          },
          distanceField: "distance",
          spherical: true,
          query: { available: true }
        }
      },
      { $sort: { distance: 1 } },
      { $limit: 3 }
    ]);

    if (nearestLorries.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No available lorries nearby"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Nearby lorries notified successfully",
      lorries: nearestLorries
    });
  } catch (error) {
    console.error("Error in notifyNearbyLorries:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const acceptDeliveryJob = async (req, res) => {
  try {
    const { orderId, lorryId } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.status !== "Paid") {
      return res.status(400).json({
        success: false,
        message: "Order is not ready for delivery"
      });
    }

    const lorry = await lorryModel.findById(lorryId);
    if (!lorry) {
      return res.status(404).json({
        success: false,
        message: "Lorry not found"
      });
    }

    if (!lorry.available) {
      return res.status(400).json({
        success: false,
        message: "Lorry is not available"
      });
    }

    order.status = "Assigned";
    order.lorryId = lorryId;
    await order.save();

    lorry.available = false;
    lorry.currentOrder = orderId;
    await lorry.save();

    const otp = generateOTP();
    order.sellerOTP = otp;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Delivery job accepted successfully",
      order,
      lorry
    });

  } catch (error) {
    console.error("Error in acceptDeliveryJob:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateLorryLocation = async (req, res) => {
  try {
    const { lorryId, longitude, latitude } = req.body;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: "Please provide longitude and latitude"
      });
    }

    const lorry = await lorryModel.findById(lorryId);
    if (!lorry) {
      return res.status(404).json({
        success: false,
        message: "Lorry not found"
      });
    }

    lorry.gps.coordinates = [longitude, latitude];
    await lorry.save();

    return res.status(200).json({
      success: true,
      message: "Lorry location updated successfully",
      lorry
    });

  } catch (error) {
    console.error("Error in updateLorryLocation:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const verifySellerOTP = async (req, res) => {
  try {
    const { orderId, otp } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.status !== "Assigned") {
      return res.status(400).json({
        success: false,
        message: "Order is not in the correct state for OTP verification"
      });
    }

    if (order.sellerOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    order.isOTPVerified = true;
    order.status = "PickupVerified";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. Pickup confirmed.",
      order
    });

  } catch (error) {
    console.error("Error in verifySellerOTP:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const confirmDelivery = async (req, res) => {
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
        message: "Unauthorized to confirm delivery for this order"
      });
    }

    if (order.status !== "PickupVerified") {
      return res.status(400).json({
        success: false,
        message: "Order is not ready for delivery confirmation"
      });
    }

    order.status = "Delivered";
    order.deliveryConfirmed = true;
    await order.save();

    const lorry = await lorryModel.findById(order.lorryId);
    if (lorry) {
      lorry.available = true;
      lorry.currentOrder = null;
      await lorry.save();
    }

    return res.status(200).json({
      success: true,
      message: "Delivery confirmed successfully!",
      order
    });

  } catch (error) {
    console.error("Error in confirmDelivery:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getLorryDetails = async (req, res) => {
  try {
    const { lorryId } = req.body;

    const lorry = await lorryModel.findById(lorryId);
    if (!lorry) {
      return res.status(404).json({
        success: false,
        message: "Lorry not found"
      });
    }

    return res.status(200).json({
      success: true,
      lorry
    });

  } catch (error) {
    console.error("Error in getLorryDetails:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};