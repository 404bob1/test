/**
 * VIN Decoder Application
 * Main JavaScript file for handling user interactions and API calls
 */

document.addEventListener('DOMContentLoaded', function() {
    // Backend URL configuration
    const backendUrlInput = document.getElementById('backend-url');
    const saveBackendButton = document.getElementById('save-backend');
    
    // Load saved backend URL from localStorage
    const savedBackendUrl = localStorage.getItem('vinDecoderBackendUrl');
    if (savedBackendUrl) {
        backendUrlInput.value = savedBackendUrl;
    }
    
    // Save backend URL to localStorage
    saveBackendButton.addEventListener('click', function() {
        const backendUrl = backendUrlInput.value.trim();
        if (backendUrl) {
            localStorage.setItem('vinDecoderBackendUrl', backendUrl);
            alert('Backend URL saved! The application will now use this URL for API requests.');
        } else {
            alert('Please enter a valid backend URL');
        }
    });
    
    // Function to get the current backend URL
    function getBackendUrl() {
        return backendUrlInput.value.trim() || 'https://vin-decoder-api.onrender.com';
    }
    
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Single VIN decode functionality
    const vinInput = document.getElementById('vin-input');
    const yearInput = document.getElementById('year-input');
    const decodeButton = document.getElementById('decode-button');
    const resultsContainer = document.getElementById('results');
    const loadingIndicator = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    
    decodeButton.addEventListener('click', function() {
        decodeVin();
    });
    
    vinInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            decodeVin();
        }
    });
    
    function decodeVin() {
        const vin = vinInput.value.trim();
        if (!vin) {
            showError('Please enter a VIN.');
            return;
        }
        
        const year = yearInput.value.trim();
        const backendUrl = getBackendUrl();
        let apiUrl = `${backendUrl}/api/decode/${vin}`;
        
        if (year) {
            apiUrl += `?year=${year}`;
        }
        
        // Clear previous results and errors
        resultsContainer.innerHTML = '';
        errorMessage.style.display = 'none';
        
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                loadingIndicator.style.display = 'none';
                
                if (data.Results && data.Results.length > 0) {
                    const result = data.Results[0];
                    displayVehicleInfo(result, resultsContainer);
                } else {
                    showError('No results found for this VIN.');
                }
            })
            .catch(error => {
                loadingIndicator.style.display = 'none';
                showError(`Error: ${error.message}. Make sure your backend server is running at ${backendUrl}`);
                console.error('Error:', error);
            });
    }
    
    function displayVehicleInfo(vehicle, container) {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        // Create header with basic vehicle info
        const header = document.createElement('div');
        header.className = 'result-header';
        
        const vehicleTitle = [
            vehicle.ModelYear,
            vehicle.Make,
            vehicle.Model,
            vehicle.Trim
        ].filter(Boolean).join(' ');
        
        header.textContent = vehicleTitle || 'Vehicle Information';
        resultItem.appendChild(header);
        
        // Define important fields to show first
        const primaryFields = [
            { label: 'VIN', value: vehicle.VIN },
            { label: 'Year', value: vehicle.ModelYear },
            { label: 'Make', value: vehicle.Make },
            { label: 'Model', value: vehicle.Model },
            { label: 'Series', value: vehicle.Series },
            { label: 'Trim', value: vehicle.Trim },
            { label: 'Body Style', value: vehicle.BodyClass },
            { label: 'Vehicle Type', value: vehicle.VehicleType },
            { label: 'Engine', value: [vehicle.EngineConfiguration, vehicle.EngineModel, vehicle.DisplacementL && `${vehicle.DisplacementL}L`].filter(Boolean).join(' ') },
            { label: 'Fuel Type', value: vehicle.FuelTypePrimary },
            { label: 'Drive Type', value: vehicle.DriveType },
            { label: 'Transmission', value: vehicle.TransmissionStyle },
            { label: 'Doors', value: vehicle.Doors },
            { label: 'GVWR', value: vehicle.GVWR },
            { label: 'Plant', value: [vehicle.PlantCity, vehicle.PlantState, vehicle.PlantCountry].filter(Boolean).join(', ') },
            { label: 'Manufacturer', value: vehicle.Manufacturer }
        ];
        
        // Add primary fields to result
        primaryFields.forEach(field => {
            if (field.value) {
                addResultRow(resultItem, field.label, field.value);
            }
        });
        
        // Add all other non-empty fields
        Object.entries(vehicle).forEach(([key, value]) => {
            // Skip fields already shown and empty values
            const isPrimaryField = primaryFields.some(field => field.label === key);
            if (!isPrimaryField && value && value !== "Not Applicable" && !key.includes("ErrorCode") && !key.includes("ErrorText")) {
                // Format key with spaces
                const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
                addResultRow(resultItem, formattedKey, value);
            }
        });
        
        container.appendChild(resultItem);
    }
    
    function addResultRow(container, label, value) {
        const row = document.createElement('div');
        row.className = 'result-row';
        
        const labelElement = document.createElement('div');
        labelElement.className = 'result-label';
        labelElement.textContent = label;
        
        const valueElement = document.createElement('div');
        valueElement.className = 'result-value';
        valueElement.textContent = value;
        
        row.appendChild(labelElement);
        row.appendChild(valueElement);
        container.appendChild(row);
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    
    // Batch VIN decode functionality
    const batchInput = document.getElementById('batch-input');
    const batchDecodeButton = document.getElementById('batch-decode-button');
    const batchResultsContainer = document.getElementById('batch-results');
    const batchLoadingIndicator = document.getElementById('batch-loading');
    const batchErrorMessage = document.getElementById('batch-error-message');
    
    batchDecodeButton.addEventListener('click', function() {
        decodeBatchVins();
    });
    
    function decodeBatchVins() {
        const batchData = batchInput.value.trim();
        if (!batchData) {
            showBatchError('Please enter at least one VIN.');
            return;
        }
        
        // Clear previous results and errors
        batchResultsContainer.innerHTML = '';
        batchErrorMessage.style.display = 'none';
        
        // Show loading indicator
        batchLoadingIndicator.style.display = 'block';
        
        const backendUrl = getBackendUrl();
        const apiUrl = `${backendUrl}/api/decodeBatch`;
        
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: batchData })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                batchLoadingIndicator.style.display = 'none';
                
                if (data.Results && data.Results.length > 0) {
                    // Create container for batch results
                    const batchInfo = document.createElement('div');
                    batchInfo.className = 'info-box';
                    batchInfo.textContent = `Successfully decoded ${data.Results.length} VINs`;
                    batchResultsContainer.appendChild(batchInfo);
                    
                    // Display each vehicle result
                    data.Results.forEach(result => {
                        displayVehicleInfo(result, batchResultsContainer);
                    });
                } else {
                    showBatchError('No results found for the submitted VINs.');
                }
            })
            .catch(error => {
                batchLoadingIndicator.style.display = 'none';
                showBatchError(`Error: ${error.message}. Make sure your backend server is running at ${backendUrl}`);
                console.error('Error:', error);
            });
    }
    
    function showBatchError(message) {
        batchErrorMessage.textContent = message;
        batchErrorMessage.style.display = 'block';
    }
});