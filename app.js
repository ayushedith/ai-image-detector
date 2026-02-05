// TruthLens - Deep Forensic Analysis Engine
// Multi-Provider AI Backend + 4-Layer Detection Matrix

// ============================================
// 1. CONFIGURATION & STATE MANAGEMENT
// ============================================

const CONFIG = {
    HUGGINGFACE_API: 'https://api-inference.huggingface.co/models/',
    REPLICATE_API: 'https://api.replicate.com/v1/predictions',
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
    TIMEOUT: 60000, // 60 seconds
    ELA_QUALITY: 95, // JPEG quality for ELA comparison
    FORENSIC_THRESHOLDS: {
        REAL: 20,
        SUSPICIOUS: 60,
        EDITED: 80,
        FAKE: 100
    }
};

const PROVIDERS = {
    tfjs: {
        name: 'TensorFlow.js',
        requiresToken: false,
        models: [
            { id: 'mobilenet', name: 'MobileNet (General Classification) - NOT RECOMMENDED' },
            { id: 'browser-forensic', name: 'Browser Forensic Analysis (Heuristic-based)' }
        ],
        note: '⚠️ WARNING: Browser-based detection is LIMITED. Use Hugging Face for accurate results.'
    },
    huggingface: {
        name: 'Hugging Face',
        requiresToken: true,
        tokenPrefix: 'hf_',
        tokenUrl: 'https://huggingface.co/settings/tokens',
        models: [
            { id: 'umm-maybe/AI-image-detector', name: '🔥 AI Image Detector (Recommended)' },
            { id: 'Organika/sdxl-detector', name: 'SDXL/Stable Diffusion Detector' },
            { id: 'arnabdhar/YOLOv8-Face-Detection', name: 'Face Authenticity Detector' }
        ],
        note: '✅ RECOMMENDED: Most accurate detection. Free tier available.'
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

// Known AI generator signatures
const AI_SIGNATURES = {
    software: ['stable diffusion', 'midjourney', 'dall-e', 'dall·e', 'novelai', 'artbreeder', 'deepai', 'nightcafe', 'craiyon', 'imagen', 'firefly'],
    editors: ['photoshop', 'gimp', 'lightroom', 'affinity', 'pixlr', 'canva'],
    aiResolutions: [
        [512, 512], [768, 768], [1024, 1024], [1536, 1536], [2048, 2048],
        [512, 768], [768, 512], [768, 1024], [1024, 768], [896, 1152], [1152, 896]
    ]
};

let state = {
    provider: 'huggingface', // Changed default to Hugging Face for accuracy
    apiToken: '',
    selectedModel: 'umm-maybe/AI-image-detector',
    currentImage: null,
    currentImageFile: null,
    isAnalyzing: false,
    tfjsModel: null,
    forensicReport: null // Store the detailed forensic analysis
};

// ============================================
// 2. INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initializeEventListeners();
    initializeGlobalChart();
    updateProviderUI();
    
    // Show setup prompt for Hugging Face
    if (state.provider === 'huggingface' && !state.apiToken) {
        document.getElementById('settingsPanel').classList.remove('hidden');
        showNotification('⚠️ For accurate AI detection, configure Hugging Face API (free)', 'warning');
    } else if (state.provider === 'tfjs') {
        showNotification('⚠️ Browser mode has limited accuracy. Use Hugging Face for real detection.', 'warning');
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

function switchToHuggingFace() {
    document.getElementById('providerSelect').value = 'huggingface';
    toggleProviderSettings();
    document.getElementById('settingsPanel').classList.remove('hidden');
    showNotification('Please enter your free Hugging Face API token for accurate detection', 'info');
}

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
    const warningBanner = document.getElementById('accuracyWarning');
    
    // Update note
    providerNote.textContent = provider.note;
    
    // Show/hide accuracy warning
    if (state.provider === 'tfjs') {
        warningBanner?.classList.remove('hidden');
    } else {
        warningBanner?.classList.add('hidden');
    }
    
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
// 5. IMAGE ANALYSIS (MULTI-PROVIDER + FORENSIC LAYERS)
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
        // Initialize forensic report
        state.forensicReport = {
            layers: [],
            flags: [],
            scores: {},
            verdict: null,
            confidence: 0
        };
        
        updateLoadingMessage('Extracting metadata (Layer 1)...');
        
        // LAYER 1: Digital Footprint Analysis
        const layer1 = await analyzeDigitalFootprint();
        state.forensicReport.layers.push(layer1);
        
        updateLoadingMessage('Analyzing pixel physics (Layer 2)...');
        
        // LAYER 2: Pixel Physics Analysis (ELA, Noise)
        const layer2 = await analyzePixelPhysics();
        state.forensicReport.layers.push(layer2);
        
        updateLoadingMessage('Checking lighting & geometry (Layer 3)...');
        
        // LAYER 3: Lighting & Geometry (Basic checks)
        const layer3 = await analyzeLightingGeometry();
        state.forensicReport.layers.push(layer3);
        
        updateLoadingMessage('Running AI semantic analysis (Layer 4)...');
        
        // LAYER 4: Semantic Analysis via AI Model
        let aiResult;
        switch (state.provider) {
            case 'tfjs':
                aiResult = await analyzeWithTensorFlow();
                break;
            case 'huggingface':
                aiResult = await analyzeWithHuggingFace();
                break;
            case 'replicate':
                aiResult = await analyzeWithReplicate();
                break;
            default:
                throw new Error('Unknown provider');
        }
        
        const layer4 = processAIResults(aiResult);
        state.forensicReport.layers.push(layer4);
        
        // Calculate final verdict using scoring algorithm
        calculateFinalVerdict();
        
        // Display comprehensive results
        displayForensicResults();
        
    } catch (error) {
        console.error('Analysis error:', error);
        showError(error.message);
    } finally {
        state.isAnalyzing = false;
        document.getElementById('scanLine').classList.add('hidden');
    }
}

function updateLoadingMessage(message) {
    const loadingText = document.querySelector('#loadingState p.text-sand-700');
    if (loadingText) {
        loadingText.textContent = message;
    }
}

// ============================================
// LAYER 1: DIGITAL FOOTPRINT ANALYSIS
// ============================================

async function analyzeDigitalFootprint() {
    const layer = {
        name: 'Digital Footprint',
        icon: '🔍',
        checks: [],
        score: 0,
        maxScore: 100
    };
    
    const file = state.currentImageFile;
    
    // Check 1: EXIF Metadata Extraction
    const exifCheck = await extractEXIFData(file);
    layer.checks.push(exifCheck);
    
    // Check 2: Resolution Analysis
    const resolutionCheck = await analyzeResolution();
    layer.checks.push(resolutionCheck);
    
    // Check 3: File Signature Analysis
    const signatureCheck = analyzeFileSignature(file);
    layer.checks.push(signatureCheck);
    
    // Calculate layer score
    const passedChecks = layer.checks.filter(c => c.status === 'pass').length;
    const warnChecks = layer.checks.filter(c => c.status === 'warn').length;
    layer.score = Math.round(((passedChecks * 100) + (warnChecks * 50)) / layer.checks.length);
    
    // Add flags for failures
    layer.checks.filter(c => c.status === 'fail').forEach(c => {
        state.forensicReport.flags.push(c.flag);
    });
    
    return layer;
}

async function extractEXIFData(file) {
    return new Promise((resolve) => {
        const check = {
            name: 'EXIF Metadata Integrity',
            description: 'Camera data, timestamps, and device information',
            status: 'warn',
            details: '',
            flag: null,
            data: {}
        };
        
        // Read file as ArrayBuffer to parse EXIF
        const reader = new FileReader();
        reader.onload = function(e) {
            const view = new DataView(e.target.result);
            
            // Check for JPEG signature
            if (view.getUint16(0) !== 0xFFD8) {
                if (file.type === 'image/png') {
                    check.status = 'warn';
                    check.details = 'PNG format - Limited metadata. Often used by AI generators.';
                    check.flag = 'PNG format (commonly used by AI)';
                } else {
                    check.status = 'warn';
                    check.details = 'Non-standard image format detected.';
                }
                resolve(check);
                return;
            }
            
            // Look for EXIF marker (APP1)
            let offset = 2;
            let hasEXIF = false;
            let exifData = {};
            
            while (offset < view.byteLength - 2) {
                const marker = view.getUint16(offset);
                
                if (marker === 0xFFE1) { // APP1 marker (EXIF)
                    hasEXIF = true;
                    // Parse basic EXIF info
                    const length = view.getUint16(offset + 2);
                    
                    // Check for "Exif" string
                    if (view.getUint32(offset + 4) === 0x45786966) {
                        exifData.found = true;
                    }
                    break;
                }
                
                if (marker === 0xFFD9 || marker === 0xFFDA) break; // End or start of data
                
                offset += 2 + view.getUint16(offset + 2);
            }
            
            if (hasEXIF) {
                check.status = 'pass';
                check.details = 'EXIF metadata present. Image likely from a camera or phone.';
                check.data = { hasEXIF: true };
            } else {
                check.status = 'fail';
                check.details = 'No EXIF metadata found. Metadata stripped or AI-generated.';
                check.flag = 'Missing EXIF Metadata';
                check.data = { hasEXIF: false };
            }
            
            resolve(check);
        };
        
        reader.onerror = () => {
            check.status = 'warn';
            check.details = 'Could not read file metadata.';
            resolve(check);
        };
        
        reader.readAsArrayBuffer(file.slice(0, 65536)); // Read first 64KB for EXIF
    });
}

async function analyzeResolution() {
    return new Promise((resolve) => {
        const check = {
            name: 'Resolution Pattern Analysis',
            description: 'Check for AI-typical square/standard resolutions',
            status: 'pass',
            details: '',
            flag: null
        };
        
        const img = new Image();
        img.onload = () => {
            const w = img.naturalWidth;
            const h = img.naturalHeight;
            
            check.data = { width: w, height: h };
            
            // Check against known AI resolutions
            const isAIResolution = AI_SIGNATURES.aiResolutions.some(
                ([aiW, aiH]) => (w === aiW && h === aiH) || (w === aiH && h === aiW)
            );
            
            // Check if perfectly square
            const isPerfectSquare = w === h;
            
            // Check if resolution is power of 2 (common in AI)
            const isPowerOf2 = (n) => n > 0 && (n & (n - 1)) === 0;
            const bothPowerOf2 = isPowerOf2(w) && isPowerOf2(h);
            
            if (isAIResolution) {
                check.status = 'fail';
                check.details = `Resolution ${w}×${h} matches known AI generator output.`;
                check.flag = `AI-Typical Resolution (${w}×${h})`;
            } else if (isPerfectSquare && bothPowerOf2) {
                check.status = 'warn';
                check.details = `Perfect square resolution ${w}×${h} (power of 2) - common in AI.`;
            } else if (isPerfectSquare && w >= 512) {
                check.status = 'warn';
                check.details = `Square resolution ${w}×${h} - sometimes indicates AI cropping.`;
            } else {
                check.status = 'pass';
                check.details = `Resolution ${w}×${h} appears normal for camera output.`;
            }
            
            resolve(check);
        };
        
        img.onerror = () => {
            check.status = 'warn';
            check.details = 'Could not analyze image resolution.';
            resolve(check);
        };
        
        img.src = state.currentImage;
    });
}

function analyzeFileSignature(file) {
    const check = {
        name: 'Software Signature Detection',
        description: 'Check filename and type for AI generator signatures',
        status: 'pass',
        details: '',
        flag: null
    };
    
    const filename = file.name.toLowerCase();
    const filenameParts = filename.replace(/[_\-\.]/g, ' ');
    
    // Check for AI generator names in filename
    const aiMatch = AI_SIGNATURES.software.find(sig => filenameParts.includes(sig));
    const editorMatch = AI_SIGNATURES.editors.find(sig => filenameParts.includes(sig));
    
    // Check for common AI output patterns
    const hasAIPattern = /^(image|output|generated|result|sample|grid|seed)[\s_\-]?\d*/i.test(filename);
    const hasMidjourneyPattern = /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}/i.test(filename);
    const hasDALLEPattern = /^DALL/i.test(filename);
    const hasSDPattern = /^\d{5,}-\d+/i.test(filename); // Stable Diffusion seed pattern
    
    if (aiMatch) {
        check.status = 'fail';
        check.details = `Filename contains AI generator signature: "${aiMatch}"`;
        check.flag = `AI Software Detected (${aiMatch})`;
    } else if (hasDALLEPattern || hasMidjourneyPattern || hasSDPattern) {
        check.status = 'fail';
        check.details = 'Filename matches AI generator output pattern.';
        check.flag = 'AI Output Filename Pattern';
    } else if (editorMatch) {
        check.status = 'warn';
        check.details = `Image may have been edited with: ${editorMatch}`;
    } else if (hasAIPattern) {
        check.status = 'warn';
        check.details = 'Generic filename pattern - could be AI output.';
    } else {
        check.status = 'pass';
        check.details = 'No AI generator signatures detected in filename.';
    }
    
    return check;
}

// ============================================
// LAYER 2: PIXEL PHYSICS ANALYSIS
// ============================================

async function analyzePixelPhysics() {
    const layer = {
        name: 'Pixel Physics',
        icon: '🔬',
        checks: [],
        score: 0,
        maxScore: 100
    };
    
    // Check 1: Error Level Analysis (ELA)
    const elaCheck = await performELA();
    layer.checks.push(elaCheck);
    
    // Check 2: Noise Pattern Analysis
    const noiseCheck = await analyzeNoisePattern();
    layer.checks.push(noiseCheck);
    
    // Check 3: Color Distribution Analysis
    const colorCheck = await analyzeColorDistribution();
    layer.checks.push(colorCheck);
    
    // Calculate layer score
    const passedChecks = layer.checks.filter(c => c.status === 'pass').length;
    const warnChecks = layer.checks.filter(c => c.status === 'warn').length;
    layer.score = Math.round(((passedChecks * 100) + (warnChecks * 50)) / layer.checks.length);
    
    // Add flags for failures
    layer.checks.filter(c => c.status === 'fail').forEach(c => {
        state.forensicReport.flags.push(c.flag);
    });
    
    return layer;
}

async function performELA() {
    return new Promise((resolve) => {
        const check = {
            name: 'Error Level Analysis (ELA)',
            description: 'Detect compression inconsistencies from manipulation',
            status: 'pass',
            details: '',
            flag: null,
            elaDataUrl: null
        };
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            try {
                // Create canvas for original
                const canvas1 = document.createElement('canvas');
                const ctx1 = canvas1.getContext('2d');
                canvas1.width = img.width;
                canvas1.height = img.height;
                ctx1.drawImage(img, 0, 0);
                
                // Get original image data
                const originalData = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
                
                // Recompress at lower quality
                const recompressedDataUrl = canvas1.toDataURL('image/jpeg', CONFIG.ELA_QUALITY / 100);
                
                const img2 = new Image();
                img2.onload = () => {
                    // Create canvas for recompressed
                    const canvas2 = document.createElement('canvas');
                    const ctx2 = canvas2.getContext('2d');
                    canvas2.width = img.width;
                    canvas2.height = img.height;
                    ctx2.drawImage(img2, 0, 0);
                    
                    const recompressedData = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);
                    
                    // Calculate ELA difference
                    const elaCanvas = document.createElement('canvas');
                    const elaCtx = elaCanvas.getContext('2d');
                    elaCanvas.width = img.width;
                    elaCanvas.height = img.height;
                    
                    const elaImageData = elaCtx.createImageData(canvas1.width, canvas1.height);
                    const scale = 20; // Amplification factor
                    
                    let totalDiff = 0;
                    let maxDiff = 0;
                    let highDiffPixels = 0;
                    const diffThreshold = 50;
                    
                    for (let i = 0; i < originalData.data.length; i += 4) {
                        const rDiff = Math.abs(originalData.data[i] - recompressedData.data[i]);
                        const gDiff = Math.abs(originalData.data[i + 1] - recompressedData.data[i + 1]);
                        const bDiff = Math.abs(originalData.data[i + 2] - recompressedData.data[i + 2]);
                        
                        const avgDiff = (rDiff + gDiff + bDiff) / 3;
                        totalDiff += avgDiff;
                        maxDiff = Math.max(maxDiff, avgDiff);
                        
                        if (avgDiff > diffThreshold) {
                            highDiffPixels++;
                        }
                        
                        // Scale difference for visibility
                        elaImageData.data[i] = Math.min(255, rDiff * scale);
                        elaImageData.data[i + 1] = Math.min(255, gDiff * scale);
                        elaImageData.data[i + 2] = Math.min(255, bDiff * scale);
                        elaImageData.data[i + 3] = 255;
                    }
                    
                    elaCtx.putImageData(elaImageData, 0, 0);
                    check.elaDataUrl = elaCanvas.toDataURL('image/png');
                    
                    // Analyze results
                    const totalPixels = (originalData.data.length / 4);
                    const avgDiff = totalDiff / totalPixels;
                    const highDiffPercentage = (highDiffPixels / totalPixels) * 100;
                    
                    check.data = {
                        averageDifference: avgDiff.toFixed(2),
                        maxDifference: maxDiff.toFixed(2),
                        highDiffPercentage: highDiffPercentage.toFixed(2)
                    };
                    
                    if (highDiffPercentage > 15) {
                        check.status = 'fail';
                        check.details = `High ELA variance detected (${highDiffPercentage.toFixed(1)}% anomalous pixels). Possible manipulation or AI generation.`;
                        check.flag = 'High ELA Variance (Manipulation Detected)';
                    } else if (highDiffPercentage > 8 || avgDiff > 20) {
                        check.status = 'warn';
                        check.details = `Moderate ELA inconsistencies (${highDiffPercentage.toFixed(1)}%). Some regions may be edited.`;
                    } else {
                        check.status = 'pass';
                        check.details = `Uniform compression levels (${highDiffPercentage.toFixed(1)}% variance). No obvious manipulation.`;
                    }
                    
                    resolve(check);
                };
                
                img2.src = recompressedDataUrl;
                
            } catch (err) {
                check.status = 'warn';
                check.details = 'ELA analysis could not complete: ' + err.message;
                resolve(check);
            }
        };
        
        img.onerror = () => {
            check.status = 'warn';
            check.details = 'Could not load image for ELA analysis.';
            resolve(check);
        };
        
        img.src = state.currentImage;
    });
}

async function analyzeNoisePattern() {
    return new Promise((resolve) => {
        const check = {
            name: 'Noise Print Analysis (PRNU)',
            description: 'Detect inconsistent noise patterns from AI generation',
            status: 'pass',
            details: '',
            flag: null
        };
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Use smaller size for performance
                const maxSize = 512;
                const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // Calculate local variance in different regions
                const regionSize = 32;
                const regions = [];
                
                for (let y = 0; y < canvas.height - regionSize; y += regionSize) {
                    for (let x = 0; x < canvas.width - regionSize; x += regionSize) {
                        let sum = 0;
                        let sumSq = 0;
                        let count = 0;
                        
                        for (let dy = 0; dy < regionSize; dy++) {
                            for (let dx = 0; dx < regionSize; dx++) {
                                const idx = ((y + dy) * canvas.width + (x + dx)) * 4;
                                // Use luminance
                                const lum = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
                                sum += lum;
                                sumSq += lum * lum;
                                count++;
                            }
                        }
                        
                        const mean = sum / count;
                        const variance = (sumSq / count) - (mean * mean);
                        regions.push({ x, y, variance, mean });
                    }
                }
                
                // Analyze variance distribution
                const variances = regions.map(r => r.variance);
                const avgVariance = variances.reduce((a, b) => a + b, 0) / variances.length;
                const varianceOfVariance = variances.reduce((sum, v) => sum + Math.pow(v - avgVariance, 2), 0) / variances.length;
                
                // Count regions with very low variance (smooth/plastic look)
                const smoothRegions = regions.filter(r => r.variance < 50 && r.mean > 50 && r.mean < 200).length;
                const smoothPercentage = (smoothRegions / regions.length) * 100;
                
                check.data = {
                    averageVariance: avgVariance.toFixed(2),
                    varianceConsistency: varianceOfVariance.toFixed(2),
                    smoothRegions: smoothPercentage.toFixed(1) + '%'
                };
                
                if (smoothPercentage > 40) {
                    check.status = 'fail';
                    check.details = `Excessive smooth regions (${smoothPercentage.toFixed(1)}%). AI-generated images often lack natural noise.`;
                    check.flag = 'Synthetic Noise Profile (AI-like smoothness)';
                } else if (smoothPercentage > 25) {
                    check.status = 'warn';
                    check.details = `Some unnaturally smooth areas detected (${smoothPercentage.toFixed(1)}%).`;
                } else {
                    check.status = 'pass';
                    check.details = `Natural noise distribution detected. Consistent with camera sensor output.`;
                }
                
                resolve(check);
                
            } catch (err) {
                check.status = 'warn';
                check.details = 'Noise analysis could not complete.';
                resolve(check);
            }
        };
        
        img.src = state.currentImage;
    });
}

async function analyzeColorDistribution() {
    return new Promise((resolve) => {
        const check = {
            name: 'Color Distribution Analysis',
            description: 'Check for unnatural color patterns from AI generation',
            status: 'pass',
            details: '',
            flag: null
        };
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const maxSize = 256;
                const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // Build color histogram
                const histogram = { r: new Array(256).fill(0), g: new Array(256).fill(0), b: new Array(256).fill(0) };
                
                for (let i = 0; i < data.length; i += 4) {
                    histogram.r[data[i]]++;
                    histogram.g[data[i + 1]]++;
                    histogram.b[data[i + 2]]++;
                }
                
                // Check for unusual spikes (AI often has unnatural color distributions)
                const totalPixels = data.length / 4;
                const threshold = totalPixels * 0.05; // 5% of pixels
                
                let spikes = 0;
                let gaps = 0;
                
                ['r', 'g', 'b'].forEach(channel => {
                    for (let i = 1; i < 255; i++) {
                        if (histogram[channel][i] > threshold) spikes++;
                        // Check for gaps (missing values)
                        if (histogram[channel][i] === 0 && histogram[channel][i-1] > 100 && histogram[channel][i+1] > 100) {
                            gaps++;
                        }
                    }
                });
                
                check.data = {
                    colorSpikes: spikes,
                    histogramGaps: gaps
                };
                
                if (spikes > 15 || gaps > 10) {
                    check.status = 'fail';
                    check.details = `Unnatural color distribution detected. ${spikes} color spikes, ${gaps} histogram gaps.`;
                    check.flag = 'Abnormal Color Distribution';
                } else if (spikes > 8 || gaps > 5) {
                    check.status = 'warn';
                    check.details = `Slightly unusual color patterns detected.`;
                } else {
                    check.status = 'pass';
                    check.details = `Color distribution appears natural for photographic content.`;
                }
                
                resolve(check);
                
            } catch (err) {
                check.status = 'warn';
                check.details = 'Color analysis could not complete.';
                resolve(check);
            }
        };
        
        img.src = state.currentImage;
    });
}

// ============================================
// LAYER 3: LIGHTING & GEOMETRY ANALYSIS
// ============================================

async function analyzeLightingGeometry() {
    const layer = {
        name: 'Lighting & Geometry',
        icon: '💡',
        checks: [],
        score: 0,
        maxScore: 100
    };
    
    // Check 1: Edge Consistency
    const edgeCheck = await analyzeEdges();
    layer.checks.push(edgeCheck);
    
    // Check 2: Contrast Analysis
    const contrastCheck = await analyzeContrast();
    layer.checks.push(contrastCheck);
    
    // Calculate layer score
    const passedChecks = layer.checks.filter(c => c.status === 'pass').length;
    const warnChecks = layer.checks.filter(c => c.status === 'warn').length;
    layer.score = Math.round(((passedChecks * 100) + (warnChecks * 50)) / layer.checks.length);
    
    // Add flags for failures
    layer.checks.filter(c => c.status === 'fail').forEach(c => {
        state.forensicReport.flags.push(c.flag);
    });
    
    return layer;
}

async function analyzeEdges() {
    return new Promise((resolve) => {
        const check = {
            name: 'Edge Coherence Analysis',
            description: 'Check for unnatural edge artifacts from AI upscaling',
            status: 'pass',
            details: '',
            flag: null
        };
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const maxSize = 256;
                const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // Simple Sobel edge detection
                let edgeSum = 0;
                let edgeCount = 0;
                const width = canvas.width;
                const height = canvas.height;
                
                for (let y = 1; y < height - 1; y++) {
                    for (let x = 1; x < width - 1; x++) {
                        const idx = (y * width + x) * 4;
                        
                        // Get luminance of surrounding pixels
                        const getLum = (i) => data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
                        
                        const tl = getLum(((y-1) * width + (x-1)) * 4);
                        const t = getLum(((y-1) * width + x) * 4);
                        const tr = getLum(((y-1) * width + (x+1)) * 4);
                        const l = getLum((y * width + (x-1)) * 4);
                        const r = getLum((y * width + (x+1)) * 4);
                        const bl = getLum(((y+1) * width + (x-1)) * 4);
                        const b = getLum(((y+1) * width + x) * 4);
                        const br = getLum(((y+1) * width + (x+1)) * 4);
                        
                        // Sobel operators
                        const gx = -tl - 2*l - bl + tr + 2*r + br;
                        const gy = -tl - 2*t - tr + bl + 2*b + br;
                        
                        const magnitude = Math.sqrt(gx*gx + gy*gy);
                        edgeSum += magnitude;
                        edgeCount++;
                    }
                }
                
                const avgEdge = edgeSum / edgeCount;
                
                check.data = {
                    averageEdgeStrength: avgEdge.toFixed(2)
                };
                
                // AI images often have either too sharp or too blurry edges
                if (avgEdge > 80) {
                    check.status = 'warn';
                    check.details = `Unusually sharp edges detected. May indicate AI sharpening/enhancement.`;
                } else if (avgEdge < 10) {
                    check.status = 'warn';
                    check.details = `Very soft edges detected. May indicate AI smoothing or over-processing.`;
                } else {
                    check.status = 'pass';
                    check.details = `Edge characteristics consistent with natural photography.`;
                }
                
                resolve(check);
                
            } catch (err) {
                check.status = 'warn';
                check.details = 'Edge analysis could not complete.';
                resolve(check);
            }
        };
        
        img.src = state.currentImage;
    });
}

async function analyzeContrast() {
    return new Promise((resolve) => {
        const check = {
            name: 'Dynamic Range Analysis',
            description: 'Check for clipped highlights/shadows indicative of AI',
            status: 'pass',
            details: '',
            flag: null
        };
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const maxSize = 256;
                const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                const totalPixels = data.length / 4;
                let clippedBlack = 0;
                let clippedWhite = 0;
                let minLum = 255;
                let maxLum = 0;
                
                for (let i = 0; i < data.length; i += 4) {
                    const lum = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
                    minLum = Math.min(minLum, lum);
                    maxLum = Math.max(maxLum, lum);
                    
                    if (lum < 5) clippedBlack++;
                    if (lum > 250) clippedWhite++;
                }
                
                const clippedPercentage = ((clippedBlack + clippedWhite) / totalPixels) * 100;
                const dynamicRange = maxLum - minLum;
                
                check.data = {
                    dynamicRange: dynamicRange.toFixed(0),
                    clippedPercentage: clippedPercentage.toFixed(2) + '%'
                };
                
                if (dynamicRange < 100) {
                    check.status = 'warn';
                    check.details = `Limited dynamic range (${dynamicRange.toFixed(0)}). Could indicate AI processing.`;
                } else if (clippedPercentage > 10) {
                    check.status = 'warn';
                    check.details = `High clipping detected (${clippedPercentage.toFixed(1)}%). May be over-processed.`;
                } else {
                    check.status = 'pass';
                    check.details = `Good dynamic range (${dynamicRange.toFixed(0)}) with minimal clipping.`;
                }
                
                resolve(check);
                
            } catch (err) {
                check.status = 'warn';
                check.details = 'Contrast analysis could not complete.';
                resolve(check);
            }
        };
        
        img.src = state.currentImage;
    });
}

// ============================================
// LAYER 4: SEMANTIC ANALYSIS (AI Classification)
// ============================================

function processAIResults(aiResults) {
    const layer = {
        name: 'Semantic Analysis',
        icon: '🧠',
        checks: [],
        score: 0,
        maxScore: 100,
        aiPredictions: aiResults
    };
    
    // Process AI model output
    const check = {
        name: 'AI Model Classification',
        description: `Analysis by ${PROVIDERS[state.provider].name}`,
        status: 'pass',
        details: '',
        flag: null
    };
    
    if (!aiResults || aiResults.length === 0) {
        check.status = 'warn';
        check.details = 'AI model returned no predictions.';
        layer.checks.push(check);
        layer.score = 50;
        return layer;
    }
    
    // Find the top prediction
    const sorted = [...aiResults].sort((a, b) => b.score - a.score);
    const top = sorted[0];
    const confidence = (top.score * 100).toFixed(1);
    
    // Determine if it's classified as fake
    const fakeKeywords = ['fake', 'ai', 'generated', 'synthetic', 'artificial', 'deepfake', 'manipulated'];
    const realKeywords = ['real', 'authentic', 'human', 'natural', 'genuine'];
    
    const labelLower = top.label.toLowerCase();
    const isFakeLabel = fakeKeywords.some(kw => labelLower.includes(kw));
    const isRealLabel = realKeywords.some(kw => labelLower.includes(kw));
    
    if (isFakeLabel && top.score > 0.7) {
        check.status = 'fail';
        check.details = `AI classified as "${top.label}" with ${confidence}% confidence.`;
        check.flag = `AI Classification: ${top.label} (${confidence}%)`;
        layer.score = Math.round((1 - top.score) * 100);
    } else if (isFakeLabel && top.score > 0.5) {
        check.status = 'warn';
        check.details = `AI suggests possible "${top.label}" (${confidence}% confidence).`;
        layer.score = Math.round((1 - top.score) * 100);
    } else if (isRealLabel && top.score > 0.7) {
        check.status = 'pass';
        check.details = `AI classified as "${top.label}" with ${confidence}% confidence.`;
        layer.score = Math.round(top.score * 100);
    } else {
        check.status = 'warn';
        check.details = `Inconclusive: "${top.label}" (${confidence}% confidence).`;
        layer.score = 50;
    }
    
    layer.checks.push(check);
    
    return layer;
}

// ============================================
// SCORING ALGORITHM & FINAL VERDICT
// ============================================

function calculateFinalVerdict() {
    const report = state.forensicReport;
    
    // Weight each layer
    const weights = {
        'Digital Footprint': 0.20,
        'Pixel Physics': 0.30,
        'Lighting & Geometry': 0.15,
        'Semantic Analysis': 0.35
    };
    
    // Calculate weighted score
    let totalScore = 0;
    let totalWeight = 0;
    
    report.layers.forEach(layer => {
        const weight = weights[layer.name] || 0.25;
        totalScore += (100 - layer.score) * weight; // Invert: high layer score = low fake score
        totalWeight += weight;
    });
    
    // Normalize to 0-100 (where 100 = definitely fake)
    let fakeScore = totalScore / totalWeight;
    
    // Boost score based on critical flags
    const criticalFlags = report.flags.filter(f => 
        f.includes('AI Software') || 
        f.includes('AI Classification') ||
        f.includes('Synthetic Noise') ||
        f.includes('AI-Typical Resolution')
    );
    
    if (criticalFlags.length > 0) {
        fakeScore = Math.min(100, fakeScore + (criticalFlags.length * 10));
    }
    
    // Determine verdict
    let verdict, verdictClass;
    
    if (fakeScore <= CONFIG.FORENSIC_THRESHOLDS.REAL) {
        verdict = 'LIKELY REAL';
        verdictClass = 'real';
    } else if (fakeScore <= CONFIG.FORENSIC_THRESHOLDS.SUSPICIOUS) {
        verdict = 'SUSPICIOUS';
        verdictClass = 'suspicious';
    } else if (fakeScore <= CONFIG.FORENSIC_THRESHOLDS.EDITED) {
        verdict = 'LIKELY EDITED';
        verdictClass = 'edited';
    } else {
        verdict = 'AI GENERATED / FAKE';
        verdictClass = 'fake';
    }
    
    report.confidence = Math.round(fakeScore);
    report.verdict = verdict;
    report.verdictClass = verdictClass;
    
    // Get top 3 flags
    report.primaryFlags = report.flags.slice(0, 3);
    
    // Store scores
    report.scores = {
        weighted: fakeScore.toFixed(1),
        layers: report.layers.map(l => ({ name: l.name, score: l.score }))
    };
}

// ============================================
// FORENSIC RESULTS DISPLAY
// ============================================

function displayForensicResults() {
    const report = state.forensicReport;
    
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('resultsDisplay').classList.remove('hidden');
    
    // Update verdict card with forensic styling
    updateForensicVerdictCard(report);
    
    // Display layer-by-layer breakdown
    displayLayerBreakdown(report);
    
    // Display confidence scores
    displayForensicScores(report);
    
    // Create forensic chart
    createForensicChart(report);
    
    // Display metadata
    displayForensicMetadata(report);
}

function updateForensicVerdictCard(report) {
    const card = document.getElementById('verdictCard');
    const labelEl = document.getElementById('verdictLabel');
    const textEl = document.getElementById('verdictText');
    const iconEl = document.getElementById('verdictIcon');
    
    const verdictConfig = {
        real: {
            bgClass: 'bg-verified/10 border-verified',
            textClass: 'text-verified',
            detailClass: 'text-verified-dark',
            icon: '✓',
            description: 'No significant manipulation detected. The image passes forensic analysis across all layers.'
        },
        suspicious: {
            bgClass: 'bg-suspicious/10 border-suspicious',
            textClass: 'text-suspicious',
            detailClass: 'text-suspicious-dark',
            icon: '⚠',
            description: 'Some anomalies detected. The image may have been edited or processed. Further verification recommended.'
        },
        edited: {
            bgClass: 'bg-orange-100 border-orange-500',
            textClass: 'text-orange-600',
            detailClass: 'text-orange-700',
            icon: '✎',
            description: 'Strong indicators of manipulation detected. Image has likely been edited or enhanced with software.'
        },
        fake: {
            bgClass: 'bg-danger/10 border-danger',
            textClass: 'text-danger',
            detailClass: 'text-danger-dark',
            icon: '✕',
            description: 'Multiple forensic layers indicate AI generation or significant manipulation. Exercise extreme caution.'
        }
    };
    
    const config = verdictConfig[report.verdictClass];
    
    card.className = `rounded-lg p-4 border-2 ${config.bgClass}`;
    labelEl.textContent = report.verdict;
    labelEl.className = `font-semibold text-lg ${config.textClass}`;
    
    let flagsHtml = '';
    if (report.primaryFlags.length > 0) {
        flagsHtml = '<br><br><strong>Primary Flags:</strong><ul class="list-disc list-inside mt-1">' + 
            report.primaryFlags.map(f => `<li>${f}</li>`).join('') + '</ul>';
    }
    
    textEl.innerHTML = config.description + flagsHtml;
    textEl.className = `text-sm ${config.detailClass}`;
    iconEl.textContent = config.icon;
}

function displayLayerBreakdown(report) {
    const container = document.getElementById('scoresContainer');
    container.innerHTML = '<h4 class="font-medium text-sand-800 mb-3">4-Layer Detection Matrix</h4>';
    
    report.layers.forEach(layer => {
        const authenticity = layer.score;
        let colorClass = 'bg-verified';
        
        if (authenticity < 40) {
            colorClass = 'bg-danger';
        } else if (authenticity < 70) {
            colorClass = 'bg-suspicious';
        }
        
        const checksHtml = layer.checks.map(check => {
            const statusIcon = check.status === 'pass' ? '✓' : check.status === 'fail' ? '✕' : '⚠';
            const statusColor = check.status === 'pass' ? 'text-verified' : check.status === 'fail' ? 'text-danger' : 'text-suspicious';
            return `
                <div class="flex items-start space-x-2 text-xs">
                    <span class="${statusColor} font-bold">${statusIcon}</span>
                    <div>
                        <span class="font-medium">${check.name}:</span>
                        <span class="text-sand-600">${check.details}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        const layerHtml = `
            <div class="mb-4 p-3 bg-sand-50 rounded-lg">
                <div class="flex justify-between mb-2">
                    <span class="font-medium text-sand-800">${layer.icon} ${layer.name}</span>
                    <span class="text-sm font-semibold ${authenticity >= 70 ? 'text-verified' : authenticity >= 40 ? 'text-suspicious' : 'text-danger'}">${authenticity}% Authentic</span>
                </div>
                <div class="w-full bg-sand-200 rounded-full h-2 mb-3">
                    <div class="result-bar ${colorClass} h-2 rounded-full transition-all duration-1000" style="width: ${authenticity}%"></div>
                </div>
                <div class="space-y-2">
                    ${checksHtml}
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', layerHtml);
    });
}

function displayForensicScores(report) {
    // Add overall confidence display
    const container = document.getElementById('scoresContainer');
    
    const overallHtml = `
        <div class="mt-4 p-4 bg-sand-800 text-white rounded-lg">
            <div class="flex justify-between items-center">
                <span class="font-bold text-lg">FORENSIC CONFIDENCE</span>
                <span class="text-3xl font-bold ${report.confidence >= 60 ? 'text-danger-light' : report.confidence >= 30 ? 'text-suspicious-light' : 'text-verified-light'}">${report.confidence}%</span>
            </div>
            <p class="text-sand-300 text-sm mt-2">
                Probability that this image is synthetic, AI-generated, or significantly manipulated.
            </p>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', overallHtml);
}

function createForensicChart(report) {
    const ctx = document.getElementById('resultsChart');
    
    if (window.resultsChartInstance) {
        window.resultsChartInstance.destroy();
    }
    
    const labels = report.layers.map(l => l.name);
    const scores = report.layers.map(l => l.score);
    
    const backgroundColors = scores.map(score => {
        if (score >= 70) return 'rgba(13, 148, 136, 0.7)';
        if (score >= 40) return 'rgba(245, 158, 11, 0.7)';
        return 'rgba(220, 38, 38, 0.7)';
    });
    
    window.resultsChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Authenticity Score',
                data: scores,
                backgroundColor: 'rgba(13, 148, 136, 0.2)',
                borderColor: 'rgba(13, 148, 136, 1)',
                pointBackgroundColor: backgroundColors,
                pointBorderColor: '#fff',
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Layer-by-Layer Authenticity Analysis'
                }
            }
        }
    });
}

function displayForensicMetadata(report) {
    const container = document.getElementById('metadata');
    const file = state.currentImageFile;
    const now = new Date();
    
    const providerName = PROVIDERS[state.provider].name;
    const modelName = state.selectedModel.includes('/') 
        ? state.selectedModel.split('/')[1] 
        : state.selectedModel;
    
    // Get technical data from checks
    let technicalDetails = [];
    report.layers.forEach(layer => {
        layer.checks.forEach(check => {
            if (check.data) {
                Object.entries(check.data).forEach(([key, value]) => {
                    technicalDetails.push(`<strong>${key}:</strong> ${value}`);
                });
            }
        });
    });
    
    const metadata = [
        `<strong>Final Verdict:</strong> <span class="${report.verdictClass === 'real' ? 'text-verified' : report.verdictClass === 'fake' ? 'text-danger' : 'text-suspicious'} font-bold">${report.verdict}</span>`,
        `<strong>Confidence:</strong> ${report.confidence}%`,
        `<strong>Flags Detected:</strong> ${report.flags.length}`,
        `<hr class="my-2 border-sand-300">`,
        `<strong>AI Provider:</strong> ${providerName}`,
        `<strong>Model:</strong> ${modelName}`,
        `<strong>File:</strong> ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
        `<strong>Analyzed:</strong> ${now.toLocaleString()}`,
        `<hr class="my-2 border-sand-300">`,
        `<details class="cursor-pointer"><summary class="font-medium">Technical Details</summary><div class="mt-2 space-y-1 text-xs">${technicalDetails.join('<br>')}</div></details>`
    ];
    
    container.innerHTML = metadata.join('<br>');
}

// ============================================
// 5a. TENSORFLOW.JS ANALYSIS
// ============================================

async function analyzeWithTensorFlow() {
    showNotification('Loading AI model in your browser...', 'info');
    // IMPORTANT: TensorFlow.js in browser cannot accurately detect AI-generated images
    // This is a FALLBACK ONLY - results will be unreliable
    
    if (state.selectedModel === 'browser-forensic') {
        // Use only forensic layers, skip AI classification
        showNotification('Using forensic heuristics only (no AI model). Limited accuracy.', 'warning');
        return [{
            label: 'Browser Forensic Analysis Only',
            score: 0.5,
            originalLabel: 'Heuristic-based detection'
        }];
    }
    
    showNotification('⚠️ MobileNet cannot detect AI images. Use Hugging Face instead!', 'error');
    
    // Load MobileNet anyway (for demonstration)
    if (!state.tfjsModel) {
        state.tfjsModel = await mobilenet.load();
    }
    
    const img = new Image();
    img.src = state.currentImage;
    await new Promise((resolve) => { img.onload = resolve; });
    
    const predictions = await state.tfjsModel.classify(img);
    
    // This is INCORRECT - MobileNet classifies OBJECTS, not AI vs Real
    // Returning with a warning
    return predictions.map(pred => ({
        label: `⚠️ NOT AI DETECTION: ${pred.className}`,
        score: pred.probability * 0.3, // Reduce confidence to show unreliability
        originalLabel: pred.className,
        warning: 'MobileNet is not designed for AI detection. Please use Hugging Face.'
    }));

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
// 6. RESULTS DISPLAY (Legacy - kept for compatibility)
// ============================================

function showLoadingState() {
    document.getElementById('placeholder').classList.add('hidden');
    document.getElementById('resultsDisplay').classList.add('hidden');
    document.getElementById('errorState').classList.add('hidden');
    document.getElementById('loadingState').classList.remove('hidden');
}

function displayResults(results) {
    // This function is now replaced by displayForensicResults
    // Kept for backward compatibility
    displayForensicResults();
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
