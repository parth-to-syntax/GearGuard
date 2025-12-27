const statusConfig = {
  'New Request': {
    bg: 'bg-[var(--steel-100)]',
    text: 'text-[var(--steel-700)]',
    border: 'border-[var(--steel-200)]',
    dot: 'bg-[var(--steel-500)]'
  },
  'Draft': {
    bg: 'bg-[var(--steel-100)]',
    text: 'text-[var(--steel-600)]',
    border: 'border-[var(--steel-200)]',
    dot: 'bg-[var(--steel-400)]'
  },
  'DRAFT': {
    bg: 'bg-[var(--steel-100)]',
    text: 'text-[var(--steel-600)]',
    border: 'border-[var(--steel-200)]',
    dot: 'bg-[var(--steel-400)]'
  },
  'SUBMITTED': {
    bg: 'bg-[var(--status-info-bg)]',
    text: 'text-[var(--status-info)]',
    border: 'border-[var(--status-info-border)]',
    dot: 'bg-[var(--status-info)]'
  },
  'In Review': {
    bg: 'bg-[var(--status-warning-bg)]',
    text: 'text-amber-700',
    border: 'border-[var(--status-warning-border)]',
    dot: 'bg-[var(--status-warning)]'
  },
  'IN_REVIEW': {
    bg: 'bg-[var(--status-warning-bg)]',
    text: 'text-amber-700',
    border: 'border-[var(--status-warning-border)]',
    dot: 'bg-[var(--status-warning)]'
  },
  'Approved': {
    bg: 'bg-[var(--status-info-bg)]',
    text: 'text-[var(--status-info)]',
    border: 'border-[var(--status-info-border)]',
    dot: 'bg-[var(--status-info)]'
  },
  'APPROVED': {
    bg: 'bg-[var(--status-info-bg)]',
    text: 'text-[var(--status-info)]',
    border: 'border-[var(--status-info-border)]',
    dot: 'bg-[var(--status-info)]'
  },
  'PENDING': {
    bg: 'bg-[var(--status-warning-bg)]',
    text: 'text-amber-700',
    border: 'border-[var(--status-warning-border)]',
    dot: 'bg-[var(--status-warning)]'
  },
  'In Progress': {
    bg: 'bg-[var(--brand-accent-muted)]',
    text: 'text-[var(--brand-accent)]',
    border: 'border-[rgba(255,107,53,0.3)]',
    dot: 'bg-[var(--brand-accent)]'
  },
  'IN_PROGRESS': {
    bg: 'bg-[var(--brand-accent-muted)]',
    text: 'text-[var(--brand-accent)]',
    border: 'border-[rgba(255,107,53,0.3)]',
    dot: 'bg-[var(--brand-accent)]'
  },
  'On Hold': {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500'
  },
  'ON_HOLD': {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500'
  },
  'Completed': {
    bg: 'bg-[var(--status-success-bg)]',
    text: 'text-[var(--status-success)]',
    border: 'border-[var(--status-success-border)]',
    dot: 'bg-[var(--status-success)]'
  },
  'COMPLETED': {
    bg: 'bg-[var(--status-success-bg)]',
    text: 'text-[var(--status-success)]',
    border: 'border-[var(--status-success-border)]',
    dot: 'bg-[var(--status-success)]'
  },
  'Reopened': {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500'
  },
  'REOPENED': {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500'
  },
  'Cancelled': {
    bg: 'bg-[var(--status-danger-bg)]',
    text: 'text-[var(--status-danger)]',
    border: 'border-[var(--status-danger-border)]',
    dot: 'bg-[var(--status-danger)]'
  },
  'CANCELLED': {
    bg: 'bg-[var(--status-danger-bg)]',
    text: 'text-[var(--status-danger)]',
    border: 'border-[var(--status-danger-border)]',
    dot: 'bg-[var(--status-danger)]'
  }
};

const priorityConfig = {
  LOW: {
    bg: 'bg-[var(--steel-100)]',
    text: 'text-[var(--steel-600)]',
    border: 'border-[var(--steel-200)]',
    accent: 'bg-[var(--steel-400)]'
  },
  MEDIUM: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    accent: 'bg-[var(--priority-medium)]'
  },
  HIGH: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    accent: 'bg-[var(--priority-high)]'
  },
  CRITICAL: {
    bg: 'bg-[var(--status-danger-bg)]',
    text: 'text-[var(--status-danger)]',
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
      ${config.bg} ${config.text} ${config.border}
    `}>
      <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
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
