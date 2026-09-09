import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { cn } from '../../utils/cn';
import { CreatorCredit } from '../CreatorCredit';
import { ThemeToggle } from '../ThemeToggle';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Clock, 
  CheckSquare, 
  FileText,
  CreditCard,
  History,
  BarChart,
  Bell,
  Activity,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Students', path: '/admin/students', icon: Users },
  { label: 'Teachers', path: '/admin/teachers', icon: Users },
  { label: 'Courses', path: '/admin/courses', icon: BookOpen },
  { label: 'Batches', path: '/admin/batches', icon: Clock },
  { label: 'Attendance', path: '/admin/attendance', icon: CheckSquare },
  { label: "Today's Classes", path: '/admin/classes', icon: FileText },
  { label: 'Fees', path: '/admin/fees', icon: CreditCard },
  { label: 'Payments', path: '/admin/payments', icon: History },
  { label: 'Reports', path: '/admin/reports', icon: BarChart },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell },
  { label: 'Activity Logs', path: '/admin/activity-logs', icon: Activity },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row font-sans transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 dark:bg-black text-white p-4 flex justify-between items-center sticky top-0 z-20">
        <h1 className="font-bold text-lg">MITHI COMPUTER CLASSES</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-900 dark:bg-black text-white w-64 min-h-screen flex-shrink-0 fixed md:sticky top-0 z-10 transition-transform duration-300 ease-in-out flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 hidden md:flex justify-between items-start">
          <div>
            <h1 className="font-black text-xl tracking-tight leading-tight">
              MITHI<br/><span className="text-blue-400">COMPUTER CLASSES</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Raniganj</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {currentUser?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-semibold">{currentUser?.name}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
        </div>

        <nav className="px-4 pb-4 space-y-1 overflow-y-auto flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-600 text-white" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors w-full mt-4"
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-x-hidden p-4 md:p-8 flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        <div className="mt-8">
          <CreatorCredit />
        </div>
      </main>
    </div>
  );
};
