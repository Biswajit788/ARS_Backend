const mongoose = require("mongoose");

const VendorDetailsSchema = new mongoose.Schema(
  {
    vendorId: {type: Number, unique: true},
    vName: String,
    vAddress: String,
    vGstin: { type: String, unique: true },
    vCategory: String,
    msmeRegNo: String,
    msmeCate: String,
    msmeGender: String,
  },
  {
    timestamps: true,
  },
  {
    collection: "vendors",
  }
);

module.exports = mongoose.model("vendors", VendorDetailsSchema);