import React, { useState } from 'react';
import {
  Database,
  Search,
  Filter,
  Download,
  CheckCircle2,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Upload,
  X,
} from 'lucide-react';
import { DATASET_CATALOG, SATELLITE_ASSETS } from '../data/mockData';

export default function DatasetsPage({ onNavigate }) {
  const [search, setSearch] = useState('');
  const [selectedSensor, setSelectedSensor] = useState('All');
  const [datasetsList, setDatasetsList] = useState(DATASET_CATALOG);
  const [selectedDataset, setSelectedDataset] = useState(DATASET_CATALOG[0]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New dataset form state
  const [newDatasetName, setNewDatasetName] = useState('');
  const [newDatasetSensor, setNewDatasetSensor] = useState('ISRO LISS-IV Optical');
  const [newDatasetRegion, setNewDatasetRegion] = useState('');
  const [newDatasetRes, setNewDatasetRes] = useState('5.0m GSD');

  const showToast = (title, desc) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filtered = datasetsList.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase());
    const matchSensor = selectedSensor === 'All' || d.sensor.includes(selectedSensor);
    return matchSearch && matchSensor;
  });

  const handleDownloadMetadata = (item) => {
    const metadata = {
      dataset_id: item.id,
      name: item.name,
      sensor: item.sensor,
      resolution: item.resolution,
      date_acquired: item.date,
      cloud_coverage: item.cloudCoverage,
      scenes_count: item.scenes,
      bands: ['Green (0.52-0.59 µm)', 'Red (0.62-0.68 µm)', 'Near-Infrared (0.77-0.86 µm)'],
      crs: 'EPSG:32646 (WGS 84 / UTM zone 46N)',
      geotransform: [384000.0, 5.0, 0.0, 3030000.0, 0.0, -5.0],
      format: 'GeoTIFF / Cloud-Optimized GeoTIFF (COG)',
      licence: 'ISRO / NRSC Open Geospatial Data Archive',
    };
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.id}_metadata.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Metadata Downloaded', `Exported geospatial schema for ${item.name}.`);
  };

  const handleCreateDataset = (e) => {
    e.preventDefault();
    if (!newDatasetName.trim() || !newDatasetRegion.trim()) {
      showToast('Validation Failed', 'Please provide both Dataset Name and Target Region.', 'error');
      return;
    }
    const newEntry = {
      id: `DS-0${datasetsList.length + 1}`,
      name: newDatasetName,
      sensor: newDatasetSensor,
      resolution: newDatasetRes,
      scenesCount: 1,
      avgCloudCover: '42.5%',
      date: 'Today',
      description: `User-ingested archive for ${newDatasetRegion}. Validated optical/SAR raster mosaic.`,
      preview: SATELLITE_ASSETS.cloudy,
    };
    setDatasetsList([newEntry, ...datasetsList]);
    setSelectedDataset(newEntry);
    setShowUploadModal(false);
    setNewDatasetName('');
    setNewDatasetRegion('');
    showToast('Dataset Ingested', `Successfully indexed ${newEntry.name} in geospatial catalog.`);
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

      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Geospatial Datasets Explorer</h1>
          <p className="page-subtitle">
            Browse, inspect, and select optical LISS-IV scenes, Sentinel-1 SAR imagery, and temporal reference mosaics
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={() => setShowUploadModal(true)}
            id="datasets-upload-btn"
          >
            <Upload size={14} />
            <span>Upload Dataset</span>
          </button>
          <button className="btn-primary" onClick={() => onNavigate('/cloud-removal')}>
            <span>Use in Cloud Removal</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Upload Dataset Modal */}
      {showUploadModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowUploadModal(false);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Upload New Geospatial Dataset</h3>
              <button className="btn-icon" onClick={() => setShowUploadModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDataset}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                  Dataset Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Arunachal High Altitude LISS-IV Mosaic"
                  value={newDatasetName}
                  onChange={(e) => setNewDatasetName(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                    Sensor Architecture
                  </label>
                  <select
                    value={newDatasetSensor}
                    onChange={(e) => setNewDatasetSensor(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  >
                    <option value="ISRO LISS-IV Optical">ISRO LISS-IV Optical</option>
                    <option value="Copernicus Sentinel-1 SAR">Copernicus Sentinel-1 SAR</option>
                    <option value="Sentinel-2 MSI Multi-Spectral">Sentinel-2 MSI Multi-Spectral</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                    Spatial Resolution
                  </label>
                  <select
                    value={newDatasetRes}
                    onChange={(e) => setNewDatasetRes(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                  >
                    <option value="5.0m GSD (Native)">5.0m GSD (Native)</option>
                    <option value="10.0m GSD">10.0m GSD</option>
                    <option value="2.5m Resampled">2.5m Resampled</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                  Target Geographic Region *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Tawang Valley, Arunachal Pradesh"
                  value={newDatasetRegion}
                  onChange={(e) => setNewDatasetRegion(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Ingest Dataset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', flex: 1, minWidth: '240px' }}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search datasets by name, ID, or geographic area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Sensor:</span>
            {['All', 'LISS-IV', 'Sentinel-1'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSensor(s)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  border: selectedSensor === s ? '1px solid #16a34a' : '1px solid #cbd5e1',
                  background: selectedSensor === s ? '#f0fdf4' : '#ffffff',
                  color: selectedSensor === s ? '#15803d' : '#475569',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Dataset Cards List + Selected Details Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Catalog Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map((item) => {
            const isSelected = selectedDataset.id === item.id;
            return (
              <div
                key={item.id}
                className="card"
                onClick={() => setSelectedDataset(item)}
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #16a34a' : '1px solid #e2e8f0',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: '#eff6ff',
                        color: '#2878e5',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {item.tag}
                    </span>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginTop: '6px' }}>
                      {item.name}
                    </h3>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                    {item.size}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '11.5px', color: '#64748b', margin: '12px 0' }}>
                  <div>
                    <div>Sensor:</div>
                    <strong style={{ color: '#1e293b' }}>{item.sensor}</strong>
                  </div>
                  <div>
                    <div>Resolution:</div>
                    <strong style={{ color: '#1e293b' }}>{item.resolution}</strong>
                  </div>
                  <div>
                    <div>Scenes:</div>
                    <strong style={{ color: '#1e293b' }}>{item.scenesCount}</strong>
                  </div>
                  <div>
                    <div>Cloud Cover:</div>
                    <strong style={{ color: (item.avgCloudCover || '').includes('0.0') ? '#16a34a' : '#ef4444' }}>
                      {item.avgCloudCover}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                    ID: {item.id}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadMetadata(item);
                      }}
                      title="Download metadata JSON"
                    >
                      <Download size={12} />
                      <span>Metadata</span>
                    </button>
                    <button
                      className="btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('/cloud-removal');
                      }}
                    >
                      <span>Select</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Dataset Details Drawer */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-header">
            <span className="card-title">
              <Database size={15} color="#2878e5" />
              Dataset Specifications
            </span>
          </div>
          <div className="card-body">
            <div style={{ borderRadius: '6px', overflow: 'hidden', height: '140px', marginBottom: '14px', position: 'relative' }}>
              <img
                src={
                  selectedDataset.tag === 'SAR Guidance'
                    ? SATELLITE_ASSETS.sar
                    : selectedDataset.tag === 'Temporal Prior'
                    ? SATELLITE_ASSETS.temporal
                    : SATELLITE_ASSETS.cropAgriAfter
                }
                alt="preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(8,24,39,0.85)', color: '#fff', fontSize: '10.5px', padding: '3px 8px', borderRadius: '4px' }}>
                Coverage: Assam & Brahmaputra Valley
              </div>
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              {selectedDataset.name}
            </h3>

            <div style={{ fontSize: '12px', lineHeight: '2.1', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Dataset ID</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{selectedDataset.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Spatial Resolution</span>
                <span style={{ fontWeight: 600 }}>{selectedDataset.resolution}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Temporal Range</span>
                <span style={{ fontWeight: 600 }}>{selectedDataset.dateRange}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Coordinate System</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>EPSG:32646 (UTM 46N)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Distribution Format</span>
                <span style={{ fontWeight: 600 }}>{selectedDataset.format}</span>
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
              onClick={() => onNavigate('/cloud-removal')}
            >
              <span>Load into Cloud Removal Workspace</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
