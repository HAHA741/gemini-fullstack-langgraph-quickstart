# mypy: disable - error - code = "no-untyped-def,misc"
import pathlib
from fastapi import FastAPI, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File, HTTPException
from pathlib import Path
import logging
import os
logger = logging.getLogger(__name__)
# Define the FastAPI app
app = FastAPI()

# 添加 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def create_frontend_router(build_dir="../frontend/dist"):
    """Creates a router to serve the React frontend.

    Args:
        build_dir: Path to the React build directory relative to this file.

    Returns:
        A Starlette application serving the frontend.
    """
    build_path = pathlib.Path(__file__).parent.parent.parent / build_dir

    if not build_path.is_dir() or not (build_path / "index.html").is_file():
        print(
            f"WARN: Frontend build directory not found or incomplete at {build_path}. Serving frontend will likely fail."
        )
        # Return a dummy router if build isn't ready
        from starlette.routing import Route

        async def dummy_frontend(request):
            return Response(
                "Frontend not built. Run 'npm run build' in the frontend directory.",
                media_type="text/plain",
                status_code=503,
            )

        return Route("/{path:path}", endpoint=dummy_frontend)

    return StaticFiles(directory=build_path, html=True)


# Mount the frontend under /app to not conflict with the LangGraph API routes
app.mount(
    "/app",
    create_frontend_router(),
    name="frontend",
)


# ============ 普通 REST API 接口 ============

from pydantic import BaseModel
from typing import List, Optional
import json
from pathlib import Path


class ConversationData(BaseModel):
    """对话数据模型"""
    id: str
    timestamp: str
    content: str


@app.get("/api/conversations")
async def get_conversations() -> dict:
    """获取所有保存的对话列表"""
    try:
        output_dir = Path(__file__).parent.parent.parent / "outputs" / "conversations"
        if not output_dir.exists():
            return {"success": True, "data": []}
        
        conversations = []
        for json_file in sorted(output_dir.glob("*.json"), reverse=True):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    conversations.append({
                        "id": json_file.stem,
                        "filename": json_file.name,
                        "size": json_file.stat().st_size,
                    })
            except Exception as e:
                print(f"Error reading {json_file}: {e}")
        
        return {"success": True, "data": conversations}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/api/conversations/{conversation_id}")
async def get_conversation(conversation_id: str) -> dict:
    """根据 ID 获取单个对话详情"""
    try:
        output_dir = Path(__file__).parent.parent.parent / "outputs" / "conversations"
        json_file = output_dir / f"{conversation_id}.json"
        
        if not json_file.exists():
            return {"success": False, "error": "Conversation not found"}
        
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return {"success": True, "data": data}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str) -> dict:
    """删除指定的对话"""
    try:
        output_dir = Path(__file__).parent.parent.parent / "outputs" / "conversations"
        json_file = output_dir / f"{conversation_id}.json"
        
        if not json_file.exists():
            return {"success": False, "error": "Conversation not found"}
        
        json_file.unlink()
        return {"success": True, "message": "Conversation deleted"}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/api/health")
async def health_check() -> dict:
    """健康检查接口"""
    return {"status": "ok", "message": "Server is running"}

@app.get("/api/getSrtList")
async def getSrtList()-> dict:
    try:
        srt_dir = Path(__file__).parent.parent / "contentAgent" / "data"
        print(f"📂 Looking for SRT files in: {srt_dir}")
        print(f"📂 Directory exists: {srt_dir.exists()}")
        
        if not srt_dir.exists():
            print(f"⚠️ SRT directory not found: {srt_dir}")
            return {"success": True, "data": []}
        
        srt_files = []
        for srt_file in sorted(srt_dir.glob("*.srt"), reverse=True):
            srt_files.append({
                "filename": srt_file.name,
                "path": str(srt_file),
            })
            print(f"✓ Found SRT file: {srt_file.name}")
        
        print(f"✓ Total SRT files found: {len(srt_files)}")
        return {"success": True, "data": srt_files}
    except Exception as e:
        error_msg = f"Error getting SRT list: {str(e)}"
        print(f"❌ {error_msg}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": error_msg}
@app.post("/api/uploadSrt")
async def upload_srt(file: UploadFile = File(...)) -> dict:
    """上传 SRT 文件（重名直接覆盖，保留原文件名）"""

    # 只取文件名，防止 ../ 路径注入
    filename = os.path.basename(file.filename)

    if not filename.lower().endswith(".srt"):
        raise HTTPException(status_code=400, detail="Only .srt files are allowed")

    try:
        srt_dir = Path(__file__).parent.parent / "contentAgent" / "data"
        srt_dir.mkdir(parents=True, exist_ok=True)

        file_path = srt_dir / filename

        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file")

        # 重名直接覆盖
        file_path.write_bytes(content)

        # logger.info("Uploaded SRT file: %s (overwritten if existed)", filename)

        # parsed = parse_srt(file_path)

        return {
            "success": True,
            "filename": filename,
            "data": True
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Upload SRT failed")
        raise HTTPException(status_code=500, detail=str(e))

