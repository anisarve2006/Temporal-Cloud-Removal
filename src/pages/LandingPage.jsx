import React, { useState } from 'react';
import {
  Zap,
  ArrowRight,
  CloudLightning,
  GitCompare,
  Layers,
  Database,
  Upload,
  ChevronDown,
  Sprout,
  Waves,
  Trees,
} from 'lucide-react';
import ComparisonViewer from '../components/satellite/ComparisonViewer';
import { SATELLITE_ASSETS, PRIMARY_SCENE_INFO } from '../data/mockData';

export default function LandingPage({ onNavigate }) {
  const [activeHeroTab, setActiveHeroTab] = useState('cloud-removal');
  const [selectedMode, setSelectedMode] = useState('Natural True Color (RGB)');
  const [isProcessing, setIsProcessing] = useState(false);

  const heroTabs = [
    { id: 'cloud-removal', label: 'Cloud Removal', icon: CloudLightning },
    { id: 'image-comparison', label: 'Image Comparison', icon: GitCompare },
    { id: 'lulc-analysis', label: 'LULC Analysis', icon: Layers },
    { id: 'explore-dataset', label: 'Explore Dataset', icon: Database },
  ];

  const handleHeroAction = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onNavigate('/dashboard');
    }, 800);
  };

  return (
    <div className="landing-page">
      {/* Top Navbar */}
      <header className="landing-header">
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => onNavigate('/')}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(168, 240, 74, 0.15)',
              border: '1px solid #a8f04a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={15} color="#a8f04a" />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.08em', color: '#ffffff' }}>
            CLOUDLESS AI
          </span>
        </div>

        <nav className="landing-nav-links">
          <span className="landing-nav-link active" onClick={() => onNavigate('/')}>
            Home
          </span>
          <span className="landing-nav-link" onClick={() => onNavigate('/how-it-works')}>
            How it Works
          </span>
          <span className="landing-nav-link" onClick={() => onNavigate('/comparison')}>
            Explore Results
          </span>
          <span className="landing-nav-link" onClick={() => onNavigate('/datasets')}>
            Datasets
          </span>
          <span className="landing-nav-link" onClick={() => onNavigate('/use-cases')}>
            Use Cases
          </span>
          <span className="landing-nav-link" onClick={() => onNavigate('/about')}>
            About
          </span>
        </nav>

        <button
          className="btn-primary"
          style={{ borderRadius: 'var(--radius-pill)', padding: '8px 20px', fontSize: '13px' }}
          onClick={() => onNavigate('/dashboard')}
        >
          <span>Get Started</span>
          <ArrowRight size={14} />
        </button>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '40px 48px 60px 48px', maxWidth: '1440px', margin: '0 auto' }}>
        <div style={{ textAlign: 'right', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.15em', fontWeight: 700, color: '#94a3b8' }}>
            AI FOR A CLEARER PLANET <span style={{ color: '#a8f04a' }}>──</span>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.35fr', gap: '48px', alignItems: 'center' }}>
          {/* Left Column: Headline, Copy, CTAs, Metrics */}
          <div>
            {/* Pill Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#091c2e',
                border: '1px solid #1a3a5c',
                borderRadius: '9999px',
                padding: '4px 14px',
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: '24px',
              }}
            >
              <span>ISRO LISS-IV</span>
              <span style={{ color: '#a8f04a' }}>×</span>
              <span>Sentinel-1 SAR</span>
              <span style={{ color: '#a8f04a' }}>×</span>
              <span>Generative AI</span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: '56px',
                lineHeight: 1.05,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: '#ffffff',
                marginBottom: '20px',
                textTransform: 'uppercase',
              }}
            >
              SEE WHAT <br />
              <span style={{ color: '#a8f04a' }}>THE CLOUDS</span> <br />
              HIDE
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.6,
                color: '#94a3b8',
                maxWidth: '480px',
                marginBottom: '32px',
              }}
            >
              Cloudless AI reconstructs cloud-covered satellite imagery using multi-modal AI,
              combining optical, SAR and temporal data to reveal clear, analysis-ready LISS-IV images.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
              <button
                className="btn-primary"
                style={{ borderRadius: 'var(--radius-pill)', padding: '12px 24px', fontSize: '14px' }}
                onClick={() => onNavigate('/dashboard')}
              >
                <span>Try Cloud Removal</span>
                <ArrowRight size={16} />
              </button>
              <button
                style={{
                  background: '#0c1b2e',
                  color: '#f8fafc',
                  border: '1px solid #1d3b5c',
                  borderRadius: 'var(--radius-pill)',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => onNavigate('/comparison')}
              >
                View Results
              </button>
            </div>

            {/* Metrics Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '24px',
              }}
            >
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#a8f04a', fontFamily: 'var(--font-mono)' }}>
                  80.98%
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  Avg. Cloud Coverage in Test Scenes
                </div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#a8f04a', fontFamily: 'var(--font-mono)' }}>
                  +37.68%
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  LULC Consistency Gain
                </div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#a8f04a', fontFamily: 'var(--font-mono)' }}>
                  39.67 dB
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  Reconstruction PSNR
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Interactive Workspace Card */}
          <div
            style={{
              background: '#071626',
              border: '1px solid #132f4c',
              borderRadius: '14px',
              padding: '16px',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Tabs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                background: '#040d18',
                padding: '4px',
                borderRadius: '8px',
                marginBottom: '14px',
              }}
            >
              {heroTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeHeroTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveHeroTab(tab.id);
                      if (tab.id === 'image-comparison') onNavigate('/comparison');
                      if (tab.id === 'lulc-analysis') onNavigate('/lulc-analysis');
                      if (tab.id === 'explore-dataset') onNavigate('/datasets');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: isActive ? '1px solid #a8f04a' : '1px solid transparent',
                      background: isActive ? '#0e2920' : 'transparent',
                      color: isActive ? '#a8f04a' : '#94a3b8',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Upload & Control Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr auto',
                gap: '12px',
                alignItems: 'center',
                background: '#0b1d30',
                border: '1px solid #16385a',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Upload size={18} color="#a8f04a" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>
                    Upload LISS-IV Image
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    TIFF, GeoTIFF, or PNG (Max 200 MB)
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>
                  Select Mode
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    setSelectedMode(
                      selectedMode.includes('RGB') ? 'False Color Composite (FCC)' : 'Natural True Color (RGB)'
                    )
                  }
                >
                  <span>{selectedMode}</span>
                  <ChevronDown size={14} color="#94a3b8" />
                </div>
              </div>

              <button
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '12px', whiteSpace: 'nowrap' }}
                onClick={handleHeroAction}
              >
                <span>{isProcessing ? 'Processing...' : 'Process Image'}</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Interactive Split Comparison Viewer */}
            <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #16385a' }}>
              <ComparisonViewer
                beforeImage={SATELLITE_ASSETS.cloudy}
                afterImage={
                  selectedMode.includes('FCC') ? SATELLITE_ASSETS.fcc : SATELLITE_ASSETS.reconstructed
                }
                beforeLabel="Input (Cloudy)"
                afterLabel="Reconstructed (Cloud-Free)"
                metaLeft={`LISS-IV (${selectedMode.includes('FCC') ? 'FCC' : 'Natural RGB'}) | Cloud Coverage: 80.98%`}
                metaRight="PSNR: 39.67 dB | SSIM: 0.9834 | SAM: 1.6°"
                showScale={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section: Why Cloudless AI Matters */}
      <section style={{ padding: '60px 48px 80px 48px', maxWidth: '1440px', margin: '0 auto', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.15em', fontWeight: 700, color: '#a8f04a' }}>
            FROM OBSCURED TO OPPORTUNITY ──
          </span>
        </div>
        <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#ffffff', marginBottom: '12px' }}>
          Why Cloudless AI Matters
        </h2>
        <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '640px', marginBottom: '40px' }}>
          Persistent cloud cover in tropical and monsoon regions limits the usability of satellite data.
          Our AI-powered reconstruction unlocks clear, reliable and analysis-ready imagery.
        </p>

        {/* 3 Domain Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {/* Card 1: Agriculture */}
          <div
            style={{
              background: '#071626',
              border: '1px solid #132f4c',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(168, 240, 74, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sprout size={16} color="#a8f04a" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                  Agriculture Monitoring
                </h3>
                <p style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                  Track crop health and land use with clear imagery
                </p>
              </div>
            </div>

            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #16385a' }}>
              <ComparisonViewer
                beforeImage={SATELLITE_ASSETS.cropAgriBefore}
                afterImage={SATELLITE_ASSETS.cropAgriAfter}
                beforeLabel="Before (Cloudy)"
                afterLabel="After (Reconstructed)"
                showMetaBottom={false}
                showScale={false}
                zoomable={false}
              />
            </div>
          </div>

          {/* Card 2: Disaster Response */}
          <div
            style={{
              background: '#071626',
              border: '1px solid #132f4c',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(40, 120, 229, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Waves size={16} color="#2878e5" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                  Disaster Response
                </h3>
                <p style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                  Get timely insights during floods and natural disasters
                </p>
              </div>
            </div>

            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #16385a' }}>
              <ComparisonViewer
                beforeImage={SATELLITE_ASSETS.cropDisasterBefore}
                afterImage={SATELLITE_ASSETS.cropDisasterAfter}
                beforeLabel="Before (Cloudy)"
                afterLabel="After (Reconstructed)"
                showMetaBottom={false}
                showScale={false}
                zoomable={false}
              />
            </div>
          </div>

          {/* Card 3: Environmental Analysis */}
          <div
            style={{
              background: '#071626',
              border: '1px solid #132f4c',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(22, 163, 74, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trees size={16} color="#16a34a" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                  Environmental Analysis
                </h3>
                <p style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                  Monitor forests, wetlands and urban expansion
                </p>
              </div>
            </div>

            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #16385a' }}>
              <ComparisonViewer
                beforeImage={SATELLITE_ASSETS.cropEnvBefore}
                afterImage={SATELLITE_ASSETS.cropEnvAfter}
                beforeLabel="Before (Cloudy)"
                afterLabel="After (Reconstructed)"
                showMetaBottom={false}
                showScale={false}
                zoomable={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '40px 48px',
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#64748b',
          fontSize: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={14} color="#a8f04a" />
          <span style={{ color: '#ffffff', fontWeight: 700 }}>CLOUDLESS AI</span>
          <span>— Earth Observation Intelligence Platform</span>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/documentation')}>Documentation</span>
          <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/api-access')}>API Reference</span>
          <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/datasets')}>ISRO LISS-IV Archive</span>
          <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/about')}>Research & Credits</span>
        </div>
      </footer>
    </div>
  );
}
