import numpy as np
from typing import Dict, Any, Tuple, Optional, List
from sklearn.isotonic import IsotonicRegression

class UnCRtainTSCalibrator:
    """
    UnCRtainTS-style Uncertainty & Conformal Calibration Engine:
    1. Fits Isotonic Regression on validation split: maps raw network confidence to calibrated confidence [0, 1].
    2. Implements Conformal Prediction: computes finite-sample distribution-free non-conformity quantiles
       for guaranteed coverage (e.g. 90% or 95% prediction intervals).
    3. Derives the optimal selective fallback threshold from the calibrated risk-coverage curve.
    """
    def __init__(self, alpha: float = 0.10):
        self.alpha = alpha  # 1 - alpha = 90% nominal coverage
        self.isotonic_reg = IsotonicRegression(out_of_bounds="clip", y_min=0.01, y_max=0.99)
        self.is_fitted = False
        self.conformal_quantile: float = 1.645  # fallback Gaussian 90%
        self.optimal_fallback_threshold: float = 0.45

    def fit(self, raw_confidences: np.ndarray, pixel_errors: np.ndarray, cloud_mask: Optional[np.ndarray] = None) -> Dict[str, Any]:
        """
        Fits calibration model using validation data strictly on masked cloud/shadow pixels.
        - raw_confidences: in [0, 1]
        - pixel_errors: absolute error |target - pred|
        """
        if cloud_mask is not None:
            c = raw_confidences[cloud_mask].flatten()
            e = pixel_errors[cloud_mask].flatten()
        else:
            c = raw_confidences.flatten()
            e = pixel_errors.flatten()

        valid_idx = (c > 0) & (~np.isnan(c)) & (~np.isnan(e))
        c = c[valid_idx]
        e = e[valid_idx]

        if len(c) < 50:
            return {"status": "insufficient_samples", "fitted": False}

        # Subsample for efficient isotonic regression if large
        if len(c) > 20000:
            sample_p = np.random.choice(len(c), 20000, replace=False)
            c_fit = c[sample_p]
            e_fit = e[sample_p]
        else:
            c_fit = c
            e_fit = e

        # Empirical accuracy target: higher confidence should predict lower error
        # Normalize error relative to 95th percentile
        err_p95 = float(np.percentile(e_fit, 95)) + 1e-5
        empirical_acc = np.clip(1.0 - (e_fit / err_p95), 0.0, 1.0)

        # Fit isotonic regression
        self.isotonic_reg.fit(c_fit, empirical_acc)

        # Conformal prediction: compute non-conformity scores
        # Non-conformity score: s_i = error_i / sigma_i
        # where sigma_i approx = (1.0 - conf_i)
        pred_sigma = np.clip(1.0 - c_fit, 0.05, 1.0)
        nonconformity_scores = e_fit / pred_sigma
        # (1 - alpha) conformal quantile
        q_level = float(np.ceil((len(nonconformity_scores) + 1) * (1.0 - self.alpha)) / len(nonconformity_scores))
        q_level = min(max(q_level, 0.5), 0.999)
        self.conformal_quantile = float(np.quantile(nonconformity_scores, q_level))

        # Determine optimal fallback threshold:
        # Find confidence where predicted error exceeds remote sensing tolerance (e.g. error > 0.15)
        conf_eval = np.linspace(0.1, 0.9, 50)
        calibrated_eval = self.isotonic_reg.predict(conf_eval)
        # Choose threshold where accuracy drops below 60%
        below_tolerance = conf_eval[calibrated_eval < 0.60]
        if len(below_tolerance) > 0:
            self.optimal_fallback_threshold = round(float(np.max(below_tolerance)), 2)
        else:
            self.optimal_fallback_threshold = 0.40

        self.is_fitted = True

        return {
            "status": "calibrated",
            "fitted": True,
            "conformal_quantile": round(self.conformal_quantile, 4),
            "nominal_coverage_pct": round((1.0 - self.alpha) * 100, 1),
            "optimal_fallback_threshold": self.optimal_fallback_threshold,
            "sample_count": len(c_fit)
        }

    def calibrate(self, raw_confidence: np.ndarray) -> np.ndarray:
        """
        Maps raw confidence array to calibrated confidence raster in [0, 1].
        """
        if not self.is_fitted:
            return raw_confidence
        shape = raw_confidence.shape
        flat = raw_confidence.flatten()
        calibrated = self.isotonic_reg.predict(flat)
        return calibrated.reshape(shape).astype(np.float32)

    def compute_conformal_bounds(self, pred_img: np.ndarray, raw_confidence: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Computes lower and upper conformal prediction intervals:
        [pred - q * sigma, pred + q * sigma] with distribution-free coverage guarantee.
        """
        sigma = np.clip(1.0 - raw_confidence, 0.05, 1.0)
        margin = self.conformal_quantile * sigma
        lower_bound = np.clip(pred_img - margin, 0.0, 1.0)
        upper_bound = np.clip(pred_img + margin, 0.0, 1.0)
        return lower_bound, upper_bound
