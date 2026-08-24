"""
Haze Removal API — FastAPI backend
Accepts a hazy image and returns a dehazed version using U-Net.
"""

import io
import numpy as np
import cv2
from PIL import Image
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from model_loader import load_dehaze_model

app = FastAPI(
    title="Haze Removal API",
    description="Upload a hazy image → returns dehazed image using U-Net",
    version="1.0.0",
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model at startup
model = None


@app.on_event("startup")
async def startup():
    global model
    model = load_dehaze_model()
    print("✓ Model loaded successfully")


@app.get("/")
def root():
    return {
        "service": "Haze Removal API",
        "status": "running",
        "model": "U-Net 2D (256x256x3)",
        "endpoints": {
            "/predict": "POST - upload hazy image, returns dehazed image",
            "/health": "GET - health check",
        },
    }


@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model is not None}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Upload a hazy image and receive the dehazed version.
    
    - Input: Any image (will be resized to 256x256 for inference)
    - Output: Dehazed PNG image
    """
    # Read uploaded image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # Store original size for resize back
    original_h, original_w = img_rgb.shape[:2]

    # Preprocess: resize to 256x256, normalize to [0, 1]
    img_resized = cv2.resize(img_rgb, (256, 256)) / 255.0
    img_input = np.expand_dims(img_resized, axis=0).astype(np.float32)

    # Inference
    prediction = model.predict(img_input, verbose=0)
    dehazed = prediction[0]

    # Post-process: clip values, convert to uint8
    dehazed = np.clip(dehazed, 0, 1)
    dehazed_uint8 = (dehazed * 255).astype(np.uint8)

    # Resize back to original dimensions
    dehazed_full = cv2.resize(dehazed_uint8, (original_w, original_h))

    # Encode as PNG and return
    pil_image = Image.fromarray(dehazed_full)
    buffer = io.BytesIO()
    pil_image.save(buffer, format="PNG")
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="image/png",
        headers={"Content-Disposition": "inline; filename=dehazed.png"},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
