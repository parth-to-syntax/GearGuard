const statusConfig = {
  'New Request': { dot: 'bg-[var(--text-secondary)]', strong: false },
  'Draft': { dot: 'bg-[var(--text-secondary)]', strong: false },
  'DRAFT': { dot: 'bg-[var(--text-secondary)]', strong: false },
  'SUBMITTED': { dot: 'bg-[var(--status-info)]', strong: false },
  'In Review': { dot: 'bg-[var(--status-warning)]', strong: false },
  'IN_REVIEW': { dot: 'bg-[var(--status-warning)]', strong: false },
  'Approved': { dot: 'bg-[var(--status-info)]', strong: false },
  'APPROVED': { dot: 'bg-[var(--status-info)]', strong: false },
  'PENDING': { dot: 'bg-[var(--status-warning)]', strong: false },
  'In Progress': { dot: 'bg-[var(--brand-accent)]', strong: false },
  'IN_PROGRESS': { dot: 'bg-[var(--brand-accent)]', strong: false },
  'On Hold': { dot: 'bg-orange-500', strong: false },
  'ON_HOLD': { dot: 'bg-orange-500', strong: false },
  'Completed': { dot: 'bg-[var(--status-success)]', strong: false },
  'COMPLETED': { dot: 'bg-[var(--status-success)]', strong: false },
  'Reopened': { dot: 'bg-yellow-500', strong: false },
  'REOPENED': { dot: 'bg-yellow-500', strong: false },
  'Cancelled': { dot: 'bg-[var(--status-danger)]', strong: true },
  'CANCELLED': { dot: 'bg-[var(--status-danger)]', strong: true }
};

const priorityConfig = {
  LOW: {
    bg: 'bg-[rgba(255,255,255,0.05)]',
    text: 'text-secondary',
    border: 'border-[var(--card-border)]',
    accent: 'bg-[var(--text-muted)]'
  },
  MEDIUM: {
    bg: 'bg-[rgba(234,179,8,0.15)]',
    text: 'text-yellow-400',
    border: 'border-[rgba(234,179,8,0.3)]',
    accent: 'bg-[var(--priority-medium)]'
  },
  HIGH: {
    bg: 'bg-[rgba(249,115,22,0.15)]',
    text: 'text-orange-400',
    border: 'border-[rgba(249,115,22,0.3)]',
    accent: 'bg-[var(--priority-high)]'
  },
  CRITICAL: {
    bg: 'bg-[var(--status-danger-bg)]',
    text: 'text-red-400',
    border: 'border-[var(--status-danger-border)]',
    accent: 'bg-[var(--priority-critical)]'
  }
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig['Draft'];
  const displayStatus = status?.replace(/_/g, ' ').split(' ').map(w => 
    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  ).join(' ');
  
  return (
    <span className={`
      inline-flex items-center gap-2 px-3 py-1.5 
      rounded-lg text-xs font-semibold uppercase tracking-wide
      border font-['DM_Sans']
      ${config.strong ? 'bg-[var(--status-danger-bg)] text-red-400 border-[var(--status-danger-border)]' : 'bg-[var(--steel-50)] text-secondary border-[var(--border-subtle)]'}
    `}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {displayStatus}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || priorityConfig['MEDIUM'];
  const label = priority?.charAt(0) + priority?.slice(1).toLowerCase();
  
  return (
    <span className={`
      inline-flex items-center gap-2 pl-0 pr-3 py-1.5 
      rounded-lg text-xs font-semibold uppercase tracking-wide
      border overflow-hidden font-['DM_Sans']
      ${config.bg} ${config.text} ${config.border}
    `}>
      <span className={`w-1 h-full ${config.accent} self-stretch`} />
      {label}
    </span>
  );
};

export default StatusBadge;
