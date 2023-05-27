const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const MarketplaceInventorySchema = new mongoose.Schema({
  model_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OEMSpecs",
    required: true,
  },
  image: {type: String,required: true},
  bullet_points: {type: [{point : String}],required: true},
  odometer_km: { type: Number, required: true },
  title: {type: String,required: true},
  major_scratches: { type: Boolean },
  original_paint: { type: Boolean},
  accidents_reported: { type: Number, required: true },
  previous_buyers: { type: Number, required: true },
  registration_place: { type: String, required: true },
  userId : {type: String, required : true}
});

const MarketplaceInventory = mongoose.model(
  "MarketplaceInventory",
  MarketplaceInventorySchema
);

module.exports = MarketplaceInventory;
