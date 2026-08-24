# 🌫️ Haze Removal Demo — U-Net Image Dehazing

Interactive demo for the **Enhancing Image Clarity with U-Net Haze Removal** project.

Upload a hazy image → model removes haze → compare before/after with a slider.

## Architecture

```
┌─────────────────┐
│   Next.js UI    │  ← Upload image, before/after slider
│   (Vercel)      │
└────────┬────────┘
         │ POST /predict
         ▼
┌─────────────────┐
│   FastAPI       │  ← Receives image, runs inference
│   (Render)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   U-Net Model   │  ← keras_unet_collection unet_2d
│   TensorFlow    │     Input: 256x256x3, SSIM loss
└─────────────────┘
```

## Model Details

- **Architecture:** U-Net 2D (keras_unet_collection)
- **Input Size:** 256 × 256 × 3
- **Filters:** [16, 32, 64, 128, 256]
- **Loss:** SSIM Loss
- **Output:** Sigmoid (dehazed RGB image)
- **Dataset:** Indoor/Outdoor haze images
- **Result:** 25% mAP improvement on downstream object detection

## Backend (FastAPI)

```bash
cd app
pip install -r requirements.txt
uvicorn main:app --reload
```

## Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

## Deploy

- **Frontend:** Deploy `frontend/` to Vercel
- **Backend:** Deploy `app/` to Render (free tier) or Railway

## Tech Stack

Python · TensorFlow · FastAPI · Next.js · Docker · OpenCV
