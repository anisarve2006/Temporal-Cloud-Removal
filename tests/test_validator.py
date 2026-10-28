import pytest
from pathlib import Path
from backend.app.pipeline.validator import validate_satellite_scene
from backend.app.config import PUBLIC_IMAGES_DIR

def test_validator_nonexistent_file():
    """
    Checks that validator raises FileNotFoundError on missing files.
    """
    bad_path = "storage/non_existent_satellite_file.tif"
    with pytest.raises(FileNotFoundError):
        validate_satellite_scene(bad_path)

def test_validator_corrupt_file(tmp_path):
    """
    Checks that corrupted / truncated non-image files return valid: False with error string.
    """
    corrupt_file = tmp_path / "corrupt_scene.tif"
    corrupt_file.write_bytes(b"NOT_A_VALID_TIFF_OR_IMAGE_BYTES_0123456789")
    
    result = validate_satellite_scene(str(corrupt_file))
    assert result["valid"] is False
    assert result["error"] is not None

def test_validator_valid_image_scene():
    """
    Checks that existing valid demonstration scene passes validation with correct dimensions and metadata.
    """
    scene_path = PUBLIC_IMAGES_DIR / "satellite-cloudy.jpg"
    assert scene_path.exists(), f"Demo asset not found: {scene_path}"
    
    result = validate_satellite_scene(str(scene_path))
    assert result["valid"] is True
    assert result["width"] > 0
    assert result["height"] > 0
    assert result["bands"] in [1, 3, 4]
    assert result["file_size_bytes"] > 0
