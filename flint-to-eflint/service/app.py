from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from eflint_generator import generate_eflint

app = FastAPI(title="eFLINT Generator API")

class GenerateRequest(BaseModel):
    interpretation: dict

@app.post("/generate")
def generate(req: GenerateRequest):
    eflint = generate_eflint(req.interpretation)
    return {"eflint": eflint}