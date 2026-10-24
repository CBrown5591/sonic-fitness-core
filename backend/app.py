from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Sonic Fitness Core Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ACTIVE_SESSION = {
    "stage_code": "STAGE_X",
    "prehab_completed": False,
    "circuit_rounds": 0,
    "cardio_mins": 0,
    "movements": [
        {"slot_id": "X1", "name": "Elevated / Floor Push-Ups", "target": "10-15 reps", "sets": []},
        {"slot_id": "X2", "name": "Doorway / Towel Isometric Rows", "target": "12-15 reps", "sets": []},
        {"slot_id": "X3", "name": "Bodyweight Box Squats / Split Squats", "target": "12-15 reps/leg", "sets": []},
        {"slot_id": "X4", "name": "Deadbug or McGill Side-Plank", "target": "45s hold", "sets": []}
    ]
}

class SetLogPayload(BaseModel):
    slot_id: str
    reps: int
    load_lbs: float = 0.0
    rpe: float
    tempo_clean: bool = True
    joint_pain: bool = False

@app.get("/api/stage/active")
def get_active_stage():
    return ACTIVE_SESSION

@app.post("/api/stage/prehab")
def toggle_prehab(status: bool):
    ACTIVE_SESSION["prehab_completed"] = status
    return {"status": "success", "prehab_completed": status}

@app.post("/api/stage/set")
def log_set(data: SetLogPayload):
    for m in ACTIVE_SESSION["movements"]:
        if m["slot_id"] == data.slot_id:
            m["sets"].append(data.dict())
            return {"status": "set_logged", "movement": m}
    raise HTTPException(status_code=404, detail="Movement slot not found")

@app.post("/api/stage/evaluate")
def evaluate_stage():
    prehab = ACTIVE_SESSION["prehab_completed"]
    movements = ACTIVE_SESSION["movements"]
    
    any_pain = any(s.get("joint_pain") for m in movements for s in m["sets"])
    ring_bonus = 15000 if (prehab and not any_pain) else (7500 if (prehab and any_pain) else 0)
    time_bonus = 20000 if ACTIVE_SESSION.get("circuit_rounds", 3) >= 3 else 12000
    
    total_reps = sum(s.get("reps", 0) for m in movements for s in m["sets"])
    total_load = sum(s.get("load_lbs", 0) * s.get("reps", 0) for m in movements for s in m["sets"])
    force_bonus = (total_load * 2.25) if total_load > 0 else (total_reps * 75)
    
    rings_banked = 0
    for m in movements:
        if m["sets"] and all(s.get("rpe", 10) <= 8.0 and s.get("tempo_clean") and not s.get("joint_pain") for s in m["sets"]):
            rings_banked += 1
            
    red_ring_bonus = rings_banked * 10000
    total = ring_bonus + time_bonus + force_bonus + red_ring_bonus
    rank = "S" if total >= 85000 else ("A" if total >= 70000 else "B")
    
    return {
        "ring_bonus": ring_bonus,
        "time_bonus": time_bonus,
        "force_bonus": force_bonus,
        "red_ring_bonus": red_ring_bonus,
        "total_score": total,
        "sonic_rank": rank,
        "rings_banked": rings_banked
    }
