import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Award, QrCode, LogOut } from 'lucide-react';

interface LayoutProps {
  onLogout: () => void;
}

export default function Layout({ onLogout }: LayoutProps) {
  const navigate = useNavigate();
  const restaurant = JSON.parse(localStorage.getItem('restaurant') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('restaurant');
    onLogout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Award className="w-7 h-7 text-indigo-600" />
              <span className="font-bold text-lg text-gray-900">Fidélité</span>
            </div>

            <div className="hidden sm:flex items-center gap-1">
              <NavLink to="/" end className={linkClass}>
                <LayoutDashboard className="w-4 h-4" />
                Tableau de bord
              </NavLink>
              <NavLink to="/programs" className={linkClass}>
                <Award className="w-4 h-4" />
                Programmes
              </NavLink>
              <NavLink to="/scanner" className={linkClass}>
                <QrCode className="w-4 h-4" />
                Scanner
              </NavLink>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 hidden sm:block">{restaurant.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="sm:hidden flex border-t border-gray-100">
          <NavLink to="/" end className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs ${isActive ? 'text-indigo-600' : 'text-gray-500'}`
          }>
            <LayoutDashboard className="w-5 h-5" />
            Accueil
          </NavLink>
          <NavLink to="/programs" className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs ${isActive ? 'text-indigo-600' : 'text-gray-500'}`
          }>
            <Award className="w-5 h-5" />
            Programmes
          </NavLink>
          <NavLink to="/scanner" className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs ${isActive ? 'text-indigo-600' : 'text-gray-500'}`
          }>
            <QrCode className="w-5 h-5" />
            Scanner
          </NavLink>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
