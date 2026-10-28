// Cloudless AI Coordinated Data Model & Verified Remote Sensing Information

export const SATELLITE_ASSETS = {
  cloudy: '/images/satellite/satellite-cloudy.jpg',
  clear: '/images/satellite/satellite-clear-reference-demo.jpg',
  reconstructed: '/images/satellite/satellite-reconstructed-demo.jpg',
  sar: '/images/satellite/satellite-sar-demo.jpg',
  fcc: '/images/satellite/satellite-fcc-demo.jpg',
  temporal: '/images/satellite/satellite-temporal-demo.jpg',
  mask: '/images/satellite/cloud-shadow-mask-demo.png',
  confidence: '/images/satellite/confidence-map-demo.png',
  lulcCloudy: '/images/satellite/lulc-original-demo.png',
  lulcReconstructed: '/images/satellite/lulc-reconstructed-demo.png',
  cropAgriBefore: '/images/satellite/crop-agri-before.jpg',
  cropAgriAfter: '/images/satellite/crop-agri-after.jpg',
  cropDisasterBefore: '/images/satellite/crop-disaster-before.jpg',
  cropDisasterAfter: '/images/satellite/crop-disaster-after.jpg',
  cropEnvBefore: '/images/satellite/crop-env-before.jpg',
  cropEnvAfter: '/images/satellite/crop-env-after.jpg',
};

export const PRIMARY_SCENE_INFO = {
  id: 'LISS4_20230612_ASSAM_01',
  sensor: 'ISRO LISS-IV (Resourcesat-2A)',
  resolution: '5.0 m',
  bands: '3 (Green: B2, Red: B3, NIR: B4)',
  captureDate: '12-JUN-2023',
  referenceDate: '01-NOV-2023',
  location: 'Assam, India',
  region: 'Brahmaputra Valley',
  crs: 'EPSG:32646 (UTM Zone 46N)',
  fileSize: '~ 145 MB (GeoTIFF)',
  cloudCoverage: 80.98,
  metrics: {
    psnr: 39.67,
    ssim: 0.9834,
    sam: 1.6,
    ndviMae: 0.1142,
    lulcGain: 37.68,
    reconstructedAccuracy: 73.26,
    originalAccuracy: 3.69
  }
};

export const HISTORICAL_PROCESSING_DATA = [
  {
    id: 1,
    date: '12-JUN-2023',
    location: 'Assam, India',
    cloudCoverage: '80.98%',
    mode: 'RGB',
    psnr: '39.67',
    ssim: '0.9834',
    sam: '1.6°',
    status: 'Completed',
    model: 'Multi-Modal (SAR + Temporal)',
    time: '2m 14s'
  },
  {
    id: 2,
    date: '05-MAY-2023',
    location: 'Meghalaya, India',
    cloudCoverage: '72.41%',
    mode: 'RGB',
    psnr: '37.12',
    ssim: '0.9761',
    sam: '2.4°',
    status: 'Completed',
    model: 'Multi-Modal (SAR + Temporal)',
    time: '2m 38s'
  },
  {
    id: 3,
    date: '18-APR-2023',
    location: 'Arunachal Pradesh',
    cloudCoverage: '67.30%',
    mode: 'FCC',
    psnr: '34.21',
    ssim: '0.9652',
    sam: '3.8°',
    status: 'Completed',
    model: 'SAR-Guided Diffuser',
    time: '3m 05s'
  },
  {
    id: 4,
    date: '28-MAR-2023',
    location: 'Nagaland, India',
    cloudCoverage: '84.15%',
    mode: 'RGB',
    psnr: '38.45',
    ssim: '0.9790',
    sam: '1.9°',
    status: 'Completed',
    model: 'Multi-Modal (SAR + Temporal)',
    time: '2m 20s'
  },
  {
    id: 5,
    date: '10-FEB-2023',
    location: 'Mizoram, India',
    cloudCoverage: '59.20%',
    mode: 'RGB',
    psnr: '40.12',
    ssim: '0.9882',
    sam: '1.4°',
    status: 'Completed',
    model: 'Multi-Modal (SAR + Temporal)',
    time: '1m 55s'
  }
];

export const SPECTRAL_ANALYSIS_DATA = {
  bands: [
    { name: 'Green (B3)', wavelength: '0.52 - 0.59 µm', original: 0.12, reconstructed: 0.11, reference: 0.10 },
    { name: 'Red (B2)', wavelength: '0.62 - 0.68 µm', original: 0.18, reconstructed: 0.17, reference: 0.16 },
    { name: 'NIR (B4)', wavelength: '0.77 - 0.86 µm', original: 0.62, reconstructed: 0.59, reference: 0.58 }
  ],
  curvePoints: [
    { wl: 0.50, orig: 0.11, recon: 0.10, ref: 0.09 },
    { wl: 0.55, orig: 0.13, recon: 0.12, ref: 0.11 },
    { wl: 0.60, orig: 0.15, recon: 0.14, ref: 0.13 },
    { wl: 0.65, orig: 0.20, recon: 0.19, ref: 0.18 },
    { wl: 0.70, orig: 0.38, recon: 0.35, ref: 0.34 },
    { wl: 0.75, orig: 0.58, recon: 0.54, ref: 0.53 },
    { wl: 0.80, orig: 0.68, recon: 0.63, ref: 0.62 },
    { wl: 0.85, orig: 0.74, recon: 0.67, ref: 0.66 },
    { wl: 0.90, orig: 0.76, recon: 0.69, ref: 0.67 }
  ]
};

export const LULC_CLASSES = [
  { id: 'water', name: 'Water Bodies', color: '#2563eb', areaKm2: 38.2, percent: 7.9, cloudyArea: 8.2 },
  { id: 'forest', name: 'Dense Forest', color: '#166534', areaKm2: 68.1, percent: 14.1, cloudyArea: 12.4 },
  { id: 'vegetation', name: 'Sparse Vegetation', color: '#86efac', areaKm2: 98.0, percent: 20.3, cloudyArea: 18.6 },
  { id: 'agriculture', name: 'Agriculture / Cropland', color: '#eab308', areaKm2: 152.8, percent: 31.7, cloudyArea: 28.1 },
  { id: 'builtup', name: 'Built-up / Urban', color: '#ef4444', areaKm2: 34.2, percent: 7.1, cloudyArea: 6.3 },
  { id: 'barren', name: 'Barren Land', color: '#d97706', areaKm2: 32.8, percent: 6.8, cloudyArea: 9.4 },
  { id: 'wetlands', name: 'Wetlands', color: '#c084fc', areaKm2: 14.5, percent: 3.0, cloudyArea: 3.1 },
  { id: 'others', name: 'Others', color: '#94a3b8', areaKm2: 43.7, percent: 9.1, cloudyArea: 13.9 }
];

export const CONFUSION_MATRIX_DATA = {
  labels: ['Water', 'Forest', 'Veg', 'Agri', 'Built', 'Barren', 'Wet', 'Others'],
  matrix: [
    [0.91, 0.02, 0.01, 0.01, 0.00, 0.01, 0.03, 0.01],
    [0.01, 0.86, 0.06, 0.02, 0.01, 0.01, 0.01, 0.02],
    [0.01, 0.07, 0.80, 0.08, 0.01, 0.01, 0.01, 0.01],
    [0.00, 0.03, 0.06, 0.86, 0.02, 0.01, 0.01, 0.01],
    [0.00, 0.01, 0.02, 0.03, 0.87, 0.04, 0.01, 0.02],
    [0.01, 0.01, 0.02, 0.04, 0.06, 0.83, 0.01, 0.02],
    [0.02, 0.01, 0.02, 0.02, 0.01, 0.01, 0.87, 0.04],
    [0.01, 0.02, 0.02, 0.02, 0.01, 0.03, 0.04, 0.85]
  ]
};

export const BATCH_JOBS_DATA = [
  {
    id: 'SCENE_2023_0612_01',
    location: 'Assam Valley, IN',
    date: '12-JUN-2023',
    cloudCoverage: 80.98,
    mode: 'RGB',
    status: 'Completed',
    progress: 100,
    psnr: '39.67 dB',
    ssim: '0.9834',
    sam: '1.6°',
    lulcGain: '+37.68%'
  },
  {
    id: 'SCENE_2023_0614_02',
    location: 'Shillong Plateau, IN',
    date: '14-JUN-2023',
    cloudCoverage: 74.32,
    mode: 'RGB',
    status: 'Completed',
    progress: 100,
    psnr: '38.15 dB',
    ssim: '0.9782',
    sam: '2.1°',
    lulcGain: '+34.12%'
  },
  {
    id: 'SCENE_2023_0618_03',
    location: 'Dibrugarh Basin, IN',
    date: '18-JUN-2023',
    cloudCoverage: 89.45,
    mode: 'FCC',
    status: 'Processing',
    progress: 68,
    psnr: '--',
    ssim: '--',
    sam: '--',
    lulcGain: '--'
  },
  {
    id: 'SCENE_2023_0620_04',
    location: 'Tezpur Sector, IN',
    date: '20-JUN-2023',
    cloudCoverage: 62.10,
    mode: 'RGB',
    status: 'Queued',
    progress: 0,
    psnr: '--',
    ssim: '--',
    sam: '--',
    lulcGain: '--'
  },
  {
    id: 'SCENE_2023_0622_05',
    location: 'Guwahati East, IN',
    date: '22-JUN-2023',
    cloudCoverage: 91.20,
    mode: 'RGB',
    status: 'Queued',
    progress: 0,
    psnr: '--',
    ssim: '--',
    sam: '--',
    lulcGain: '--'
  }
];

export const DATASET_CATALOG = [
  {
    id: 'DS_LISS4_ASSAM_2023',
    name: 'ISRO Resourcesat-2A LISS-IV Northeast Archive',
    sensor: 'LISS-IV (MX)',
    resolution: '5.0 m',
    scenesCount: 142,
    dateRange: 'Jan 2023 - Oct 2023',
    avgCloudCover: '68.4%',
    format: 'GeoTIFF (COG)',
    size: '18.4 GB',
    tag: 'Primary Optical'
  },
  {
    id: 'DS_S1_GRD_IW_2023',
    name: 'Sentinel-1 C-Band SAR Dual-Pol (VV+VH) IW',
    sensor: 'Sentinel-1A / 1B',
    resolution: '10.0 m',
    scenesCount: 96,
    dateRange: 'Jan 2023 - Dec 2023',
    avgCloudCover: '0.0% (Radar)',
    format: 'GeoTIFF / SAFE',
    size: '42.1 GB',
    tag: 'SAR Guidance'
  },
  {
    id: 'DS_LISS4_TEMPORAL_REF',
    name: 'LISS-IV Post-Monsoon Cloud-Free Reference Mosaic',
    sensor: 'LISS-IV (MX)',
    resolution: '5.0 m',
    scenesCount: 38,
    dateRange: 'Nov 2023 - Dec 2023',
    avgCloudCover: '< 5%',
    format: 'GeoTIFF Mosaic',
    size: '9.2 GB',
    tag: 'Temporal Prior'
  }
];
