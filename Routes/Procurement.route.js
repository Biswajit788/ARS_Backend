const express = require('express');
const procurementRoute = express.Router();
const { authenticateToken, authorizeRole } = require('../authMiddleware');

let procurementModel = require('../models/procurementData');
let AssetLocationLog = require('../models/assetLocationLog');
let AssetTransfer = require('../models/assetTransferData');
let AssetTransferRequest = require('../models/assetTransferRequest');


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
                created_by, status, transFlag: 0,
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


procurementRoute.route('/transferRequestCount').get(authenticateToken, async (req, res) => {
    try {
        const projectFilter = req.query.location;
        const count = await AssetTransferRequest.countDocuments({ newLocation: projectFilter, status: "Pending" });
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error fetching transfer request count:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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
        const item = await procurementModel.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.status != '0' && item.transFlag == '0') {
            res.sendStatus(201); // Item already marked for transfer action
        } else if (item.status == '0' && item.transFlag != '0') {
            res.status(601).json({ message: 'Transfer action in process' });
        } else {
            const updatedItem = await procurementModel.findByIdAndUpdate(req.params.id, { status: '1' }, { new: true });
            if (updatedItem) {
                res.sendStatus(200); // Item marked for transfer action successfully
            } else {
                res.status(500).json({ message: 'Failed to update item status' });
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

// To get list of Pending Transfer Request 
procurementRoute.route('/pendingTransferRequest').get(authenticateToken, authorizeRole('Admin'), async (req, res) => {
    const locationFilter = req.query.location;
    //const deptFilter = req.query.dept;
    try {
        let query = { newLocation: locationFilter };
        const data = await AssetTransferRequest.find(query).sort({ _id: -1, createdAt: -1 });
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

procurementRoute.route('/transferRequest/:id').post(authenticateToken, authorizeRole('Admin'), async (req, res) => {
    const { transferType, transferCase, newLocation, transferRemarks, ...currentItem } = req.body;
    const itemId = req.params.id;
    try {
        if (transferType === "Inter Project Transfer") {
            const transferRequest = new AssetTransferRequest({
                itemId: currentItem._id,
                assetId: currentItem.asset_id,
                asset_description: currentItem.itemCategory,
                model: currentItem.model,
                serial: currentItem.serial,
                oldLocation: currentItem.project,
                transferType,
                newLocation,
                transferRemarks,
                status: 'Pending',
            });
            await transferRequest.save();

            const data = await procurementModel.findById(itemId);
            if (!data) {
                return res.status(404).json({ error: 'Unable to find Item with this ID' });
            }
            data.status = 0;
            data.transFlag = 1;
            await data.save();

            return res.status(200).json({ message: 'Transfer request created successfully' });
        } else {
            // Second case: Other transfer types
            const newTransfer = new AssetTransfer({
                assetRefId: currentItem._id,
                transfer_type: transferType,
                transfer_code: getTransferCode(transferType),
                transfer_case: transferCase,
                transfer_remarks: transferRemarks,
                asset_id: currentItem.asset_id,
                category: currentItem.category,
                itemCategory: currentItem.itemCategory,
                model: currentItem.model,
                serial: currentItem.serial,
                part_no: currentItem.part_no,
                unitPrice: currentItem.unitPrice,
                warranty: currentItem.warranty,
                installation_dt: currentItem.installation_dt,
                licenseStartDate: currentItem.licenseStartDate,
                licenseEndDate: currentItem.licenseEndDate,
                additional_info: currentItem.additional_info,
                last_project: currentItem.project,
                last_dept: currentItem.dept,
                supplier: currentItem.supplier,
                vendoradd: currentItem.vendoradd,
                vendor_category: currentItem.vendor_category,
                caste: currentItem.caste,
                gender: currentItem.gender,
                reg_no: currentItem.reg_no,
                gstin: currentItem.gstin,
                mode: currentItem.mode,
                title: currentItem.description,
                order_no: currentItem.order_no,
                order_dt: currentItem.order_dt,
                order_value: currentItem.price,
            });
            await newTransfer.save();
            await procurementModel.findByIdAndDelete(req.params.id);

            res.json({message: 'Asset transferred and removed from the Asset database.'});
        }
    } catch (err) {
        res.status(400).json({ error: 'Unable to Update Item', details: err.message });
    }
});

procurementRoute.route('/acceptTransferRequest/:requestId').post(authenticateToken, authorizeRole('Admin'), async (req, res) => {
    const requestId = req.params.requestId;

    try {
        const transferRequest = await AssetTransferRequest.findById(requestId);

        if (!transferRequest || transferRequest.status !== 'Pending') {
            return res.status(404).json({ error: 'Transfer request not found or already processed' });
        }

        // Update the Procurement table based on the transfer request details
        const updatedItem = await procurementModel.findByIdAndUpdate(
            transferRequest.itemId,
            {
                project: transferRequest.newLocation,
                status: '0',
                transFlag: '0',
            },
            { new: true }
        );

        if (updatedItem) {
            // Update transfer request status to Accepted
            transferRequest.status = 'Completed';
            await transferRequest.save();

            // Create an entry in the AssetLocationLog table
            const locationLog = new AssetLocationLog({
                assetRefId: transferRequest.itemId,
                assetId: transferRequest.assetId,
                asset_description: transferRequest.asset_description,
                serial: transferRequest.serial,
                model: transferRequest.model,
                oldLocation: transferRequest.oldLocation,
                transferType: transferRequest.transferType,
                newLocation: transferRequest.newLocation,
                transfer_remarks: transferRequest.transferRemarks,
                status: 'Accepted',
                rejection_remarks: 'NA',
            });
            await locationLog.save();

            return res.status(200).json({ message: 'Transfer request accepted and table updated successfully', updatedItem });
        } else {
            return res.status(404).json({ error: 'Item not found' });
        }
    } catch (error) {
        console.error('Error accepting transfer request:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

procurementRoute.route('/rejectTransferRequest/:requestId').post(authenticateToken, authorizeRole('Admin'), async (req, res) => {
    const requestId = req.params.requestId;
    const { rejectionReason } = req.body;
  
    try {
      const transferRequest = await AssetTransferRequest.findById(requestId);
  
      if (!transferRequest || transferRequest.status !== 'Pending') {
        return res.status(404).json({ error: 'Transfer request not found or already processed' });
      }
  
      // Update the Procurement table to set transFlag to 0
      const updatedItem = await procurementModel.findByIdAndUpdate(
        transferRequest.itemId,
        {
          transFlag: '0',
        },
        { new: true }
      );
  
      if (updatedItem) {
        // Update transfer request status to Rejected
        transferRequest.status = 'Rejected';
        await transferRequest.save();
  
        // Create an entry in the AssetLocationLog table with rejection remarks
        const assetLocationLog = new AssetLocationLog({
            assetRefId: transferRequest.itemId,
            assetId: transferRequest.assetId,
            asset_description: transferRequest.asset_description,
            serial: transferRequest.serial,
            model: transferRequest.model,
            oldLocation: transferRequest.oldLocation,
            transferType: transferRequest.transferType,
            newLocation: transferRequest.newLocation,
            transfer_remarks: transferRequest.transferRemarks,
            status: 'Rejected',
            rejection_remarks: rejectionReason,
        });
  
        await assetLocationLog.save();
  
        return res.status(200).json({ message: 'Transfer request rejected and table updated successfully', updatedItem });
      } else {
        return res.status(404).json({ error: 'Item not found' });
      }
    } catch (error) {
      console.error('Error rejecting transfer request:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

module.exports = procurementRoute;