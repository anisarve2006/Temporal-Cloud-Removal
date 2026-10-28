import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  Plus,
  Calendar,
  MapPin,
  Clock,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Copy,
  Edit,
  ArrowRight,
} from 'lucide-react';
import { SATELLITE_ASSETS } from '../data/mockData';

export default function ProjectsPage({ onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [projects, setProjects] = useState([
    {
      id: 'PRJ-01',
      name: 'Assam Brahmaputra Basin Cloud Removal',
      region: 'Assam, Northeast India',
      scenes: 18,
      status: 'Active',
      lastUpdated: '12-JUN-2023',
      createdDate: '10-MAY-2023',
      meanPsnr: '39.67 dB',
      img: SATELLITE_ASSETS.cropDisasterAfter,
    },
    {
      id: 'PRJ-02',
      name: 'Meghalaya Plateau LULC Analysis',
      region: 'Meghalaya, India',
      scenes: 8,
      status: 'Completed',
      lastUpdated: '05-MAY-2023',
      createdDate: '14-APR-2023',
      meanPsnr: '37.12 dB',
      img: SATELLITE_ASSETS.cropEnvAfter,
    },
    {
      id: 'PRJ-03',
      name: 'Arunachal Mountain Valley Infrastructure',
      region: 'Arunachal Pradesh, India',
      scenes: 12,
      status: 'Active',
      lastUpdated: '18-APR-2023',
      createdDate: '01-APR-2023',
      meanPsnr: '34.21 dB',
      img: SATELLITE_ASSETS.cropAgriAfter,
    },
    {
      id: 'PRJ-04',
      name: 'Nagaland Forest Canopy Preservation',
      region: 'Nagaland, India',
      scenes: 6,
      status: 'Archived',
      lastUpdated: '28-MAR-2023',
      createdDate: '15-FEB-2023',
      meanPsnr: '38.45 dB',
      img: SATELLITE_ASSETS.reconstructed,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectRegion, setNewProjectRegion] = useState('');

  const showToast = (title, desc) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      showToast('Project Removed', `Deleted "${name}".`);
    }
  };

  const handleDuplicate = (proj) => {
    const copy = {
      ...proj,
      id: `PRJ-0${projects.length + 1}`,
      name: `${proj.name} (Copy)`,
      lastUpdated: 'Just now',
    };
    setProjects([copy, ...projects]);
    showToast('Project Duplicated', `Created "${copy.name}".`);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      showToast('Validation Failed', 'Project name is required.', 'error');
      return;
    }
    const newProj = {
      id: `PRJ-0${projects.length + 1}`,
      name: newProjectName.trim(),
      region: newProjectRegion.trim() || 'Assam, India',
      scenes: 1,
      status: 'Active',
      lastUpdated: 'Just now',
      createdDate: 'Today',
      meanPsnr: '39.67 dB',
      img: SATELLITE_ASSETS.cropAgriAfter,
    };
    setProjects([newProj, ...projects]);
    setShowCreateModal(false);
    setNewProjectName('');
    setNewProjectRegion('');
    showToast('Project Created', `Workspace "${newProj.name}" created successfully.`);
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
          <h1 className="page-title">Saved Geospatial Projects</h1>
          <p className="page-subtitle">
            Manage your satellite scenes, reconstructed archives, and land-cover classification workflows
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
          id="projects-create-new-btn"
        >
          <Plus size={14} />
          <span>Create New Project</span>
        </button>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
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
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
              Create New Geospatial Project
            </h3>
            <form onSubmit={handleCreateSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Northeast Monsoon Flood Reconstruction"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                  Target Region
                </label>
                <input
                  type="text"
                  placeholder="e.g., Assam, Northeast India"
                  value={newProjectRegion}
                  onChange={(e) => setNewProjectRegion(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '12px 18px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', width: '320px' }}>
            <Search size={14} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search projects by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['All', 'Active', 'Completed', 'Archived'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '5px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  border: statusFilter === status ? '1px solid #16a34a' : '1px solid #cbd5e1',
                  background: statusFilter === status ? '#f0fdf4' : '#ffffff',
                  color: statusFilter === status ? '#15803d' : '#475569',
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
        {filtered.map((proj) => (
          <div
            key={proj.id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              transition: 'box-shadow 0.15s ease',
            }}
          >
            <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
              <img
                src={proj.img}
                alt={proj.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: proj.status === 'Active' ? '#f0fdf4' : proj.status === 'Completed' ? '#eff6ff' : '#f1f5f9',
                  color: proj.status === 'Active' ? '#16a34a' : proj.status === 'Completed' ? '#2878e5' : '#64748b',
                }}
              >
                {proj.status}
              </span>
              <span
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'rgba(8,24,39,0.85)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <MapPin size={11} color="#a8f04a" />
                {proj.region}
              </span>
            </div>

            <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                  {proj.name}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11.5px', color: '#64748b', margin: '8px 0' }}>
                  <div>
                    <div>Scenes:</div>
                    <strong style={{ color: '#1e293b' }}>{proj.scenes} Scenes</strong>
                  </div>
                  <div>
                    <div>Mean PSNR:</div>
                    <strong style={{ color: '#16a34a', fontFamily: 'var(--font-mono)' }}>{proj.meanPsnr}</strong>
                  </div>
                  <div>
                    <div>Updated:</div>
                    <strong style={{ color: '#1e293b' }}>{proj.lastUpdated}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-icon"
                    style={{ width: '28px', height: '28px' }}
                    title="Duplicate"
                    onClick={() => handleDuplicate(proj)}
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    className="btn-icon"
                    style={{ width: '28px', height: '28px' }}
                    title="Delete"
                    onClick={() => handleDelete(proj.id, proj.name)}
                  >
                    <Trash2 size={13} color="#ef4444" />
                  </button>
                </div>

                <button
                  className="btn-primary btn-sm"
                  onClick={() => onNavigate('/dashboard')}
                >
                  <span>Open Workspace</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
