import React, { useState } from 'react';
import {
  Cpu,
  Upload,
  Play,
  Download,
  FileText,
  RotateCcw,
  CheckCircle2,
  Clock,
  Eye,
  Trash2,
  Sliders,
} from 'lucide-react';
import { BATCH_JOBS_DATA, SATELLITE_ASSETS } from '../data/mockData';

export default function BatchProcessingPage({ onNavigate }) {
  const [filterTab, setFilterTab] = useState('All');
  const [batchJobs, setBatchJobs] = useState(BATCH_JOBS_DATA);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelPipeline, setModelPipeline] = useState('Multi-Modal (SAR + Temporal)');
  const [temporalWindow, setTemporalWindow] = useState('± 30 Days (Recommended)');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (title, desc) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredJobs = batchJobs.filter((job) => {
    if (filterTab === 'All') return true;
    return job.status.toLowerCase() === filterTab.toLowerCase();
  });

  const handleStartBatch = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setBatchJobs((prev) =>
        prev.map((j) => (j.status !== 'Completed' ? { ...j, status: 'Completed', progress: 100 } : j))
      );
      showToast('Batch Complete', 'All active queue scenes have finished inference and validation.');
    }, 1200);
  };

  const handleExportBatchCsv = () => {
    const headers = 'Job ID,Scene Name,Status,Progress,PSNR (dB),SSIM,SAM (deg),LULC Gain\n';
    const rows = batchJobs.map((j) =>
      `"${j.id}","${j.sceneName}","${j.status}","${j.progress}%","${j.psnr}","${j.ssim}","${j.sam}","${j.lulcGain}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudless_batch_manifest_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export Generated', 'Downloaded batch pipeline execution metadata CSV.');
  };

  const handleDownloadZipPackage = () => {
    const manifest = {
      project: 'Cloudless AI Batch Archive',
      timestamp: new Date().toISOString(),
      pipeline: modelPipeline,
      temporal_window: temporalWindow,
      total_scenes: batchJobs.length,
      completed_scenes: batchJobs.filter((j) => j.status === 'Completed').length,
      scenes: batchJobs,
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_reconstruction_archive_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Package Ready', 'Generated batch archive package with scene descriptors and download URLs.');
  };

  const handleBatchFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newJobs = files.map((file, idx) => ({
      id: `BATCH-${String(batchJobs.length + idx + 1).padStart(3, '0')}`,
      sceneName: file.name,
      status: 'Queued',
      progress: 0,
      psnr: '39.42 dB',
      ssim: '0.981',
      sam: '1.7°',
      lulcGain: '+68.2%',
      date: 'Today',
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    }));

    setBatchJobs((prev) => [...prev, ...newJobs]);
    showToast('Files Added', `Added ${files.length} LISS-IV scene(s) to the batch processing queue.`);
  };

  const handleDownloadJobOutput = (jobId) => {
    window.open(`/api/v1/export/JOB_20261020_E4192818/geotiff`, '_blank');
    showToast('Download Dispatched', `Downloading reconstructed GeoTIFF raster for ${jobId}.`);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Toast Notification */}
      {toastMessage && (
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
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <span style={{ fontWeight: 700 }}>{toastMessage.title}:</span>
          <span>{toastMessage.desc}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Batch Processing Pipeline</h1>
          <p className="page-subtitle">
            Scale multi-modal reconstruction across large satellite scene archives with queue automation
          </p>
        </div>

        {/* Bulk Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={handleExportBatchCsv}
            id="batch-export-csv-btn"
          >
            <FileText size={13} />
            <span>Export Metadata (CSV)</span>
          </button>
          <button
            className="btn-primary"
            onClick={handleDownloadZipPackage}
            id="batch-download-zip-btn"
          >
            <Download size={13} />
            <span>Download All Results (ZIP)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>Total Scenes in Batch</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#1e293b', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            {batchJobs.length}
          </div>
          <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px' }}>Active archive session</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>Currently Processing</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#2878e5', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            {batchJobs.filter((j) => j.status === 'Processing').length}
          </div>
          <div style={{ fontSize: '11px', color: '#2878e5', marginTop: '4px' }}>SAR + Temporal Guidance active</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>Completed Scenes</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            {batchJobs.filter((j) => j.status === 'Completed').length}
          </div>
          <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px' }}>Mean PSNR: 38.91 dB</div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>Total Processing Time</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#081827', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            7m 32s
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Avg. 2m 10s per 1024² scene</div>
        </div>
      </div>

      {/* Main Grid: Upload & Configuration / Sample Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Upload & Setup Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Upload size={15} color="#2878e5" />
              Batch Ingestion & Model Parameters
            </span>
          </div>
          <div className="card-body">
            <label
              style={{
                display: 'block',
                border: '2px dashed #cbd5e1',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                background: '#f8fafc',
                cursor: 'pointer',
                marginBottom: '16px',
              }}
              title="Click or drag and drop to ingest satellite scenes"
            >
              <Upload size={28} color="#2878e5" style={{ margin: '0 auto 8px auto' }} />
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                Drag and drop multiple LISS-IV scene files here (or click to browse)
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                Supports batch .tif, .geotiff, .png, .jpg archives up to 2 GB total
              </div>
              <input
                type="file"
                multiple
                accept=".tif,.tiff,.geotiff,.png,.jpg,.tar.gz"
                style={{ display: 'none' }}
                onChange={handleBatchFiles}
                id="batch-file-input"
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                  Model Pipeline
                </label>
                <select
                  value={modelPipeline}
                  onChange={(e) => setModelPipeline(e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                >
                  <option value="Multi-Modal (SAR + Temporal)">Multi-Modal (SAR + Temporal)</option>
                  <option value="Fast Optical-Only Diffusion">Fast Optical-Only Diffusion</option>
                  <option value="Model D Quality-Aware (Heteroscedastic)">Model D Quality-Aware (Heteroscedastic)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                  Temporal Window
                </label>
                <select
                  value={temporalWindow}
                  onChange={(e) => setTemporalWindow(e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                >
                  <option value="± 30 Days (Recommended)">± 30 Days (Recommended)</option>
                  <option value="± 15 Days">± 15 Days</option>
                  <option value="± 60 Days">± 60 Days</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '14px', fontSize: '11.5px', color: '#475569' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="checkbox" defaultChecked /> Confidence Maps
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="checkbox" defaultChecked /> Cloud Masks
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input type="checkbox" defaultChecked /> LULC Metrics
                </label>
              </div>

              <button
                className="btn-primary"
                onClick={handleStartBatch}
                disabled={isProcessing}
              >
                <Play size={13} fill="#081827" />
                <span>{isProcessing ? 'Processing Queue...' : 'Start Batch Processing'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sample Results Visual Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Latest Batch Output Preview</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '10.5px', color: '#64748b', marginBottom: '2px' }}>Input (Cloudy)</div>
                <img src={SATELLITE_ASSETS.cloudy} alt="input" style={{ width: '100%', height: '80px', borderRadius: '4px', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontSize: '10.5px', color: '#64748b', marginBottom: '2px' }}>Cloud Mask</div>
                <img src={SATELLITE_ASSETS.mask} alt="mask" style={{ width: '100%', height: '80px', borderRadius: '4px', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: 600, marginBottom: '2px' }}>Reconstructed</div>
                <img src={SATELLITE_ASSETS.reconstructed} alt="recon" style={{ width: '100%', height: '80px', borderRadius: '4px', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontSize: '10.5px', color: '#2878e5', marginBottom: '2px' }}>Confidence Map</div>
                <img src={SATELLITE_ASSETS.confidence} alt="conf" style={{ width: '100%', height: '80px', borderRadius: '4px', objectFit: 'cover' }} />
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
              Scene: <strong style={{ color: '#1e293b' }}>SCENE_2023_0612_01 (Assam)</strong> • PSNR: 39.67 dB
            </div>
          </div>
        </div>
      </div>

      {/* Queue Table Card */}
      <div className="card">
        <div className="card-header">
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '4px', background: '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
            {['All', 'Processing', 'Completed', 'Queued'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '5px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  background: filterTab === tab ? '#16a34a' : 'transparent',
                  color: filterTab === tab ? '#ffffff' : '#475569',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Showing {filteredJobs.length} items
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Scene ID</th>
                <th>Location</th>
                <th>Date</th>
                <th>Cloud Cover</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Progress</th>
                <th>PSNR</th>
                <th>SSIM</th>
                <th>SAM</th>
                <th>LULC Gain</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#1e293b' }}>
                    {job.id}
                  </td>
                  <td>{job.location}</td>
                  <td>{job.date}</td>
                  <td style={{ color: '#ef4444', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {job.cloudCoverage}%
                  </td>
                  <td>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', fontSize: '11px', fontWeight: 600 }}>
                      {job.mode}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${job.status.toLowerCase()}`}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: job.status === 'Completed' ? '#16a34a' : job.status === 'Processing' ? '#2878e5' : '#d97706' }}></span>
                      {job.status}
                    </span>
                  </td>
                  <td style={{ width: '120px' }}>
                    <div className="progress-bar-bg" style={{ height: '5px', marginBottom: '2px' }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${job.progress}%`,
                          background: job.status === 'Completed' ? '#16a34a' : '#2878e5',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      {job.progress}%
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{job.psnr}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{job.ssim}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{job.sam}</td>
                  <td style={{ color: '#16a34a', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {job.lulcGain}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button className="btn-icon" style={{ width: '26px', height: '26px' }} title="Preview" onClick={() => onNavigate('/comparison')}>
                        <Eye size={13} />
                      </button>
                      <button className="btn-icon" style={{ width: '26px', height: '26px' }} title="Download" onClick={() => handleDownloadJobOutput(job.id)}>
                        <Download size={13} />
                      </button>
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
