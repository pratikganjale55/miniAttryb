const Router = require("express");
const inventryRoute = Router();
const inventryData = require("../models/MarketplaceInventoryModel");
const oemSpecdata = require("../models/oemModel");

const jwt = require("jsonwebtoken");
// Set up Multer storage


inventryRoute.post("/addInventry/:model_id", async (req, res) => {
  try {
    console.log(req.body)
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const { userId } = jwt.verify(token, process.env.JWT_KEY);
    const { model_id } = req.params;
    const { 
     image,
      title, 
      bullet_points,
      odometer_km,
      major_scratches,
      original_paint,
      accidents_reported,
      previous_buyers,
      registration_place
     
    } = req.body;
//   console.log(req.body, model_id)
    const oemSpec = await oemSpecdata.findById(model_id);
    if (!oemSpec) {
      return res.status(404).json({ message: "OEM model not found" });
    }
    const newItem = new inventryData({
      model_id,
      image,
      title,
      bullet_points,
      odometer_km,
      major_scratches,
      original_paint,
      accidents_reported,
      previous_buyers,
      registration_place,
      userId 
    });
    const savedItem = await newItem.save();
    return res
      .status(201)
      .send({ message: "Inventry data save add successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
inventryRoute.get("/allInventry/:userId", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const {userId} = req.params;
    console.log(userId)
    const inventory = await inventryData
      .find({userId})
      .populate("model_id");

    if (!inventory) {
      return res
        .status(404)
        .json({ message: "No inventory found for the given model ID" });
    }

    return res.status(200).json(inventory);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

inventryRoute.patch("/updateInventry/:id", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const { id } = req.params;
    const updateFields = req.body;

    const updatedItem = await inventryData.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    return res.status(200).json({message : "Data edit successfully"});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

inventryRoute.post("/deleteInventry", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const  ids  = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid IDs array" });
    }

    const result = await inventryData.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No matching inventory found" });
    }

    return res.status(200).json({ message: "Inventory data deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = inventryRoute;
