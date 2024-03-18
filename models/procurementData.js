const mongoose = require("mongoose");

const ProcurementDataSchema = new mongoose.Schema(
    {
        project: String,
        dept: String,
        description: String,
        qty: {type: Number},
        model: String,
        serial: String,
        part_no: String,
        asset_id: {type: Number},
        additional_info: String,
        supplier: String,
        vendoradd: String,
        order_no: String, 
        order_dt: String, 
        price: {type: Number},
        condition1: String, 
        condition2: String,  
        condition4: String,
        condition5: String, 
        reg_no: String, 
        pan: String, 
        category: String, 
        cate_others: String,
        mode: String,
        itemLoc: String,
        reason: String, 
        remarks: String,
        created_by: String,
        status: {type: Number, unique: true},
    },
    {
        timestamps: true,
    },
    {
        collection: "procurements",
    }
);

module.exports = mongoose.model("procurements", ProcurementDataSchema);
