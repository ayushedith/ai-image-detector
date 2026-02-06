"""Test script for the AI image detection system"""
from PIL import Image
import numpy as np
import requests
import os

# Create a simple real-like test image (natural gradient with noise)
np.random.seed(42)
h, w = 400, 600
real_img = np.zeros((h, w, 3), dtype=np.uint8)
for i in range(h):
    for j in range(w):
        real_img[i,j] = [(i*255//h), (j*255//w), 128]
# Add natural noise
real_img = real_img.astype(float) + np.random.normal(0, 15, real_img.shape)
real_img = np.clip(real_img, 0, 255).astype(np.uint8)
img = Image.fromarray(real_img)
img.save('test_natural.jpg', 'JPEG', quality=75)

# Create AI-like image (very smooth, no noise, perfect gradients, 1024x1024)
ai_img = np.zeros((1024, 1024, 3), dtype=np.uint8)
for i in range(1024):
    for j in range(1024):
        ai_img[i,j] = [int(127 + 60*np.sin(i/50)), int(127 + 60*np.cos(j/50)), 150]
img2 = Image.fromarray(ai_img)
img2.save('test_ai_like.png')

print('=== Testing natural-like image ===')
with open('test_natural.jpg', 'rb') as f:
    files = {'image': ('test_natural.jpg', f, 'image/jpeg')}
    r = requests.post('http://localhost:8001/api/analyze', files=files)
    print(f"Status: {r.status_code}")
    result = r.json()
    print(f"Response: {result}")
    if 'verdict' in result:
        print(f"Verdict: {result['verdict']}")
        print(f"Score: {result['overall_score']}")
        print(f"Confidence: {result['confidence']}")
        print(f"Layer scores:")
        for name, layer in result['layers'].items():
            print(f"  {name}: {layer['score']}")

print()
print('=== Testing AI-like image ===')
with open('test_ai_like.png', 'rb') as f:
    files = {'image': ('midjourney_test_ai_like.png', f, 'image/png')}
    r = requests.post('http://localhost:8001/api/analyze', files=files)
    result = r.json()
    print(f"Verdict: {result['verdict']}")
    print(f"Score: {result['overall_score']}")
    print(f"Confidence: {result['confidence']}")
    print(f"Layer scores:")
    for name, layer in result['layers'].items():
        print(f"  {name}: {layer['score']}")

os.remove('test_natural.jpg')
os.remove('test_ai_like.png')
print()
print('Tests completed!')
