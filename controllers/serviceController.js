import req from "express/lib/request.js";
import serviceModel from "../models/serviceModel.js";

export const addService=async (req, res)=> {
  const {name, description, price, category, rating}=req.body;

  if(!name || !description || !price || !category || !rating){
    return res.status(400).json({
      success: false,
      message: "Please enter all details of the service!"
    });
  }

  const service=await serviceModel.findOne({name});
  if(service){
    return res.status(400).json({
      success: false,
      message: "Service already exists!"
    });
  }

  const serviceData={
    name,
    description,
    price,
    category,
    rating,
  };

  const newService=new serviceModel(serviceData);
  await newService.save();

  return res.status(200).json({
    success: true,
    message: "Service added successfully!",
    service: newService
  });
}

export const updateAvailability=async (req, res)=> {
  const {serviceId}=req.body;

  const service=await serviceModel.findById(serviceId);
  if(!service){
    return res.status(400).json({
      success: false,
      message: "Service not found!"
    });
  }

  service.availability=!service.availability;
  await service.save();

  return res.status(200).json({
    success: true,
    message: "Service availability updated successfully!",
    service
  });
}

export const updateService=async (req, res)=> {
  const {serviceId, price, rating}=req.body;

  const service=await serviceModel.findById(serviceId);
  if(!service){
    return res.status(400).json({
      success: false,
      message: "Service not found!"
    });
  }

  if(price){
    service.price=price;
  }
  if(rating){
    service.rating=rating;
  }

  await service.save();

  const formattedCreatedAt = service.createdAt.toLocaleString();
  const formattedUpdatedAt = service.updatedAt.toLocaleString();

  return res.status(200).json({
    success: true,
    message: "Service details updated successfully!",
    updatedService: {
      ...service.toObject(),
      createdAt: formattedCreatedAt,
      updatedAt: formattedUpdatedAt
    }
  })
}

export const getAllServices=async (req, res)=> {
  const services=await serviceModel.find();

  return res.status(200).json({
    success: true,
    message: "All service listings retreived",
    services
  });
}