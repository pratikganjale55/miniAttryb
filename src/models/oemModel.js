const mongoose = require('mongoose');
mongoose.set("strictQuery", true);

const OEMSpecsSchema = new mongoose.Schema({
  model_name: { type: String, required: true },
  year: { type: Number, required: true },
  list_price: { type: Number, required: true },
  colors: { type: [String], required: true },
  mileage: { type: Number, required: true },
  power: { type: Number, required: true },
  max_speed: { type: Number, required: true },
});

const OEMSpecs = mongoose.model('OEMSpecs', OEMSpecsSchema);

module.exports = OEMSpecs;