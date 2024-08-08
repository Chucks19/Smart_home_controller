const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 3002;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/smart-home', { useNewUrlParser: true, useUnifiedTopology: true });

// Define User and Device schemas
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const deviceSchema = new mongoose.Schema({
    name: String,
    type: String,
    status: String,
    settings: Object,
});

const User = mongoose.model('User', userSchema);
const Device = mongoose.model('Device', deviceSchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, 'secretkey', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Philips Hue API credentials
const HUE_API_URL = 'http://<bridge-ip-address>/api';
const HUE_USER = '<your-username>';

// Fetch devices from Philips Hue API
app.get('/devices', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get(`${HUE_API_URL}/${HUE_USER}/lights`);
        const devices = response.data;
        res.json(devices);
    } catch (error) {
        res.status(500).send('Error fetching devices');
    }
});

// Control a device
app.put('/devices/:id', authenticateToken, async (req, res) => {
    const deviceId = req.params.id;
    const { status } = req.body;
    try {
        await axios.put(`${HUE_API_URL}/${HUE_USER}/lights/${deviceId}/state`, { on: status === 'on' });
        res.status(200).send('Device updated');
    } catch (error) {
        res.status(500).send('Error updating device');
    }
});

// User authentication routes
app.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username, password: req.body.password });
    if (user) {
        const token = jwt.sign({ username: user.username }, 'secretkey');
        res.json({ token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

app.post('/register', async (req, res) => {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
        return res.status(400).send('User already exists');
    }

    const user = new User({ username: req.body.username, password: req.body.password });
    await user.save();
    const token = jwt.sign({ username: user.username }, 'secretkey');
    res.json({ token });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
