import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, ChevronDown, Menu, User, Settings, LogOut, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Topbar({ onToggleMobileMenu, onNavigate }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Inference Complete',
      message: 'Scene Assam_12JUN2023 reconstructed with PSNR 39.67 dB',
      time: '10m ago',
      read: false,
    },
    {
      id: 2,
      type: 'info',
      title: 'Pipeline Status Nominal',
      message: 'Model D quality-aware diffusion ready on CPU/CUDA engine',
      time: '25m ago',
      read: false,
    },
    {
      id: 3,
      type: 'info',
      title: 'Dataset Verified',
      message: 'ISRO LISS-IV Assam Monsoon 2023 mosaic validated',
      time: '1h ago',
      read: false,
    },
  ]);

  const searchRef = useRef(null);
  const notifRef = useRef(null);

  const searchableItems = [
    { label: 'Dashboard Workspace', route: '/dashboard', category: 'Navigation' },
    { label: 'Cloud Removal Pipeline (Model D)', route: '/cloud-removal', category: 'Tool' },
    { label: 'Image Comparison & ROI Splitter', route: '/comparison', category: 'Tool' },
    { label: 'Land Use / Land Cover (LULC) Analysis', route: '/lulc-analysis', category: 'Tool' },
    { label: 'Batch Processing Queue', route: '/batch-processing', category: 'Tool' },
    { label: 'Geospatial Datasets Explorer', route: '/datasets', category: 'Data' },
    { label: 'Visualizations & Performance Trends', route: '/visualizations', category: 'Analytics' },
    { label: 'Saved Geospatial Projects', route: '/projects', category: 'Projects' },
    { label: 'LISS-IV Brahmaputra Basin Scene', route: '/comparison', category: 'Dataset' },
    { label: 'Assam Tea Plantation Floodplain', route: '/lulc-analysis', category: 'Dataset' },
    { label: 'System Documentation & Benchmark Papers', route: '/documentation', category: 'Docs' },
    { label: 'API Reference & Python SDK', route: '/api-access', category: 'Developer' },
  ];

  const filteredItems = searchTerm.trim()
    ? searchableItems.filter((item) =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Close menus on outside click or ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSearchResults(false);
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const handleSelectSearchResult = (route) => {
    setShowSearchResults(false);
    setSearchTerm('');
    onNavigate(route);
  };

  return (
    <header className="app-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          className="btn-icon"
          onClick={onToggleMobileMenu}
          style={{ display: 'none' }} // Visible on mobile via CSS
          id="mobile-menu-btn"
        >
          <Menu size={18} />
        </button>

        {/* Global Search */}
        <div className="topbar-search" ref={searchRef} style={{ position: 'relative' }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search datasets, locations, or tools..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => {
              if (searchTerm.trim()) setShowSearchResults(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (filteredItems.length > 0) {
                  handleSelectSearchResult(filteredItems[0].route);
                } else if (searchTerm.trim()) {
                  handleSelectSearchResult('/datasets');
                }
              }
            }}
            id="topbar-global-search-input"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setShowSearchResults(false);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', color: '#94a3b8' }}
            >
              <X size={14} />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showSearchResults && searchTerm.trim() && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '6px',
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-lg)',
                padding: '6px',
                zIndex: 60,
                maxHeight: '320px',
                overflowY: 'auto',
              }}
            >
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSearchResult(item.route)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12.5px',
                      color: '#1e293b',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                    <span
                      style={{
                        fontSize: '10.5px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        color: '#64748b',
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                  No matching tools or scenes found. Press enter to search Datasets.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Topbar Actions */}
      <div className="topbar-actions">
        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className="btn-icon"
            style={{ position: 'relative' }}
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            id="topbar-notifications-btn"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                }}
              />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '320px',
                background: '#ffffff',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-lg)',
                padding: '12px',
                zIndex: 60,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                  System Notifications {unreadCount > 0 && `(${unreadCount})`}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{ background: 'none', border: 'none', color: '#2878e5', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Mark read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {notifications.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        background: item.read ? '#ffffff' : '#f8fafc',
                        border: '1px solid #f1f5f9',
                        fontSize: '11.5px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{item.title}</span>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{item.time}</span>
                      </div>
                      <p style={{ color: '#64748b', margin: 0, lineHeight: 1.4 }}>{item.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                  No new notifications
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div style={{ position: 'relative' }}>
          <div
            className="user-profile-badge"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">A</div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
              Anirudh
            </span>
            <ChevronDown size={14} color="#64748b" />
          </div>

          {/* User Dropdown */}
          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '180px',
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-lg)',
                padding: '4px',
                zIndex: 50,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '12.5px',
                  color: '#334155',
                  cursor: 'pointer',
                  borderRadius: '6px',
                }}
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('/profile');
                }}
              >
                <User size={14} /> Profile
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '12.5px',
                  color: '#334155',
                  cursor: 'pointer',
                  borderRadius: '6px',
                }}
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('/settings');
                }}
              >
                <Settings size={14} /> Settings
              </div>
              <div
                style={{
                  height: '1px',
                  background: '#f1f5f9',
                  margin: '4px 0',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '12.5px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  borderRadius: '6px',
                }}
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('/');
                }}
              >
                <LogOut size={14} /> Log Out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
