import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, Images, Building2, LogOut, Camera, X, KeyRound } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../stores/auth.store';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/auth.api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/business', label: 'Business Info', icon: Building2 },
  { to: '/categories', label: 'Categories', icon: FolderOpen },
  { to: '/albums', label: 'Albums', icon: Images },
];

const SETTINGS_ITEMS = [
  { to: '/settings/password', label: 'Change Password', icon: KeyRound },
];


interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const admin = useAuthStore((s) => s.admin);

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      navigate('/login');
    },
    onError: () => {
      toast.error('Logout failed');
    },
  });

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600 border border-primary-100">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 tracking-tight block">PORTFOLIO</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block -mt-1">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Management
        </p>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary-50 text-primary-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-4 w-4', isActive ? 'text-primary-600' : 'text-slate-400')} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}

        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 mt-5">
          Settings
        </p>
        {SETTINGS_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary-50 text-primary-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-4 w-4', isActive ? 'text-primary-600' : 'text-slate-400')} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile & Logout */}
      <div className="border-t border-slate-100 p-4 bg-slate-50/50">
        <div className="mb-3 px-2">
          <p className="text-xs font-semibold text-slate-800 truncate">{admin?.email ?? 'Administrator'}</p>
          <p className="text-[10px] text-slate-500 font-medium">Logged in</p>
        </div>
        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4 text-red-500" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
