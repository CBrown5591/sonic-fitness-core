"""
Database Models for Sonic Fitness Engine
Includes Stage Days A, B, C, and Stage X (Calisthenics Circuit)
"""
from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class ExerciseSet:
    set_num: int
    reps: int
    load_lbs: float  # 0.0 for pure bodyweight
    rpe: float
    tempo_clean: bool = True
    joint_pain: bool = False

@dataclass
class MovementSlot:
    slot_id: str          # e.g., "A1", "X1"
    exercise_name: str
    tier: int             # 1 = Entry/Regression, 2 = Standard
    target_reps: str      # e.g., "8-10" or "45s hold"
    sets: List[ExerciseSet] = field(default_factory=list)

    @property
    def ring_earned(self) -> bool:
        if not self.sets:
            return False
        # Red Star Ring Criteria: All sets RPE <= 8.0, clean tempo, zero joint pain
        return all(s.rpe <= 8.0 and s.tempo_clean and not s.joint_pain for s in self.sets)

@dataclass
class StageSession:
    session_id: str
    stage_code: str       # "DAY_A", "DAY_B", "DAY_C", or "STAGE_X"
    date: str
    prehab_completed: bool
    movements: List[MovementSlot]
    cardio_mins: int
    cardio_avg_hr: int
    circuit_rounds_completed: Optional[int] = 0

    def calculate_score(self) -> dict:
        # 1. Ring Bonus (Joint Shields)
        any_pain = any(s.joint_pain for m in self.movements for s in m.sets)
        if not self.prehab_completed:
            ring_bonus = 0
        elif any_pain:
            ring_bonus = 7500  # Level 50 Kinetic Deflection 50% cushion
        else:
            ring_bonus = 15000

        # 2. Time / Reactor Bonus
        if self.stage_code == "STAGE_X":
            time_bonus = 20000 if (self.circuit_rounds_completed or 0) >= 3 else (self.circuit_rounds_completed or 0) * 6000
        else:
            time_bonus = 20000 if self.cardio_mins >= 20 else self.cardio_mins * 1000

        # 3. Force Bonus / Kinetic Density
        if self.stage_code == "STAGE_X":
            total_reps = sum(s.reps for m in self.movements for s in m.sets)
            force_bonus = total_reps * 75
        else:
            total_tonnage = sum(s.reps * s.load_lbs for m in self.movements for s in m.sets)
            force_bonus = total_tonnage * 2.25

        # 4. Red Star Ring Bonus
        rings_banked = sum(1 for m in self.movements if m.ring_earned)
        red_ring_bonus = rings_banked * 10000

        total_score = ring_bonus + time_bonus + force_bonus + red_ring_bonus

        # Sonic Letter Grade Rank
        if total_score >= 85000:
            rank = "S"
        elif total_score >= 70000:
            rank = "A"
        elif total_score >= 50000:
            rank = "B"
        else:
            rank = "C"

        return {
            "time_bonus": time_bonus,
            "ring_bonus": ring_bonus,
            "force_bonus": force_bonus,
            "red_ring_bonus": red_ring_bonus,
            "total_score": round(total_score, 1),
            "rank": rank,
            "rings_banked": rings_banked
        }
