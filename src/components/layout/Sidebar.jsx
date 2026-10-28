import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CloudLightning,
  GitCompare,
  Layers,
  Cpu,
  Database,
  BarChart3,
  FolderKanban,
  HelpCircle,
  FileText,
  Compass,
  Code,
  Zap,
  CheckCircle2,
  X,
  CreditCard,
} from 'lucide-react';

export default function Sidebar({ currentRoute = '/dashboard', onNavigate }) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState('enterprise');
  const [credits, setCredits] = useState(78);
  const [notification, setNotification] = useState('');

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showUpgradeModal) {
        setShowUpgradeModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showUpgradeModal]);

  const mainNav = [
    { id: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/cloud-removal', label: 'Cloud Removal', icon: CloudLightning },
    { id: '/comparison', label: 'Image Comparison', icon: GitCompare },
    { id: '/lulc-analysis', label: 'LULC Analysis', icon: Layers },
    { id: '/batch-processing', label: 'Batch Processing', icon: Cpu },
    { id: '/datasets', label: 'Datasets', icon: Database },
    { id: '/visualizations', label: 'Visualizations', icon: BarChart3 },
    { id: '/projects', label: 'Saved Projects', icon: FolderKanban },
  ];

  const resourceNav = [
    { id: '/how-it-works', label: 'How it Works', icon: HelpCircle },
    { id: '/documentation', label: 'Documentation', icon: FileText },
    { id: '/use-cases', label: 'Use Cases', icon: Compass },
    { id: '/api-access', label: 'API Access', icon: Code },
  ];

  const handleTopUpCredits = () => {
    setCredits((c) => Math.min(100, c + 20));
    setNotification('Successfully added +20 processing credits to your workspace.');
    setTimeout(() => setNotification(''), 4000);
  };

  const handlePlanChange = (tier) => {
    setSelectedTier(tier);
    setNotification(`Plan successfully set to ${tier.toUpperCase()}. Features active.`);
    setTimeout(() => setNotification(''), 4000);
  };

  return (
    <>
      <aside className="app-sidebar">
        {/* Brand Header */}
        <div
          className="sidebar-logo"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('/')}
          title="Go to Landing Page"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(168, 240, 74, 0.15)', border: '1px solid #a8f04a' }}>
            <Zap size={14} color="#a8f04a" />
          </div>
          <span style={{ letterSpacing: '0.08em', fontWeight: 800 }}>CLOUDLESS AI</span>
        </div>

        {/* Main Navigation Links */}
        <div className="sidebar-nav">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <div
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
                style={{ cursor: 'pointer' }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </div>
            );
          })}

          {/* Resources Section */}
          <div className="nav-section-label">Resources</div>
          {resourceNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <div
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
                style={{ cursor: 'pointer' }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Processing Credits Card */}
        <div className="sidebar-credits-card">
          <div className="sidebar-credits-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a8f04a' }}></span>
              Processing Credits
            </span>
            <span style={{ fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
              {credits} / 100
            </span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${credits}%` }}></div>
          </div>
          <button
            className="btn-upgrade-plan"
            onClick={() => setShowUpgradeModal(true)}
            id="sidebar-upgrade-plan-btn"
          >
            Upgrade Plan
          </button>
        </div>
      </aside>

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowUpgradeModal(false);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '640px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  Cloudless AI Subscription & Compute
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                  Scale multi-modal satellite cloud removal with high-throughput GPU inference
                </p>
              </div>
              <button
                className="btn-icon"
                onClick={() => setShowUpgradeModal(false)}
                title="Close Modal"
              >
                <X size={18} />
              </button>
            </div>

            {notification && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle2 size={16} />
                <span>{notification}</span>
              </div>
            )}

            {/* Plans Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {/* Starter */}
              <div
                onClick={() => handlePlanChange('starter')}
                style={{
                  border: selectedTier === 'starter' ? '2px solid #2878e5' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  background: selectedTier === 'starter' ? '#f0f7ff' : '#ffffff',
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Research Starter</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#2878e5', margin: '6px 0' }}>Free</div>
                <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>
                  25 scene credits / mo<br />
                  Model B (U-Net)<br />
                  Single-thread queue
                </div>
              </div>

              {/* Pro */}
              <div
                onClick={() => handlePlanChange('pro')}
                style={{
                  border: selectedTier === 'pro' ? '2px solid #2878e5' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  background: selectedTier === 'pro' ? '#f0f7ff' : '#ffffff',
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Geospatial Pro</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#2878e5', margin: '6px 0' }}>$49/mo</div>
                <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>
                  150 scene credits / mo<br />
                  Model C (Cross-Modal)<br />
                  Priority batch processing
                </div>
              </div>

              {/* Enterprise */}
              <div
                onClick={() => handlePlanChange('enterprise')}
                style={{
                  border: selectedTier === 'enterprise' ? '2px solid #16a34a' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  background: selectedTier === 'enterprise' ? '#f0fdf4' : '#ffffff',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '-9px',
                    right: '10px',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontSize: '9.5px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  Active
                </span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>ISRO Enterprise</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a', margin: '6px 0' }}>Custom</div>
                <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>
                  Unlimited GPU scenes<br />
                  Model D (Quality-Aware)<br />
                  Conformal Confidence rasters
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Current balance: <strong style={{ color: '#0f172a' }}>{credits} credits remaining</strong>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn-secondary"
                  onClick={handleTopUpCredits}
                  id="top-up-credits-btn"
                >
                  <CreditCard size={14} />
                  <span>Top-up 20 Credits</span>
                </button>
                <button
                  className="btn-primary"
                  onClick={() => setShowUpgradeModal(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
