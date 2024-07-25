const mongoose = require("mongoose");

const assetLocationLogSchema = new mongoose.Schema(
  {
    assetRefId: { type: mongoose.Schema.Types.ObjectId, ref: 'procurementData', required: true },
    assetId: {type: String, required: true},
    asset_description: {type: String, required: true},
    oldLocation: { type: String, required: true },
    newLocation: { type: String, required: true },
    changeTimestamp: { type: Date, default: Date.now },
    transfer_remarks: {type: String, required: true}
  },
  {
    collection: "assetLocationLog",
  }
);

module.exports = mongoose.model("assetLocationLog", assetLocationLogSchema);