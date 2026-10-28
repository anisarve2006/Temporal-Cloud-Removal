import React, { useState, useEffect } from 'react';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import CloudRemovalPage from './pages/CloudRemovalPage';
import ComparisonPage from './pages/ComparisonPage';
import LulcAnalysisPage from './pages/LulcAnalysisPage';
import BatchProcessingPage from './pages/BatchProcessingPage';
import DatasetsPage from './pages/DatasetsPage';
import VisualizationsPage from './pages/VisualizationsPage';
import ProjectsPage from './pages/ProjectsPage';
import {
  HowItWorksPage,
  DocumentationPage,
  UseCasesPage,
  ApiAccessPage,
  AboutPage,
  ProfilePage,
  SettingsPage,
} from './pages/SupportingPages';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Captured in ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '36px 24px', textAlign: 'center', background: '#ffffff', borderRadius: '10px', margin: '20px', border: '1px solid #fee2e2', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <span style={{ fontSize: '22px' }}>⚠️</span>
          </div>
          <h2 style={{ fontSize: '17px', color: '#991b1b', marginBottom: '6px', fontWeight: 700 }}>Something went wrong loading this view</h2>
          <p style={{ fontSize: '12px', color: '#64748b', maxWidth: '520px', margin: '0 auto 18px auto', lineHeight: '1.6' }}>
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              className="btn-primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{ fontSize: '12px', padding: '6px 16px' }}
            >
              Reload Page
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/dashboard';
              }}
              style={{ fontSize: '12px', padding: '6px 16px' }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    return window.location.pathname || '/';
  });

  const navigate = (route) => {
    window.history.pushState({}, '', route);
    setCurrentRoute(route);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const onPopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Landing page renders full screen dark cinematic theme without workspace sidebar
  if (currentRoute === '/' || currentRoute === '') {
    return <LandingPage onNavigate={navigate} />;
  }

  // Get Breadcrumbs dynamically based on route
  const getBreadcrumbs = () => {
    switch (currentRoute) {
      case '/dashboard':
        return [];
      case '/cloud-removal':
        return [{ label: 'Dashboard', route: '/dashboard' }, { label: 'Cloud Removal' }];
      case '/comparison':
        return [{ label: 'Dashboard', route: '/dashboard' }, { label: 'Image Comparison' }];
      case '/lulc-analysis':
        return [{ label: 'Dashboard', route: '/dashboard' }, { label: 'LULC Analysis' }];
      case '/batch-processing':
        return [{ label: 'Dashboard', route: '/dashboard' }, { label: 'Batch Processing' }];
      case '/datasets':
        return [{ label: 'Dashboard', route: '/dashboard' }, { label: 'Datasets' }];
      case '/visualizations':
        return [{ label: 'Dashboard', route: '/dashboard' }, { label: 'Visualizations' }];
      case '/projects':
        return [{ label: 'Dashboard', route: '/dashboard' }, { label: 'Saved Projects' }];
      case '/how-it-works':
        return [{ label: 'Resources' }, { label: 'How it Works' }];
      case '/documentation':
        return [{ label: 'Resources' }, { label: 'Documentation' }];
      case '/use-cases':
        return [{ label: 'Resources' }, { label: 'Use Cases' }];
      case '/api-access':
        return [{ label: 'Resources' }, { label: 'API Access' }];
      case '/profile':
        return [{ label: 'User' }, { label: 'Profile' }];
      case '/settings':
        return [{ label: 'Settings' }];
      default:
        return [{ label: 'Workspace' }];
    }
  };

  const renderContent = () => {
    switch (currentRoute) {
      case '/dashboard':
        return <DashboardPage onNavigate={navigate} />;
      case '/cloud-removal':
        return <CloudRemovalPage onNavigate={navigate} />;
      case '/comparison':
        return <ComparisonPage onNavigate={navigate} />;
      case '/lulc-analysis':
        return <LulcAnalysisPage onNavigate={navigate} />;
      case '/batch-processing':
        return <BatchProcessingPage onNavigate={navigate} />;
      case '/datasets':
        return <DatasetsPage onNavigate={navigate} />;
      case '/visualizations':
        return <VisualizationsPage onNavigate={navigate} />;
      case '/projects':
        return <ProjectsPage onNavigate={navigate} />;
      case '/how-it-works':
        return <HowItWorksPage onNavigate={navigate} />;
      case '/documentation':
        return <DocumentationPage onNavigate={navigate} />;
      case '/use-cases':
        return <UseCasesPage onNavigate={navigate} />;
      case '/api-access':
        return <ApiAccessPage onNavigate={navigate} />;
      case '/about':
        return <AboutPage onNavigate={navigate} />;
      case '/profile':
        return <ProfilePage onNavigate={navigate} />;
      case '/settings':
        return <SettingsPage onNavigate={navigate} />;
      default:
        return <DashboardPage onNavigate={navigate} />;
    }
  };

  return (
    <AppLayout
      currentRoute={currentRoute}
      onNavigate={navigate}
      breadcrumbs={getBreadcrumbs()}
    >
      <ErrorBoundary key={currentRoute}>
        {renderContent()}
      </ErrorBoundary>
    </AppLayout>
  );
}
