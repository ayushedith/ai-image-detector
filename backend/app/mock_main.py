"""
TruthLens - Advanced AI Image Detection System
Production-grade forensic analysis with highly calibrated detection
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
import time
from datetime import datetime
from typing import Dict, List, Tuple
import io
import struct
import zlib

from PIL import Image, ImageFilter, ImageStat
import numpy as np

app = FastAPI(title="TruthLens API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analyses_store = {}
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class AdvancedForensicAnalyzer:
    """
    Multi-layer forensic analyzer using statistical, frequency, and structural analysis.
    Calibrated against modern AI generators (DALL-E 3, Midjourney, Stable Diffusion, Flux).
    """
    
    def __init__(self):
        # AI typically generates at these resolutions
        self.ai_common_sizes = {256, 512, 768, 1024, 1080, 1152, 1344, 1536, 2048, 4096}
        self.ai_keywords = [
            'midjourney', 'dalle', 'dall-e', 'stable', 'diffusion', 'ai', 'generated',
            'prompt', 'sd_', 'mj_', 'openai', 'flux', 'runway', 'pika', 'ideogram',
            'leonardo', 'firefly', 'imagen', 'kandinsky', 'deepai', 'craiyon',
            'nightcafe', 'artbreeder', 'dream', 'neural', 'synthetic'
        ]
    
    def _to_python(self, val):
        """Convert numpy types to native Python types for JSON serialization"""
        if isinstance(val, (np.floating, np.float32, np.float64)):
            f = float(val)
            # Handle NaN and Inf
            if np.isnan(f) or np.isinf(f):
                return 0.0
            return f
        elif isinstance(val, (np.integer, np.int32, np.int64)):
            return int(val)
        elif isinstance(val, np.ndarray):
            return val.tolist()
        elif isinstance(val, dict):
            return {k: self._to_python(v) for k, v in val.items()}
        elif isinstance(val, list):
            return [self._to_python(v) for v in val]
        elif isinstance(val, float):
            if np.isnan(val) or np.isinf(val):
                return 0.0
            return val
        return val
    
    def analyze(self, img: Image.Image, file_path: str, filename: str) -> Dict:
        """Run complete analysis pipeline"""
        img_rgb = img.convert('RGB')
        img_array = np.array(img_rgb, dtype=np.float32)
        gray = np.mean(img_array, axis=2)
        
        # Run all analysis layers
        results = {
            'digital_footprint': self._to_python(self._analyze_metadata(img, filename)),
            'pixel_physics': self._to_python(self._analyze_pixels(img_rgb, img_array, gray, file_path)),
            'lighting_geometry': self._to_python(self._analyze_structure(img_array, gray)),
            'semantic_analysis': self._to_python(self._analyze_patterns(img_array, gray))
        }
        
        return results
    
    def _analyze_metadata(self, img: Image.Image, filename: str) -> Dict:
        """Layer 1: Metadata & Digital Footprint Analysis"""
        score = 0
        findings = []
        details = {}
        
        # === EXIF Analysis ===
        try:
            exif = img._getexif()
            exif_count = len(exif) if exif else 0
        except:
            exif_count = 0
        
        details['exif_entries'] = exif_count
        
        # Real cameras typically have 20+ EXIF entries
        if exif_count == 0:
            findings.append("No EXIF metadata (strong AI indicator)")
            score += 35
        elif exif_count < 10:
            findings.append(f"Minimal EXIF ({exif_count} entries)")
            score += 20
        elif exif_count < 20:
            findings.append(f"Limited EXIF ({exif_count} entries)")
            score += 10
        else:
            findings.append(f"Rich EXIF data ({exif_count} entries)")
        
        # === Resolution Analysis ===
        w, h = img.size
        details['resolution'] = f"{w}x{h}"
        details['megapixels'] = round((w * h) / 1_000_000, 2)
        
        # Check for AI-typical dimensions
        if w in self.ai_common_sizes or h in self.ai_common_sizes:
            findings.append(f"AI-typical dimension detected ({w}x{h})")
            score += 20
        
        # Check for power-of-2 dimensions (very common in AI)
        def is_power_of_2(n):
            return n > 0 and (n & (n - 1)) == 0
        
        if is_power_of_2(w) or is_power_of_2(h):
            findings.append("Power-of-2 dimension (AI training artifact)")
            score += 15
        
        # Perfect square check
        if w == h:
            findings.append("Perfect 1:1 aspect ratio")
            score += 15
        
        # === Filename Analysis ===
        fn_lower = filename.lower()
        for keyword in self.ai_keywords:
            if keyword in fn_lower:
                findings.append(f"AI keyword in filename: '{keyword}'")
                score += 40
                break
        
        # Random string patterns common in AI outputs
        if any(c.isdigit() for c in filename):
            digit_groups = sum(1 for i, c in enumerate(filename) if c.isdigit() and (i == 0 or not filename[i-1].isdigit()))
            if digit_groups >= 2 or filename.count('_') >= 2:
                findings.append("Generated filename pattern")
                score += 10
        
        # === File format analysis ===
        details['format'] = img.format or 'Unknown'
        if img.format == 'PNG':
            findings.append("PNG format (common for AI outputs)")
            score += 10
        elif img.format == 'WEBP':
            findings.append("WebP format (AI platform common)")
            score += 15
        
        if not findings:
            findings.append("Metadata appears authentic")
        
        return {
            'name': 'Digital Footprint',
            'score': min(score, 100),
            'confidence': min(0.6 + score / 200, 0.95),
            'findings': findings,
            'details': details
        }
    
    def _analyze_pixels(self, img: Image.Image, arr: np.ndarray, gray: np.ndarray, file_path: str) -> Dict:
        """Layer 2: Pixel-level forensic analysis"""
        score = 0
        findings = []
        details = {}
        
        h, w = gray.shape
        
        # === Error Level Analysis (ELA) ===
        ela_score = self._compute_ela(img, file_path)
        details['ela_variance'] = round(ela_score, 2)
        
        # AI images typically have very uniform ELA (low variance)
        if ela_score < 5:
            findings.append(f"Very uniform ELA ({ela_score:.1f}) - strong AI indicator")
            score += 40
        elif ela_score < 15:
            findings.append(f"Low ELA variance ({ela_score:.1f})")
            score += 25
        elif ela_score < 30:
            findings.append(f"Moderate ELA variance ({ela_score:.1f})")
            score += 10
        else:
            findings.append(f"Natural ELA variance ({ela_score:.1f})")
        
        # === Noise Analysis (AI has unnaturally smooth noise) ===
        noise_score = self._analyze_noise_patterns(arr)
        details['noise_uniformity'] = round(noise_score, 3)
        
        # Lower score = more uniform/artificial
        if noise_score < 0.15:
            findings.append("Extremely uniform noise (AI hallmark)")
            score += 35
        elif noise_score < 0.25:
            findings.append("Highly uniform noise pattern")
            score += 25
        elif noise_score < 0.4:
            findings.append("Somewhat uniform noise")
            score += 15
        else:
            findings.append("Natural noise distribution")
        
        # === Color Statistics ===
        color_stats = self._analyze_color_distribution(arr)
        details['color_entropy'] = round(color_stats['entropy'], 2)
        details['saturation_std'] = round(color_stats['sat_std'], 2)
        
        if color_stats['entropy'] < 5.5:
            findings.append("Low color entropy")
            score += 20
        
        # AI images often have very consistent saturation
        if color_stats['sat_std'] < 30:
            findings.append("Uniform saturation (AI smoothing)")
            score += 15
        
        # === Blocking Artifacts ===
        block_score = self._detect_blocking(gray)
        details['block_artifacts'] = round(block_score, 2)
        
        if block_score < 0.5:
            findings.append("No compression artifacts (pristine AI output)")
            score += 15
        
        # === Statistical Distribution ===
        skewness = self._compute_skewness(gray.flatten())
        details['pixel_skewness'] = round(skewness, 3)
        
        if abs(skewness) < 0.1:
            findings.append("Unnaturally balanced pixel distribution")
            score += 15
        
        if not findings:
            findings.append("Pixel analysis inconclusive")
        
        return {
            'name': 'Pixel Physics',
            'score': min(score, 100),
            'confidence': min(0.65 + score / 200, 0.95),
            'findings': findings,
            'details': details
        }
    
    def _analyze_structure(self, arr: np.ndarray, gray: np.ndarray) -> Dict:
        """Layer 3: Structural & Lighting Analysis"""
        score = 0
        findings = []
        details = {}
        
        h, w = gray.shape
        
        # === Edge Analysis ===
        edges = self._detect_edges(gray)
        edge_density = np.mean(edges > 30)
        edge_uniformity = np.std(edges) / (np.mean(edges) + 1)
        
        details['edge_density'] = round(edge_density, 4)
        details['edge_uniformity'] = round(edge_uniformity, 3)
        
        if edge_density < 0.05:
            findings.append("Very low edge density (over-smoothed)")
            score += 25
        elif edge_density < 0.1:
            findings.append("Low edge density")
            score += 15
        
        if edge_uniformity < 1.5:
            findings.append("Uniform edge distribution (AI characteristic)")
            score += 20
        
        # === Dynamic Range ===
        p1, p99 = np.percentile(gray, [1, 99])
        dynamic_range = p99 - p1
        details['dynamic_range'] = round(dynamic_range, 1)
        
        if dynamic_range < 100:
            findings.append("Limited dynamic range")
            score += 20
        elif dynamic_range < 150:
            findings.append("Moderate dynamic range")
            score += 10
        
        # === Gradient Analysis ===
        gx = np.diff(gray, axis=1)
        gy = np.diff(gray, axis=0)
        gradient_mag = np.sqrt(gx[:h-1, :w-1]**2 + gy[:h-1, :w-1]**2)
        gradient_consistency = np.std(gradient_mag) / (np.mean(gradient_mag) + 1)
        
        details['gradient_consistency'] = round(gradient_consistency, 3)
        
        if gradient_consistency < 2.0:
            findings.append("Very consistent gradients (AI shading)")
            score += 20
        elif gradient_consistency < 3.0:
            findings.append("Consistent gradients")
            score += 10
        
        # === Symmetry Analysis (AI often produces subtly symmetric images) ===
        if h > 100 and w > 100:
            center_left = gray[:, :w//4].mean()
            center_right = gray[:, -w//4:].mean()
            h_symmetry = 1 - abs(center_left - center_right) / 255
            
            top_half = gray[:h//4, :].mean()
            bottom_half = gray[-h//4:, :].mean()
            v_symmetry = 1 - abs(top_half - bottom_half) / 255
            
            details['h_symmetry'] = round(h_symmetry, 3)
            details['v_symmetry'] = round(v_symmetry, 3)
            
            if h_symmetry > 0.95 and v_symmetry > 0.95:
                findings.append("High bilateral symmetry")
                score += 15
        
        # === Local Contrast Analysis ===
        local_contrast = self._compute_local_contrast(gray)
        details['local_contrast'] = round(local_contrast, 2)
        
        if local_contrast < 20:
            findings.append("Low local contrast (AI smoothing artifact)")
            score += 20
        elif local_contrast < 35:
            findings.append("Moderate local contrast")
            score += 10
        
        if not findings:
            findings.append("Structure analysis within normal range")
        
        return {
            'name': 'Lighting & Geometry',
            'score': min(score, 100),
            'confidence': min(0.6 + score / 200, 0.93),
            'findings': findings,
            'details': details
        }
    
    def _analyze_patterns(self, arr: np.ndarray, gray: np.ndarray) -> Dict:
        """Layer 4: Pattern & Semantic Analysis"""
        score = 0
        findings = []
        details = {}
        
        h, w = gray.shape
        
        # === Texture Repetition Analysis ===
        if h >= 64 and w >= 64:
            patch_scores = self._analyze_texture_patches(arr)
            details['texture_similarity'] = round(patch_scores['similarity'], 3)
            details['texture_variance'] = round(patch_scores['variance'], 2)
            
            if patch_scores['similarity'] > 0.85:
                findings.append("High texture similarity (repetitive patterns)")
                score += 30
            elif patch_scores['similarity'] > 0.7:
                findings.append("Moderate texture similarity")
                score += 15
            
            if patch_scores['variance'] < 100:
                findings.append("Low texture variance")
                score += 20
        
        # === Frequency Domain Analysis ===
        if h >= 64 and w >= 64:
            freq_analysis = self._analyze_frequency_domain(gray)
            details['high_freq_energy'] = round(freq_analysis['high_freq'], 4)
            details['spectral_flatness'] = round(freq_analysis['flatness'], 4)
            
            # AI images often lack natural high-frequency detail
            if freq_analysis['high_freq'] < 0.02:
                findings.append("Abnormally low high-frequency content")
                score += 30
            elif freq_analysis['high_freq'] < 0.05:
                findings.append("Limited high-frequency detail")
                score += 15
            
            # Very flat spectrum is AI indicator
            if freq_analysis['flatness'] > 0.7:
                findings.append("Flat frequency spectrum (AI fingerprint)")
                score += 25
            elif freq_analysis['flatness'] > 0.5:
                findings.append("Relatively flat spectrum")
                score += 10
        
        # === Channel Correlation Analysis ===
        r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
        
        # Subsample for speed
        step = max(1, min(h, w) // 100)
        r_flat = r[::step, ::step].flatten()
        g_flat = g[::step, ::step].flatten()
        b_flat = b[::step, ::step].flatten()
        
        # Safe correlation with NaN handling
        def safe_corr(a, b):
            if np.std(a) < 0.01 or np.std(b) < 0.01:
                return 0.95  # Very uniform = high correlation indicator
            corr = np.corrcoef(a, b)[0, 1]
            return 0.0 if np.isnan(corr) else corr
        
        rg_corr = safe_corr(r_flat, g_flat)
        rb_corr = safe_corr(r_flat, b_flat)
        gb_corr = safe_corr(g_flat, b_flat)
        
        avg_corr = (abs(rg_corr) + abs(rb_corr) + abs(gb_corr)) / 3
        details['channel_correlation'] = round(avg_corr, 3)
        
        if avg_corr > 0.92:
            findings.append("Very high channel correlation")
            score += 25
        elif avg_corr > 0.85:
            findings.append("High channel correlation")
            score += 15
        
        # === Histogram Analysis ===
        hist_analysis = self._analyze_histogram(gray)
        details['histogram_smoothness'] = round(hist_analysis['smoothness'], 3)
        details['unique_values'] = hist_analysis['unique_count']
        
        if hist_analysis['smoothness'] > 0.9:
            findings.append("Unnaturally smooth histogram")
            score += 20
        
        # AI often doesn't use full grayscale range
        if hist_analysis['unique_count'] < 200:
            findings.append(f"Limited value range ({hist_analysis['unique_count']}/256)")
            score += 15
        
        # === Compression-free Features ===
        compressibility = self._estimate_compressibility(arr)
        details['compressibility'] = round(compressibility, 2)
        
        # Very high compressibility = less detail = AI
        if compressibility > 0.85:
            findings.append("High data redundancy")
            score += 15
        
        if not findings:
            findings.append("Pattern analysis within normal range")
        
        return {
            'name': 'AI Semantic Analysis',
            'score': min(score, 100),
            'confidence': min(0.55 + score / 180, 0.95),
            'findings': findings,
            'details': details
        }
    
    # =============== HELPER METHODS ===============
    
    def _compute_ela(self, img: Image.Image, file_path: str) -> float:
        """Error Level Analysis - compare to re-compressed version"""
        try:
            temp_path = file_path + "_ela_temp.jpg"
            img_rgb = img.convert('RGB')
            
            # Save at quality 85 (optimal for ELA)
            img_rgb.save(temp_path, 'JPEG', quality=85)
            compressed = Image.open(temp_path).convert('RGB')
            
            orig = np.array(img_rgb, dtype=np.float32)
            comp = np.array(compressed, dtype=np.float32)
            
            diff = np.abs(orig - comp)
            ela_variance = np.std(diff)
            
            os.remove(temp_path)
            return float(ela_variance)
        except Exception:
            return 15.0  # Neutral default
    
    def _analyze_noise_patterns(self, arr: np.ndarray) -> float:
        """Analyze noise uniformity - AI has unnaturally uniform noise"""
        # Apply high-pass filter to isolate noise
        gray = np.mean(arr, axis=2)
        
        # Compute local variance across small patches
        patch_size = 8
        h, w = gray.shape
        variances = []
        
        for i in range(0, h - patch_size, patch_size * 2):
            for j in range(0, w - patch_size, patch_size * 2):
                patch = gray[i:i+patch_size, j:j+patch_size]
                # Only consider mid-tone areas (avoid edges/highlights)
                if 40 < np.mean(patch) < 215:
                    variances.append(np.var(patch))
        
        if len(variances) < 10:
            return 0.5  # Not enough data
        
        variances = np.array(variances)
        # Coefficient of variation of variances
        cv = np.std(variances) / (np.mean(variances) + 1)
        return min(cv, 1.0)
    
    def _analyze_color_distribution(self, arr: np.ndarray) -> Dict:
        """Analyze color distribution statistics"""
        # Color entropy
        total_entropy = 0
        for c in range(3):
            hist, _ = np.histogram(arr[:,:,c], bins=256, range=(0, 255))
            hist = hist[hist > 0]
            prob = hist / hist.sum()
            entropy = -np.sum(prob * np.log2(prob + 1e-10))
            total_entropy += entropy
        
        # Saturation analysis
        max_rgb = np.max(arr, axis=2)
        min_rgb = np.min(arr, axis=2)
        saturation = max_rgb - min_rgb
        
        return {
            'entropy': total_entropy / 3,
            'sat_std': np.std(saturation)
        }
    
    def _detect_edges(self, gray: np.ndarray) -> np.ndarray:
        """Simple Sobel-like edge detection"""
        gx = np.abs(np.diff(gray, axis=1))  # shape: (h, w-1)
        gy = np.abs(np.diff(gray, axis=0))  # shape: (h-1, w)
        
        h, w = gray.shape
        # Trim to same size (h-1, w-1)
        gx_trimmed = gx[:h-1, :]  # (h-1, w-1)
        gy_trimmed = gy[:, :w-1]  # (h-1, w-1)
        
        edges = np.sqrt(gx_trimmed ** 2 + gy_trimmed ** 2)
        return edges
    
    def _detect_blocking(self, gray: np.ndarray) -> float:
        """Detect JPEG-style 8x8 blocking artifacts"""
        h, w = gray.shape
        if h < 24 or w < 24:
            return 0.5
        
        diffs = []
        for i in range(8, min(h, 200), 8):
            boundary_diff = np.mean(np.abs(gray[i, :] - gray[i-1, :]))
            interior_diff = np.mean(np.abs(gray[i-1, :] - gray[i-2, :]))
            if interior_diff > 0:
                diffs.append(boundary_diff / (interior_diff + 1))
        
        return np.mean(diffs) if diffs else 0.5
    
    def _compute_skewness(self, data: np.ndarray) -> float:
        """Compute skewness of distribution"""
        n = len(data)
        if n < 10:
            return 0
        
        mean = np.mean(data)
        std = np.std(data)
        if std < 1:
            return 0
        
        skew = np.mean(((data - mean) / std) ** 3)
        return skew
    
    def _compute_local_contrast(self, gray: np.ndarray) -> float:
        """Compute average local contrast"""
        block_size = 16
        h, w = gray.shape
        contrasts = []
        
        for i in range(0, h - block_size, block_size):
            for j in range(0, w - block_size, block_size):
                block = gray[i:i+block_size, j:j+block_size]
                contrasts.append(np.std(block))
        
        return np.mean(contrasts) if contrasts else 30
    
    def _analyze_texture_patches(self, arr: np.ndarray) -> Dict:
        """Analyze texture similarity across patches"""
        h, w = arr.shape[:2]
        patch_size = 32
        gray = np.mean(arr, axis=2)
        
        patch_means = []
        patch_stds = []
        
        for i in range(0, h - patch_size, patch_size):
            for j in range(0, w - patch_size, patch_size):
                patch = gray[i:i+patch_size, j:j+patch_size]
                patch_means.append(np.mean(patch))
                patch_stds.append(np.std(patch))
        
        if len(patch_stds) < 4:
            return {'similarity': 0.5, 'variance': 100}
        
        # High similarity = patches look alike
        std_of_stds = np.std(patch_stds)
        mean_std = np.mean(patch_stds)
        
        similarity = 1 - (std_of_stds / (mean_std + 1))
        variance = np.var(patch_means)
        
        return {
            'similarity': max(0, min(similarity, 1)),
            'variance': variance
        }
    
    def _analyze_frequency_domain(self, gray: np.ndarray) -> Dict:
        """Analyze frequency content using FFT"""
        h, w = gray.shape
        
        # Use center crop for consistency
        size = min(h, w, 256)
        cy, cx = h // 2, w // 2
        crop = gray[cy-size//2:cy+size//2, cx-size//2:cx+size//2]
        
        # Apply windowing to reduce edge artifacts
        window = np.outer(np.hanning(size), np.hanning(size))
        crop = crop * window
        
        # FFT
        fft = np.fft.fft2(crop)
        fft_shift = np.fft.fftshift(fft)
        magnitude = np.abs(fft_shift)
        magnitude = np.log(magnitude + 1)
        
        # Analyze frequency rings
        center = size // 2
        total_energy = np.sum(magnitude)
        
        # High frequency = outer ring
        y, x = np.ogrid[:size, :size]
        dist = np.sqrt((x - center) ** 2 + (y - center) ** 2)
        
        high_freq_mask = dist > (size * 0.35)
        high_freq_energy = np.sum(magnitude[high_freq_mask]) / (total_energy + 1)
        
        # Spectral flatness
        magnitude_flat = magnitude.flatten()
        magnitude_flat = magnitude_flat[magnitude_flat > 0]
        geo_mean = np.exp(np.mean(np.log(magnitude_flat + 1e-10)))
        arith_mean = np.mean(magnitude_flat)
        flatness = geo_mean / (arith_mean + 1e-10)
        
        return {
            'high_freq': float(high_freq_energy),
            'flatness': float(min(flatness, 1.0))
        }
    
    def _analyze_histogram(self, gray: np.ndarray) -> Dict:
        """Analyze histogram characteristics"""
        hist, _ = np.histogram(gray, bins=256, range=(0, 255))
        
        # Smoothness - how gradual are the changes
        hist_diff = np.abs(np.diff(hist.astype(float)))
        smoothness = 1 - (np.mean(hist_diff) / (np.mean(hist) + 1))
        
        # Count unique values
        unique_count = np.sum(hist > 0)
        
        return {
            'smoothness': max(0, min(smoothness, 1)),
            'unique_count': int(unique_count)
        }
    
    def _estimate_compressibility(self, arr: np.ndarray) -> float:
        """Estimate data compressibility (redundancy)"""
        # Downsample for speed
        small = arr[::4, ::4, :].astype(np.uint8)
        raw_size = small.size
        
        try:
            compressed = zlib.compress(small.tobytes(), level=1)
            ratio = len(compressed) / raw_size
            return 1 - ratio  # Higher = more compressible = more redundant
        except:
            return 0.5


# Initialize analyzer
analyzer = AdvancedForensicAnalyzer()


@app.get("/")
async def root():
    return {"message": "TruthLens API - Advanced AI Detection", "version": "2.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/analyze")
async def analyze_image(image: UploadFile = File(...)):
    """Analyze image using advanced 4-layer forensic detection"""
    start_time = time.time()
    
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    analysis_id = str(uuid.uuid4())[:8]
    file_ext = os.path.splitext(image.filename or 'image.jpg')[1] or '.jpg'
    file_path = os.path.join(UPLOAD_DIR, f"{analysis_id}{file_ext}")
    
    try:
        contents = await image.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        img = Image.open(file_path)
        
        # Run comprehensive analysis
        results = analyzer.analyze(img, file_path, image.filename or 'unknown.jpg')
        
        # Calculate weighted score
        layer1 = results['digital_footprint']
        layer2 = results['pixel_physics']
        layer3 = results['lighting_geometry']
        layer4 = results['semantic_analysis']
        
        # Weighted combination (tempered to reduce false positives on real photos)
        overall_score = (
            layer1['score'] * 0.10 +  # Digital Footprint (10%)
            layer2['score'] * 0.30 +  # Pixel Physics (30%)
            layer3['score'] * 0.20 +  # Lighting & Geometry (20%)
            layer4['score'] * 0.40    # AI Semantic (40%)
        )

        # Require multiple layers to agree before pushing risk upward
        high_evidence_layers = sum(1 for s in [layer1['score'], layer2['score'], layer3['score'], layer4['score']] if s >= 45)
        if high_evidence_layers <= 1:
            overall_score *= 0.55
        elif high_evidence_layers == 2:
            overall_score *= 0.75
        else:
            overall_score *= 0.9

        overall_score = min(100, overall_score)
        
        # Verdict thresholds (recalibrated more conservatively)
        if overall_score >= 70:
            verdict = "fake"
        elif overall_score >= 55:
            verdict = "edited"
        elif overall_score >= 40:
            verdict = "suspicious"
        else:
            verdict = "real"
        
        # Confidence calculation centered around mid-range risk
        distance_from_center = abs(overall_score - 50)
        confidence = min(0.5 + distance_from_center / 120, 0.9)
        
        processing_time = time.time() - start_time
        
        result = {
            "id": analysis_id,
            "verdict": verdict,
            "confidence": round(confidence, 2),
            "overall_score": round(overall_score, 1),
            "processing_time": round(processing_time, 3),
            "created_at": datetime.now().isoformat(),
            "layers": {
                "digital_footprint": layer1,
                "pixel_physics": layer2,
                "lighting_geometry": layer3,
                "semantic_analysis": layer4
            },
            "metadata": {
                "file_info": {
                    "format": img.format or "Unknown",
                    "dimensions": list(img.size),
                    "size": os.path.getsize(file_path),
                    "color_mode": img.mode
                },
                "analysis_timestamp": datetime.now().isoformat(),
                "engine_version": "2.0.0"
            }
        }
        
        analyses_store[analysis_id] = result
        return result
        
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}\n{traceback.format_exc()}")
    
    finally:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass


@app.get("/api/analysis/{analysis_id}")
async def get_analysis(analysis_id: str):
    if analysis_id in analyses_store:
        return analyses_store[analysis_id]
    raise HTTPException(status_code=404, detail="Analysis not found")


@app.get("/api/history")
async def get_history():
    return {
        "analyses": list(analyses_store.values())[-20:],
        "total": len(analyses_store)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
