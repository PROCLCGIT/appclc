// src/pages/Dashboard.jsx
import { Users, FileText, DollarSign, ListTodo } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { 
      title: 'Total Users', 
      value: '1,234',
      icon: Users,
      trend: '+12.5%',
      trendUp: true
    },
    { 
      title: 'Active Projects', 
      value: '80',
      icon: FileText,
      trend: '+8.2%',
      trendUp: true
    },
    { 
      title: 'Pending Tasks', 
      value: '15',
      icon: ListTodo,
      trend: '-2.4%',
      trendUp: false
    },
    { 
      title: 'Total Revenue', 
      value: '$12,345',
      icon: DollarSign,
      trend: '+18.9%',
      trendUp: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, happening today.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <stat.icon size={22} className="text-indigo-600" />
              </div>
              <span className={`text-sm font-medium ${
                stat.trendUp ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-500 mt-1">Latest actions and updates</p>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-center justify-center text-gray-500">
            Content will go here
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;