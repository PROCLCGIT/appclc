import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/i18n';

// Mock ExportButton component to make testing simpler
vi.mock('../components/dashboard/ExportButton', () => ({
  default: ({ disabled }) => (
    <button data-testid="export-button" disabled={disabled}>
      Export Mock
    </button>
  ),
}));

// Mock ThemeToggle component
vi.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: () => <button data-testid="theme-toggle">Theme Toggle</button>,
}));

describe('DashboardHeader', () => {
  const mockRefetch = vi.fn();
  const defaultProps = {
    isLoading: false,
    isFetching: false,
    refetch: mockRefetch,
    dateRange: { startDate: new Date(), endDate: new Date() },
    statusFilters: ['borrador', 'enviada'],
  };

  const renderWithRouter = (ui, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>{ui}</BrowserRouter>
      </I18nextProvider>
    );
  };

  beforeEach(() => {
    mockRefetch.mockClear();
  });

  test('renders correctly with all elements', () => {
    renderWithRouter(<DashboardHeader {...defaultProps} />);
    
    // Title should be present
    expect(screen.getByText(/Dashboard de Proformas/i)).toBeInTheDocument();
    
    // Buttons should be present
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('export-button')).toBeInTheDocument();
    expect(screen.getByText(/Actualizar/i)).toBeInTheDocument();
    expect(screen.getByText(/Nueva Proforma/i)).toBeInTheDocument();
  });

  test('refresh button calls refetch when clicked', () => {
    renderWithRouter(<DashboardHeader {...defaultProps} />);
    
    const refreshButton = screen.getByText(/Actualizar/i);
    fireEvent.click(refreshButton);
    
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  test('refresh button and export button are disabled when loading', () => {
    renderWithRouter(
      <DashboardHeader {...defaultProps} isLoading={true} />
    );
    
    const refreshButton = screen.getByText(/Actualizar/i);
    expect(refreshButton).toBeDisabled();
    
    const exportButton = screen.getByTestId('export-button');
    expect(exportButton).toBeDisabled();
  });

  test('refresh button and export button are disabled when fetching', () => {
    renderWithRouter(
      <DashboardHeader {...defaultProps} isFetching={true} />
    );
    
    const refreshButton = screen.getByText(/Actualizar/i);
    expect(refreshButton).toBeDisabled();
    
    const exportButton = screen.getByTestId('export-button');
    expect(exportButton).toBeDisabled();
  });

  test('new proforma link points to correct route', () => {
    renderWithRouter(<DashboardHeader {...defaultProps} />);
    
    const newProformaLink = screen.getByText(/Nueva Proforma/i).closest('a');
    expect(newProformaLink).toHaveAttribute('href', '/enhancedproforma?new=true');
  });
});