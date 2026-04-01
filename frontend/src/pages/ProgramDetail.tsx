import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Copy, Check, Stamp, Star } from 'lucide-react';
import api from '../api';

interface Card {
  id: string;
  serialNumber: string;
  currentStamps: number;
  currentPoints: number;
  totalRewardsEarned: number;
  createdAt: string;
  customer: { id: string; name: string | null; email: string };
}

interface Program {
  id: string;
  name: string;
  type: 'STAMPS' | 'POINTS';
  stampGoal: number | null;
  pointsGoal: number | null;
  pointsPerEuro: number | null;
  reward: string;
  color: string;
  isActive: boolean;
  description: string | null;
  _count: { cards: number };
  cards: Card[];
}

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/programs/${id}`).then(({ data }) => {
      setProgram(data);
      setLoading(false);
    });
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="h-4 w-96 bg-gray-200 rounded" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (!program) {
    return <div className="text-center py-12 text-gray-500">Programme non trouvé</div>;
  }

  const goal = program.type === 'STAMPS' ? program.stampGoal : program.pointsGoal;

  return (
    <div>
      <Link to="/programs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour aux programmes
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: program.color }}
            >
              {program.type === 'STAMPS' ? (
                <Stamp className="w-7 h-7 text-white" />
              ) : (
                <Star className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{program.name}</h1>
              <p className="text-gray-500 mt-1">
                {program.type === 'STAMPS' ? 'Programme tampons' : 'Programme points'} &middot;{' '}
                {goal} {program.type === 'STAMPS' ? 'tampons' : 'points'} &rarr; {program.reward}
              </p>
              {program.description && <p className="text-sm text-gray-400 mt-2">{program.description}</p>}
            </div>
          </div>

          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {copied ? (
              <><Check className="w-4 h-4 text-green-600" /> Copié !</>
            ) : (
              <><Copy className="w-4 h-4" /> Copier le lien d'inscription</>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Clients ({program._count.cards})
          </h2>
        </div>

        {program.cards.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun client inscrit pour le moment</p>
            <p className="text-sm text-gray-400 mt-1">
              Partagez le lien d'inscription pour que vos clients rejoignent le programme
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">{program.type === 'STAMPS' ? 'Tampons' : 'Points'}</th>
                  <th className="px-6 py-3">Progression</th>
                  <th className="px-6 py-3">Récompenses</th>
                  <th className="px-6 py-3">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {program.cards.map((card) => {
                  const current = program.type === 'STAMPS' ? card.currentStamps : card.currentPoints;
                  const pct = Math.min(100, Math.round((current / (goal || 1)) * 100));

                  return (
                    <tr key={card.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 text-sm">{card.customer.name || 'Anonyme'}</div>
                        <div className="text-xs text-gray-400">{card.customer.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {current}/{goal}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32 bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: program.color }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{card.totalRewardsEarned}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(card.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
