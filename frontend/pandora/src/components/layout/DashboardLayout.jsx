// src/components/layout/DashboardLayout.jsx
import { useState } from 'react';
import { 
  Home,
  Users,
  FileText,
  Bell,
  User,
  ChevronDown,
  Search,
  Menu
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50/95">
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen
        bg-white border-r border-gray-200
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'}
        lg:translate-x-0 lg:w-64
      `}>
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-xl">P</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Pandora</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4">
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-900 rounded-lg bg-gray-100">
            <Home size={20} className="text-gray-600" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <Users size={20} className="text-gray-600" />
            <span className="font-medium">Users</span>
          </a>
          <button className="flex items-center justify-between px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-gray-600" />
              <span className="font-medium">Forms</span>
            </div>
            <ChevronDown size={16} className="text-gray-600" />
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="fixed top-0 right-0 z-30 w-full lg:w-[calc(100%-16rem)] bg-white border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="p-1.5 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                <Menu size={22} />
              </button>
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent w-64"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-1.5 rounded-lg hover:bg-gray-100 relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <span className="font-medium hidden sm:inline">User Name</span>
                <ChevronDown size={16} className="text-gray-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-16 px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;