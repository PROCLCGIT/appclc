import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import DashboardProformas from '../DashboardProformas';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/i18n';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock all dashboard components to focus on integration
vi.mock('../components/dashboard/DashboardHeader', () => ({
  default: ({ isLoading, isFetching, refetch }) => (
    <div data-testid="dashboard-header">
      <button 
        data-testid="refetch-button" 
        onClick={refetch}
        disabled={isLoading || isFetching}
      >
        Refetch
      </button>
    </div>
  ),
}));

vi.mock('../components/dashboard/DateRangeSelector', () => ({
  default: ({ dateRange, setDateRange, onValidationChange }) => (
    <div data-testid="date-range-selector">
      <button
        data-testid="date-valid-button"
        onClick={() => onValidationChange(true)}
      >
        Valid Date
      </button>
      <button
        data-testid="date-invalid-button"
        onClick={() => onValidationChange(false, 'Error message')}
      >
        Invalid Date
      </button>
    </div>
  ),
}));

vi.mock('@/components/SkeletonList', () => ({
  SkeletonDashboard: () => <div data-testid="skeleton-dashboard">Loading skeleton</div>,
}));

vi.mock('../components/dashboard/ErrorMessage', () => ({
  default: ({ error, refetch }) => (
    <div data-testid="error-message">
      Error: {error?.message || 'Unknown error'}
      <button data-testid="error-retry" onClick={refetch}>Retry</button>
    </div>
  ),
}));

vi.mock('../components/dashboard/SummaryCards', () => ({
  default: ({ isLoading }) => (
    <div data-testid="summary-cards" data-loading={isLoading}>
      Summary Cards
    </div>
  ),
}));

vi.mock('../components/dashboard/StatusFilter', () => ({
  default: ({ estadosFiltrados, toggleEstadoFiltro }) => (
    <div data-testid="status-filter">
      {estadosFiltrados.map(estado => (
        <button 
          key={estado} 
          data-testid={`filter-${estado}`}
          onClick={() => toggleEstadoFiltro(estado)}
        >
          {estado}
        </button>
      ))}
      <button 
        data-testid="add-filter-test"
        onClick={() => toggleEstadoFiltro('test')}
      >
        Add Test Filter
      </button>
    </div>
  ),
}));

vi.mock('../components/dashboard/StatusChart', () => ({
  default: ({ isLoading, data }) => (
    <div data-testid="status-chart" data-loading={isLoading}>
      Status Chart: {data?.length || 0} states
    </div>
  ),
}));

vi.mock('../components/dashboard/AmountChart', () => ({
  default: ({ isLoading, data }) => (
    <div data-testid="amount-chart" data-loading={isLoading}>
      Amount Chart: {data?.length || 0} states
    </div>
  ),
}));

vi.mock('../components/dashboard/MonthlyTrendChart', () => ({
  default: ({ isLoading, data }) => (
    <div data-testid="monthly-trend-chart" data-loading={isLoading}>
      Monthly Trend Chart: {data?.length || 0} months
    </div>
  ),
}));

vi.mock('../components/dashboard/RecentQuotesCard', () => ({
  default: ({ isLoading }) => (
    <div data-testid="recent-quotes-card" data-loading={isLoading}>
      Recent Quotes
    </div>
  ),
}));

// Mock the hook
vi.mock('../hooks/useDashboardData', () => ({
  useDashboardData: vi.fn().mockReturnValue({
    dashboardData: {
      total_proformas: 10,
      total_monto: 15000,
      por_estado: {
        borrador: { count: 5, total: 7500 },
        enviada: { count: 3, total: 4500 },
        aprobada: { count: 2, total: 3000 }
      },
      por_mes: [
        { mes: '2023-01', count: 3, total: 4500 },
        { mes: '2023-02', count: 7, total: 10500 }
      ]
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refreshData: vi.fn(),
    estadosChartData: [
      { estadoKey: 'borrador', estado: 'Borrador', cantidad: 5, monto: 7500 },
      { estadoKey: 'enviada', estado: 'Enviada', cantidad: 3, monto: 4500 },
      { estadoKey: 'aprobada', estado: 'Aprobada', cantidad: 2, monto: 3000 }
    ],
    mesChartData: [
      { mes: '2023-01', cantidad: 3, monto: 4500 },
      { mes: '2023-02', cantidad: 7, monto: 10500 }
    ],
    summaryData: {
      totalProformas: 10,
      proformasAprobadas: 2,
      montoTotal: 15000,
      promedioProforma: 1500,
      tasaConversion: 20
    },
    recentProformas: [
      { id: '1', numero: '1', cliente: 'Cliente 1' },
      { id: '2', numero: '2', cliente: 'Cliente 2' }
    ]
  })
}));

describe('DashboardProformas', () => {
  // Create a new QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderWithProviders = (ui) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider>
            <BrowserRouter>
              {ui}
            </BrowserRouter>
          </ThemeProvider>
        </I18nextProvider>
      </QueryClientProvider>
    );
  };

  test('renders all dashboard components when data is loaded', async () => {
    renderWithProviders(<DashboardProformas />);
    
    // Check that all components are rendered
    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    expect(screen.getByTestId('date-range-selector')).toBeInTheDocument();
    expect(screen.getByTestId('summary-cards')).toBeInTheDocument();
    expect(screen.getByTestId('status-filter')).toBeInTheDocument();
    expect(screen.getByTestId('status-chart')).toBeInTheDocument();
    expect(screen.getByTestId('amount-chart')).toBeInTheDocument();
    expect(screen.getByTestId('monthly-trend-chart')).toBeInTheDocument();
    expect(screen.getByTestId('recent-quotes-card')).toBeInTheDocument();
  });

  test('toggles status filter when clicked', async () => {
    renderWithProviders(<DashboardProformas />);
    
    // Get initial filters
    const borrador = screen.getByTestId('filter-borrador');
    const enviada = screen.getByTestId('filter-enviada');
    const aprobada = screen.getByTestId('filter-aprobada');
    
    // Test removing a filter
    fireEvent.click(borrador);
    
    // Test adding a new filter
    const addTestFilter = screen.getByTestId('add-filter-test');
    fireEvent.click(addTestFilter);
  });

  test('displays loading skeleton when loading', async () => {
    // Override the mock to return loading state
    vi.mocked(useDashboardData).mockReturnValueOnce({
      ...vi.mocked(useDashboardData).getMockImplementation()(),
      isLoading: true
    });
    
    renderWithProviders(<DashboardProformas />);
    
    expect(screen.getByTestId('skeleton-dashboard')).toBeInTheDocument();
  });

  test('displays error message when there is an error', async () => {
    // Override the mock to return error state
    vi.mocked(useDashboardData).mockReturnValueOnce({
      ...vi.mocked(useDashboardData).getMockImplementation()(),
      isError: true,
      error: new Error('Test error')
    });
    
    renderWithProviders(<DashboardProformas />);
    
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
  });

  test('handles date range validation', async () => {
    renderWithProviders(<DashboardProformas />);
    
    // Simulate invalid date
    fireEvent.click(screen.getByTestId('date-invalid-button'));
    
    // Components should still render, but with loading state
    expect(screen.getByTestId('summary-cards')).toHaveAttribute('data-loading', 'true');
    
    // Simulate valid date
    fireEvent.click(screen.getByTestId('date-valid-button'));
    
    // Components should not be in loading state
    expect(screen.getByTestId('summary-cards')).toHaveAttribute('data-loading', 'false');
  });
});