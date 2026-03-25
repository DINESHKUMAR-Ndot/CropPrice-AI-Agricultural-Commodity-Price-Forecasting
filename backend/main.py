"""
CropPrice AI - FastAPI Backend
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from model_service import model_instance

# Initialize FastAPI app
app = FastAPI(
    title="CropPrice AI API",
    description="Agricultural Commodity Price Forecasting API",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class PredictionRequest(BaseModel):
    quantity: float
    commodity: str

class PredictionResponse(BaseModel):
    predicted_price: float
    commodity: str
    quantity: float
    model: str
    confidence: dict

# API Endpoints
@app.get("/")
async def root():
    """Welcome endpoint"""
    return {
        "message": "Welcome to CropPrice AI API",
        "docs": "/docs",
        "endpoints": ["/predict", "/commodities", "/model-info", "/historical"]
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_price(request: PredictionRequest):
    """
    Predict commodity price based on quantity and commodity type.

    - **quantity**: Amount of commodity (e.g., 150)
    - **commodity**: Type of crop (Wheat, Rice, or Corn)
    """
    try:
        result = model_instance.predict(request.quantity, request.commodity)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/commodities")
async def get_commodities():
    """Get list of available commodities"""
    return {
        "commodities": model_instance.get_commodities()
    }

@app.get("/model-info")
async def get_model_info():
    """Get model information and performance metrics"""
    return model_instance.get_model_info()

@app.get("/historical")
async def get_historical_data():
    """Get historical price data for visualization"""
    return {
        "data": model_instance.get_historical_data()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_trained": model_instance.is_trained}

@app.post("/retrain")
async def retrain_model():
    """Retrain the model with latest data (Production feature)"""
    try:
        metrics = model_instance.train()
        return {
            "status": "success",
            "message": "Model retrained successfully",
            "metrics": metrics,
            "training_info": model_instance.training_info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")

# Train model on startup
@app.on_event("startup")
async def startup_event():
    """Train model when server starts"""
    print("Starting CropPrice AI API...")
    model_instance.train()
    print("API ready!")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
