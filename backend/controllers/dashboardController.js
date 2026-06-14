const Room = require('../models/Room');
const Request = require('../models/Request');

const getDashboardStats = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const totalRequests = await Request.countDocuments();

    const approvedRequests = await Request.countDocuments({
      status: 'Approved',
    });

    const rejectedRequests = await Request.countDocuments({
      status: 'Rejected',
    });

    const pendingRequests = await Request.countDocuments({
      status: 'Pending',
    });

    res.status(200).json({
      success: true,
      data: {
        totalRooms,
        totalRequests,
        approvedRequests,
        rejectedRequests,
        pendingRequests,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};