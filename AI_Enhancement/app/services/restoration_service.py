from typing import Dict, Tuple

import cv2
import numpy as np

from app.services.image_utils import ensure_uint8, np_image_to_base64_jpeg


class RestorationService:
    def __init__(self) -> None:
        self.lama_available = False
        self.realesrgan_available = False

    def _classical_enhancement(self, image_bgr: np.ndarray) -> np.ndarray:
        lab = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)

        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l_corrected = clahe.apply(l)
        color_corrected = cv2.merge((l_corrected, a, b))
        color_corrected = cv2.cvtColor(color_corrected, cv2.COLOR_LAB2BGR)

        denoised = cv2.fastNlMeansDenoisingColored(
            color_corrected,
            None,
            h=3,
            hColor=3,
            templateWindowSize=7,
            searchWindowSize=21,
        )

        gaussian = cv2.GaussianBlur(denoised, (0, 0), 2.0)
        sharpened = cv2.addWeighted(denoised, 1.5, gaussian, -0.5, 0)

        lab2 = cv2.cvtColor(sharpened, cv2.COLOR_BGR2LAB)
        l2, a2, b2 = cv2.split(lab2)
        clahe2 = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8, 8))
        l2_enhanced = clahe2.apply(l2)
        final = cv2.merge((l2_enhanced, a2, b2))
        final = cv2.cvtColor(final, cv2.COLOR_LAB2BGR)
        return final

    def _damage_mask(self, image_bgr: np.ndarray) -> Tuple[np.ndarray, float]:
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)

        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        blackhat_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
        blackhat = cv2.morphologyEx(blur, cv2.MORPH_BLACKHAT, blackhat_kernel)

        _, thresh = cv2.threshold(blackhat, 18, 255, cv2.THRESH_BINARY)
        edge = cv2.Canny(gray, 50, 150)

        combined = cv2.bitwise_or(thresh, edge)
        kernel = np.ones((3, 3), np.uint8)
        combined = cv2.morphologyEx(combined, cv2.MORPH_OPEN, kernel, iterations=1)
        combined = cv2.dilate(combined, kernel, iterations=1)

        damage_ratio = float(np.sum(combined > 0) / combined.size)
        return combined, damage_ratio

    def _inpaint(self, image_bgr: np.ndarray, mask: np.ndarray) -> np.ndarray:
        return cv2.inpaint(image_bgr, mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)

    def restore(self, image_bgr: np.ndarray, use_super_resolution: bool = False) -> Dict:
        enhanced = self._classical_enhancement(image_bgr)
        mask, damage_ratio = self._damage_mask(image_bgr)

        if damage_ratio > 0.003:
            restored = self._inpaint(enhanced, mask)
        else:
            restored = enhanced

        restored = ensure_uint8(restored)

        result_base64 = np_image_to_base64_jpeg(restored)
        return {
            "message": "Restoration completed.",
            "used_lama": False,
            "used_super_resolution": False,
            "damage_ratio": round(damage_ratio, 6),
            "output_image_base64": result_base64,
        }