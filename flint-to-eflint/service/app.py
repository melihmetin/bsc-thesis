from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from eflint_generator import generate_eflint

app = FastAPI(title="eFLINT Generator API")

class GenerateRequest(BaseModel):
    interpretation: dict

@app.post("/generate")
def generate(req: GenerateRequest):
    try:
        eflint = generate_eflint(req.interpretation)
        return {"eflint": eflint}
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing key in interpretation JSON: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))