const User = require('../models/userDetails');

const seedAdminUser = async() => {
    const adminData = {
        uid: '0001',
        fname: 'Admin',
        lname: 'User',
        desgn: 'Administrator',
        email: 'admin@yahoo.com',
        project: 'Admin Project',
        dept: 'Admin Dept',
        role: 'Admin',
        password: 'Admin@123',
        status: '1',
    };

    const userExists = await User.findOne({uid: adminData.uid});
    if(!userExists) {
        const adminUser = new User(adminData);
        await adminUser.save();
        console.log('Admin user seeded successfully!');
    } else {
        console.log('Admin user already exist!');
    }
};

module.exports = seedAdminUser;