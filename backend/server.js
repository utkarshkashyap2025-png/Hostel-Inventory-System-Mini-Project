const dashboardRoutes = require('./routes/dashboardRoutes');
const requestRoutes = require('./routes/requestRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
require('./config/env');

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const roomRoutes = require('./routes/roomRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('Backend Running');
});

app.use('/api/rooms', roomRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/dashboard', dashboardRoutes);
//app.use('/api/inventory', inventoryRoutes);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
