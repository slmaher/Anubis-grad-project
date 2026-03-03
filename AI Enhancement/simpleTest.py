# ==========================================
# ANUBIS - Artifact Restoration Testing
# Simple Visual Testing Version
# ==========================================

# STEP 1: Install OpenCV
print("Installing OpenCV...")
import subprocess
subprocess.run(["pip", "install", "-q", "opencv-python-headless"], check=True)
print("Done!\n")

# STEP 2: Import Libraries
import cv2
import numpy as np
import matplotlib.pyplot as plt
from google.colab import files

# STEP 3: Upload Test Image
print("Upload an artifact image:")
uploaded = files.upload()
image_path = list(uploaded.keys())[0]

# STEP 4: Load Image
img = cv2.imread(image_path)
original = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
print(f"Image loaded: {img.shape[1]}x{img.shape[0]} pixels\n")

# STEP 5: Artifact Restoration Pipeline
print("Processing artifact...\n")

# 1. Convert to Grayscale
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
print("Step 1: Grayscale conversion")

# 2. Detect Damaged Areas (SMART VERSION)

# Enhance contrast for better crack detection
clahe_detect = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
gray_enhanced = clahe_detect.apply(gray)

# Detect edges (cracks are thin edges)
edges = cv2.Canny(gray_enhanced, 80, 180)

# Morphological operations to refine cracks
kernel = np.ones((2,2), np.uint8)
damage_mask = cv2.dilate(edges, kernel, iterations=1)
damage_mask = cv2.morphologyEx(damage_mask, cv2.MORPH_CLOSE, kernel)

print("Step 2: Smart crack detection")

# 3. Inpainting
restored = cv2.inpaint(img, damage_mask, 3, cv2.INPAINT_TELEA)
print("Step 3: Inpainting restoration")

# 4. Noise Reduction
denoised = cv2.fastNlMeansDenoisingColored(restored, None, 10, 10, 7, 21)
print("Step 4: Noise reduction")

# 5. Sharpening
sharpen_kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
sharpened = cv2.filter2D(denoised, -1, sharpen_kernel)
print("Step 5: Sharpening")

# 6. Contrast Enhancement
lab = cv2.cvtColor(sharpened, cv2.COLOR_BGR2LAB)
l, a, b = cv2.split(lab)
clahe = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(8, 8))
cl = clahe.apply(l)
merged = cv2.merge((cl, a, b))
final = cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)
print("Step 6: CLAHE enhancement")

print("\nRestoration complete!\n")

# STEP 6: Display Results
plt.figure(figsize=(20, 12))

plt.subplot(2, 4, 1)
plt.title("1. Original", fontsize=14, fontweight='bold')
plt.imshow(original)
plt.axis("off")

plt.subplot(2, 4, 2)
plt.title("2. Grayscale", fontsize=14, fontweight='bold')
plt.imshow(gray, cmap='gray')
plt.axis("off")

plt.subplot(2, 4, 3)
plt.title("3. Damage Mask", fontsize=14, fontweight='bold')
plt.imshow(damage_mask, cmap='gray')
plt.axis("off")

plt.subplot(2, 4, 4)
plt.title("4. Inpainted", fontsize=14, fontweight='bold')
plt.imshow(cv2.cvtColor(restored, cv2.COLOR_BGR2RGB))
plt.axis("off")

plt.subplot(2, 4, 5)
plt.title("5. Denoised", fontsize=14, fontweight='bold')
plt.imshow(cv2.cvtColor(denoised, cv2.COLOR_BGR2RGB))
plt.axis("off")

plt.subplot(2, 4, 6)
plt.title("6. Sharpened", fontsize=14, fontweight='bold')
plt.imshow(cv2.cvtColor(sharpened, cv2.COLOR_BGR2RGB))
plt.axis("off")

plt.subplot(2, 4, 7)
plt.title("7. FINAL RESULT", fontsize=14, fontweight='bold', color='green')
plt.imshow(cv2.cvtColor(final, cv2.COLOR_BGR2RGB))
plt.axis("off")

plt.subplot(2, 4, 8)
plt.title("8. Before vs After", fontsize=14, fontweight='bold')
h, w = original.shape[:2]
comparison = np.hstack([original[:, :w//2], cv2.cvtColor(final, cv2.COLOR_BGR2RGB)[:, w//2:]])
plt.imshow(comparison)
plt.axvline(x=w//2, color='red', linewidth=2, linestyle='--')
plt.axis("off")

plt.tight_layout()
plt.show()

# STEP 7: Statistics
print("\n" + "="*70)
print("RESTORATION STATISTICS")
print("="*70)
print(f"Image Size: {img.shape[1]} x {img.shape[0]} pixels")
damaged_pixels = np.sum(damage_mask > 0)
total_pixels = damage_mask.size
print(f"Damaged Area: {damaged_pixels:,} pixels ({damaged_pixels/total_pixels*100:.2f}%)")
print(f"Processing Steps: 6")
print(f"Algorithm: OpenCV Inpainting (TELEA) + CLAHE")
print("="*70)

# STEP 8: Save Result
print("\nSaving restored image...")
cv2.imwrite('restored_artifact.jpg', final)
files.download('restored_artifact.jpg')
print("Downloaded: restored_artifact.jpg\n")

# STEP 9: Quality Metrics
print("QUALITY METRICS")
print("="*70)
mse = np.mean((img - final) ** 2)
print(f"MSE: {mse:.2f}")

if mse == 0:
    psnr = 100
else:
    psnr = 20 * np.log10(255.0 / np.sqrt(mse))
print(f"PSNR: {psnr:.2f} dB")

original_brightness = np.mean(gray)
final_gray = cv2.cvtColor(final, cv2.COLOR_BGR2GRAY)
final_brightness = np.mean(final_gray)
print(f"Brightness: {original_brightness:.1f} -> {final_brightness:.1f} ({(final_brightness-original_brightness)/original_brightness*100:+.1f}%)")
print("="*70)

print("\nTesting complete! Ready for deployment.")