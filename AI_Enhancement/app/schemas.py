from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class SimilarArtifact(BaseModel):
    artifact_id: str
    name: str
    museum: str
    era: str
    confidence: float


class RecognitionResponse(BaseModel):
    artifact_id: Optional[str]
    name: Optional[str]
    artifact_type: Optional[str]
    museum: Optional[str]
    era: Optional[str]
    dynasty: Optional[str]
    material: Optional[str]
    confidence: float
    similar_artifacts: List[SimilarArtifact]
    raw_scores: List[Dict[str, Any]]


class KnowledgeResponse(BaseModel):
    artifact_id: str
    name: str
    artifact_type: str
    museum: str
    era: str
    dynasty: str
    material: str
    location: str
    description_en: str
    description_ar: str
    story_en: str
    story_ar: str
    audio_script_en: str
    audio_script_ar: str


class RestorationResponse(BaseModel):
    message: str
    used_lama: bool
    used_super_resolution: bool
    damage_ratio: float
    output_image_base64: str


class ScanResponse(BaseModel):
    recognition: RecognitionResponse
    knowledge: Optional[KnowledgeResponse]
    restoration: RestorationResponse


class HieroglyphResponse(BaseModel):
    detected_symbols: List[str]
    transliteration: str
    translated_en: str
    translated_ar: str
    note: str