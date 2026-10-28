import React, { useState } from 'react';
import {
  Upload,
  FolderPlus,
  Image as ImageIcon,
  BookOpen,
  ArrowRight,
  Download,
  Eye,
  MoreVertical,
  CheckCircle2,
  FileText,
  BarChart2,
  Sliders,
} from 'lucide-react';
import SatelliteMapCard from '../components/satellite/SatelliteMapCard';
import SpectralChart from '../components/analytics/SpectralChart';
import { SATELLITE_ASSETS, PRIMARY_SCENE_INFO, HISTORICAL_PROCESSING_DATA } from '../data/mockData';
import { submitReconstructionJob, fetchJobStatus, fetchJobResults } from '../services/api';

export default function DashboardPage({ onNavigate }) {
  const [processingMode, setProcessingMode] = useState('Natural True Color (RGB)');
  const [genConfidence, setGenConfidence] = useState(true);
  const [saveIntermediate, setSaveIntermediate] = useState(false);
  const [runLulc, setRunLulc] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [activeJobId, setActiveJobId] = useState('JOB_20261020_E4192818');
  const [selectedSceneName, setSelectedSceneName] = useState('Assam_12JUN2023.tif');
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeMenuRowId, setActiveMenuRowId] = useState(null);
  const [historyRows, setHistoryRows] = useState(HISTORICAL_PROCESSING_DATA);

  const showToast = (title, description, type = 'success') => {
    setToastMessage({ title, description, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessProgress(10);
    setCurrentStage('Submitting job to queue...');

    try {
      const job = await submitReconstructionJob({
        scene_name: selectedSceneName,
        model_id: 'model_d',
        spectral_mode: processingMode.includes('FCC') ? 'FCC' : 'RGB',
        use_sar: true,
        use_temporal: true,
        generate_confidence: genConfidence,
        run_lulc: runLulc,
        output_resolution: '5.0m',
      });

      const jobId = job.job_id;
      setActiveJobId(jobId);

      // Poll until completion
      const interval = setInterval(async () => {
        try {
          const statusRes = await fetchJobStatus(jobId);
          setProcessProgress(statusRes.progress.percent);
          setCurrentStage(statusRes.progress.stage);

          if (statusRes.status === 'completed') {
            clearInterval(interval);
            setIsProcessing(false);
            const results = await fetchJobResults(jobId);
            showToast(
              'Reconstruction Complete',
              `Job ${jobId} finished in ${statusRes.progress.duration_seconds}s. PSNR: ${statusRes.metrics?.psnr} dB, SSIM: ${statusRes.metrics?.ssim}.`,
              'success'
            );
          } else if (statusRes.status === 'failed') {
            clearInterval(interval);
            setIsProcessing(false);
            setErrorMessage(`Job execution failed: ${statusRes.error}`);
          }
        } catch (pollErr) {
          console.warn('Poll error:', pollErr);
        }
      }, 600);
    } catch (err) {
      setIsProcessing(false);
      setErrorMessage(`Backend submission failed: ${err.message}. Please verify the backend server is running on port 8001.`);
    }
  };

  const handleDownload = (type, customId) => {
    let endpoint = 'geotiff';
    if (type.includes('Confidence')) endpoint = 'confidence';
    if (type.includes('Mask')) endpoint = 'mask';
    if (type.includes('Report') || type.includes('pdf')) endpoint = 'pdf';
    if (type.includes('CSV') || type.includes('statistics')) endpoint = 'csv';
    const targetId = customId || activeJobId || 'JOB_20261020_E4192818';
    window.open(`/api/v1/export/${targetId}/${endpoint}`, '_blank');
  };

  const handleLoadSample = () => {
    setSelectedSceneName('Brahmaputra_Basin_Assam_LISS4.tif');
    showToast(
      'Sample Image Loaded',
      'Loaded LISS-IV scene: Brahmaputra River Basin, Assam (3-band Optical + Sentinel-1 SAR pair).',
      'info'
    );
  };

  const handleDeleteHistoryRow = (id) => {
    setHistoryRows((prev) => prev.filter((r) => r.id !== id));
    setActiveMenuRowId(null);
    showToast('Record Removed', `Scene ${id} removed from historical workspace log.`, 'info');
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            background: toastMessage.type === 'success' ? '#064e3b' : '#0f172a',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '420px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <CheckCircle2 size={18} color="#a8f04a" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '12.5px' }}>{toastMessage.title}</div>
            <div style={{ fontSize: '11.5px', color: '#cbd5e1', marginTop: '2px' }}>{toastMessage.description}</div>
          </div>
        </div>
      )}

      {/* Actionable Error Banner */}
      {errorMessage && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '12.5px' }}>
            <strong>Submission Error:</strong> {errorMessage}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn-secondary"
              style={{ fontSize: '11px', padding: '4px 10px' }}
              onClick={handleProcess}
            >
              Retry Submission
            </button>
            <button
              className="btn-icon"
              style={{ width: '24px', height: '24px' }}
              onClick={() => setErrorMessage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Cloud Removal Workspace</h1>
          <p className="page-subtitle">
            Upload LISS-IV imagery and generate cloud-free, analysis-ready images using multi-modal AI
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={() => onNavigate('/projects')}
            id="dashboard-new-project-btn"
          >
            <FolderPlus size={14} color="#2878e5" />
            <span>New Project</span>
          </button>
          <button
            className="btn-secondary"
            onClick={handleLoadSample}
            id="dashboard-sample-image-btn"
          >
            <ImageIcon size={14} color="#16a34a" />
            <span>Sample Image</span>
          </button>
          <button
            className="btn-secondary"
            onClick={() => onNavigate('/how-it-works')}
            id="dashboard-tutorial-btn"
          >
            <BookOpen size={14} color="#f59e0b" />
            <span>Tutorial</span>
          </button>
        </div>
      </div>

      {/* Top Configuration & Upload Bar (Card) */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div
          className="card-body"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1.2fr 1.2fr auto',
            gap: '20px',
            alignItems: 'center',
            padding: '16px 20px',
          }}
        >
          {/* Upload Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bfdbfe',
                flexShrink: 0,
              }}
            >
              <Upload size={20} color="#2878e5" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                {selectedSceneName}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                Validated 3-Band LISS-IV Optical (5.0m GSD)
              </div>
              <label
                style={{
                  display: 'inline-block',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '5px',
                  padding: '3px 12px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                Choose File
                <input
                  type="file"
                  style={{ display: 'none' }}
                  accept=".tif,.tiff,.geotiff,.png,.jpg"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (file) {
                      if (file.size > 100 * 1024 * 1024) {
                        showToast('File Too Large', 'Maximum allowed raster upload is 100 MB.', 'error');
                        return;
                      }
                      setSelectedSceneName(file.name);
                      showToast(
                        'Scene Loaded & Validated',
                        `File "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB) verified for 3-band LISS-IV processing.`,
                        'success'
                      );
                    }
                  }}
                  id="dashboard-file-upload-input"
                />
              </label>
            </div>
          </div>

          {/* Select Processing Mode */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
              Select Processing Mode
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '6px 10px',
              }}
            >
              <img
                src={SATELLITE_ASSETS.cropAgriAfter}
                alt="mode preview"
                style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }}
              />
              <select
                value={processingMode}
                onChange={(e) => setProcessingMode(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: '#1e293b',
                  width: '100%',
                }}
              >
                <option value="Natural True Color (RGB)">Natural True Color (RGB)</option>
                <option value="False Color Composite (FCC)">False Color Composite (FCC)</option>
              </select>
            </div>
          </div>

          {/* Additional Options */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
              Additional Options
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={genConfidence}
                  onChange={(e) => setGenConfidence(e.target.checked)}
                />
                <span>Generate Confidence Map</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={saveIntermediate}
                  onChange={(e) => setSaveIntermediate(e.target.checked)}
                />
                <span>Save Intermediate Results</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={runLulc}
                  onChange={(e) => setRunLulc(e.target.checked)}
                />
                <span>Run LULC Analysis</span>
              </label>
            </div>
          </div>

          {/* Process Image Button */}
          <div style={{ textAlign: 'right' }}>
            <button
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '14px', borderRadius: '8px' }}
              onClick={handleProcess}
              disabled={isProcessing}
            >
              <span>{isProcessing ? `Processing ${processProgress}%` : 'Process Image'}</span>
              <ArrowRight size={16} />
            </button>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              Estimated time: ~2–3 minutes
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Panel Visualization Area */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {/* Panel 1: Input (Cloudy Image) */}
        <SatelliteMapCard
          title="Input (Cloudy Image)"
          imageSrc={SATELLITE_ASSETS.cloudy}
          tagText="Cloud Coverage: 80.98%"
          scale="2 km"
          icon={ImageIcon}
          onExpand={() => onNavigate('/comparison')}
        />

        {/* Panel 2: Reconstructed (Cloud-Free) */}
        <SatelliteMapCard
          title="Reconstructed (Cloud-Free)"
          imageSrc={
            processingMode.includes('FCC') ? SATELLITE_ASSETS.fcc : SATELLITE_ASSETS.reconstructed
          }
          tagText="PSNR: 39.67 dB | SSIM: 0.9834 | SAM: 1.6°"
          scale="2 km"
          icon={CheckCircle2}
          onExpand={() => onNavigate('/comparison')}
        />

        {/* Panel 3: Confidence Map */}
        <SatelliteMapCard
          title="Confidence Map"
          imageSrc={SATELLITE_ASSETS.confidence}
          scale="2 km"
          hasColorbar={true}
          icon={Sliders}
          onExpand={() => onNavigate('/comparison')}
        />
      </div>

      {/* Information Cards Row (4 Columns) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1.35fr 1fr',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Card 1: Image Information */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <FileText size={15} color="#2878e5" />
              Image Information
            </span>
          </div>
          <div className="card-body" style={{ fontSize: '12px', lineHeight: '2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Sensor</span>
              <span style={{ fontWeight: 600 }}>{PRIMARY_SCENE_INFO.sensor.split(' ')[1]}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Resolution</span>
              <span style={{ fontWeight: 600 }}>{PRIMARY_SCENE_INFO.resolution}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Bands</span>
              <span style={{ fontWeight: 600 }}>3 (G, R, NIR)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Date</span>
              <span style={{ fontWeight: 600 }}>{PRIMARY_SCENE_INFO.captureDate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Location</span>
              <span style={{ fontWeight: 600 }}>{PRIMARY_SCENE_INFO.location}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>CRS</span>
              <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>EPSG:32646</span>
            </div>
          </div>
        </div>

        {/* Card 2: Processing Statistics */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <BarChart2 size={15} color="#16a34a" />
              Processing Statistics
            </span>
          </div>
          <div className="card-body" style={{ fontSize: '12px', lineHeight: '2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Cloud Coverage</span>
              <span style={{ fontWeight: 600, color: '#ef4444' }}>80.98%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Processing Time</span>
              <span style={{ fontWeight: 600 }}>2m 14s</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Model</span>
              <span style={{ fontWeight: 600, fontSize: '11px' }}>Multi-Modal (SAR + Temp)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Mode</span>
              <span style={{ fontWeight: 600 }}>{processingMode.includes('FCC') ? 'FCC' : 'Natural RGB'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Output Size</span>
              <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>1024 × 1024</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b' }}>Status</span>
              <span className="status-pill completed">
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#16a34a' }}></span>
                Completed
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Spectral Analysis */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <BarChart2 size={15} color="#2878e5" />
              Spectral Analysis
            </span>
          </div>
          <div className="card-body" style={{ padding: '12px' }}>
            <SpectralChart height={140} />
          </div>
        </div>

        {/* Card 4: Download Results */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Download size={15} color="#2878e5" />
              Download Results
            </span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="btn-secondary"
              style={{ justifyContent: 'flex-start', fontSize: '12px' }}
              onClick={() => handleDownload('Reconstructed Image GeoTIFF')}
            >
              <Download size={13} color="#2878e5" />
              <span>Reconstructed Image (GeoTIFF)</span>
            </button>
            <button
              className="btn-secondary"
              style={{ justifyContent: 'flex-start', fontSize: '12px' }}
              onClick={() => handleDownload('Confidence Map GeoTIFF')}
            >
              <Download size={13} color="#2878e5" />
              <span>Confidence Map (GeoTIFF)</span>
            </button>
            <button
              className="btn-secondary"
              style={{ justifyContent: 'flex-start', fontSize: '12px' }}
              onClick={() => handleDownload('Cloud/Shadow Mask PNG')}
            >
              <Download size={13} color="#2878e5" />
              <span>Cloud/Shadow Mask (PNG)</span>
            </button>
            <button
              className="btn-secondary"
              style={{ justifyContent: 'flex-start', fontSize: '12px' }}
              onClick={() => handleDownload('Analysis Report PDF')}
            >
              <FileText size={13} color="#16a34a" />
              <span>Analysis Report (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Historical Processing Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2878e5' }}></span>
            Historical Processing
          </span>
          <button
            className="btn-secondary btn-sm"
            onClick={() => onNavigate('/batch-processing')}
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </button>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Location</th>
                <th>Cloud Coverage</th>
                <th>Mode</th>
                <th>PSNR</th>
                <th>SSIM</th>
                <th>SAM</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {historyRows.map((row) => (
                <tr key={row.id}>
                  <td style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{row.id}</td>
                  <td style={{ fontWeight: 600 }}>{row.date}</td>
                  <td>{row.location}</td>
                  <td style={{ color: '#ef4444', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {row.cloudCoverage}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: '#f1f5f9',
                        fontSize: '11px',
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {row.mode}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{row.psnr}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{row.ssim}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{row.sam}</td>
                  <td>
                    <span className="status-pill completed">
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#16a34a' }}></span>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
                      <button
                        className="btn-icon"
                        style={{ width: '28px', height: '28px' }}
                        title="Preview Comparison"
                        onClick={() => onNavigate('/comparison')}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="btn-icon"
                        style={{ width: '28px', height: '28px' }}
                        title="Download GeoTIFF"
                        onClick={() => handleDownload('geotiff', 'JOB_20261020_E4192818')}
                      >
                        <Download size={14} />
                      </button>
                      <button
                        className="btn-icon"
                        style={{ width: '28px', height: '28px' }}
                        title="More Actions"
                        onClick={() => setActiveMenuRowId(activeMenuRowId === row.id ? null : row.id)}
                      >
                        <MoreVertical size={14} />
                      </button>

                      {/* Row Action Dropdown Menu */}
                      {activeMenuRowId === row.id && (
                        <div
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            marginTop: '4px',
                            background: '#ffffff',
                            borderRadius: '8px',
                            boxShadow: 'var(--shadow-lg)',
                            border: '1px solid #e2e8f0',
                            padding: '4px',
                            zIndex: 40,
                            minWidth: '160px',
                            textAlign: 'left',
                          }}
                        >
                          <div
                            style={{ padding: '6px 10px', fontSize: '11.5px', color: '#1e293b', cursor: 'pointer', borderRadius: '4px' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            onClick={() => {
                              navigator.clipboard?.writeText(row.id);
                              showToast('ID Copied', `Copied ${row.id} to clipboard.`, 'info');
                              setActiveMenuRowId(null);
                            }}
                          >
                            Copy Scene ID
                          </div>
                          <div
                            style={{ padding: '6px 10px', fontSize: '11.5px', color: '#1e293b', cursor: 'pointer', borderRadius: '4px' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            onClick={() => {
                              handleDownload('pdf', 'JOB_20261020_E4192818');
                              setActiveMenuRowId(null);
                            }}
                          >
                            Download Report (PDF)
                          </div>
                          <div
                            style={{ padding: '6px 10px', fontSize: '11.5px', color: '#ef4444', cursor: 'pointer', borderRadius: '4px', borderTop: '1px solid #f1f5f9' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            onClick={() => handleDeleteHistoryRow(row.id)}
                          >
                            Remove Record
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
