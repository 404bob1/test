/**
 * VIN Decoder Backend Server
 * Acts as a proxy to the NHTSA vPIC API to avoid CORS issues
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT || 100, // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests, please try again later.'
  }
});

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/', limiter); // Apply rate limiting to API routes

// Base URL for NHTSA API
const NHTSA_API_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';

// Custom middleware for logging requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// Route for single VIN decoding
app.get('/api/decode/:vin', async (req, res) => {
    try {
        const { vin } = req.params;
        const modelYear = req.query.year || '';
        
        let apiUrl = `${NHTSA_API_BASE_URL}/DecodeVinValuesExtended/${vin}?format=json`;
        
        if (modelYear) {
            apiUrl += `&modelyear=${modelYear}`;
        }
        
        console.log(`Fetching data from NHTSA API: ${apiUrl}`);
        
        const response = await axios.get(apiUrl, {
            timeout: 10000 // 10 second timeout
        });
        
        if (response.data && response.data.Results) {
            res.json(response.data);
        } else {
            res.status(404).json({ error: 'No results found for this VIN' });
        }
    } catch (error) {
        console.error('Error decoding VIN:', error.message);
        
        // Provide more helpful error messages
        if (error.code === 'ECONNABORTED') {
            res.status(504).json({ 
                error: 'NHTSA API timeout',
                details: 'The NHTSA API took too long to respond. Please try again later.' 
            });
        } else if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            res.status(error.response.status).json({
                error: `NHTSA API error: ${error.response.status}`,
                details: error.response.data || error.message
            });
        } else {
            res.status(500).json({ 
                error: 'Error connecting to NHTSA API',
                details: error.message 
            });
        }
    }
});

// Route for batch VIN decoding
app.post('/api/decodeBatch', async (req, res) => {
    try {
        const { data } = req.body;
        
        if (!data) {
            return res.status(400).json({ error: 'No VIN data provided' });
        }
        
        const apiUrl = `${NHTSA_API_BASE_URL}/DecodeVINValuesBatch/`;
        
        console.log(`Sending batch decode request to NHTSA API with ${data.split(';').filter(Boolean).length} VINs`);
        
        const formData = new URLSearchParams();
        formData.append('data', data);
        formData.append('format', 'json');
        
        const response = await axios.post(apiUrl, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 20000 // 20 second timeout for batch requests
        });
        
        if (response.data && response.data.Results) {
            res.json(response.data);
        } else {
            res.status(404).json({ error: 'No results found for the submitted VINs' });
        }
    } catch (error) {
        console.error('Error decoding batch VINs:', error.message);
        
        if (error.code === 'ECONNABORTED') {
            res.status(504).json({ 
                error: 'NHTSA API timeout',
                details: 'The NHTSA API took too long to respond. Please try again later.' 
            });
        } else if (error.response) {
            res.status(error.response.status).json({
                error: `NHTSA API error: ${error.response.status}`,
                details: error.response.data || error.message
            });
        } else {
            res.status(500).json({
                error: 'Error connecting to NHTSA API',
                details: error.message
            });
        }
    }
});

// Route for getting all makes
app.get('/api/makes', async (req, res) => {
    try {
        const apiUrl = `${NHTSA_API_BASE_URL}/GetAllMakes?format=json`;
        const response = await axios.get(apiUrl);
        
        if (response.data && response.data.Results) {
            res.json(response.data);
        } else {
            res.status(404).json({ error: 'No makes found' });
        }
    } catch (error) {
        console.error('Error getting all makes:', error.message);
        res.status(500).json({
            error: 'Error connecting to NHTSA API',
            details: error.message
        });
    }
});

// Route for getting models for a specific make
app.get('/api/models/:make', async (req, res) => {
    try {
        const { make } = req.params;
        const apiUrl = `${NHTSA_API_BASE_URL}/GetModelsForMake/${make}?format=json`;
        
        const response = await axios.get(apiUrl);
        
        if (response.data && response.data.Results) {
            res.json(response.data);
        } else {
            res.status(404).json({ error: 'No models found for this make' });
        }
    } catch (error) {
        console.error('Error getting models for make:', error.message);
        res.status(500).json({
            error: 'Error connecting to NHTSA API',
            details: error.message
        });
    }
});

// Route for getting manufacturers
app.get('/api/manufacturers', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const apiUrl = `${NHTSA_API_BASE_URL}/GetAllManufacturers?format=json&page=${page}`;
        
        const response = await axios.get(apiUrl);
        
        if (response.data && response.data.Results) {
            res.json(response.data);
        } else {
            res.status(404).json({ error: 'No manufacturers found' });
        }
    } catch (error) {
        console.error('Error getting manufacturers:', error.message);
        res.status(500).json({
            error: 'Error connecting to NHTSA API',
            details: error.message
        });
    }
});

// Route for getting WMI information
app.get('/api/wmi/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const apiUrl = `${NHTSA_API_BASE_URL}/DecodeWMI/${code}?format=json`;
        
        const response = await axios.get(apiUrl);
        
        if (response.data && response.data.Results) {
            res.json(response.data);
        } else {
            res.status(404).json({ error: 'No WMI information found for this code' });
        }
    } catch (error) {
        console.error('Error decoding WMI:', error.message);
        res.status(500).json({
            error: 'Error connecting to NHTSA API',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString()
    });
});

// Serve static files from the "public" directory if it exists
app.use(express.static('public'));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API base URL: http://localhost:${PORT}/api/`);
});

// Export for testing purposes
module.exports = app;