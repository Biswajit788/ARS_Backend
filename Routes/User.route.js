const express = require('express');

const bcrypt = require("bcryptjs");
const app = express();
const userRoute = express.Router();

let userModel = require('../models/userDetails');

// To get list of User

userRoute.route('/').get(function (req, res) {
    userModel.find(function (err, user) {
        if (err) {
            console.log("🚀 ~ file: User.route.js ~ line 11 ~ err", err);
        }
        else {
            res.json(user);
        }
    });
});

// To Add New User

userRoute.route('/addUser').post(async (req, res) => {
    const body = req.body;
    const user = new userModel(body);
    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(user.password, salt);

    //let user = new userModel(req.body);
    user.save()
        .then(data => {
            res.status(200).json({ 'user': 'User Added Successfully' });
        })
        .catch(err => {
            res.status(400).send("Something went wrong");
        });
})

// To get User details by userID

userRoute.route('/editUser/:id').get(function (req, res) {
    let id = req.params.id;
    userModel.findById(id, function (err, user) {
        res.json(user);
    });
});

// To Update User details

userRoute.route('/updateUser/:id').patch(function (req, res){

    userModel.findById(req.params.id, async (err, user) => {
        if (!user) {
            return next(new Error('Unable to find User with this ID'));
        } else if (req.body.password === user.password) {
            //const salt = await bcrypt.genSalt(10);

            user.fname = req.body.fname;
            user.lname = req.body.lname;
            user.email = req.body.email;
            user.uid = req.body.uid;
            user.desgn = req.body.desgn;
            user.role = req.body.role;
            user.project = req.body.project;
            user.dept = req.body.dept;
            //user.password = await bcrypt.hash(req.body.password, salt);
            user.password = req.body.password;
            user.save()
                .then(usr => {
                    res.json('User Updated Successfully');
                })
                .catch(err => {
                    res.status(400).send('Unable to Update User');
                });
        }else{
            const salt = await bcrypt.genSalt(10);

            user.fname = req.body.fname;
            user.lname = req.body.lname;
            user.email = req.body.email;
            user.uid = req.body.uid;
            user.desgn = req.body.desgn;
            user.role = req.body.role;
            user.project = req.body.project;
            user.dept = req.body.dept;
            user.password = await bcrypt.hash(req.body.password, salt);
            user.save()
                .then(usr => {
                    res.json('User Updated Successfully');
                })
                .catch(err => {
                    res.status(400).send('Unable to Update User');
                });
        }
    })
});

// To Delete the User

userRoute.route('/deleteUser/:id').get(function (req, res) {
    userModel.findByIdAndRemove({ _id: req.params.id }, function (err, user) {
        if (err)
            res.json(err);
        else
            res.json('User Deleted Successfully');
    });
});

module.exports = userRoute;