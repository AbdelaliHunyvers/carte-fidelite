import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, CreditCard, ArrowRightLeft, Gift, Plus } from 'lucide-react';
import api from '../api';

interface Stats {
  totalPrograms: number;
  totalCards: number;
  totalTransactions: number;
  totalRewards: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const restaurant = JSON.parse(localStorage.getItem('restaurant') || '{}');

  useEffect(() => {
    api.get('/restaurants/stats').then(({ data }) => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Programmes actifs', value: stats.totalPrograms, icon: CreditCard, color: 'bg-indigo-500' },
    { label: 'Cartes distribuées', value: stats.totalCards, icon: Users, color: 'bg-emerald-500' },
    { label: 'Transactions', value: stats.totalTransactions, icon: ArrowRightLeft, color: 'bg-amber-500' },
    { label: 'Récompenses offertes', value: stats.totalRewards, icon: Gift, color: 'bg-rose-500' },
  ] : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {restaurant.name}</h1>
          <p className="text-gray-500 mt-1">Voici un aperçu de votre programme de fidélité</p>
        </div>
        <Link
          to="/programs"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau programme
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
              <div className="h-8 w-16 bg-gray-200 rounded mb-1" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className={`inline-flex items-center justify-center w-10 h-10 ${stat.color} rounded-lg mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {stats && stats.totalPrograms === 0 && (
        <div className="mt-12 text-center bg-white rounded-2xl border border-gray-200 p-12">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Aucun programme de fidélité</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Créez votre premier programme de fidélité pour commencer à récompenser vos clients.
          </p>
          <Link
            to="/programs"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Créer un programme
          </Link>
        </div>
      )}
    </div>
  );
}
