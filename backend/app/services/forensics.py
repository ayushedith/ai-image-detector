import cv2
import numpy as np
from PIL import Image
import exifread
import os
from typing import Dict, Any
from scipy import ndimage

class ForensicAnalyzer:
    """4-Layer forensic analysis for image authenticity"""
    
    async def analyze_all_layers(self, file_path: str, img: Image.Image) -> Dict:
        """Run all 4 forensic layers"""
        
        return {
            "digital_footprint": await self.analyze_digital_footprint(file_path, img),
            "pixel_physics": await self.analyze_pixel_physics(file_path, img),
            "lighting_geometry": await self.analyze_lighting_geometry(file_path, img)
        }
    
    async def analyze_digital_footprint(self, file_path: str, img: Image.Image) -> Dict:
        """Layer 1: Digital Footprint Analysis"""
        
        findings = []
        score = 0
        details = {}
        
        # Check EXIF
        exif = self.extract_exif(file_path)
        if not exif or len(exif) < 5:
            findings.append("⚠ Missing or minimal EXIF metadata")
            score += 30
        else:
            findings.append("✓ EXIF metadata present")
            score += 0
        
        # Resolution analysis
        width, height = img.size
        details["resolution"] = f"{width}x{height}"
        
        # Check for AI-typical resolutions
        ai_resolutions = [512, 768, 1024, 1536, 2048]
        if width in ai_resolutions or height in ai_resolutions:
            findings.append(f"⚠ AI-typical resolution: {width}x{height}")
            score += 25
        else:
            findings.append(f"✓ Non-standard resolution: {width}x{height}")
        
        # Filename analysis
        filename = os.path.basename(file_path).lower()
        ai_keywords = ['midjourney', 'dalle', 'stable', 'diffusion', 'ai', 'generated']
        if any(kw in filename for kw in ai_keywords):
            findings.append("⚠ AI-related keywords in filename")
            score += 20
        
        confidence = min(score / 100, 0.9)
        
        return {
            "name": "Digital Footprint",
            "score": min(score, 100),
            "confidence": confidence,
            "findings": findings,
            "details": details
        }
    
    async def analyze_pixel_physics(self, file_path: str, img: Image.Image) -> Dict:
        """Layer 2: Pixel Physics (ELA, Noise, Compression)"""
        
        findings = []
        score = 0
        details = {}
        
        # Convert to numpy
        img_array = np.array(img.convert('RGB'))
        
        # Error Level Analysis (ELA)
        ela_score = self._perform_ela(file_path)
        details["ela_variance"] = float(ela_score)
        
        if ela_score > 50:
            findings.append(f"⚠ High ELA variance: {ela_score:.1f}")
            score += 35
        else:
            findings.append(f"✓ Normal ELA variance: {ela_score:.1f}")
        
        # Noise pattern analysis
        noise_score = self._analyze_noise(img_array)
        details["noise_uniformity"] = float(noise_score)
        
        if noise_score < 0.3:
            findings.append("⚠ Abnormally uniform noise pattern")
            score += 30
        else:
            findings.append("✓ Natural noise pattern")
        
        # Color distribution
        color_score = self._analyze_colors(img_array)
        details["color_diversity"] = float(color_score)
        
        if color_score < 0.4:
            findings.append("⚠ Limited color diversity")
            score += 20
        
        confidence = 0.7
        
        return {
            "name": "Pixel Physics",
            "score": min(score, 100),
            "confidence": confidence,
            "findings": findings,
            "details": details
        }
    
    async def analyze_lighting_geometry(self, file_path: str, img: Image.Image) -> Dict:
        """Layer 3: Lighting & Geometry Analysis"""
        
        findings = []
        score = 0
        details = {}
        
        img_array = np.array(img.convert('RGB'))
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Edge coherence
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        details["edge_density"] = float(edge_density)
        
        if edge_density < 0.05 or edge_density > 0.3:
            findings.append("⚠ Abnormal edge characteristics")
            score += 25
        else:
            findings.append("✓ Normal edge coherence")
        
        # Dynamic range
        dynamic_range = np.ptp(gray)
        details["dynamic_range"] = int(dynamic_range)
        
        if dynamic_range < 100:
            findings.append("⚠ Limited dynamic range")
            score += 20
        else:
            findings.append("✓ Good dynamic range")
        
        # Gradient analysis
        gx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        gy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(gx**2 + gy**2)
        gradient_std = np.std(gradient_magnitude)
        details["gradient_std"] = float(gradient_std)
        
        confidence = 0.65
        
        return {
            "name": "Lighting & Geometry",
            "score": min(score, 100),
            "confidence": confidence,
            "findings": findings,
            "details": details
        }
    
    def _perform_ela(self, file_path: str) -> float:
        """Perform Error Level Analysis"""
        try:
            img = Image.open(file_path)
            
            # Save at 95% quality
            temp_path = file_path + "_temp.jpg"
            img.save(temp_path, 'JPEG', quality=95)
            
            # Calculate difference
            original = np.array(img.convert('RGB'), dtype=np.int16)
            compressed = np.array(Image.open(temp_path).convert('RGB'), dtype=np.int16)
            
            diff = np.abs(original - compressed)
            variance = np.var(diff)
            
            os.remove(temp_path)
            
            return float(variance)
            
        except:
            return 25.0
    
    def _analyze_noise(self, img_array: np.ndarray) -> float:
        """Analyze noise patterns"""
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Calculate local variance
        mean_filter = ndimage.uniform_filter(gray.astype(float), size=5)
        sqr_mean_filter = ndimage.uniform_filter(gray.astype(float)**2, size=5)
        variance = sqr_mean_filter - mean_filter**2
        
        # Uniformity of noise
        noise_std = np.std(variance)
        noise_mean = np.mean(variance)
        
        if noise_mean > 0:
            return min(noise_std / noise_mean, 1.0)
        return 0.5
    
    def _analyze_colors(self, img_array: np.ndarray) -> float:
        """Analyze color distribution"""
        # Calculate color histogram
        hist_r = np.histogram(img_array[:,:,0], bins=256)[0]
        hist_g = np.histogram(img_array[:,:,1], bins=256)[0]
        hist_b = np.histogram(img_array[:,:,2], bins=256)[0]
        
        # Calculate entropy (diversity)
        def entropy(hist):
            hist = hist[hist > 0]
            prob = hist / hist.sum()
            return -np.sum(prob * np.log2(prob))
        
        avg_entropy = (entropy(hist_r) + entropy(hist_g) + entropy(hist_b)) / 3
        
        return min(avg_entropy / 8.0, 1.0)
    
    def extract_exif(self, file_path: str) -> Dict[str, Any]:
        """Extract EXIF metadata"""
        try:
            with open(file_path, 'rb') as f:
                tags = exifread.process_file(f, details=False)
                return {
                    tag: str(value)
                    for tag, value in tags.items()
                    if not tag.startswith('Thumbnail')
                }
        except:
            return {}
