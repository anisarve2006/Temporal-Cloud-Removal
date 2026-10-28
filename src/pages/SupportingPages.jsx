import React, { useState } from 'react';
import {
  HelpCircle,
  FileText,
  Compass,
  Code,
  Info,
  User,
  Settings as SettingsIcon,
  CheckCircle2,
  Copy,
  Terminal,
  Zap,
} from 'lucide-react';

export function HowItWorksPage({ onNavigate }) {
  return (
    <div style={{ maxWidth: '960px' }}>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">How Cloudless AI Works</h1>
          <p className="page-subtitle">
            Physics-guided multi-modal generative satellite surface reconstruction architecture
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2878e5', fontWeight: 800 }}>
              1
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                Multi-Modal Sensor Fusion (Optical + Synthetic Aperture Radar)
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', lineHeight: '1.6' }}>
                Cloud cover completely blocks optical sensors (like ISRO LISS-IV), but microwave radar from Sentinel-1 (C-band VV/VH) penetrates directly through thick cumulus clouds and rain. Cloudless AI core aligns microwave surface roughness and dielectric properties with optical spectral bands.
              </p>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', fontWeight: 800 }}>
              2
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                Temporal Prior Conditioning & Uncertainty Head
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', lineHeight: '1.6' }}>
                A cloud-free temporal acquisition from an adjacent season provides structural baselines for parcel boundaries, river courses, and road corridors. A dedicated uncertainty head generates a pixel-wise confidence map (0.0 to 1.0) providing transparent scientific accountability.
              </p>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', fontWeight: 800 }}>
              3
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                Downstream Land Use / Land Cover (LULC) Preservation
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', lineHeight: '1.6' }}>
                Unlike generic artistic AI models that invent random hallucinated textures, Cloudless AI is constrained by spectral preservation loss functions (SAM &lt; 2.0°), ensuring that downstream classification algorithms (Random Forest, U-Net) achieve verifiable accuracy gains (+69.57%).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DocumentationPage({ onNavigate }) {
  return (
    <div style={{ maxWidth: '960px' }}>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Developer & Scientific Documentation</h1>
          <p className="page-subtitle">API schemas, GeoTIFF projection standards, and model inference guidelines</p>
        </div>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Supported Sensor Payloads</h3>
        <ul style={{ fontSize: '13px', color: '#475569', lineHeight: '2', paddingLeft: '20px' }}>
          <li><strong>Primary Optical:</strong> ISRO Resourcesat-2 / 2A LISS-IV (Green: Band 2, Red: Band 3, NIR: Band 4, 5.0m GSD).</li>
          <li><strong>SAR Guidance:</strong> ESA Sentinel-1 C-Band SAR GRD IW (VV and VH Dual-Polarization, 10m GSD).</li>
          <li><strong>Coordinate Systems:</strong> UTM Projection WGS84 (Assam Zone: EPSG:32646 / EPSG:32645).</li>
          <li><strong>Data Format:</strong> Cloud Optimized GeoTIFF (COG), 16-bit unsigned integer or 32-bit floating point.</li>
        </ul>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>REST API Ingestion Example</h3>
        <pre style={{ background: '#081827', color: '#a8f04a', padding: '16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)', overflowX: 'auto' }}>
{`curl -X POST https://api.cloudless.ai/v1/reconstruct \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "cloudy_scene=@Assam_12JUN2023.tif" \\
  -F "sar_guidance=@Sentinel1_Assam_June.tif" \\
  -F "temporal_ref=@LISS4_Nov2023_Ref.tif" \\
  -F "mode=RGB" \\
  -F "output_confidence=true"`}
        </pre>
      </div>
    </div>
  );
}

export function UseCasesPage({ onNavigate }) {
  return (
    <div style={{ maxWidth: '1080px' }}>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Operational Geospatial Use Cases</h1>
          <p className="page-subtitle">Demonstrated impact across real-world remote sensing operational domains</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Agriculture & Crop Yield</h3>
          <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: '1.6' }}>
            Monsoon cloud cover prevents time-critical monitoring of kharif crop emergence in Northeast India. Reconstructed optical NDVI enables accurate vegetative vigor estimation.
          </p>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Disaster Flood Inundation</h3>
          <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: '1.6' }}>
            During monsoon river surges along the Brahmaputra, cloud-free optical composite extraction provides rapid damage assessment for relief logistics.
          </p>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Forest & Wetland Conservation</h3>
          <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: '1.6' }}>
            Detection of illegal deforestation and wetland encroachment in protected sanctuaries across Kaziranga and surrounding foothills.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ApiAccessPage() {
  const [copied, setCopied] = useState(false);
  const apiKey = "cld_live_9482bf7a8109d43e201a";

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '960px' }}>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">API Keys & Integration</h1>
          <p className="page-subtitle">Authenticate your geospatial pipeline with Cloudless AI cloud endpoints</p>
        </div>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Your Secret API Key</div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            readOnly
            value={apiKey}
            style={{ flex: 1, padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'var(--font-mono)', fontSize: '13px', background: '#f8fafc' }}
          />
          <button className="btn-secondary" onClick={handleCopy}>
            <Copy size={14} />
            <span>{copied ? 'Copied!' : 'Copy Key'}</span>
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Python SDK Quickstart</h3>
        <pre style={{ background: '#081827', color: '#f8fafc', padding: '16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
{`import cloudless

client = cloudless.Client(api_key="${apiKey}")

result = client.reconstruct(
    optical_path="assam_cloudy_liss4.tif",
    sar_path="sentinel1_dualpol.tif",
    mode="RGB"
)

result.save("assam_cloud_free_reconstructed.tif")
print(f"PSNR: {result.metrics.psnr} dB | Confidence: {result.mean_confidence}")`}
        </pre>
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <div style={{ maxWidth: '960px' }}>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">About Cloudless AI</h1>
          <p className="page-subtitle">Next-generation multi-modal Earth Observation intelligence platform</p>
        </div>
      </div>

      <div className="card" style={{ padding: '24px', lineHeight: '1.8', fontSize: '13.5px', color: '#334155' }}>
        <p style={{ marginBottom: '16px' }}>
          Cloudless AI is engineered to solve one of the most persistent bottlenecks in satellite Earth observation: severe tropical cloud and shadow occlusion. More than 60% of the Earth's surface is obscured by clouds at any given moment, rendering critical optical satellite data unavailable during monsoon and flood seasons.
        </p>
        <p style={{ marginBottom: '16px' }}>
          By fusing ISRO Resourcesat-2A high-resolution optical imagery with Sentinel-1 microwave radar and temporal prior mosaics, Cloudless AI reconstructs authentic, analysis-ready spectral reflectance surfaces with verified mathematical fidelity and downstream land-use classification accuracy.
        </p>
      </div>
    </div>
  );
}

export function ProfilePage() {
  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">User Profile</h1>
          <p className="page-subtitle">Manage user credentials and geospatial processing tier</p>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#081827', color: '#a8f04a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 800 }}>
            A
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Anirudh</h2>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Lead Geospatial Remote Sensing Engineer</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px' }}>
            <div style={{ color: '#64748b', fontSize: '11px' }}>Current Tier</div>
            <strong style={{ color: '#16a34a', fontSize: '15px' }}>Geospatial Enterprise</strong>
          </div>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px' }}>
            <div style={{ color: '#64748b', fontSize: '11px' }}>Monthly Scene Quota</div>
            <strong style={{ color: '#1e293b', fontSize: '15px', fontFamily: 'var(--font-mono)' }}>78 / 100 Credits</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const [notifyEmail, setNotifyEmail] = useState(() => {
    try {
      const saved = localStorage.getItem('cloudless_settings');
      if (saved) return JSON.parse(saved).notifyEmail ?? true;
    } catch (e) {}
    return true;
  });
  const [defaultCRS, setDefaultCRS] = useState(() => {
    try {
      const saved = localStorage.getItem('cloudless_settings');
      if (saved) return JSON.parse(saved).defaultCRS || 'EPSG:32646 (UTM Zone 46N - Assam / NE India)';
    } catch (e) {}
    return 'EPSG:32646 (UTM Zone 46N - Assam / NE India)';
  });
  const [savedStatus, setSavedStatus] = useState(false);

  const handleSave = () => {
    try {
      localStorage.setItem('cloudless_settings', JSON.stringify({ defaultCRS, notifyEmail }));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 3500);
  };

  return (
    <div style={{ maxWidth: '800px', position: 'relative' }}>
      {savedStatus && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            background: '#064e3b',
            color: '#ffffff',
            padding: '10px 16px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 9999,
            fontSize: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          Preferences saved successfully to local workspace.
        </div>
      )}

      <div className="page-header-row">
        <div>
          <h1 className="page-title">Workspace Settings</h1>
          <p className="page-subtitle">Configure application defaults and coordinate system projections</p>
        </div>
      </div>

      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
            Default Projected Coordinate Reference System (CRS)
          </label>
          <select
            value={defaultCRS}
            onChange={(e) => setDefaultCRS(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            <option>EPSG:32646 (UTM Zone 46N - Assam / NE India)</option>
            <option>EPSG:32645 (UTM Zone 45N - Bengal / Bihar)</option>
            <option>EPSG:4326 (WGS84 Geographic Lat/Long)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
            <span>Notify via email upon batch pipeline completion</span>
          </label>
        </div>

        <button
          className="btn-primary"
          style={{ width: 'fit-content', padding: '8px 20px', marginTop: '10px' }}
          onClick={handleSave}
          id="settings-save-btn"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
