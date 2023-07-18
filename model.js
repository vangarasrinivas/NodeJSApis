const mongoose = require("mongoose");

const BrandName = mongoose.Schema({
  vendor_name: {
    type: String,
    require: true,
  },
  vendor_phone: {
    type: Number,
    require: true,
  },
  brandName: {
    type: String,
    require: true,
  },
  quantity: {
    type: Number,
    require: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Brandname", BrandName);
