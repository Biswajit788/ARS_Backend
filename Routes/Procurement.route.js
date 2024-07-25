const express = require('express');
const procurementRoute = express.Router();
const { authenticateToken, authorizeRole } = require('../authMiddleware');

let procurementModel = require('../models/procurementData');
let AssetLocationLog = require('../models/assetLocationLog');
let AssetTransfer = require('../models/assetTransferData');


const getTransferCode = (transferType) => {
    switch (transferType) {
        case 'Asset Handover as per IT Policy':
            return 100;
        case 'Damage/E-Waste':
            return 200;
        case 'Inter Project Transfer':
            return 300;
        default:
            return 0;
    }
};

// To get list of Procurement (Role Based)

procurementRoute.route('/').post(authenticateToken, async function (req, res) {
    const projectFilter = req.query.project;
    const deptFilter = req.query.dept;
    const roleFilter = req.query.role;

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

procurementRoute.route('/createItem').post(authenticateToken, async (req, res) => {
    const {
        project, dept, description, category, itemCategory, installation_dt, assets, licenseStartDate, licenseEndDate, additional_info, supplier,
        vendoradd, vendor_category, reg_no, caste, gender, gstin, reason, order_no, order_dt, price, mode,
        remarks, created_by, status,
    } = req.body;

    try {
        // If category is "Hardware", check for duplicate asset_id
        if (category === "Hardware") {
            for (let asset of assets) {
                const count = await procurementModel.countDocuments({ asset_id: asset.asset_id, category });

                if (count !== 0) {
                    return res.json({ error: "Document Already Exist", status: "exist", message: `Asset Id no. ${asset.asset_id} for category ${category} already exist.` });
                }
            }
        }

        // Save new records to the database
        const assetPromises = assets.map(asset => {
            const newAsset = new procurementModel({
                project, dept, description, category, itemCategory, installation_dt,
                serial: asset.serial,
                model: asset.model,
                part_no: asset.part_no,
                asset_id: asset.asset_id,
                unitPrice: asset.unitPrice,
                warranty: asset.warranty + ' Yrs',
                itemUser: asset.itemUser,
                itemLoc: asset.itemLoc,
                licenseStartDate,
                licenseEndDate,
                additional_info, supplier, vendoradd, vendor_category, reg_no, caste, gender,
                gstin, reason, order_no, order_dt, price, mode, remarks,
                created_by, status,
            });
            return newAsset.save();
        });

        await Promise.all(assetPromises);
        res.send({ status: "Success" });

    } catch (err) {
        console.error("Error creating asset record:", err);
        res.status(500).send("An error occurred while creating the asset record");
    }
});


// To get Item details by ID

procurementRoute.route('/editItem/:id').get(authenticateToken, async (req, res) => {
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

procurementRoute.route('/updateItem/:id').post(authenticateToken, async (req, res) => {
    try {
        const data = await procurementModel.findById(req.params.id);

        if (!data) {
            return res.status(404).json({ error: 'Unable to find Item with this ID' });
        }

        data.project = req.body.project;
        data.dept = req.body.dept;
        data.description = req.body.description;
        data.category = req.body.category;
        data.itemCategory = req.body.itemCategory;
        data.warranty = req.body.warranty;
        data.installation_dt = req.body.installation_dt;
        data.licenseStartDate = req.body.licenseStartDate;
        data.licenseEndDate = req.body.licenseEndDate;
        data.model = req.body.model;
        data.serial = req.body.serial;
        data.part_no = req.body.part_no;
        data.asset_id = req.body.asset_id;
        data.unitPrice = req.body.unitPrice;
        data.additional_info = req.body.additional_info;
        data.supplier = req.body.supplier;
        data.vendoradd = req.body.vendoradd;
        data.vendor_category = req.body.vendor_category;
        data.reg_no = req.body.reg_no;
        data.caste = req.body.caste;
        data.gender = req.body.gender;
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
procurementRoute.route('/markItem/:id').get(authenticateToken, async (req, res) => {
    try {
        const item = await procurementModel.findById({ _id: req.params.id });
        if (item.status != '0') {
            res.sendStatus(201);
        } else {
            const updatedItem = await procurementModel.findByIdAndUpdate({ _id: req.params.id }, { status: '1' }, { new: true });
            if (updatedItem) {
                res.sendStatus(200);
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while marking the item status' });
    }
});

// To Delete the Item

procurementRoute.route('/deleteItem/:id').get(authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const result = await procurementModel.findByIdAndDelete({ _id: req.params.id });
        if (!result) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json({ message: 'Item Deleted Successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// To get list of Pending Marked Transfer Item 

procurementRoute.route('/pendingTransfer').get(authenticateToken, authorizeRole('Admin'), async (req, res) => {
    const projectFilter = req.query.project;
    //const deptFilter = req.query.dept;
    try {
        let query = { project: projectFilter, status: "1" };
        const data = await procurementModel.find(query).sort({ _id: -1, createdAt: -1 });
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching pending transfers' });
    }
});

//To remove Item from TransferList

procurementRoute.route('/removeTransferItemList/:id').get(authenticateToken, authorizeRole('Admin'), async (req, res) => {
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

procurementRoute.route('/:id').get(authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await procurementModel.findById(itemId);

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(item);
    } catch (error) {
        console.error('Error fetching item data:', error);
        res.status(500).json({ error: 'An error occurred while fetching item data' });
    }
});

procurementRoute.route('/transferAsset/:id').post(authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const data = await procurementModel.findById(req.params.id);

        if (!data) {
            return res.status(404).json({ error: 'Unable to find Item with this ID' });
        }

        const oldLocation = data.project;
        const newLocation = req.body.project;
        const transferType = req.body.transferType;
        const transferCase = req.body.transferCase;
        const transferRemarks = req.body.transferRemarks;

        if (transferType === "Inter Project Transfer" && oldLocation !== newLocation) {
            // First case: Inter Project Transfer
            data.project = newLocation;
            data.status = 0;
            await data.save();

            const locationLog = new AssetLocationLog({
                assetRefId: data._id,
                asset_description: data.itemCategory,
                assetId: data.asset_id,
                oldLocation,
                newLocation,
                transfer_remarks: transferRemarks,
            });
            await locationLog.save();

            res.json('Item updated and location log created successfully');
        } else {
            // Second case: Other transfer types
            const newTransfer = new AssetTransfer({
                assetRefId: data._id,
                transfer_type: transferType,
                transfer_code: getTransferCode(transferType),
                transfer_case: transferCase,
                transfer_remarks: transferRemarks,
                asset_id: data.asset_id,
                category: data.category,
                itemCategory: data.itemCategory,
                model: data.model,
                serial: data.serial,
                part_no: data.part_no,
                unitPrice: data.unitPrice,
                warranty: data.warranty,
                installation_dt: data.installation_dt,
                licenseStartDate: data.licenseStartDate,
                licenseEndDate: data.licenseEndDate,
                additional_info: data.additional_info,
                last_project: data.project,
                last_dept: data.dept,
                supplier: data.supplier,
                vendoradd: data.vendoradd,
                vendor_category: data.vendor_category,
                caste: data.caste,
                gender: data.gender,
                reg_no: data.reg_no,
                gstin: data.gstin,
                mode: data.mode,
                title: data.description,
                order_no: data.order_no,
                order_dt: data.order_dt,
                order_value: data.price,
            });
            await newTransfer.save();
            await procurementModel.findByIdAndDelete(req.params.id);

            res.json('Asset transferred and original item deleted successfully');
        }
    } catch (err) {
        res.status(400).json({ error: 'Unable to Update Item', details: err.message });
    }
});

module.exports = procurementRoute;