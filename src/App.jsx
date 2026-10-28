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
      {renderContent()}
    </AppLayout>
  );
}
