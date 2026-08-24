"""
Model loader for the U-Net haze removal model.
Uses keras_unet_collection to build the same architecture as training.
"""

import os
import tensorflow as tf
from keras_unet_collection import models


MODEL_PATH = os.environ.get("MODEL_PATH", "model/best_model.keras")


def build_unet_model():
    """
    Build the same U-Net architecture used during training.
    
    Architecture:
    - Input: (256, 256, 3) — hazy RGB image
    - U-Net 2D with filters [16, 32, 64, 128, 256]
    - Stack: 2 conv blocks down/up
    - Output: (256, 256, 3) — dehazed RGB image with Sigmoid activation
    """
    model = models.unet_2d(
        (256, 256, 3),
        filter_num=[16, 32, 64, 128, 256],
        n_labels=3,
        stack_num_down=2,
        stack_num_up=2,
        activation="ReLU",
        output_activation="Sigmoid",
        pool=True,
        unpool=True,
        batch_norm=True,
    )
    return model


def load_dehaze_model():
    """
    Load the trained model weights.
    If weights file exists, load it. Otherwise, return the architecture only
    (for demo/development purposes).
    """
    model = build_unet_model()

    if os.path.exists(MODEL_PATH):
        print(f"Loading trained weights from: {MODEL_PATH}")
        model.load_weights(MODEL_PATH)
    else:
        print(f"⚠ No weights found at {MODEL_PATH}. Using untrained model.")
        print("  Place your trained .keras or .h5 weights file in the model/ folder.")
        print("  Expected path: model/best_model.keras")

    return model
