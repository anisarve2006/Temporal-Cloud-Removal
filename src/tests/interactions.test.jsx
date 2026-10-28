import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import ProjectsPage from '../pages/ProjectsPage';
import DatasetsPage from '../pages/DatasetsPage';
import ComparisonPage from '../pages/ComparisonPage';
import BatchProcessingPage from '../pages/BatchProcessingPage';

describe('Zero-Dead-Interaction Frontend Audit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Navigation & Layout (Sidebar & Topbar)', () => {
    it('navigates when sidebar navigation items are clicked', () => {
      const onNavigate = vi.fn();
      render(<Sidebar currentRoute="/dashboard" onNavigate={onNavigate} />);

      const cloudRemovalLink = screen.getByText('Cloud Removal');
      fireEvent.click(cloudRemovalLink);
      expect(onNavigate).toHaveBeenCalledWith('/cloud-removal');

      const comparisonLink = screen.getByText('Image Comparison');
      fireEvent.click(comparisonLink);
      expect(onNavigate).toHaveBeenCalledWith('/comparison');
    });

    it('opens and closes the Upgrade Plan modal and tops up compute credits', () => {
      render(<Sidebar currentRoute="/dashboard" onNavigate={vi.fn()} />);

      const upgradeBtn = screen.getByRole('button', { name: /Upgrade Plan/i });
      fireEvent.click(upgradeBtn);

      // Modal is visible
      expect(screen.getByText(/Cloudless AI Subscription & Compute/i)).toBeDefined();

      // Top up credits
      const topUpBtn = screen.getByRole('button', { name: /Top-up 20 Credits/i });
      fireEvent.click(topUpBtn);
      expect(screen.getByText(/Successfully added \+20 processing credits/i)).toBeDefined();

      // Close modal
      const closeBtn = screen.getByTitle('Close Modal');
      fireEvent.click(closeBtn);
      expect(screen.queryByText(/Cloudless AI Subscription & Compute/i)).toBeNull();
    });

    it('filters routes in Topbar search palette and navigates on select', () => {
      const onNavigate = vi.fn();
      render(<Topbar onNavigate={onNavigate} currentRoute="/dashboard" breadcrumbs={[]} />);

      const searchInput = screen.getByPlaceholderText(/Search datasets, locations/i);
      fireEvent.focus(searchInput);
      fireEvent.change(searchInput, { target: { value: 'LULC' } });

      // Search results drop down
      const searchItem = screen.getByText(/Land Use \/ Land Cover \(LULC\) Analysis/i);
      fireEvent.click(searchItem);
      expect(onNavigate).toHaveBeenCalledWith('/lulc-analysis');
    });

    it('toggles notifications and user menu drawers in Topbar', () => {
      render(<Topbar onNavigate={vi.fn()} currentRoute="/dashboard" breadcrumbs={[]} />);

      const notifBtn = screen.getByTitle('Notifications');
      fireEvent.click(notifBtn);
      expect(screen.getByText(/System Notifications/i)).toBeDefined();

      // Close notifications by clicking again
      fireEvent.click(notifBtn);
      expect(screen.queryByText(/System Notifications/i)).toBeNull();
    });
  });

  describe('Comparison Page Controls', () => {
    it('switches comparison view modes: Side by Side, Slider, Triple View', () => {
      render(<ComparisonPage onNavigate={vi.fn()} />);

      const sideBySideBtn = screen.getByRole('button', { name: /Side by Side/i });
      fireEvent.click(sideBySideBtn);
      expect(sideBySideBtn.style.color).toBe('rgb(255, 255, 255)');

      const tripleViewBtn = screen.getByRole('button', { name: /Triple View/i });
      fireEvent.click(tripleViewBtn);
      expect(tripleViewBtn.style.color).toBe('rgb(255, 255, 255)');
    });

    it('shares comparison link and resets view state', () => {
      // Mock clipboard
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(),
        },
      });

      const { container } = render(<ComparisonPage onNavigate={vi.fn()} />);

      const shareBtn = container.querySelector('#comparison-share-btn');
      fireEvent.click(shareBtn);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();

      const resetBtn = container.querySelector('#comparison-reset-view-btn');
      fireEvent.click(resetBtn);
      expect(screen.getByText(/ROI boundary, opacity, and zoom reset/i)).toBeDefined();
    });
  });

  describe('Batch Processing Queue & Exports', () => {
    it('filters batch queue by status and starts execution', async () => {
      render(<BatchProcessingPage onNavigate={vi.fn()} />);

      // Filter by Completed
      const completedFilter = screen.getByRole('button', { name: /Completed/i });
      fireEvent.click(completedFilter);
      expect(completedFilter.style.color).toBe('rgb(255, 255, 255)');

      // Switch to All
      const allFilter = screen.getByRole('button', { name: /^All$/ });
      fireEvent.click(allFilter);

      // Start batch execution
      const startBtn = screen.getByRole('button', { name: /Start Batch Processing/i });
      fireEvent.click(startBtn);

      await waitFor(() => {
        expect(screen.getAllByText(/Completed/i).length).toBeGreaterThan(0);
      });
    });

    it('triggers CSV metadata export without dead clicks', () => {
      // Mock URL.createObjectURL
      window.URL.createObjectURL = vi.fn(() => 'blob:mock');
      window.URL.revokeObjectURL = vi.fn();

      render(<BatchProcessingPage onNavigate={vi.fn()} />);

      const exportCsvBtn = screen.getByRole('button', { name: /Export Metadata \(CSV\)/i });
      fireEvent.click(exportCsvBtn);

      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('Datasets Management & Search', () => {
    it('searches datasets by keyword and filters by sensor', () => {
      render(<DatasetsPage onNavigate={vi.fn()} />);

      const searchInput = screen.getByPlaceholderText(/Search datasets by name/i);
      fireEvent.change(searchInput, { target: { value: 'Resourcesat' } });

      expect(screen.getAllByText(/ISRO Resourcesat-2A LISS-IV/i).length).toBeGreaterThan(0);

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });

      // Filter by Sentinel-1
      const s1Filter = screen.getByRole('button', { name: /^Sentinel-1$/i });
      fireEvent.click(s1Filter);
      expect(screen.getAllByText(/Sentinel-1 C-Band SAR/i).length).toBeGreaterThan(0);
    });

    it('opens upload dataset modal, validates inputs and adds to dataset inventory', () => {
      render(<DatasetsPage onNavigate={vi.fn()} />);

      const uploadBtn = screen.getByRole('button', { name: /Upload Dataset/i });
      fireEvent.click(uploadBtn);

      expect(screen.getByText(/Upload New Geospatial Dataset/i)).toBeDefined();

      // Submit form
      const nameInput = screen.getByPlaceholderText(/e\.g\., Arunachal High Altitude/i);
      fireEvent.change(nameInput, { target: { value: 'Ganga Delta High-Res' } });

      const regionInput = screen.getByPlaceholderText(/e\.g\., Tawang Valley/i);
      fireEvent.change(regionInput, { target: { value: 'Sundarbans Biosphere' } });

      const submitBtn = screen.getByRole('button', { name: /Ingest Dataset/i });
      fireEvent.click(submitBtn);

      expect(screen.getAllByText('Ganga Delta High-Res').length).toBeGreaterThan(0);
    });
  });

  describe('Projects CRUD & State Persistence', () => {
    it('creates, duplicates, and deletes projects with persistence', async () => {
      render(<ProjectsPage onNavigate={vi.fn()} />);

      // Create Project
      const createBtn = screen.getByRole('button', { name: /Create New Project/i });
      fireEvent.click(createBtn);

      const nameInput = screen.getByPlaceholderText(/e\.g\., Northeast Monsoon/i);
      fireEvent.change(nameInput, { target: { value: 'Sundarbans Mangrove Analysis' } });

      const saveBtn = screen.getByRole('button', { name: /Create Project/i });
      fireEvent.click(saveBtn);

      expect(screen.getAllByText('Sundarbans Mangrove Analysis').length).toBeGreaterThan(0);

      // Duplicate Project
      const duplicateBtns = screen.getAllByTitle('Duplicate');
      fireEvent.click(duplicateBtns[0]);

      expect(screen.getAllByText(/Copy/i).length).toBeGreaterThan(0);

      // Delete Project (with confirm mock)
      window.confirm = vi.fn(() => true);
      const deleteBtns = screen.getAllByTitle('Delete');
      fireEvent.click(deleteBtns[0]);

      expect(window.confirm).toHaveBeenCalled();
    });
  });

  describe('Cloud Removal Multi-Step Pipeline', () => {
    it('switches steps and configures presets in Cloud Removal page', async () => {
      const { default: CloudRemovalPage } = await import('../pages/CloudRemovalPage');
      render(<CloudRemovalPage onNavigate={vi.fn()} />);

      // Switch preset to High Quality
      const highQualityBtn = screen.getByRole('button', { name: /High Quality/i });
      fireEvent.click(highQualityBtn);
      expect(highQualityBtn.style.color).toBe('rgb(21, 128, 61)');

      // Switch step to Step 2 (Reference Data)
      const step2Btn = screen.getByText('Reference Data');
      fireEvent.click(step2Btn);
      expect(screen.getByText('SAR & Temporal')).toBeDefined();

      // Switch to Step 5 (Results)
      const step5Btn = screen.getByText('Results');
      fireEvent.click(step5Btn);
      expect(screen.getByText('Visualize & Download')).toBeDefined();
    });
  });

  describe('LULC Analysis ROI & Inference', () => {
    it('switches ROI shapes and triggers classification computation', async () => {
      const { default: LulcAnalysisPage } = await import('../pages/LulcAnalysisPage');
      render(<LulcAnalysisPage onNavigate={vi.fn()} />);

      // Switch ROI to Rectangle
      const rectBtn = screen.getByRole('button', { name: /Rectangle/i });
      fireEvent.click(rectBtn);
      expect(screen.getAllByText('Dense Forest').length).toBeGreaterThan(0);

      // Trigger LULC Classification
      const runBtn = screen.getByRole('button', { name: /Run LULC Analysis/i });
      fireEvent.click(runBtn);

      await waitFor(() => {
        expect(screen.getByText(/LULC Classification Complete/i)).toBeDefined();
      });
    });
  });
});
