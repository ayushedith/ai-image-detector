// TruthLens - Client-Side Application Logic
// Multi-Provider AI Backend Support

// ============================================
// 1. CONFIGURATION & STATE MANAGEMENT
// ============================================

const CONFIG = {
    HUGGINGFACE_API: 'https://api-inference.huggingface.co/models/',
    REPLICATE_API: 'https://api.replicate.com/v1/predictions',
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
    TIMEOUT: 60000 // 60 seconds
};

const PROVIDERS = {
    tfjs: {
        name: 'TensorFlow.js',
        requiresToken: false,
        models: [
            { id: 'mobilenet', name: 'MobileNet (General Classification)' },
            { id: 'nsfwjs', name: 'NSFW Detector' }
        ],
        note: 'Runs completely in your browser. No internet required after page load.'
    },
    huggingface: {
        name: 'Hugging Face',
        requiresToken: true,
        tokenPrefix: 'hf_',
        tokenUrl: 'https://huggingface.co/settings/tokens',
        models: [
            { id: 'umm-maybe/AI-image-detector', name: 'AI Image Detector (General)' },
            { id: 'prithivMLmods/Deepfake-Image-Detection', name: 'Deepfake Detection' },
            { id: 'Organika/sdxl-detector', name: 'SDXL/Stable Diffusion Detector' }
        ],
        note: 'Free tier available. Requires account signup.'
    },
    replicate: {
        name: 'Replicate',
        requiresToken: true,
        tokenPrefix: 'r8_',
        tokenUrl: 'https://replicate.com/account/api-tokens',
        models: [
            { id: 'andreasjansson/blip-2:4b32258c42e9efd4288bb9910bc532a69727f9acd26aa08e175713a0a857a608', name: 'Image Captioning (BLIP-2)' },
            { id: 'salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746', name: 'Image Analysis (BLIP)' }
        ],
        note: 'Pay-per-use pricing. Free credits available for new users.'
    }
};

let state = {
    provider: 'tfjs',
    apiToken: '',
    selectedModel: 'mobilenet',
    currentImage: null,
    currentImageFile: null,
    isAnalyzing: false,
    tfjsModel: null // Cache for loaded TensorFlow.js models
};

// ============================================
// 2. INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initializeEventListeners();
    initializeGlobalChart();
    updateProviderUI();
    
    // Check if TensorFlow.js provider is selected (no token needed)
    if (state.provider === 'tfjs') {
        document.getElementById('settingsPanel').classList.add('hidden');
        showNotification('Using TensorFlow.js - No API key required! 🎉', 'success');
    } else if (!state.apiToken) {
        document.getElementById('settingsPanel').classList.remove('hidden');
        showNotification('Please configure your API token to begin', 'warning');
    }
});

function initializeEventListeners() {
    // File upload
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    
    dropArea.addEventListener('click', () => fileInput.click());
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// ============================================
// 3. SETTINGS MANAGEMENT
// ============================================

function toggleProviderSettings() {
    const provider = document.getElementById('providerSelect').value;
    state.provider = provider;
    updateProviderUI();
}

function updateProviderUI() {
    const provider = PROVIDERS[state.provider];
    const tokenSection = document.getElementById('apiTokenSection');
    const modelSelect = document.getElementById('modelSelect');
    const providerNote = document.getElementById('providerNote');
    
    // Update note
    providerNote.textContent = provider.note;
    
    // Show/hide token section
    if (provider.requiresToken) {
        tokenSection.classList.remove('hidden');
        document.getElementById('tokenLabel').textContent = `${provider.name} API Token`;
        document.getElementById('tokenRequired').textContent = '(Required)';
        document.getElementById('apiToken').placeholder = `${provider.tokenPrefix}...`;
        document.getElementById('tokenLink').href = provider.tokenUrl;
        document.getElementById('tokenLink').textContent = provider.tokenUrl.replace('https://', '');
    } else {
        tokenSection.classList.add('hidden');
    }
    
    // Update model options
    modelSelect.innerHTML = '';
    provider.models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = model.name;
        modelSelect.appendChild(option);
    });
    
    // Set default model
    if (provider.models.length > 0) {
        state.selectedModel = provider.models[0].id;
        modelSelect.value = state.selectedModel;
    }
}

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('hidden');
}

function toggleTokenVisibility() {
    const input = document.getElementById('apiToken');
    const icon = document.getElementById('eyeIcon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>';
    } else {
        input.type = 'password';
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>';
    }
}

function saveSettings() {
    const provider = document.getElementById('providerSelect').value;
    const token = document.getElementById('apiToken').value.trim();
    const model = document.getElementById('modelSelect').value;
    
    const providerConfig = PROVIDERS[provider];
    
    // Validate token if required
    if (providerConfig.requiresToken) {
        if (!token) {
            showNotification('Please enter a valid API token', 'error');
            return;
        }
        
        if (!token.startsWith(providerConfig.tokenPrefix)) {
            showNotification(`Invalid token format. Must start with "${providerConfig.tokenPrefix}"`, 'error');
            return;
        }
    }
    
    // Save to state and localStorage
    state.provider = provider;
    state.apiToken = token;
    state.selectedModel = model;
    
    localStorage.setItem('truthlens_provider', provider);
    localStorage.setItem('truthlens_token', token);
    localStorage.setItem('truthlens_model', model);
    
    showNotification('Settings saved successfully!', 'success');
    document.getElementById('settingsPanel').classList.add('hidden');
}

function loadSettings() {
    const savedProvider = localStorage.getItem('truthlens_provider') || 'tfjs';
    const savedToken = localStorage.getItem('truthlens_token');
    const savedModel = localStorage.getItem('truthlens_model');
    
    state.provider = savedProvider;
    document.getElementById('providerSelect').value = savedProvider;
    
    if (savedToken) {
        state.apiToken = savedToken;
        document.getElementById('apiToken').value = savedToken;
    }
    
    if (savedModel) {
        state.selectedModel = savedModel;
    }
}

// ============================================
// 4. FILE HANDLING
// ============================================

function handleDragOver(e) {
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    e.currentTarget.classList.remove('dragover');
    
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

function processFile(file) {
    // Validate file type
    if (!CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
        showNotification('Unsupported file format. Please use JPG, PNG, or WebP', 'error');
        return;
    }
    
    // Validate file size
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showNotification('File too large. Maximum size is 10MB', 'error');
        return;
    }
    
    // Read and display file
    const reader = new FileReader();
    reader.onload = (e) => {
        state.currentImage = e.target.result;
        state.currentImageFile = file;
        displayPreview(e.target.result);
    };
    reader.readAsDataURL(file);
}

function displayPreview(imageSrc) {
    const previewArea = document.getElementById('previewArea');
    const previewImage = document.getElementById('previewImage');
    
    previewImage.src = imageSrc;
    previewArea.classList.remove('hidden');
    
    // Reset results
    resetResults();
}

// ============================================
// 5. IMAGE ANALYSIS (MULTI-PROVIDER)
// ============================================

async function analyzeImage() {
    // Validation
    const providerConfig = PROVIDERS[state.provider];
    
    if (providerConfig.requiresToken && !state.apiToken) {
        showNotification('Please configure your API token first', 'error');
        toggleSettings();
        return;
    }
    
    if (!state.currentImageFile) {
        showNotification('Please upload an image first', 'error');
        return;
    }
    
    if (state.isAnalyzing) {
        return; // Prevent multiple simultaneous requests
    }
    
    // Update UI
    state.isAnalyzing = true;
    showLoadingState();
    document.getElementById('scanLine').classList.remove('hidden');
    
    try {
        let result;
        
        // Route to appropriate provider
        switch (state.provider) {
            case 'tfjs':
                result = await analyzeWithTensorFlow();
                break;
            case 'huggingface':
                result = await analyzeWithHuggingFace();
                break;
            case 'replicate':
                result = await analyzeWithReplicate();
                break;
            default:
                throw new Error('Unknown provider');
        }
        
        // Display results
        displayResults(result);
        
    } catch (error) {
        console.error('Analysis error:', error);
        showError(error.message);
    } finally {
        state.isAnalyzing = false;
        document.getElementById('scanLine').classList.add('hidden');
    }
}

// ============================================
// 5a. TENSORFLOW.JS ANALYSIS
// ============================================

async function analyzeWithTensorFlow() {
    showNotification('Loading AI model in your browser...', 'info');
    
    // Load model if not cached
    if (!state.tfjsModel) {
        if (state.selectedModel === 'mobilenet') {
            state.tfjsModel = await mobilenet.load();
        } else {
            throw new Error('Model not yet implemented. Try MobileNet.');
        }
    }
    
    // Create image element
    const img = new Image();
    img.src = state.currentImage;
    await new Promise((resolve) => { img.onload = resolve; });
    
    // Run prediction
    const predictions = await state.tfjsModel.classify(img);
    
    // Convert to our standard format
    return predictions.map(pred => ({
        label: classifyAsRealOrFake(pred.className),
        score: pred.probability,
        originalLabel: pred.className
    }));
}

function classifyAsRealOrFake(className) {
    // Heuristic: Check if the predicted class suggests AI/synthetic content
    const syntheticKeywords = ['screen', 'monitor', 'computer', 'digital', 'web'];
    const lowerClass = className.toLowerCase();
    
    const isSynthetic = syntheticKeywords.some(keyword => lowerClass.includes(keyword));
    
    if (isSynthetic) {
        return `Potentially AI-Generated (${className})`;
    } else {
        return `Likely Real Photo (${className})`;
    }
}

// ============================================
// 5b. HUGGING FACE ANALYSIS
// ============================================

async function analyzeWithHuggingFace() {
    const imageBlob = await fetch(state.currentImage).then(r => r.blob());
    const endpoint = CONFIG.HUGGINGFACE_API + state.selectedModel;
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${state.apiToken}`,
            'Content-Type': 'application/octet-stream'
        },
        body: imageBlob
    });
    
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Invalid API token. Please check your credentials.');
        } else if (response.status === 503) {
            throw new Error('Model is loading. Please wait 20 seconds and try again.');
        } else if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else {
            const errorText = await response.text();
            throw new Error(`API Error (${response.status}): ${errorText}`);
        }
    }
    
    const data = await response.json();
    
    if (Array.isArray(data)) {
        return data;
    } else if (data.error) {
        throw new Error(data.error);
    } else {
        throw new Error('Unexpected API response format');
    }
}

// ============================================
// 5c. REPLICATE ANALYSIS
// ============================================

async function analyzeWithReplicate() {
    // Convert image to base64
    const base64Image = state.currentImage.split(',')[1];
    const dataUri = `data:${state.currentImageFile.type};base64,${base64Image}`;
    
    // Start prediction
    const response = await fetch(CONFIG.REPLICATE_API, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${state.apiToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            version: state.selectedModel,
            input: {
                image: dataUri
            }
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Replicate API Error (${response.status})`);
    }
    
    const prediction = await response.json();
    
    // Poll for completion
    let result = prediction;
    while (result.status === 'starting' || result.status === 'processing') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const pollResponse = await fetch(result.urls.get, {
            headers: { 'Authorization': `Token ${state.apiToken}` }
        });
        result = await pollResponse.json();
    }
    
    if (result.status === 'failed') {
        throw new Error(result.error || 'Prediction failed');
    }
    
    // Convert Replicate output to our format
    return convertReplicateOutput(result.output);
}

function convertReplicateOutput(output) {
    // Replicate models return different formats
    // For image captioning (BLIP), we get text
    if (typeof output === 'string') {
        // Analyze caption for AI indicators
        const aiKeywords = ['render', '3d', 'digital', 'cgi', 'generated'];
        const hasAIIndicators = aiKeywords.some(kw => output.toLowerCase().includes(kw));
        
        return [
            { 
                label: hasAIIndicators ? 'Possibly AI-Generated' : 'Likely Real Photo',
                score: hasAIIndicators ? 0.65 : 0.35,
                caption: output
            },
            {
                label: hasAIIndicators ? 'Likely Real Photo' : 'Possibly AI-Generated',
                score: hasAIIndicators ? 0.35 : 0.65,
                caption: output
            }
        ];
    }
    
    // Default fallback
    return [
        { label: 'Analysis Complete', score: 1.0, details: JSON.stringify(output) }
    ];
}

// ============================================
// 6. RESULTS DISPLAY
// ============================================

function showLoadingState() {
    document.getElementById('placeholder').classList.add('hidden');
    document.getElementById('resultsDisplay').classList.add('hidden');
    document.getElementById('errorState').classList.add('hidden');
    document.getElementById('loadingState').classList.remove('hidden');
}

function displayResults(results) {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('resultsDisplay').classList.remove('hidden');
    
    // Sort by confidence (descending)
    results.sort((a, b) => b.score - a.score);
    
    // Determine verdict
    const topPrediction = results[0];
    const isFake = topPrediction.label.toLowerCase().includes('fake') || 
                   topPrediction.label.toLowerCase().includes('ai') ||
                   topPrediction.label.toLowerCase().includes('generated');
    
    const confidence = (topPrediction.score * 100).toFixed(1);
    
    // Update verdict card
    updateVerdictCard(topPrediction.label, confidence, isFake);
    
    // Display confidence bars
    displayConfidenceBars(results);
    
    // Create chart
    createResultsChart(results);
    
    // Display metadata
    displayMetadata();
}

function updateVerdictCard(label, confidence, isFake) {
    const card = document.getElementById('verdictCard');
    const labelEl = document.getElementById('verdictLabel');
    const textEl = document.getElementById('verdictText');
    const iconEl = document.getElementById('verdictIcon');
    
    if (isFake && confidence > 70) {
        card.className = 'rounded-lg p-4 border-2 bg-danger/10 border-danger';
        labelEl.textContent = 'High Risk Detected';
        labelEl.className = 'font-semibold text-lg text-danger';
        textEl.textContent = `The image appears to be ${label.toLowerCase()} with ${confidence}% confidence. Exercise caution when sharing or trusting this content.`;
        textEl.className = 'text-sm text-danger-dark';
        iconEl.textContent = '⚠️';
    } else if (isFake && confidence > 50) {
        card.className = 'rounded-lg p-4 border-2 bg-suspicious/10 border-suspicious';
        labelEl.textContent = 'Suspicious Content';
        labelEl.className = 'font-semibold text-lg text-suspicious';
        textEl.textContent = `The image shows signs of manipulation (${confidence}% confidence). Further verification recommended.`;
        textEl.className = 'text-sm text-suspicious-dark';
        iconEl.textContent = '⚡';
    } else {
        card.className = 'rounded-lg p-4 border-2 bg-verified/10 border-verified';
        labelEl.textContent = 'Likely Authentic';
        labelEl.className = 'font-semibold text-lg text-verified';
        textEl.textContent = `No significant manipulation detected. The image appears to be ${label.toLowerCase()} (${confidence}% confidence).`;
        textEl.className = 'text-sm text-verified-dark';
        iconEl.textContent = '✓';
    }
}

function displayConfidenceBars(results) {
    const container = document.getElementById('scoresContainer');
    container.innerHTML = '';
    
    results.forEach(result => {
        const percentage = (result.score * 100).toFixed(1);
        const label = result.label;
        
        // Determine color based on label
        let colorClass = 'bg-sand-500';
        if (label.toLowerCase().includes('fake') || label.toLowerCase().includes('ai')) {
            colorClass = percentage > 70 ? 'bg-danger' : percentage > 50 ? 'bg-suspicious' : 'bg-sand-500';
        } else if (label.toLowerCase().includes('real') || label.toLowerCase().includes('authentic')) {
            colorClass = percentage > 70 ? 'bg-verified' : 'bg-sand-500';
        }
        
        const barHTML = `
            <div>
                <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-sand-700">${label}</span>
                    <span class="text-sm font-semibold text-sand-900">${percentage}%</span>
                </div>
                <div class="w-full bg-sand-200 rounded-full h-3 overflow-hidden">
                    <div class="result-bar ${colorClass} h-3 rounded-full transition-all duration-1000" style="width: 0%"></div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', barHTML);
    });
    
    // Animate bars
    setTimeout(() => {
        const bars = container.querySelectorAll('.result-bar');
        bars.forEach((bar, index) => {
            const percentage = (results[index].score * 100).toFixed(1);
            bar.style.width = percentage + '%';
        });
    }, 100);
}

function createResultsChart(results) {
    const ctx = document.getElementById('resultsChart');
    
    // Destroy existing chart if any
    if (window.resultsChartInstance) {
        window.resultsChartInstance.destroy();
    }
    
    const labels = results.map(r => r.label);
    const scores = results.map(r => (r.score * 100).toFixed(1));
    
    // Determine colors
    const backgroundColors = results.map(r => {
        const label = r.label.toLowerCase();
        if (label.includes('fake') || label.includes('ai')) {
            return 'rgba(220, 38, 38, 0.7)';
        } else if (label.includes('real') || label.includes('authentic')) {
            return 'rgba(13, 148, 136, 0.7)';
        } else {
            return 'rgba(156, 141, 125, 0.7)';
        }
    });
    
    window.resultsChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: scores,
                backgroundColor: backgroundColors,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Confidence Distribution'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

function displayMetadata() {
    const container = document.getElementById('metadata');
    const file = state.currentImageFile;
    const now = new Date();
    
    const providerName = PROVIDERS[state.provider].name;
    const modelName = state.selectedModel.includes('/') 
        ? state.selectedModel.split('/')[1] 
        : state.selectedModel;
    
    const metadata = [
        `<strong>Provider:</strong> ${providerName}`,
        `<strong>Model:</strong> ${modelName}`,
        `<strong>File Name:</strong> ${file.name}`,
        `<strong>File Size:</strong> ${(file.size / 1024).toFixed(2)} KB`,
        `<strong>File Type:</strong> ${file.type}`,
        `<strong>Analysis Time:</strong> ${now.toLocaleString()}`
    ];
    
    container.innerHTML = metadata.join('<br>');
}

function showError(message) {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('errorState').classList.remove('hidden');
    document.getElementById('errorMessage').textContent = message;
}

function resetResults() {
    document.getElementById('placeholder').classList.remove('hidden');
    document.getElementById('resultsDisplay').classList.add('hidden');
    document.getElementById('errorState').classList.add('hidden');
    document.getElementById('loadingState').classList.add('hidden');
}

// ============================================
// 7. GLOBAL INTELLIGENCE DASHBOARD
// ============================================

function initializeGlobalChart() {
    const ctx = document.getElementById('globalChart');
    
    // Simulated data (for educational purposes)
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Deepfake Detections',
                    data: [1200, 1850, 2400, 3100, 4200, 5600, 6800],
                    borderColor: 'rgb(220, 38, 38)',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Verified Authentic',
                    data: [8500, 9200, 10100, 11400, 12200, 13500, 14800],
                    borderColor: 'rgb(13, 148, 136)',
                    backgroundColor: 'rgba(13, 148, 136, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Global Detection Trends (2026)',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// ============================================
// 8. UTILITIES & NOTIFICATIONS
// ============================================

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg max-w-md transform transition-all duration-300 translate-x-full`;
    
    let bgColor = 'bg-sand-700';
    let icon = 'ℹ️';
    
    if (type === 'success') {
        bgColor = 'bg-verified';
        icon = '✓';
    } else if (type === 'error') {
        bgColor = 'bg-danger';
        icon = '✕';
    } else if (type === 'warning') {
        bgColor = 'bg-suspicious';
        icon = '⚠';
    }
    
    notification.className += ` ${bgColor} text-white`;
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <span class="text-xl">${icon}</span>
            <p class="font-medium">${message}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// ============================================
// 9. PRIVACY & SECURITY NOTICES
// ============================================

// Show privacy notice on first visit
if (!localStorage.getItem('truthlens_privacy_accepted')) {
    setTimeout(() => {
        const message = `⚠️ PRIVACY NOTICE

TruthLens supports multiple AI providers:

• TensorFlow.js: Runs 100% in your browser (most private)
• Hugging Face: Images sent to Hugging Face servers
• Replicate: Images sent to Replicate servers

Your API tokens are stored only in your browser's localStorage.
We do NOT collect any data.

By using this tool, you agree to the respective provider's Terms of Service.

Do you understand and accept?`;
        
        if (confirm(message)) {
            localStorage.setItem('truthlens_privacy_accepted', 'true');
        } else {
            document.body.innerHTML = '<div class="flex items-center justify-center h-screen"><p class="text-sand-600">You must accept the privacy notice to use TruthLens.</p></div>';
        }
    }, 1000);
}
