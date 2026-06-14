const Request = require('../models/Request');

// Create Request
const createRequest = async (req, res) => {
  try {
    const request = await Request.create(req.body);

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get All Requests
const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find();

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Approve Request
const approveRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved' },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Reject Request
const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected' },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  approveRequest,
  rejectRequest,
};