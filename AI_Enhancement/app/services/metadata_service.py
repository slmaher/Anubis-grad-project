import json
from typing import Dict, Optional, List

from app.config import settings


class MetadataService:
    def __init__(self) -> None:
        self.metadata_by_id: Dict[str, dict] = {}
        self._load()

    def _load(self) -> None:
        try:
            with open(settings.ARTIFACT_METADATA_PATH, "r", encoding="utf-8") as f:
                items = json.load(f)
            self.metadata_by_id = {item["artifact_id"]: item for item in items}
        except FileNotFoundError:
            self.metadata_by_id = {}

    def get(self, artifact_id: str) -> Optional[dict]:
        return self.metadata_by_id.get(artifact_id)

    def all(self) -> List[dict]:
        return list(self.metadata_by_id.values())