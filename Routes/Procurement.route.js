const express = require('express');
const app = express();
const procurementRoute = express.Router();

let procurementModel = require('../models/procurementData');

// To get list of Procurement (Admin User)
/* procurementRoute.route('/').get(function (req, res) {
    procurementModel.find(function (err, data) {
        if (err) {
            console.log("🚀 ~ file: Procurement.route.js ~ line 12 ~ err", err);
        }
        else {
            res.json(data);
        }
    });
}); */

procurementRoute.route('/').post(function (req, res) {
    const filter = req.body;
    const projectFilter = filter.project;
    const deptFilter = filter.dept;
    const roleFilter = filter.role;

    if(roleFilter === "Admin"){
        procurementModel.find({ project: projectFilter }, function (err, data) {
            if (err) {
                console.log("🚀 ~ file: Procurement.route.js ~ line 12 ~ err", err);
            }
            else {
                res.json(data);
            }
        });
    }
    else{
        procurementModel.find({ project: projectFilter, dept: deptFilter }, function (err, data) {
            if (err) {
                console.log("🚀 ~ file: Procurement.route.js ~ line 12 ~ err", err);
            }
            else {
                res.json(data);
            }
        });
    }
    
});

// To get list of Procurement (Normal User)
/* procurementRoute.route('/').post(function (req, res) {
    const filter = req.body;
    const projectFilter = filter.project;
    const deptFilter = filter.dept;
    console.log("🚀 ~ file: Procurement.route.js ~ line 11 ~ filter", filter.project)
    procurementModel.find({ project: projectFilter, dept: deptFilter }, function (err, data) {
        if (err) {
            console.log("🚀 ~ file: Procurement.route.js ~ line 12 ~ err", err);
        }
        else {
            res.json(data);
        }
    });
}); */

// To Add New Item

procurementRoute.route('/addItem').post(function (req, res) {

    let data = new procurementModel(req.body);
    data.save()
        .then(response => {
            res.status(200).json({ 'message': 'New Item Added Successfully' });
        })
        .catch(err => {
            res.status(400).send("Something went wrong. Please try again later!");
        });
});

// To get Item details by ID

procurementRoute.route('/editItem/:id').get(function (req, res) {
    let id = req.params.id;
    procurementModel.findById(id, function (err, data) {
        res.json(data);
    });
});

// To Update Item details

procurementRoute.route('/updateItem/:id').post(function (req, res) {

    procurementModel.findById(req.params.id, function (err, data) {
        if (!data) {
            return next(new Error('Unable to find Item with this ID'));
        } else {
            data.project = req.body.project;
            data.dept = req.body.dept;
            data.description = req.body.description;
            data.qty = req.body.qty;
            data.model = req.body.model;
            data.serial = req.body.serial;
            data.part_no = req.body.part_no;
            data.asset_id = req.body.asset_id;
            data.additional_info = req.body.additional_info;
            data.supplier = req.body.supplier;
            data.vendoradd = req.body.vendoradd;
            data.condition1 = req.body.condition1;
            data.reg_no = req.body.reg_no;
            data.condition2 = req.body.condition2;
            data.condition5 = req.body.condition5;
            data.pan = req.body.pan;
            data.condition4 = req.body.condition4;
            data.reason = req.body.reason;
            data.order_no = req.body.order_no;
            data.order_dt = req.body.order_dt;
            data.price = req.body.price;
            data.category = req.body.category;
            data.cate_others = req.body.cate_others;
            data.mode = req.body.mode;
            data.itemLoc = req.body.itemLoc;
            data.remarks = req.body.remarks;

            data.save()
                .then(response => {
                    res.json('Item Updated Successfully');
                })
                .catch(err => {
                    res.status(400).send('Unable to Update Item');
                });
        }
    });
});

//To mark Item for Transfer
procurementRoute.route('/markItem/:id').get(function (req, res) {
    procurementModel.findByIdAndUpdate({ _id: req.params.id }, { status: '1' }, function (err, data) {
        if(err){
            console.log(err);
        }else{
            if(data.status != 0){
                res.sendStatus(201);
            }else{
                res.sendStatus(200);
            }
        }

    });
});

// To Delete the Item

procurementRoute.route('/deleteItem/:id').get(function (req, res) {
    procurementModel.findByIdAndRemove({ _id: req.params.id }, function (err, data) {
        if (err)
            res.json(err);
        else
            res.json('Item Deleted Successfully');
    });
});

// To get list of Pending Marked Transfer Item 
procurementRoute.route('/pendingTransfer').get(function (req, res) {
    procurementModel.find({ status: "1" }, function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(data);
        }
    });
});

//To remove Item from TransferList
procurementRoute.route('/removeTransferItemList/:id').get(function (req, res) {
    procurementModel.findByIdAndUpdate({ _id: req.params.id }, { status: '0' }, function (err, data) {
        if(err){
            console.log(err);
        }
        else{
            if(data.status != 0){
                res.sendStatus(200);
            }else{
                res.sendStatus(201);
            }
        }
    });
});


module.exports = procurementRoute;