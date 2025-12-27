import { AlertTriangle, Users, ClipboardList, TrendingUp, TrendingDown, Zap } from 'lucide-react';

const variants = {
  critical: {
    bg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.20)',
    shadow: 'transparent',
    iconBg: 'rgba(239, 68, 68, 0.10)',
    icon: AlertTriangle,
    iconColor: 'text-red-400'
  },
  technician: {
    bg: 'rgba(59, 130, 246, 0.08)',
    border: 'rgba(59, 130, 246, 0.20)',
    shadow: 'transparent',
    iconBg: 'rgba(59, 130, 246, 0.10)',
    icon: Users,
    iconColor: 'text-blue-400'
  },
  requests: {
    bg: 'rgba(139, 92, 246, 0.08)',
    border: 'rgba(139, 92, 246, 0.20)',
    shadow: 'transparent',
    iconBg: 'rgba(139, 92, 246, 0.10)',
    icon: ClipboardList,
    iconColor: 'text-purple-400'
  },
  success: {
    bg: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.20)',
    shadow: 'transparent',
    iconBg: 'rgba(16, 185, 129, 0.10)',
    icon: Zap,
    iconColor: 'text-green-400'
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
      className="glass-card p-6 cursor-pointer transition-colors duration-200 group relative overflow-hidden"
      style={{ boxShadow: 'none', background: config.bg, borderColor: config.border }}
    >
      {/* Icon */}
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 relative z-10"
        style={{ background: config.iconBg }}
      >
        <Icon className={`w-6 h-6 ${config.iconColor}`} strokeWidth={2.5} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <p className="text-sm font-semibold text-secondary mb-3 tracking-wider uppercase opacity-80">{title}</p>
        <p className="text-4xl font-bold text-primary tracking-tight mb-1">{value}</p>
        <p className="text-sm text-muted font-medium leading-relaxed">{subtitle}</p>

        {/* Trend Indicator */}
        {trend && (
          <div className="flex items-center gap-3 mt-5 pt-5 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-[rgba(255,255,255,0.06)] border border-[var(--border-subtle)]">
              {trend === 'up' ? (
                <TrendingUp className="w-5 h-5 text-green-400" strokeWidth={2.5} />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" strokeWidth={2.5} />
              )}
              <span className="text-primary font-bold">{trendValue}</span>
            </div>
            <span className="text-sm text-muted font-medium">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
