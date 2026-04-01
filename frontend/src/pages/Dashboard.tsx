import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, CreditCard, ArrowRightLeft, Gift, Plus, Search, Mail, Phone, Stamp, Star, Trophy } from 'lucide-react';
import api from '../api';

interface Stats {
  totalPrograms: number;
  totalCards: number;
  totalTransactions: number;
  totalRewards: number;
}

interface ClientCard {
  serialNumber: string;
  programName: string;
  programType: 'STAMPS' | 'POINTS';
  currentStamps: number;
  currentPoints: number;
  stampGoal: number | null;
  pointsGoal: number | null;
  totalRewardsEarned: number;
  lastVisit: string;
  createdAt: string;
}

interface Client {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  customerSince: string;
  card: ClientCard;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ProgressBar({ current, goal, color }: { current: number; goal: number; color: string }) {
  const pct = Math.min((current / goal) * 100, 100);
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const restaurant = JSON.parse(localStorage.getItem('restaurant') || '{}');

  useEffect(() => {
    api.get('/restaurants/stats').then(({ data }) => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));

    api.get('/restaurants/clients').then(({ data }) => {
      setClients(data);
      setClientsLoading(false);
    }).catch(() => setClientsLoading(false));
  }, []);

  const filteredClients = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.email.toLowerCase().includes(q) ||
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      c.card.programName.toLowerCase().includes(q)
    );
  });

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

      {/* Clients section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Clients</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-64"
            />
          </div>
        </div>

        {clientsLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-48 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {search ? 'Aucun client trouvé pour cette recherche' : 'Aucun client inscrit pour le moment'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Programme</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Progression</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Récompenses</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Dernière visite</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Inscrit le</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => {
                    const isStamps = client.card.programType === 'STAMPS';
                    const current = isStamps ? client.card.currentStamps : client.card.currentPoints;
                    const goal = (isStamps ? client.card.stampGoal : client.card.pointsGoal) || 1;
                    return (
                      <tr key={client.card.serialNumber} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm">
                              {(client.name || client.email)[0].toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{client.name || '—'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="flex items-center gap-1.5 text-gray-600">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              {client.email}
                            </span>
                            {client.phone && (
                              <span className="flex items-center gap-1.5 text-gray-500">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                {client.phone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 text-gray-700">
                            {isStamps ? <Stamp className="w-3.5 h-3.5 text-indigo-500" /> : <Star className="w-3.5 h-3.5 text-amber-500" />}
                            {client.card.programName}
                          </span>
                        </td>
                        <td className="py-3 px-4 min-w-[160px]">
                          <div className="flex items-center gap-2">
                            <ProgressBar current={current} goal={goal} color={isStamps ? '#6366f1' : '#f59e0b'} />
                            <span className="text-xs text-gray-500 whitespace-nowrap">{current}/{goal}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-gray-700">
                            <Trophy className="w-3.5 h-3.5 text-rose-500" />
                            {client.card.totalRewardsEarned}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">{formatDate(client.card.lastVisit)}</td>
                        <td className="py-3 px-4 text-gray-500">{formatDate(client.card.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredClients.map((client) => {
                const isStamps = client.card.programType === 'STAMPS';
                const current = isStamps ? client.card.currentStamps : client.card.currentPoints;
                const goal = (isStamps ? client.card.stampGoal : client.card.pointsGoal) || 1;
                return (
                  <div key={client.card.serialNumber} className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
                        {(client.name || client.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{client.name || '—'}</div>
                        <div className="text-xs text-gray-500">{client.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-1.5 text-gray-600">
                        {isStamps ? <Stamp className="w-3.5 h-3.5 text-indigo-500" /> : <Star className="w-3.5 h-3.5 text-amber-500" />}
                        {client.card.programName}
                      </span>
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <Trophy className="w-3.5 h-3.5 text-rose-500" />
                        {client.card.totalRewardsEarned} récompense{client.card.totalRewardsEarned !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ProgressBar current={current} goal={goal} color={isStamps ? '#6366f1' : '#f59e0b'} />
                      <span className="text-xs text-gray-500 whitespace-nowrap">{current}/{goal}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Dernière visite : {formatDate(client.card.lastVisit)}</span>
                      <span>Depuis le {formatDate(client.card.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
