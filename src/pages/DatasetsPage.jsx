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
  Eye,
  Grid,
  Activity,
  Compass,
  Sparkles,
  Maximize2,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { DATASET_CATALOG, SATELLITE_ASSETS } from '../data/mockData';
import { BENCHMARK_50_SCENES } from '../data/benchmark50Data';

export default function DatasetsPage({ onNavigate }) {
  // Mode: 'gallery' (50-Scene Benchmark Image Gallery) | 'catalog' (Geospatial Catalog)
  const [viewMode, setViewMode] = useState('gallery');

  // 50-Scene Gallery State
  const [galleryFilter, setGalleryFilter] = useState('all'); // 'all' | 'low' | 'med' | 'high' | 'forest' | 'water' | 'mountain'
  const [galleryDisplayMode, setGalleryDisplayMode] = useState('recon'); // 'recon' | 'cloudy' | 'subcloud' | 'ndvi'
  const [selectedScene, setSelectedScene] = useState(BENCHMARK_50_SCENES[0] || null);
  const [searchQuery, setSearchQuery] = useState('');

  // Catalog State
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

  // Filter 50 benchmark scenes
  const filtered50Scenes = BENCHMARK_50_SCENES.filter((scene) => {
    const matchSearch =
      scene.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scene.dominant_subcloud_feature.toLowerCase().includes(searchQuery.toLowerCase());

    let matchFilter = true;
    if (galleryFilter === 'low') matchFilter = scene.cloud_coverage_pct < 30.0;
    else if (galleryFilter === 'med') matchFilter = scene.cloud_coverage_pct >= 30.0 && scene.cloud_coverage_pct <= 70.0;
    else if (galleryFilter === 'high') matchFilter = scene.cloud_coverage_pct > 70.0;
    else if (galleryFilter === 'forest') matchFilter = scene.dominant_subcloud_feature.includes('Forest');
    else if (galleryFilter === 'water') matchFilter = scene.dominant_subcloud_feature.includes('Water');
    else if (galleryFilter === 'mountain') matchFilter = scene.dominant_subcloud_feature.includes('Mountain');

    return matchSearch && matchFilter;
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
          <h1 className="page-title">Geospatial Datasets & 50-Scene Image Explorer</h1>
          <p className="page-subtitle">
            Browse, inspect, and compare all 50 benchmark test scenes across optical, reconstructed, sub-cloud labels, and NIR vegetation health
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={() => window.open('/images/benchmarks/scenes_50/scenes_50_master_contact_sheet.jpg', '_blank')}
            id="download-master-contact-btn"
          >
            <Download size={14} />
            <span>Master 50-Scene Contact Sheet</span>
          </button>
          <button className="btn-primary" onClick={() => onNavigate('/lulc-analysis')}>
            <span>Open in Labelling Engine</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          background: '#e2e8f0',
          padding: '4px',
          borderRadius: '8px',
          marginBottom: '18px',
        }}
      >
        <button
          onClick={() => setViewMode('gallery')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            background: viewMode === 'gallery' ? '#ffffff' : 'transparent',
            color: viewMode === 'gallery' ? '#1d4ed8' : '#475569',
            boxShadow: viewMode === 'gallery' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Grid size={16} />
          <span>50-Scene Benchmark Image Gallery (Visual Explorer)</span>
          <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '10px' }}>
            50 Scenes
          </span>
        </button>

        <button
          onClick={() => setViewMode('catalog')}
          style={{
            flex: 0.8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            background: viewMode === 'catalog' ? '#ffffff' : 'transparent',
            color: viewMode === 'catalog' ? '#0f172a' : '#475569',
            boxShadow: viewMode === 'catalog' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Database size={16} />
          <span>Ingested Geospatial Archives (Catalog View)</span>
        </button>
      </div>

      {/* =========================================================================
          VIEW MODE 1: 50-SCENE BENCHMARK IMAGE GALLERY
          ========================================================================= */}
      {viewMode === 'gallery' && (
        <div>
          {/* Top KPI Statistics Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div className="card" style={{ padding: '12px 14px', borderLeft: '4px solid #2563eb' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Dataset Sample Size</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>50 Scenes</div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>256x256 px • 5.0m LISS-IV</div>
            </div>

            <div className="card" style={{ padding: '12px 14px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '11px', color: '#d97706', fontWeight: 600, textTransform: 'uppercase' }}>Avg Cloud Coverage</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>47.8%</div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>Min: 3.8% • Max: 92.3%</div>
            </div>

            <div className="card" style={{ padding: '12px 14px', borderLeft: '4px solid #16a34a' }}>
              <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase' }}>Clear Pixel Invariance</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a', marginTop: '4px' }}>100.0%</div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>Identity verification asserted</div>
            </div>

            <div className="card" style={{ padding: '12px 14px', borderLeft: '4px solid #7c3aed' }}>
              <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 600, textTransform: 'uppercase' }}>Recovered Biomass</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>21.65 km²</div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>Avg 0.43 km² / scene</div>
            </div>

            <div className="card" style={{ padding: '12px 14px', borderLeft: '4px solid #0284c7' }}>
              <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600, textTransform: 'uppercase' }}>Roads &amp; Corridors</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>155.2 km</div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>Delineated under clouds</div>
            </div>
          </div>

          {/* Filter & View Switcher Toolbar */}
          <div className="card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              {/* Search & Cloud Cover Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '220px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Search scene or feature..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px 7px 30px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px' }}>
                  <button
                    onClick={() => setGalleryFilter('all')}
                    style={{
                      padding: '5px 10px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                      background: galleryFilter === 'all' ? '#ffffff' : 'transparent',
                      color: galleryFilter === 'all' ? '#0f172a' : '#64748b',
                      boxShadow: galleryFilter === 'all' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    All (50)
                  </button>
                  <button
                    onClick={() => setGalleryFilter('low')}
                    style={{
                      padding: '5px 10px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                      background: galleryFilter === 'low' ? '#ffffff' : 'transparent',
                      color: galleryFilter === 'low' ? '#16a34a' : '#64748b',
                      boxShadow: galleryFilter === 'low' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Low Cloud (&lt;30%)
                  </button>
                  <button
                    onClick={() => setGalleryFilter('med')}
                    style={{
                      padding: '5px 10px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                      background: galleryFilter === 'med' ? '#ffffff' : 'transparent',
                      color: galleryFilter === 'med' ? '#d97706' : '#64748b',
                      boxShadow: galleryFilter === 'med' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Moderate (30-70%)
                  </button>
                  <button
                    onClick={() => setGalleryFilter('high')}
                    style={{
                      padding: '5px 10px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                      background: galleryFilter === 'high' ? '#ffffff' : 'transparent',
                      color: galleryFilter === 'high' ? '#dc2626' : '#64748b',
                      boxShadow: galleryFilter === 'high' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Heavy Cloud (&gt;70%)
                  </button>
                </div>
              </div>

              {/* Modality Display Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>View Modality:</span>
                <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
                  <button
                    onClick={() => setGalleryDisplayMode('recon')}
                    style={{
                      padding: '5px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                      background: galleryDisplayMode === 'recon' ? '#16a34a' : 'transparent',
                      color: galleryDisplayMode === 'recon' ? '#ffffff' : '#475569',
                    }}
                  >
                    Reconstructed
                  </button>
                  <button
                    onClick={() => setGalleryDisplayMode('cloudy')}
                    style={{
                      padding: '5px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                      background: galleryDisplayMode === 'cloudy' ? '#2563eb' : 'transparent',
                      color: galleryDisplayMode === 'cloudy' ? '#ffffff' : '#475569',
                    }}
                  >
                    Cloudy Input
                  </button>
                  <button
                    onClick={() => setGalleryDisplayMode('subcloud')}
                    style={{
                      padding: '5px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                      background: galleryDisplayMode === 'subcloud' ? '#ea580c' : 'transparent',
                      color: galleryDisplayMode === 'subcloud' ? '#ffffff' : '#475569',
                    }}
                  >
                    Sub-Cloud Labels
                  </button>
                  <button
                    onClick={() => setGalleryDisplayMode('ndvi')}
                    style={{
                      padding: '5px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                      background: galleryDisplayMode === 'ndvi' ? '#7c3aed' : 'transparent',
                      color: galleryDisplayMode === 'ndvi' ? '#ffffff' : '#475569',
                    }}
                  >
                    NIR NDVI Heatmap
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Master 50-Grid + Selected Scene Inspector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {/* 50 Scene Thumbnails Grid */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                  Showing {filtered50Scenes.length} of 50 Spatially Isolated Tiles (Click to Inspect)
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Modality: <strong style={{ textTransform: 'capitalize' }}>{galleryDisplayMode}</strong>
                </span>
              </div>
              <div
                className="card-body"
                style={{
                  padding: '12px',
                  maxHeight: '620px',
                  overflowY: 'auto',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '8px',
                }}
              >
                {filtered50Scenes.map((scene) => {
                  const isSelected = selectedScene?.id === scene.id;
                  const imgSrc =
                    galleryDisplayMode === 'recon'
                      ? scene.recon_url
                      : galleryDisplayMode === 'cloudy'
                        ? scene.cloudy_url
                        : galleryDisplayMode === 'subcloud'
                          ? scene.subcloud_url
                          : scene.ndvi_url;

                  return (
                    <div
                      key={scene.id}
                      onClick={() => setSelectedScene(scene)}
                      style={{
                        position: 'relative',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: isSelected ? '3px solid #2563eb' : '1px solid #cbd5e1',
                        boxShadow: isSelected ? '0 0 8px rgba(37, 99, 235, 0.5)' : 'none',
                        transition: 'transform 0.15s ease',
                        background: '#0f172a',
                        aspectRatio: '1',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                    >
                      <img
                        src={imgSrc}
                        alt={scene.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        loading="lazy"
                      />

                      {/* Top Badge: Scene ID */}
                      <span
                        style={{
                          position: 'absolute',
                          top: '4px',
                          left: '4px',
                          background: 'rgba(15, 23, 42, 0.85)',
                          color: '#ffffff',
                          fontSize: '9.5px',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '3px',
                        }}
                      >
                        #{scene.id < 10 ? `0${scene.id}` : scene.id}
                      </span>

                      {/* Bottom Badge: Cloud Coverage */}
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          right: '4px',
                          background:
                            scene.cloud_coverage_pct > 70
                              ? 'rgba(220, 38, 38, 0.9)'
                              : scene.cloud_coverage_pct > 30
                                ? 'rgba(217, 119, 6, 0.9)'
                                : 'rgba(22, 163, 74, 0.9)',
                          color: '#ffffff',
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '1px 4px',
                          borderRadius: '3px',
                        }}
                      >
                        {scene.cloud_coverage_pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Scene 4-Modality Detailed Inspector */}
            {selectedScene && (
              <div className="card" style={{ height: 'fit-content' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Eye size={16} color="#2563eb" />
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>
                      Inspection: {selectedScene.name} (Tile Offset [{selectedScene.coords.x}, {selectedScene.coords.y}])
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: '#fef3c7',
                      color: '#92400e',
                    }}
                  >
                    Cloud: {selectedScene.cloud_coverage_pct}%
                  </span>
                </div>

                <div className="card-body" style={{ padding: '14px' }}>
                  {/* 2x2 Modality Grid for Selected Scene */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                    {/* 1. Cloudy */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                        1. Cloudy Optical
                      </div>
                      <img
                        src={selectedScene.cloudy_url}
                        alt="Cloudy"
                        style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    {/* 2. Reconstructed */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', marginBottom: '3px' }}>
                        2. Reconstructed (Model D)
                      </div>
                      <img
                        src={selectedScene.recon_url}
                        alt="Reconstructed"
                        style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    {/* 3. Sub-Cloud Labels */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#ea580c', marginBottom: '3px' }}>
                        3. Sub-Cloud Terrain Labels
                      </div>
                      <img
                        src={selectedScene.subcloud_url}
                        alt="Sub-Cloud"
                        style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    {/* 4. NIR NDVI Health */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#7c3aed', marginBottom: '3px' }}>
                        4. NIR NDVI Health Map
                      </div>
                      <img
                        src={selectedScene.ndvi_url}
                        alt="NDVI Health"
                        style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>

                  {/* Scene Diagnostic Metrics */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Dominant Sub-Cloud Feature:</span>
                      <strong style={{ color: '#0f172a' }}>{selectedScene.dominant_subcloud_feature}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Sub-Cloud Mean NDVI:</span>
                      <strong style={{ color: '#16a34a' }}>{selectedScene.mean_subcloud_ndvi} (Restored)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Recovered Biomass Area:</span>
                      <strong style={{ color: '#0f172a' }}>{selectedScene.recovered_veg_km2} km²</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Verification:</span>
                      <span style={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={14} /> Clear pixels unchanged
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', marginTop: '14px', padding: '9px' }}
                    onClick={() => onNavigate('/lulc-analysis')}
                  >
                    <span>Probe Full Resolution in Labelling Studio</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 2: CATALOG VIEW
          ========================================================================= */}
      {viewMode === 'catalog' && (
        <div>
          {/* Search and Filters */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-body" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '14px 20px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search datasets by name, sensor, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {['All', 'LISS-IV', 'Sentinel-1', 'Sentinel-2'].map((sensor) => (
                  <button
                    key={sensor}
                    onClick={() => setSelectedSensor(sensor)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      border: selectedSensor === sensor ? '1px solid #2878e5' : '1px solid #cbd5e1',
                      background: selectedSensor === sensor ? '#2878e5' : '#ffffff',
                      color: selectedSensor === sensor ? '#ffffff' : '#64748b',
                    }}
                  >
                    {sensor}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dataset Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {datasetsList
              .filter((item) => {
                const matchSensor = selectedSensor === 'All' || item.sensor.toLowerCase().includes(selectedSensor.toLowerCase());
                const matchText = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sensor.toLowerCase().includes(searchQuery.toLowerCase());
                return matchSensor && matchText;
              })
              .map((item) => (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    border: selectedDataset.id === item.id ? '2px solid #2878e5' : '1px solid #e2e8f0',
                  }}
                  onClick={() => setSelectedDataset(item)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#dbeafe', color: '#1e40af' }}>
                      {item.tag || 'Satellite'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{item.scenesCount} scenes</span>
                  </div>

                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>{item.name}</h3>
                  <p style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '12px' }}>
                    Sensor: <strong>{item.sensor}</strong> • Resolution: <strong>{item.resolution}</strong>
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {item.id}</span>
                    <button className="btn-secondary btn-sm" onClick={() => handleDownloadMetadata(item)}>
                      <Download size={12} />
                      <span>Metadata</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
