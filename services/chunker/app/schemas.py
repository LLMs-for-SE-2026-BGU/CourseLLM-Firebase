from pydantic import BaseModel, Field
from typing import List, Optional


class ChunkRequest(BaseModel):
    markdown: str = Field(..., description="Raw markdown content to chunk")
    max_chunk_size: Optional[int] = Field(None, description="Optional override for max chunk characters")


class ChunkResponseItem(BaseModel):
    content: str
    header_path: List[str]


class ChunkResponse(BaseModel):
    chunks: List[ChunkResponseItem]


class HealthResponse(BaseModel):
    status: str
