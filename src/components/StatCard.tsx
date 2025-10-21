interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color:
    | 'blue'
    | 'green'
    | 'red'
    | 'indigo'
    | 'purple'
    | 'pink'
    | 'yellow'
    | 'orange'
    | 'teal'
    | 'cyan'
    | 'gray'
    | 'amber'
    | 'lime'
    | 'emerald'
    | 'rose'
    | 'sky'
    | 'violet'
    | 'fuchsia';
}

export default function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600',
    teal: 'bg-teal-50 text-teal-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    gray: 'bg-gray-50 text-gray-600',
    amber: 'bg-amber-50 text-amber-600',
    lime: 'bg-lime-50 text-lime-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    sky: 'bg-sky-50 text-sky-600',
    violet: 'bg-violet-50 text-violet-600',
    fuchsia: 'bg-fuchsia-50 text-fuchsia-600',
  };

  const colorClass = colorStyles[color] || colorStyles.gray;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition hover:shadow-md hover:-translate-y-0.5 duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${colorClass} p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
