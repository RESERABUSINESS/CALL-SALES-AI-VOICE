const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');

const authRoutes = require('./routes/auth');
const voiceRoutes = require('./routes/voice');
const appointmentRoutes = require('./routes/appointments');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/auth', authRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/appointments', appointmentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Dashboard: ${config.baseUrl}`);
});
