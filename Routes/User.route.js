const express = require('express');

const bcrypt = require("bcryptjs");
const app = express();
const userRoute = express.Router();

let userModel = require('../models/userDetails');

// To get list of User

userRoute.route('/').get(async (req, res) => {
    try {
        const users = await userModel.find().sort({ uid: -1 });
        res.json(users);
    } catch (err) {
        console.log("🚀 ~ file: User.route.js ~ line 11 ~ err", err);
        res.status(500).json({ error: 'An error occurred while fetching users' });
    }
});

// To Add New User

userRoute.route('/addUser').post(async (req, res) => {
    try {
        const body = req.body;
        const { uid } = body;

        const userIsExistCheck = await userModel.findOne({ uid });
        if (userIsExistCheck) {
            return res.status(400).json({ message: `User with code ${uid} already exist` });
        }

        // If user does not exist, save it to the database
        const user = new userModel(body);
        //const salt = await bcrypt.genSalt(10);
        //user.password = await bcrypt.hash(user.password, salt);

        await user.save();

        res.status(200).json({ message: 'User Added Successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


// To get User details by userID

userRoute.route('/editUser/:id').get(async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching the user' });
    }
});


// To Update User details
userRoute.route('/updateUser/:id').patch(async function (req, res, next) {
    try {
        const user = await userModel.findById(req.params.id);
        
        if (!user) {
            return next(new Error('Unable to find User with this ID'));
        }

        // Update user fields
        user.fname = req.body.fname;
        user.lname = req.body.lname;
        user.email = req.body.email;
        user.uid = req.body.uid;
        user.desgn = req.body.desgn;
        user.role = req.body.role;
        user.project = req.body.project;
        user.dept = req.body.dept;
        user.status = req.body.status;

        // Check if the password field is present in the request and if it has changed
        if (req.body.password && req.body.password !== user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        await user.save();
        res.json('User Updated Successfully');
    } catch (err) {
        console.error(err);
        res.status(400).send('Unable to Update User');
    }
});

// To Delete the User

userRoute.route('/deleteUser/:id').get(async (req, res) => {
    try {
        const user = await userModel.findByIdAndDelete({_id: req.params.id});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User Deleted Successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
});

module.exports = userRoute;