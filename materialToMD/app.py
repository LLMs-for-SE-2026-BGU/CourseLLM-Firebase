from typing import List

from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel

from Converter import ConversionError, ConvertedDocument, convert_to_markdown


class AssetResponse(BaseModel):
    path: str
    content_type: str
    data_base64: str


class ConvertResponse(BaseModel):
    markdown: str
    assets: List[AssetResponse]


app = FastAPI(title="Material to Markdown Converter")


@app.post("/convert", response_model=ConvertResponse)
async def convert(file: UploadFile = File(...)) -> ConvertResponse:
    try:
        content = await file.read()
        result: ConvertedDocument = convert_to_markdown(content, file.filename)
    except ConversionError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    assets = [
        AssetResponse(path=asset.path, content_type=asset.content_type, data_base64=asset.data_base64)
        for asset in result.assets
    ]
    return ConvertResponse(markdown=result.markdown, assets=assets)
