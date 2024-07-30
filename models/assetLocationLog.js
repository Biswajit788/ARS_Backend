const mongoose = require("mongoose");

const assetLocationLogSchema = new mongoose.Schema(
  {
    assetRefId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'AssetTransferRequest' },
    assetId: { type: String, required: true },
    asset_description: { type: String, required: true },
    serial: { type: String, required: true },
    model: { type: String, required: true },
    oldLocation: { type: String, required: true },
    transferType: { type: String, required: true },
    newLocation: { type: String, required: true },
    transfer_remarks: { type: String, required: true },
    status: { type: String, required: true },
    rejection_remarks: { type: String, default: '' },
    changeTimestamp: { type: Date, default: Date.now }
  },
  {
    collection: "assetLocationLog",
  }
);

module.exports = mongoose.model("assetLocationLog", assetLocationLogSchema);