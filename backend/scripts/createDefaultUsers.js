const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/water-pump', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const createDefaultUsers = async () => {
  try {
    // Delete existing users
    await User.deleteMany({ username: { $in: ['admin', 'maintenance'] } });
    console.log('Existing users deleted');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      password: 'admin',
      email: 'admin@waterpump.com',
      role: 'admin'
    });
    await adminUser.save();
    console.log('Admin user created successfully');

    // Create maintenance user
    const maintenanceUser = new User({
      username: 'maintenance',
      password: 'maintenance',
      email: 'maintenance@waterpump.com',
      role: 'maintenance'
    });
    await maintenanceUser.save();
    console.log('Maintenance user created successfully');

    console.log('Default users created successfully');
  } catch (error) {
    console.error('Error creating default users:', error);
  } finally {
    mongoose.connection.close();
  }
};

createDefaultUsers();
