import { AlertTriangle, Users, ClipboardList, TrendingUp, TrendingDown, Zap } from 'lucide-react';

const variants = {
  critical: {
    bg: 'from-[#dc2626] to-[#b91c1c]',
    shadow: 'rgba(220, 38, 38, 0.35)',
    iconBg: 'bg-white/15',
    icon: AlertTriangle
  },
  technician: {
    bg: 'from-[var(--steel-700)] to-[var(--steel-900)]',
    shadow: 'rgba(0, 0, 0, 0.25)',
    iconBg: 'bg-white/10',
    icon: Users
  },
  requests: {
    bg: 'from-[#ff6b35] to-[#e85a2a]',
    shadow: 'rgba(255, 107, 53, 0.35)',
    iconBg: 'bg-white/15',
    icon: ClipboardList
  },
  success: {
    bg: 'from-[#10b981] to-[#059669]',
    shadow: 'rgba(16, 185, 129, 0.35)',
    iconBg: 'bg-white/15',
    icon: Zap
  }
};

const KPICard = ({ 
  title, 
  value, 
  subtitle, 
  variant = 'requests',
  trend,
  trendValue,
  onClick 
}) => {
  const config = variants[variant] || variants.requests;
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-6 
        bg-gradient-to-br ${config.bg}
        text-white
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:scale-[1.02]
        cursor-pointer group
      `}
      style={{ boxShadow: `0 8px 24px ${config.shadow}` }}
    >
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Gradient Shine */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none" />

      {/* Icon */}
      <div className={`
        absolute top-5 right-5 w-14 h-14 ${config.iconBg} 
        rounded-xl flex items-center justify-center backdrop-blur-sm
        group-hover:scale-110 group-hover:rotate-3 transition-all duration-300
      `}>
        <Icon className="w-7 h-7" strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <p className="text-sm font-medium opacity-90 mb-2 font-['DM_Sans'] tracking-wide uppercase">{title}</p>
        <p className="text-4xl font-bold tracking-tight mb-1 font-['Sora']">{value}</p>
        <p className="text-sm opacity-75 font-['DM_Sans']">{subtitle}</p>

        {/* Trend Indicator */}
        {trend && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20">
            <div className={`
              flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium
              ${trend === 'up' ? 'bg-white/20' : 'bg-white/20'}
            `}>
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{trendValue}</span>
            </div>
            <span className="text-xs opacity-70">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
