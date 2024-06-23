
const mongoose = require("mongoose");

const ProcurementDataSchema = new mongoose.Schema(
    {
        project: String,
        dept: String,
        description: String,
        category: String, 
        cate_others: String,
        //qty: {type: Number},
        warranty: String,
        installation_dt: String,
        model: String,
        serial: String,
        part_no: String,
        asset_id: String,
        additional_info: String,
        supplier: String,
        vendoradd: String,
        order_no: String, 
        order_dt: String, 
        price: {type: Number},
        vendor_category: String, 
        condition2: String,  
        condition5: String, 
        reg_no: String, 
        gstin: String, 
        mode: String,
        itemUser: String,
        itemLoc: String,
        reason: String, 
        remarks: String,
        created_by: String,
        status: {type: Number},
    },
    {
        timestamps: true,
    },
    {
        collection: "procurements",
    }
);

module.exports = mongoose.model("procurements", ProcurementDataSchema);
