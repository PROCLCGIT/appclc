// src/components/proformas/ProformaDashboard.jsx
import { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const ProformaDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    summary: {
      totalProformas: 0,
      pendingApproval: 0,
      sent: 0,
      approved: 0,
      expired: 0,
      totalAmount: 0
    },
    trends: [],
    byStatus: [],
    byClient: [],
    recentActivity: []
  });

  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/proformas/dashboard/?timeRange=${timeRange}`);
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  const renderSummaryCards = () => (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-sm font-medium text-gray-500">Total Proformas</div>
        <div className="mt-2 flex justify-between items-end">
          <div className="text-2xl font-bold">
            {dashboardData.summary.totalProformas}
          </div>
          <div className="text-sm text-gray-500">
            este {timeRange}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-sm font-medium text-gray-500">Pendientes</div>
        <div className="mt-2 flex justify-between items-end">
          <div className="text-2xl font-bold text-yellow-600">
            {dashboardData.summary.pendingApproval}
          </div>
          <div className="text-sm text-gray-500">
            por aprobar
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-sm font-medium text-gray-500">Aprobadas</div>
        <div className="mt-2 flex justify-between items-end">
          <div className="text-2xl font-bold text-green-600">
            {dashboardData.summary.approved}
          </div>
          <div className="text-sm text-gray-500">
            este {timeRange}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-sm font-medium text-gray-500">Monto Total</div>
        <div className="mt-2 flex justify-between items-end">
          <div className="text-2xl font-bold">
            S/ {dashboardData.summary.totalAmount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">
            aprobadas
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrendsChart = () => (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-medium mb-4">Tendencias</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dashboardData.trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="count"
              stroke="#8884d8"
              name="Cantidad"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="amount"
              stroke="#82ca9d"
              name="Monto"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderStatusDistribution = () => (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-medium mb-4">Distribución por Estado</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dashboardData.byStatus}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {dashboardData.byStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderTopClients = () => (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-medium mb-4">Top Clientes</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dashboardData.byClient}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" name="Monto Total" fill="#8884d8" />
            <Bar dataKey="count" name="Cantidad" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderRecentActivity = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">Actividad Reciente</h3>
      </div>
      <div className="divide-y">
        {dashboardData.recentActivity.map((activity, index) => (
          <div key={index} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{activity.description}</div>
                <div className="text-sm text-gray-500">
                  Proforma #{activity.proformaNumber}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(activity.date).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard de Proformas</h2>
        <select
          className="p-2 border rounded-md"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="week">Última Semana</option>
          <option value="month">Último Mes</option>
          <option value="quarter">Último Trimestre</option>
          <option value="year">Último Año</option>
        </select>
      </div>

      {renderSummaryCards()}

      <div className="grid grid-cols-2 gap-6">
        {renderTrendsChart()}
        {renderStatusDistribution()}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {renderTopClients()}
        {renderRecentActivity()}
      </div>
    </div>
  );
};

export default ProformaDashboard;