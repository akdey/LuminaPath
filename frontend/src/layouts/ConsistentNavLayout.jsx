import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Route, FileQuestion, BarChart3, Settings, HelpCircle, Bell, History, LogOut } from 'lucide-react';
import { logout } from '../services/api';

const ConsistentNavLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="bg-surface-background text-on-background font-body-md selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="bg-white border-b border-slate-100 flex justify-between items-center h-16 px-6 w-full sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-blue-700 font-lexend tracking-tight">Lumina Path</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex gap-8 items-center h-full">
            <Link to="/home" className={`${currentPath.includes('/home') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-blue-600'} h-16 flex items-center font-lexend text-sm transition-colors font-semibold`}>Dashboard</Link>
            <Link to="/assessment" className={`${currentPath.includes('/assessment') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-blue-600'} h-16 flex items-center font-lexend text-sm transition-colors font-semibold`}>Assessments</Link>
            <Link to="/roadmap" className={`${currentPath.includes('/roadmap') ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-blue-600'} h-16 flex items-center font-lexend text-sm transition-colors font-semibold`}>Roadmap</Link>
          </div>
          <div className="flex items-center gap-4 border-l border-slate-100 pl-8">
            <Bell className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600" />
            <History className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600" />
            <img alt="User profile avatar" className="w-8 h-8 rounded-full border border-slate-200 ml-2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2LIR4ilv03dvOXZry_sF-t77871EBiYdtcV29-7nBuy1fbkVKFqR_POHq6I1oVkeYKZ0XVXcp_Vm_GNe08tp1eXa9tINCGNvsGRpOn8xy1q1EAg7BRZP1STQcVsTnLZggPSI-lgUwb5UYoDW0VLhvK_RR5pIn2nhxbspiPcf3ZSTZe7LxtW1A1U7d78h3Ifj_9d2UdCAPod_Yhv-BUTugkb8ub1yKXs9PHualekB4mHeO67GRMEPbCcQqDiOHw4D1aDqTR2Kq1_c" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-[calc(100vh-64px)]">
        {/* SideNavBar */}
        <aside className="bg-white border-r border-slate-100 h-[calc(100vh-64px)] w-64 hidden md:flex flex-col fixed left-0 p-6 z-40">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-bold text-blue-700 font-lexend">Digital Tutor AI</span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">INTELLIGENT GUIDANCE</p>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <Link to="/home" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${currentPath.includes('/home') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-50 font-medium'}`}>
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link to="/roadmap" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${currentPath.includes('/roadmap') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-50 font-medium'}`}>
              <Route className="w-5 h-5" />
              <span>Learning Roadmap</span>
            </Link>
            <Link to="/assessment" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${currentPath.includes('/assessment') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-50 font-medium'}`}>
              <FileQuestion className="w-5 h-5" />
              <span>Assessments</span>
            </Link>
            <Link to="/gap-analysis" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${currentPath.includes('/gap-analysis') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-50 font-medium'}`}>
              <BarChart3 className="w-5 h-5" />
              <span>Gap Analysis</span>
            </Link>
          </div>
          <div className="mt-auto flex flex-col gap-2 pt-6 border-t border-slate-50">
            <button className="mb-4 bg-primary text-white py-3 rounded-lg font-bold text-xs shadow-sm hover:opacity-90 transition-opacity">
              Start New Session
            </button>
            <Link to="#" className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-medium">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            <Link to="#" className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-medium">
              <HelpCircle className="w-5 h-5" />
              <span>Help</span>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium w-full text-left mt-2 transition-colors">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 md:ml-64 flex flex-col min-w-0">
          <Outlet />
        </div>
      </div>
      
      {/* BottomNavBar (Mobile only) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe pt-2 md:hidden bg-white/80 backdrop-blur-md shadow-2xl rounded-t-xl border-t border-slate-200 h-16">
        <Link to="/home" className={`flex flex-col items-center justify-center transition-all ${currentPath.includes('/home') ? 'text-blue-600 bg-blue-50/50 rounded-xl px-3 py-1' : 'text-slate-400'}`}>
          <LayoutDashboard className="w-6 h-6" />
          <span className="font-lexend text-[10px] font-bold uppercase tracking-widest mt-1">Home</span>
        </Link>
        <Link to="/roadmap" className={`flex flex-col items-center justify-center transition-all ${currentPath.includes('/roadmap') ? 'text-blue-600 bg-blue-50/50 rounded-xl px-3 py-1' : 'text-slate-400'}`}>
          <Route className="w-6 h-6" />
          <span className="font-lexend text-[10px] font-semibold uppercase tracking-widest mt-1">Roadmap</span>
        </Link>
        <Link to="/assessment" className={`flex flex-col items-center justify-center transition-all ${currentPath.includes('/assessment') ? 'text-blue-600 bg-blue-50/50 rounded-xl px-3 py-1' : 'text-slate-400'}`}>
          <FileQuestion className="w-6 h-6" />
          <span className="font-lexend text-[10px] font-semibold uppercase tracking-widest mt-1">Quiz</span>
        </Link>
        <Link to="/gap-analysis" className={`flex flex-col items-center justify-center transition-all ${currentPath.includes('/gap-analysis') ? 'text-blue-600 bg-blue-50/50 rounded-xl px-3 py-1' : 'text-slate-400'}`}>
          <BarChart3 className="w-6 h-6" />
          <span className="font-lexend text-[10px] font-semibold uppercase tracking-widest mt-1">Report</span>
        </Link>
      </nav>
    </div>
  );
};

export default ConsistentNavLayout;
