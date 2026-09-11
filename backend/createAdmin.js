const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '../.env'),
});

const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected');

    const email = 'admin@hostel.com';
    const password = 'Admin@2026';

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name: 'Hostel Administrator',
      email,
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Admin created successfully');
    console.log('Email:', admin.email);
    console.log('Password:', password);
    console.log('Role:', admin.role);

    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
};

createAdmin();