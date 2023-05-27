const Router = require("express");
const oemSpecRoute = Router();
const oenSpecData = require("../models/oemModel");

function properName(name) {
  return name.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

oemSpecRoute.post("/oemSpec", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const { model_name, year, list_price, colors, mileage, power, max_speed } =
      req.body;

    if (
      !model_name ||
      !year ||
      !list_price ||
      !colors ||
      !mileage ||
      !power ||
      !max_speed
    ) {
      return res.status(401).send({ message: "Please fill all details" });
    }

    let toTitleCase = properName(model_name);
    const oemData = new oenSpecData({ ...req.body, model_name: toTitleCase });
    await oemData.save();

    return res.status(201).send({ message: "OEM Data save successfully" });
  } catch (error) {
    console.log(error);
    return res, send({ message: "OEM data not save ", error });
  }
});

oemSpecRoute.get("/singleOemSpec", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const { model_name } = req.query;

    const properModelNameFormat = properName(model_name);
    let queryObj = {};
    if (properModelNameFormat) {
      queryObj.model_name = { $regex: properModelNameFormat, $options: "i" };
    }
    // console.log(queryObj)
    const items = await oenSpecData.find(queryObj).exec();
    if (items.length === 0) {
      return res.status(404).send({
        message: "No matching data found or check model name",
      });
    }

    return res.status(200).send(items);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal server error" });
  }
});
oemSpecRoute.get("/allOemSpec", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const items = await oenSpecData.find();
    if (items.length === 0) {
      return res.status(404).send({
        message: "No data found",
      });
    }

    return res.status(200).send(items);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal server error" });
  }
});
module.exports = oemSpecRoute;
