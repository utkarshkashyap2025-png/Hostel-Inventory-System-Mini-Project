const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const createAuthority = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      employeeId,
      designation,
      contact,
    } = req.body;

    if (!name || !email || !password || !employeeId || !designation) {
      return res.status(400).json({
        success: false,
        message:
          'Name, email, password, employee ID and designation are required',
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email.trim().toLowerCase() },
        { employeeId: employeeId.trim().toUpperCase() },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email or Employee ID already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const authority = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'authority',
      employeeId: employeeId.trim().toUpperCase(),
      designation: designation.trim(),
      contact: contact ? contact.trim() : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Authority created successfully',
      data: {
        id: authority._id,
        name: authority.name,
        email: authority.email,
        employeeId: authority.employeeId,
        designation: authority.designation,
        role: authority.role,
        contact: authority.contact,
      },
    });
  } catch (error) {
    console.error('CREATE AUTHORITY ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  createAuthority,
};