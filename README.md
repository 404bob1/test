# VIN Decoder Application

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

A complete web application that decodes Vehicle Identification Numbers (VINs) using the NHTSA's vPIC API. This application consists of a frontend web interface and a backend Node.js server that acts as a proxy to avoid CORS issues.

## 🚗 [Live Demo](https://yourusername.github.io/vin-decoder/)

## Features

- 🔍 Decode single VINs with detailed vehicle information
- 📋 Batch decode multiple VINs (up to 50) at once
- 🌐 Works with partial VINs using asterisks (*) for unknown characters
- 📱 Responsive design for mobile and desktop devices
- 🧠 Educational content about VIN structure and meaning

## 🏗️ Project Structure

```
vin-decoder/
├── css/                # Styles for the application
│   └── styles.css
├── js/                 # JavaScript for frontend functionality
│   └── app.js
├── .github/            # GitHub Actions workflow files
│   └── workflows/
│       └── deploy.yml
├── backend/            # Node.js backend server
│   ├── package.json
│   ├── server.js
│   └── .env.example
├── .gitignore
├── index.html          # Main application page
├── README.md
├── DEPLOYMENT.md       # Deployment instructions
└── LICENSE
```

## 🚀 Quick Start

### Running the Frontend

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/vin-decoder.git
   cd vin-decoder
   ```

2. Open `index.html` in your web browser or serve it using a static file server.

### Setting Up the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. The server will run at `http://localhost:3000` by default.

6. In the frontend application, enter the backend URL in the "Backend API Configuration" section.

## 🌐 API Endpoints

The backend server provides the following endpoints:

### Decode Single VIN
```
GET /api/decode/:vin
```

### Decode Batch VINs
```
POST /api/decodeBatch
```

### Get All Makes
```
GET /api/makes
```

### Get Models for Make
```
GET /api/models/:make
```

## 📋 Requirements

### Frontend
- Modern web browser with JavaScript enabled

### Backend
- Node.js 14.x or higher
- npm or yarn

## 🧩 NHTSA API Reference

This application uses the following NHTSA vPIC API endpoints:
- [Decode VIN Values Extended](https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/)
- [Decode VIN Values Batch](https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVINValuesBatch/)
- [Get All Makes](https://vpic.nhtsa.dot.gov/api/vehicles/GetAllMakes)
- [Get Models for Make](https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/)

Full API documentation is available at [NHTSA vPIC API](https://vpic.nhtsa.dot.gov/api/).

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for both the frontend and backend components.

## 🛠️ Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [NHTSA vPIC API](https://vpic.nhtsa.dot.gov/api/) for providing the vehicle data
- [Express](https://expressjs.com/) for the backend framework
- [Axios](https://axios-http.com/) for HTTP requests