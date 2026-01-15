"""
FastAPI Backend for Secret Rooms
Sonic Codex, Ghost Codex, Pandora Codex
"""

from fastapi import FastAPI, Header, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import Optional, List
import os
import uvicorn
import json
import uuid
from datetime import datetime
from pathlib import Path

app = FastAPI(title="Bobby's Secret Rooms FastAPI Backend", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Secret Room Passcode
SECRET_ROOM_PASSCODE = os.getenv("SECRET_ROOM_PASSCODE", "BJ0990")

# Data directories
JOBS_DIR = Path("./jobs")
PERSONAS_DIR = Path("./personas")
CANARY_DIR = Path("./canary_tokens")
JOBS_DIR.mkdir(exist_ok=True)
PERSONAS_DIR.mkdir(exist_ok=True)
CANARY_DIR.mkdir(exist_ok=True)

def verify_passcode(x_secret_room_passcode: Optional[str] = Header(None)):
    """Verify Secret Room passcode"""
    if not x_secret_room_passcode or x_secret_room_passcode != SECRET_ROOM_PASSCODE:
        raise HTTPException(status_code=401, detail="Invalid Secret Room passcode")
    return True

# ==================== SONIC CODEX ====================

@app.get("/api/v1/trapdoor/sonic")
async def sonic_info(x_secret_room_passcode: Optional[str] = Header(None)):
    verify_passcode(x_secret_room_passcode)
    return {
        "ok": True,
        "name": "Sonic Codex",
        "description": "Audio processing and transcription suite",
        "status": "available",
        "backend": "FastAPI"
    }

class CaptureRequest(BaseModel):
    duration: Optional[int] = 60
    source: Optional[str] = "live"  # live, file, url
    file_path: Optional[str] = None
    url: Optional[str] = None

@app.post("/api/v1/trapdoor/sonic/capture/start")
async def sonic_capture_start(
    request: CaptureRequest,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    verify_passcode(x_secret_room_passcode)
    
    # Generate job ID
    job_id = f"sonic-{uuid.uuid4().hex[:12]}"
    job_file = JOBS_DIR / f"{job_id}.json"
    
    # Create job record
    job_data = {
        "jobId": job_id,
        "status": "pending",
        "source": request.source,
        "duration": request.duration,
        "createdAt": datetime.now().isoformat(),
        "result": None,
        "error": None
    }
    
    # Save job
    with open(job_file, 'w') as f:
        json.dump(job_data, f, indent=2)
    
    # TODO: Start actual audio capture/transcription in background
    # For now, simulate completion
    job_data["status"] = "processing"
    with open(job_file, 'w') as f:
        json.dump(job_data, f, indent=2)
    
    return {
        "ok": True,
        "data": {
            "jobId": job_id,
            "status": "processing",
            "message": "Audio capture job created"
        }
    }

@app.get("/api/v1/trapdoor/sonic/jobs")
async def sonic_jobs(x_secret_room_passcode: Optional[str] = Header(None)):
    verify_passcode(x_secret_room_passcode)
    
    jobs = []
    for job_file in JOBS_DIR.glob("sonic-*.json"):
        try:
            with open(job_file, 'r') as f:
                job_data = json.load(f)
                jobs.append({
                    "jobId": job_data.get("jobId"),
                    "status": job_data.get("status"),
                    "createdAt": job_data.get("createdAt"),
                    "source": job_data.get("source")
                })
        except:
            continue
    
    # Sort by creation time (newest first)
    jobs.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    
    return {
        "ok": True,
        "data": {
            "jobs": jobs
        }
    }

@app.get("/api/v1/trapdoor/sonic/jobs/{job_id}")
async def sonic_job_details(
    job_id: str,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    verify_passcode(x_secret_room_passcode)
    
    job_file = JOBS_DIR / f"{job_id}.json"
    if not job_file.exists():
        raise HTTPException(status_code=404, detail="Job not found")
    
    with open(job_file, 'r') as f:
        job_data = json.load(f)
    
    return {
        "ok": True,
        "data": {
            "jobId": job_data.get("jobId"),
            "status": job_data.get("status"),
            "createdAt": job_data.get("createdAt"),
            "result": job_data.get("result"),
            "error": job_data.get("error")
        }
    }

@app.get("/api/v1/trapdoor/sonic/jobs/{job_id}/download")
async def sonic_job_download(
    job_id: str,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    verify_passcode(x_secret_room_passcode)
    # TODO: Return actual file
    raise HTTPException(status_code=404, detail="Job not found")

# ==================== GHOST CODEX ====================

@app.get("/api/v1/trapdoor/ghost")
async def ghost_info(x_secret_room_passcode: Optional[str] = Header(None)):
    verify_passcode(x_secret_room_passcode)
    return {
        "ok": True,
        "name": "Ghost Codex",
        "description": "Metadata shredding and privacy tools",
        "status": "available",
        "backend": "FastAPI"
    }

class CanaryRequest(BaseModel):
    tokenType: str = "file"  # file, email, url, webhook
    name: Optional[str] = None

@app.post("/api/v1/trapdoor/ghost/canary/generate")
async def ghost_canary_generate(
    request: CanaryRequest,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    verify_passcode(x_secret_room_passcode)
    
    # Generate token ID
    token_id = f"canary-{uuid.uuid4().hex[:12]}"
    token_file = CANARY_DIR / f"{token_id}.json"
    
    # Create token
    token_data = {
        "tokenId": token_id,
        "tokenType": request.tokenType,
        "name": request.name or f"Canary Token {token_id[:8]}",
        "createdAt": datetime.now().isoformat(),
        "triggered": False,
        "triggeredAt": None,
        "metadata": {}
    }
    
    # Generate token content based on type
    if request.tokenType == "file":
        token_data["metadata"] = {
            "filename": f"{token_id}.txt",
            "content": f"Canary Token: {token_id}\nCreated: {token_data['createdAt']}"
        }
    elif request.tokenType == "email":
        token_data["metadata"] = {
            "email": f"{token_id}@canary.example.com"
        }
    elif request.tokenType == "url":
        token_data["metadata"] = {
            "url": f"https://canary.example.com/{token_id}"
        }
    
    # Save token
    with open(token_file, 'w') as f:
        json.dump(token_data, f, indent=2)
    
    return {
        "ok": True,
        "data": {
            "tokenId": token_id,
            "tokenType": request.tokenType,
            "metadata": token_data["metadata"]
        }
    }

@app.get("/api/v1/trapdoor/ghost/trap/{token_id}")
async def ghost_trap_check(
    token_id: str,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    verify_passcode(x_secret_room_passcode)
    
    token_file = CANARY_DIR / f"{token_id}.json"
    if not token_file.exists():
        raise HTTPException(status_code=404, detail="Token not found")
    
    with open(token_file, 'r') as f:
        token_data = json.load(f)
    
    return {
        "ok": True,
        "data": {
            "tokenId": token_data.get("tokenId"),
            "triggered": token_data.get("triggered", False),
            "triggeredAt": token_data.get("triggeredAt")
        }
    }

@app.get("/api/v1/trapdoor/ghost/alerts")
async def ghost_alerts(x_secret_room_passcode: Optional[str] = Header(None)):
    verify_passcode(x_secret_room_passcode)
    
    alerts = []
    for token_file in CANARY_DIR.glob("canary-*.json"):
        try:
            with open(token_file, 'r') as f:
                token_data = json.load(f)
                if token_data.get("triggered"):
                    alerts.append({
                        "tokenId": token_data.get("tokenId"),
                        "tokenType": token_data.get("tokenType"),
                        "triggeredAt": token_data.get("triggeredAt"),
                        "name": token_data.get("name")
                    })
        except:
            continue
    
    alerts.sort(key=lambda x: x.get("triggeredAt", ""), reverse=True)
    
    return {
        "ok": True,
        "data": {
            "alerts": alerts
        }
    }

class PersonaRequest(BaseModel):
    personaType: str = "basic"  # basic, professional, burner
    name: Optional[str] = None

@app.post("/api/v1/trapdoor/ghost/persona/create")
async def ghost_persona_create(
    request: PersonaRequest,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    verify_passcode(x_secret_room_passcode)
    
    # Generate persona ID
    persona_id = f"persona-{uuid.uuid4().hex[:12]}"
    persona_file = PERSONAS_DIR / f"{persona_id}.json"
    
    # Generate persona data
    import random
    first_names = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia"]
    
    persona = {
        "personaId": persona_id,
        "personaType": request.personaType,
        "name": request.name or f"{random.choice(first_names)} {random.choice(last_names)}",
        "email": f"{persona_id[:8]}@burner.example.com",
        "phone": f"+1{random.randint(2000000000, 9999999999)}",
        "createdAt": datetime.now().isoformat(),
        "metadata": {}
    }
    
    # Save persona
    with open(persona_file, 'w') as f:
        json.dump(persona, f, indent=2)
    
    return {
        "ok": True,
        "data": {
            "personaId": persona_id,
            "persona": persona
        }
    }

@app.get("/api/v1/trapdoor/ghost/personas")
async def ghost_personas(x_secret_room_passcode: Optional[str] = Header(None)):
    verify_passcode(x_secret_room_passcode)
    
    personas = []
    for persona_file in PERSONAS_DIR.glob("persona-*.json"):
        try:
            with open(persona_file, 'r') as f:
                persona_data = json.load(f)
                personas.append({
                    "personaId": persona_data.get("personaId"),
                    "name": persona_data.get("name"),
                    "email": persona_data.get("email"),
                    "personaType": persona_data.get("personaType"),
                    "createdAt": persona_data.get("createdAt")
                })
        except:
            continue
    
    personas.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    
    return {
        "ok": True,
        "data": {
            "personas": personas
        }
    }

# ==================== PANDORA CODEX ====================

@app.get("/api/v1/trapdoor/pandora")
async def pandora_info(x_secret_room_passcode: Optional[str] = Header(None)):
    verify_passcode(x_secret_room_passcode)
    return {
        "ok": True,
        "name": "Pandora Codex",
        "description": "Hardware manipulation and Chain-Breaker",
        "status": "available",
        "backend": "FastAPI"
    }

class ChainBreakerRequest(BaseModel):
    deviceSerial: str
    deviceType: Optional[str] = "auto-detect"
    operation: str = "activation_bypass"  # activation_bypass, signal_bypass

@app.post("/api/v1/trapdoor/pandora/chainbreaker")
async def pandora_chainbreaker(
    request: ChainBreakerRequest,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    verify_passcode(x_secret_room_passcode)
    
    # TODO: Implement actual Chain-Breaker logic
    # This would interface with checkm8, SSHRD, or activation bypass tools
    
    return {
        "ok": True,
        "data": {
            "message": "Chain-Breaker operation initiated",
            "deviceSerial": request.deviceSerial,
            "operation": request.operation,
            "status": "pending",
            "estimatedTime": "5-15 minutes"
        }
    }

class DFUDetectRequest(BaseModel):
    deviceSerial: Optional[str] = "auto"

@app.post("/api/v1/trapdoor/pandora/dfu/detect")
async def pandora_dfu_detect(
    request: DFUDetectRequest,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    verify_passcode(x_secret_room_passcode)
    
    # TODO: Implement actual DFU detection using libimobiledevice or similar
    # For now, return placeholder
    
    return {
        "ok": True,
        "data": {
            "dfuMode": False,
            "deviceSerial": request.deviceSerial,
            "message": "DFU detection not implemented yet"
        }
    }

@app.post("/api/v1/trapdoor/pandora/dfu/enter")
async def pandora_dfu_enter(
    data: dict,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    verify_passcode(x_secret_room_passcode)
    # TODO: Implement DFU entry
    return {
        "ok": True,
        "message": "DFU entry initiated"
    }

@app.get("/api/v1/trapdoor/pandora/devices")
async def pandora_devices(x_secret_room_passcode: Optional[str] = Header(None)):
    verify_passcode(x_secret_room_passcode)
    # TODO: Implement device detection
    return {
        "ok": True,
        "devices": []
    }

@app.post("/api/v1/trapdoor/pandora/manipulate")
async def pandora_manipulate(
    data: dict,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    verify_passcode(x_secret_room_passcode)
    # TODO: Implement hardware manipulation
    return {
        "ok": True,
        "message": "Hardware manipulation initiated"
    }

class JailbreakRequest(BaseModel):
    deviceSerial: str
    deviceType: str = "iPhone"
    iosVersion: Optional[str] = "auto-detect"
    method: str = "auto-select"  # checkra1n, palera1n, dopamine, misaka26

@app.post("/api/v1/trapdoor/pandora/jailbreak/execute")
async def pandora_jailbreak_execute(
    request: JailbreakRequest,
    x_secret_room_passcode: Optional[str] = Header(None)
):
    verify_passcode(x_secret_room_passcode)
    
    # TODO: Implement actual jailbreak automation
    # This would interface with checkra1n, palera1n, Dopamine, etc.
    
    return {
        "ok": True,
        "data": {
            "message": "Jailbreak operation initiated",
            "deviceSerial": request.deviceSerial,
            "method": request.method,
            "status": "pending",
            "estimatedTime": "2-10 minutes"
        }
    }

@app.get("/api/v1/trapdoor/pandora/jailbreak/methods")
async def pandora_jailbreak_methods(x_secret_room_passcode: Optional[str] = Header(None)):
    verify_passcode(x_secret_room_passcode)
    return {
        "ok": True,
        "methods": [
            {"id": "checkra1n", "name": "Checkra1n", "devices": "A11 and below"},
            {"id": "palera1n", "name": "Palera1n", "devices": "A11 and below"},
            {"id": "dopamine", "name": "Dopamine", "devices": "A12-A17"},
            {"id": "misaka26", "name": "Misaka26", "devices": "A18+"}
        ]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
