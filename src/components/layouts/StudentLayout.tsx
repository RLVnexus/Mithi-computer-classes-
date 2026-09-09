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
  BookOpen, 
  CheckSquare, 
  CreditCard, 
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  TrendingUp,
  MonitorPlay
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/student', icon: LayoutDashboard },
  { label: 'Study Notes', path: '/student/notes', icon: BookOpen },
  { label: 'Attendance', path: '/student/attendance', icon: CheckSquare },
  { label: 'Fees & Payments', path: '/student/fees', icon: CreditCard },
  { label: 'Notifications', path: '/student/notifications', icon: Bell },
  { label: 'Profile', path: '/student/profile', icon: UserIcon },
];

export const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      <div className="md:hidden bg-blue-700 dark:bg-blue-900 text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
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
        "bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 w-64 min-h-screen flex-shrink-0 fixed md:sticky top-0 z-10 transition-transform duration-300 ease-in-out shadow-sm flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 hidden md:flex justify-between items-start border-b border-slate-100 dark:border-slate-800">
          <div>
            <h1 className="font-black text-xl tracking-tight leading-tight text-slate-900 dark:text-white">
              MITHI<br/><span className="text-blue-600 dark:text-blue-400">COMPUTER CLASSES</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">Raniganj</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-lg">
              {currentUser?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser?.name}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full inline-block mt-1">Student</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all",
                  isActive 
                    ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                <Icon size={18} className={isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"} />
                {item.label}
              </Link>
            );
          })}
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors w-full mt-4"
          >
            <LogOut size={18} className="text-red-500 dark:text-red-400" />
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
