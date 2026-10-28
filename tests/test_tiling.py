import pytest
import numpy as np
from backend.app.pipeline.preprocessor import tiled_inference_with_hann_feathering, generate_2d_hann_window

def test_hann_window_symmetry():
    win = generate_2d_hann_window(64, 64)
    assert win.shape == (64, 64)
    # Check center is higher than edges
    assert win[32, 32] > win[0, 0]
    assert np.all(win > 0)

def test_tiled_inference_roundtrip_identity():
    """
    Round-trip identity test:
    When the model is identity: f(x) = x,
    the tiled inference with 2D Hann window feathering across overlapping tiles
    MUST reconstruct the original image exactly without seam lines or amplitude loss!
    """
    np.random.seed(42)
    h, w, c = 400, 450, 3
    test_image = np.random.rand(h, w, c).astype(np.float32)

    def identity_model(tile):
        return tile

    # Execute tiled reconstruction with 128px tiles and 32px overlap
    reconstructed = tiled_inference_with_hann_feathering(
        full_image=test_image,
        model_inference_func=identity_model,
        tile_size=128,
        overlap=32
    )

    assert reconstructed.shape == test_image.shape
    # Maximum difference across the entire scene should be negligible (< 2e-3 for float32)
    max_diff = np.max(np.abs(reconstructed - test_image))
    assert max_diff < 2e-3, f"Identity round-trip failed with max diff {max_diff}"
