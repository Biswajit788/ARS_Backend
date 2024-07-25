
const mongoose = require("mongoose");

const AssetTransferDataSchema = new mongoose.Schema(
    {
        assetRefId: { type: mongoose.Schema.Types.ObjectId, ref: 'procurementData', required: true },
        transfer_type: String,
        transfer_code: {type: Number},
        transfer_case: String,
        transfer_remarks: String,
        asset_id: String,
        category: String, 
        itemCategory: String,
        model: String,
        serial: String,
        part_no: String,
        unitPrice: {type: Number},
        warranty: String,
        installation_dt: String,
        licenseStartDate: String,
        licenseEndDate: String,
        additional_info: String, 
        last_project: String,
        last_dept: String,
        supplier: String,
        vendoradd: String,
        vendor_category: String, 
        caste: String,  
        gender: String, 
        reg_no: String, 
        gstin: String, 
        mode: String,
        title: String,
        order_no: String, 
        order_dt: String,
        order_value: {type: Number},    
    },
    {
        timestamps: true,
    },
    {
        collection: "asset_transfers",
    }
);

module.exports = mongoose.model("asset_transfers", AssetTransferDataSchema);
