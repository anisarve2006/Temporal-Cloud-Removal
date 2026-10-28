import torch
import torch.nn as nn
import torch.nn.functional as F

class MaskedCharbonnierLoss(nn.Module):
    """
    Robust Charbonnier Loss (smooth L1) calculated strictly over masked cloud/shadow pixels:
    L = 1/N * sum( M * sqrt((y - y_hat)^2 + eps^2) )
    """
    def __init__(self, eps: float = 1e-4):
        super().__init__()
        self.eps = eps

    def forward(self, pred: torch.Tensor, target: torch.Tensor, mask: torch.Tensor) -> torch.Tensor:
        # pred and target: (B, C, H, W), mask: (B, 1, H, W)
        diff = pred - target
        loss = torch.sqrt(diff ** 2 + (self.eps ** 2))
        masked_loss = loss * mask
        num_valid = torch.sum(mask) * pred.shape[1]
        if num_valid < 1.0:
            return torch.tensor(0.0, device=pred.device, requires_grad=True)
        return torch.sum(masked_loss) / num_valid

class MaskedGradientLoss(nn.Module):
    """
    Edge and structural gradient preservation loss:
    Penalizes blurriness and seam artifacts by aligning horizontal and vertical gradients.
    """
    def __init__(self):
        super().__init__()
        # Sobel/gradient kernel
        kx = torch.tensor([[-1.0, 0.0, 1.0], [-2.0, 0.0, 2.0], [-1.0, 0.0, 1.0]]).view(1, 1, 3, 3)
        ky = torch.tensor([[-1.0, -2.0, -1.0], [0.0, 0.0, 0.0], [1.0, 2.0, 1.0]]).view(1, 1, 3, 3)
        self.register_buffer("kx", kx)
        self.register_buffer("ky", ky)

    def forward(self, pred: torch.Tensor, target: torch.Tensor, mask: torch.Tensor) -> torch.Tensor:
        c = pred.shape[1]
        kx = self.kx.repeat(c, 1, 1, 1)
        ky = self.ky.repeat(c, 1, 1, 1)

        grad_x_pred = F.conv2d(pred, kx, padding=1, groups=c)
        grad_y_pred = F.conv2d(pred, ky, padding=1, groups=c)
        grad_x_target = F.conv2d(target, kx, padding=1, groups=c)
        grad_y_target = F.conv2d(target, ky, padding=1, groups=c)

        grad_loss = torch.abs(grad_x_pred - grad_x_target) + torch.abs(grad_y_pred - grad_y_target)
        masked_loss = grad_loss * mask
        num_valid = torch.sum(mask) * c
        if num_valid < 1.0:
            return torch.tensor(0.0, device=pred.device, requires_grad=True)
        return torch.sum(masked_loss) / num_valid

class MaskedSpectralAngleLoss(nn.Module):
    """
    Spectral Angle Mapper loss (L_spectral) enforcing fidelity across spectral bands.
    Clamps cosine strictly to [-0.9999, 0.9999] to prevent NaN gradients in arccos.
    """
    def __init__(self, eps: float = 1e-6):
        super().__init__()
        self.eps = eps

    def forward(self, pred: torch.Tensor, target: torch.Tensor, mask: torch.Tensor) -> torch.Tensor:
        # Inner product along channel dimension C
        dot = torch.sum(pred * target, dim=1, keepdim=True)
        norm_pred = torch.norm(pred, dim=1, keepdim=True)
        norm_target = torch.norm(target, dim=1, keepdim=True)

        denom = (norm_pred * norm_target) + self.eps
        cos_theta = torch.clamp(dot / denom, -0.9999, 0.9999)
        angle = torch.acos(cos_theta)  # in radians

        masked_angle = angle * mask
        num_valid = torch.sum(mask)
        if num_valid < 1.0:
            return torch.tensor(0.0, device=pred.device, requires_grad=True)
        return torch.sum(masked_angle) / num_valid

class HeteroscedasticUncertaintyLoss(nn.Module):
    """
    UnCRtainTS-style Heteroscedastic Gaussian Negative Log-Likelihood (hetero_nll):
    Head outputs mean mu and log-variance pred_logvar per band.
    Loss is calculated strictly over cloud pixels:
    inv_var = exp(-pred_logvar)
    loss = 0.5 * (inv_var * (pred_mean - target)^2 + pred_logvar)
    """
    def __init__(self):
        super().__init__()

    def forward(self, pred_mean: torch.Tensor, pred_logvar: torch.Tensor, target: torch.Tensor, cloud_mask: torch.Tensor) -> torch.Tensor:
        # Clamp pred_logvar for numerical stability
        pred_logvar = torch.clamp(pred_logvar, -8.0, 5.0)
        inv_var = torch.exp(-pred_logvar)
        loss = 0.5 * (inv_var * (pred_mean - target) ** 2 + pred_logvar)
        
        # Loss only on cloudy pixels (clear pixels are identity-locked)
        masked_loss = loss * cloud_mask
        denom = cloud_mask.sum().clamp(min=1.0) * pred_mean.shape[1]
        return masked_loss.sum() / denom

class CloudRemovalCompoundLoss(nn.Module):
    """
    Multi-objective loss combining:
    1. Masked Charbonnier L1 loss (weight = 1.0)
    2. Masked Structural Gradient loss (weight = 0.4)
    3. Masked Spectral Angle loss (weight = 0.25)
    """
    def __init__(self, w_l1: float = 1.0, w_grad: float = 0.4, w_spectral: float = 0.25):
        super().__init__()
        self.charbonnier = MaskedCharbonnierLoss()
        self.gradient = MaskedGradientLoss()
        self.spectral = MaskedSpectralAngleLoss()
        self.w_l1 = w_l1
        self.w_grad = w_grad
        self.w_spectral = w_spectral

    def forward(self, pred: torch.Tensor, target: torch.Tensor, mask: torch.Tensor) -> torch.Tensor:
        loss_l1 = self.charbonnier(pred, target, mask)
        loss_grad = self.gradient(pred, target, mask)
        loss_spec = self.spectral(pred, target, mask)
        return (self.w_l1 * loss_l1) + (self.w_grad * loss_grad) + (self.w_spectral * loss_spec)
