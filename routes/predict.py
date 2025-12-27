from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.predictor import predict_concentration

router = APIRouter(prefix="/api", tags=["Predict"])

@router.post("/predict")
async def predict_api(
    file: UploadFile = File(...),
    test_type: str = Form(...)
):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File kosong")

    result = predict_concentration(content, test_type)

    return {
        "rgb": result["rgb"],
        "concentration_mg_per_L": result["concentration"],
        "status": result["status"]
    }