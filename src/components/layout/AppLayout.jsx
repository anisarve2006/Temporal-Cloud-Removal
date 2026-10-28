import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { ChevronRight } from 'lucide-react';

export default function AppLayout({ currentRoute, onNavigate, breadcrumbs = [], children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={(route) => {
          setMobileOpen(false);
          onNavigate(route);
        }}
      />

      {/* Main Content Area */}
      <div className="app-main">
        <Topbar
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
          onNavigate={onNavigate}
        />

        <main className="page-content">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="page-breadcrumbs">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.label || idx}>
                  {idx > 0 && <ChevronRight size={12} color="#94a3b8" />}
                  {crumb.route ? (
                    <span
                      style={{ cursor: 'pointer', hover: { color: '#081827' } }}
                      onClick={() => onNavigate(crumb.route)}
                    >
                      {crumb.label}
                    </span>
                  ) : (
                    <span style={{ color: '#081827', fontWeight: 600 }}>
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
