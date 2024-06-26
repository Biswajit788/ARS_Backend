const express = require('express');
const app = express();
const procurementRoute = express.Router();

let procurementModel = require('../models/procurementData');

// To get list of Procurement (Role Based)

procurementRoute.route('/').post(async function (req, res) {
    const filter = req.body;
    const projectFilter = filter.project;
    const deptFilter = filter.dept;
    const roleFilter = filter.role;

    try {
        let query;
        if (roleFilter === "Admin") {
            query = { project: projectFilter };
        } else {
            query = { project: projectFilter, dept: deptFilter };
        }

        const data = await procurementModel.find(query).sort({ _id: -1, createdAt: -1 });
        res.json(data);
    } catch (err) {
        console.error("🚀 ~ file: Procurement.route.js ~ line 12 ~ err", err);
        res.status(500).send("An error occurred while fetching the data.");
    }

});


// To Add New Item

procurementRoute.route('/addItem').post(async (req, res) => {
    try {
        let data = new procurementModel(req.body);
        await data.save();
        res.status(200).json({ 'message': 'New Item Added Successfully' });
    } catch (err) {
        console.error("🚀 ~ file: Procurement.route.js ~ line 12 ~ err", err);
        res.status(400).send("Something went wrong. Please try again later!");
    }
});

// To get Item details by ID

procurementRoute.route('/editItem/:id').get(async (req, res) => {
    const id = req.params.id;
    try {
        const data = await procurementModel.findById(id);
        res.json(data);
    } catch (err) {
        console.error("Error fetching item by ID:", err);
        res.status(500).json({ error: 'An error occurred while fetching the item' });
    }
});

// To Update Item details

procurementRoute.route('/updateItem/:id').post(async (req, res) => {
    try {
        const data = await procurementModel.findById(req.params.id);

        if (!data) {
            return res.status(404).json({ error: 'Unable to find Item with this ID' });
        }
        data.project = req.body.project;
        data.dept = req.body.dept;
        data.description = req.body.description;
        data.category = req.body.category;
        data.cate_others = req.body.cate_others;
        data.warranty = req.body.warranty;
        data.installation_dt = req.body.installation_dt;
        data.model = req.body.model;
        data.serial = req.body.serial;
        data.part_no = req.body.part_no;
        data.asset_id = req.body.asset_id;
        data.additional_info = req.body.additional_info;
        data.supplier = req.body.supplier;
        data.vendoradd = req.body.vendoradd;
        data.vendor_category = req.body.vendor_category;
        data.reg_no = req.body.reg_no;
        data.condition2 = req.body.condition2;
        data.condition5 = req.body.condition5;
        data.gstin = req.body.gstin;
        data.reason = req.body.reason;
        data.order_no = req.body.order_no;
        data.order_dt = req.body.order_dt;
        data.price = req.body.price;
        data.mode = req.body.mode;
        data.itemUser = req.body.itemUser;
        data.itemLoc = req.body.itemLoc;
        data.remarks = req.body.remarks;

        await data.save();
        res.json('Item Updated Successfully');
    } catch (err) {
        res.status(400).send('Unable to Update Item');
    }
});

//To mark Item for Transfer
procurementRoute.route('/markItem/:id').get(async (req, res) => {
    try {
        const item = await procurementModel.findById({_id: req.params.id});
        if(item.status != '0'){
            res.sendStatus(201);
        }else{
            const updatedItem = await procurementModel.findByIdAndUpdate({_id: req.params.id}, { status: '1' }, { new: true });
            if(updatedItem){
                res.sendStatus(200);
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while marking the item status' });
    }
});

// To Delete the Item

procurementRoute.route('/deleteItem/:id').get(async (req, res) => {
    try {
      const result = await procurementModel.findByIdAndDelete({_id: req.params.id});
      if (!result) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json({ message: 'Item Deleted Successfully' });
    } catch (err) {
      console.error( err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// To get list of Pending Marked Transfer Item 

procurementRoute.route('/pendingTransfer').get(async (req, res) => {
    try {
        const data = await procurementModel.find({ status: "1" });
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching pending transfers' });
    }
});

//To remove Item from TransferList

procurementRoute.route('/removeTransferItemList/:id').get(async (req, res) => {
    try {
        const data = await procurementModel.findByIdAndUpdate(
            { _id: req.params.id },
            { status: '0' },
        );

        if (data && data.status !== 0) {
            res.sendStatus(200);
        } else {
            res.sendStatus(201);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while updating the item status' });
    }
});

module.exports = procurementRoute;