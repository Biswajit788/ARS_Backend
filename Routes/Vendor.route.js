const express = require('express');
const app = express();
const vendorRoute = express.Router();
const { authenticateToken, authorizeRole } = require('../authMiddleware');

let vendorModel = require('../models/vendorDetails');

// To get list of User

vendorRoute.route('/').get( authenticateToken, async (req, res) => {
    try {
        const vendors = await vendorModel.find().sort({ vName: 1 });
        res.json(vendors);
    } catch (err) {
        console.log("🚀 ~ file: User.route.js ~ line 11 ~ err", err);
        res.status(500).json({ error: 'An error occurred while fetching vendors' });
    }
});


// To Add New User
vendorRoute.route('/addVendor').post( authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const body = req.body;
        const { vGstin } = body; // Destructure vGstin from the request body

        // Check if a vendor with the provided vGstin already exists
        const vendorIsExistCheck = await vendorModel.findOne({ vGstin });

        if (vendorIsExistCheck) {
            return res.status(400).json({ message: `Vendor with GSTIN ${vGstin} already exist` });
        }

        // If vendor does not exist, save it to the database
        const vendor = new vendorModel(body);
        await vendor.save();
        res.status(200).json({ message: 'Vendor Added Successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


// To get User details by userID

vendorRoute.route('/editVendor/:id').get( authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const vendor = await vendorModel.findById(req.params.id);

        if (!vendor) {
            return res.status(404).json({ error: 'Vendor not found' });
        }

        res.json(vendor);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching the vendor' });
    }
});


// To Update User details

vendorRoute.route('/updateVendor/:id').patch( authenticateToken, authorizeRole('Admin'), async function (req, res, next) {
    try {
        const vendor = await vendorModel.findById(req.params.id);

        if (!vendor) {
            return next(new Error('Unable to find Vendor with this ID'));
        }
        vendor.vName = req.body.vName;
        vendor.vAddress = req.body.vAddress;
        vendor.vGstin = req.body.vGstin;
        vendor.vCategory = req.body.vCategory;
        vendor.msmeRegNo = req.body.msmeRegNo;
        vendor.msmeCate = req.body.msmeCate;
        vendor.msmeGender = req.body.msmeGender;

        await vendor.save();
        res.json('Vendor Updated Successfully');
    } catch (err) {
        console.error(err);
        res.status(400).send('Unable to Update Vendor');
    }
});


// To Delete the User

vendorRoute.route('/deleteVendor/:id').get( authenticateToken, authorizeRole('Admin'), async (req, res) => {
    try {
        const vendor = await vendorModel.findByIdAndDelete({ _id: req.params.id });
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.status(200).json({ message: 'Vendor Deleted Successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
});

module.exports = vendorRoute;