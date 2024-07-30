
const mongoose = require("mongoose");

const AssetTransferRequestSchema = new mongoose.Schema(
    {
        itemId: String,
        assetId: String,
        asset_description: String,
        model: String,
        serial: String,
        oldLocation: String,
        transferType: String,
        transfer_case: String,
        newLocation: String,
        transferRemarks: String,
        status: String,
    },
    {
        timestamps: true,
    },
    {
        collection: "asset_transfer_request",
    }
);

module.exports = mongoose.model("asset_transfer_request", AssetTransferRequestSchema);