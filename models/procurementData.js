
const mongoose = require("mongoose");

const ProcurementDataSchema = new mongoose.Schema(
    {
        project: String,
        dept: String,
        description: String,
        category: String, 
        itemCategory: String,
        warranty: String,
        installation_dt: String,
        model: String,
        serial: String,
        part_no: String,
        asset_id: String,
        unitPrice: {type: Number}, 
        additional_info: String,
        licenseStartDate: String,
        licenseEndDate: String,
        supplier: String,
        vendoradd: String,
        order_no: String, 
        order_dt: String,
        price: {type: Number},
        vendor_category: String, 
        caste: String,  
        gender: String, 
        reg_no: String, 
        gstin: String, 
        mode: String,
        itemUser: String,
        itemLoc: String,
        reason: String, 
        remarks: String,
        created_by: String,
        status: {type: Number},
        transFlag: {type: Number},
    },
    {
        timestamps: true,
    },
    {
        collection: "procurements",
    }
);

module.exports = mongoose.model("procurements", ProcurementDataSchema);
