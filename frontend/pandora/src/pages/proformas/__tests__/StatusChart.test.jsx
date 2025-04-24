import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import StatusChart from '../components/dashboard/StatusChart';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/i18n';

// Mock the recharts components
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children, ...props }) => (
      <div data-testid="responsive-container" {...props}>
        {children}
      </div>
    ),
    PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
    Pie: ({ data }) => (
      <div data-testid="pie">
        {data && data.map((item, index) => (
          <div key={index} data-testid={`pie-item-${item.estadoKey}`}>
            {item.estado}: {item.cantidad}
          </div>
        ))}
      </div>
    ),
    Cell: () => <div data-testid="pie-cell" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
  };
});

describe('StatusChart', () => {
  const mockData = [
    { estadoKey: 'borrador', estado: 'Borrador', cantidad: 5, monto: 1000, color: '#6b7280' },
    { estadoKey: 'enviada', estado: 'Enviada', cantidad: 3, monto: 2000, color: '#3b82f6' },
    { estadoKey: 'aprobada', estado: 'Aprobada', cantidad: 2, monto: 3000, color: '#10b981' },
  ];

  const renderWithI18n = (ui) => {
    return render(
      <I18nextProvider i18n={i18n}>
        {ui}
      </I18nextProvider>
    );
  };

  test('renders loading spinner when isLoading is true', () => {
    renderWithI18n(
      <StatusChart isLoading={true} data={[]} />
    );
    
    expect(screen.getByText(/Cargando datos del gráfico/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('renders error message when isError is true', () => {
    renderWithI18n(
      <StatusChart isError={true} data={[]} />
    );
    
    expect(screen.getByText(/No hay datos disponibles/i)).toBeInTheDocument();
  });

  test('renders empty message when data is empty', () => {
    renderWithI18n(
      <StatusChart data={[]} />
    );
    
    expect(screen.getByText(/No hay datos disponibles/i)).toBeInTheDocument();
  });

  test('renders chart with data', () => {
    renderWithI18n(
      <StatusChart data={mockData} />
    );
    
    // Chart components should be rendered
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
    
    // Data items should be rendered
    expect(screen.getByTestId('pie-item-borrador')).toBeInTheDocument();
    expect(screen.getByTestId('pie-item-enviada')).toBeInTheDocument();
    expect(screen.getByTestId('pie-item-aprobada')).toBeInTheDocument();
    
    // Check that the data is correctly displayed
    expect(screen.getByText(/Borrador: 5/i)).toBeInTheDocument();
    expect(screen.getByText(/Enviada: 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Aprobada: 2/i)).toBeInTheDocument();
  });

  test('applies custom className when provided', () => {
    renderWithI18n(
      <StatusChart data={mockData} className="custom-class" />
    );
    
    const container = screen.getByTestId('responsive-container');
    expect(container.parentElement).toHaveClass('custom-class');
  });
});