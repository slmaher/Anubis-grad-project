# ==========================================
# ANUBIS - Egyptian Artifact Restoration
# Professional Archaeological Image Enhancement
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
print("Upload an artifact image (statue, pottery, papyrus, etc.):")
uploaded = files.upload()
image_path = list(uploaded.keys())[0]

# STEP 4: Load Image
img = cv2.imread(image_path)
original = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
print(f"Image loaded: {img.shape[1]}x{img.shape[0]} pixels\n")

# ==========================================
# PROPER ARTIFACT RESTORATION PIPELINE
# For Egyptian Museum Artifacts
# ==========================================
print("Processing artifact with archaeological standards...\n")

# 1. Color Correction & White Balance
print("Step 1: Color correction")
lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
l, a, b = cv2.split(lab)

# Gentle CLAHE on luminance only
clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
l_corrected = clahe.apply(l)
color_corrected = cv2.merge((l_corrected, a, b))
color_corrected = cv2.cvtColor(color_corrected, cv2.COLOR_LAB2BGR)

# 2. Gentle Noise Reduction (preserve texture)
print("Step 2: Noise reduction (preserving details)")
denoised = cv2.fastNlMeansDenoisingColored(
    color_corrected, 
    None, 
    h=3,           # Low strength to preserve texture
    hColor=3, 
    templateWindowSize=7, 
    searchWindowSize=21
)

# 3. Subtle Sharpening (enhance edges without artifacts)
print("Step 3: Detail enhancement")
# Unsharp mask technique
gaussian = cv2.GaussianBlur(denoised, (0, 0), 2.0)
sharpened = cv2.addWeighted(denoised, 1.5, gaussian, -0.5, 0)

# 4. Contrast Enhancement (adaptive)
print("Step 4: Adaptive contrast enhancement")
# Convert to LAB again for final polish
lab2 = cv2.cvtColor(sharpened, cv2.COLOR_BGR2LAB)
l2, a2, b2 = cv2.split(lab2)

# Mild CLAHE for final touch
clahe2 = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8, 8))
l2_enhanced = clahe2.apply(l2)
final = cv2.merge((l2_enhanced, a2, b2))
final = cv2.cvtColor(final, cv2.COLOR_LAB2BGR)

# 5. Optional: Crack/Damage Detection (only if visible)
print("Step 5: Analyzing for visible damage")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Very conservative threshold - only detect obvious dark cracks
_, crack_mask = cv2.threshold(gray, 30, 255, cv2.THRESH_BINARY_INV)

# Clean up - remove small noise
kernel = np.ones((2, 2), np.uint8)
crack_mask = cv2.morphologyEx(crack_mask, cv2.MORPH_OPEN, kernel, iterations=2)
crack_mask = cv2.erode(crack_mask, kernel, iterations=1)

# Only inpaint if significant damage detected
damage_percentage = (np.sum(crack_mask > 0) / crack_mask.size) * 100

if damage_percentage > 0.5:  # Only if more than 0.5% damaged
    print(f"   - Detected damage: {damage_percentage:.2f}%")
    print("   - Applying gentle restoration")
    # Very gentle inpainting radius
    final_inpainted = cv2.inpaint(final, crack_mask, inpaintRadius=2, flags=cv2.INPAINT_TELEA)
    final = final_inpainted
else:
    print("   - No significant damage detected, skipping inpainting")

print("\nRestoration complete!\n")

# ==========================================
# STEP 6: Display Results
# ==========================================
plt.figure(figsize=(20, 10))

# Original
plt.subplot(2, 4, 1)
plt.title("1. Original Artifact", fontsize=14, fontweight='bold')
plt.imshow(original)
plt.axis("off")

# Color Corrected
plt.subplot(2, 4, 2)
plt.title("2. Color Correction", fontsize=14, fontweight='bold')
plt.imshow(cv2.cvtColor(color_corrected, cv2.COLOR_BGR2RGB))
plt.axis("off")

# Denoised
plt.subplot(2, 4, 3)
plt.title("3. Noise Reduction", fontsize=14, fontweight='bold')
plt.imshow(cv2.cvtColor(denoised, cv2.COLOR_BGR2RGB))
plt.axis("off")

# Sharpened
plt.subplot(2, 4, 4)
plt.title("4. Detail Enhancement", fontsize=14, fontweight='bold')
plt.imshow(cv2.cvtColor(sharpened, cv2.COLOR_BGR2RGB))
plt.axis("off")

# Crack Detection
plt.subplot(2, 4, 5)
plt.title("5. Damage Analysis", fontsize=14, fontweight='bold')
if damage_percentage > 0.5:
    plt.imshow(crack_mask, cmap='Reds', alpha=0.5)
else:
    plt.text(0.5, 0.5, 'No damage\ndetected', 
             ha='center', va='center', fontsize=16, color='green',
             transform=plt.gca().transAxes)
    plt.imshow(gray, cmap='gray', alpha=0.3)
plt.axis("off")

# Final Result
plt.subplot(2, 4, 6)
plt.title("6. ENHANCED RESULT", fontsize=14, fontweight='bold', color='green')
plt.imshow(cv2.cvtColor(final, cv2.COLOR_BGR2RGB))
plt.axis("off")

# Side by Side Comparison
plt.subplot(2, 4, 7)
plt.title("7. Before", fontsize=14, fontweight='bold')
plt.imshow(original)
plt.axis("off")

plt.subplot(2, 4, 8)
plt.title("8. After", fontsize=14, fontweight='bold')
plt.imshow(cv2.cvtColor(final, cv2.COLOR_BGR2RGB))
plt.axis("off")

plt.tight_layout()
plt.show()

# ==========================================
# STEP 7: Detailed Comparison
# ==========================================
plt.figure(figsize=(16, 8))

# Full comparison
plt.subplot(1, 2, 1)
plt.title("ORIGINAL", fontsize=16, fontweight='bold')
plt.imshow(original)
plt.axis("off")

plt.subplot(1, 2, 2)
plt.title("ENHANCED", fontsize=16, fontweight='bold')
plt.imshow(cv2.cvtColor(final, cv2.COLOR_BGR2RGB))
plt.axis("off")

plt.tight_layout()
plt.show()

# ==========================================
# STEP 8: Statistics
# ==========================================
print("\n" + "="*70)
print("ARTIFACT ENHANCEMENT REPORT")
print("="*70)
print(f"Image Dimensions: {img.shape[1]} x {img.shape[0]} pixels")
print(f"Detected Damage: {damage_percentage:.2f}% of surface area")
print(f"Enhancement Type: Conservative Archaeological Restoration")
print(f"Processing Steps: 5 (Color → Denoise → Sharpen → Contrast → Restore)")
print("="*70)

# Quality Metrics
original_brightness = np.mean(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY))
final_brightness = np.mean(cv2.cvtColor(final, cv2.COLOR_BGR2GRAY))
brightness_change = ((final_brightness - original_brightness) / original_brightness) * 100

print("\nENHANCEMENT METRICS")
print("="*70)
print(f"Brightness Adjustment: {brightness_change:+.1f}%")
print(f"Original Avg Brightness: {original_brightness:.1f}")
print(f"Enhanced Avg Brightness: {final_brightness:.1f}")

# Calculate sharpness (using Laplacian variance)
original_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
final_gray = cv2.cvtColor(final, cv2.COLOR_BGR2GRAY)
original_sharpness = cv2.Laplacian(original_gray, cv2.CV_64F).var()
final_sharpness = cv2.Laplacian(final_gray, cv2.CV_64F).var()

print(f"Sharpness (Laplacian Variance):")
print(f"  Original: {original_sharpness:.2f}")
print(f"  Enhanced: {final_sharpness:.2f}")
print(f"  Improvement: {((final_sharpness - original_sharpness) / original_sharpness) * 100:+.1f}%")
print("="*70)

# ==========================================
# STEP 9: Save Result
# ==========================================
print("\nSaving enhanced artifact...")
cv2.imwrite('enhanced_artifact.jpg', final)
files.download('enhanced_artifact.jpg')
print("✅ Downloaded: enhanced_artifact.jpg\n")

# ==========================================
# STEP 10: Processing Summary
# ==========================================
print("\n✅ Enhancement complete and ready for deployment!")


