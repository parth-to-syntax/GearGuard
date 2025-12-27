import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  User, 
  Wrench,
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Send,
  Edit3,
  Trash2,
  RefreshCw,
  MoreVertical,
  History
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../components/ui/StatusBadge';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'steel', next: 'SUBMITTED' },
  SUBMITTED: { label: 'New Request', color: 'info', next: 'IN_PROGRESS' },
  IN_REVIEW: { label: 'In Review', color: 'warning', next: 'APPROVED' },
  APPROVED: { label: 'Approved', color: 'info', next: 'IN_PROGRESS' },
  IN_PROGRESS: { label: 'In Progress', color: 'accent', next: 'COMPLETED' },
  ON_HOLD: { label: 'On Hold', color: 'warning', next: 'IN_PROGRESS' },
  COMPLETED: { label: 'Completed', color: 'success', next: null },
  REOPENED: { label: 'Reopened', color: 'warning', next: 'IN_PROGRESS' },
  CANCELLED: { label: 'Cancelled', color: 'danger', next: null }
};

const workflowStages = ['SUBMITTED', 'IN_PROGRESS', 'COMPLETED'];

const MaintenanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/maintenance-requests/${id}`);
      setRequest(response.data.data);
    } catch (error) {
      console.error('Error fetching request:', error);
      if (error.response?.status === 404) {
        navigate('/maintenance');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await api.patch(`/maintenance-requests/${id}/status`, { status: newStatus });
      fetchRequest();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmittingComment(true);
      await api.post(`/maintenance-requests/${id}/comments`, { content: comment });
      setComment('');
      fetchRequest();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (hours) => {
    if (!hours) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-[var(--steel-200)] rounded-xl w-1/3" />
        <div className="h-32 bg-[var(--steel-200)] rounded-2xl" />
        <div className="h-64 bg-[var(--steel-200)] rounded-2xl" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-[var(--status-warning)] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[var(--steel-900)] font-['Sora']">Request Not Found</h2>
        <p className="text-[var(--steel-500)] mt-2 font-['DM_Sans']">The maintenance request you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/maintenance')}
          className="mt-4 px-5 py-2.5 bg-gradient-to-r from-[var(--brand-accent)] to-[#e85a2a] text-white rounded-xl hover:from-[#e85a2a] hover:to-[var(--brand-accent)] transition-all font-semibold font-['DM_Sans'] shadow-lg shadow-[var(--brand-accent)]/20"
        >
          Back to Maintenance
        </button>
      </div>
    );
  }

  const currentStageIndex = workflowStages.indexOf(request.status);
  const config = statusConfig[request.status] || statusConfig.DRAFT;

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[var(--steel-600)] hover:text-[var(--steel-900)] transition-colors mb-4 font-['DM_Sans']"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-['JetBrains_Mono'] text-[var(--steel-500)] bg-[var(--steel-100)] px-2.5 py-1 rounded-lg">
                {request.requestNumber}
              </span>
              <StatusBadge status={config.label} />
              <PriorityBadge priority={request.priority} />
              {request.isOverdue && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-[var(--status-danger-bg)] text-[var(--status-danger)] text-xs font-semibold rounded-full">
                  <AlertTriangle className="w-3 h-3" />
                  Overdue
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">{request.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRequest}
              className="p-2.5 text-[var(--steel-500)] hover:text-[var(--steel-700)] hover:bg-[var(--steel-100)] rounded-xl transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate(`/maintenance/${id}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-[var(--steel-700)] bg-white border-2 border-[var(--steel-200)] rounded-xl hover:bg-[var(--steel-50)] hover:border-[var(--steel-300)] transition-all font-semibold font-['DM_Sans']"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            {config.next && (
              <button
                onClick={() => handleStatusChange(config.next)}
                disabled={updating}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--brand-accent)] to-[#e85a2a] text-white rounded-xl hover:from-[#e85a2a] hover:to-[var(--brand-accent)] transition-all disabled:opacity-50 font-semibold font-['DM_Sans'] shadow-lg shadow-[var(--brand-accent)]/20"
              >
                {updating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Move to {statusConfig[config.next]?.label}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Workflow Progress */}
      <div className="bg-white rounded-2xl border border-[var(--steel-200)] p-6 mb-6">
        <h3 className="text-sm font-bold text-[var(--steel-700)] mb-4 font-['Sora']">Workflow Progress</h3>
        <div className="relative">
          <div className="flex items-center justify-between">
            {workflowStages.map((stage, index) => {
              const stageConfig = statusConfig[stage];
              const isActive = request.status === stage;
              const isCompleted = workflowStages.indexOf(request.status) > index || request.status === 'COMPLETED';
              
              return (
                <div key={stage} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-[var(--status-success)] text-white'
                        : isActive
                        ? 'bg-[var(--brand-accent)] text-white ring-4 ring-[var(--brand-accent)]/20'
                        : 'bg-[var(--steel-200)] text-[var(--steel-500)]'
                    }`}
                  >
                    {isCompleted && !isActive ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold font-['DM_Sans']">{index + 1}</span>
                    )}
                  </div>
                  <span className={`mt-2 text-sm font-semibold font-['DM_Sans'] ${
                    isActive ? 'text-[var(--brand-accent)]' : isCompleted ? 'text-[var(--status-success)]' : 'text-[var(--steel-500)]'
                  }`}>
                    {stageConfig.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-[var(--steel-200)] -z-0" />
          <div 
            className="absolute top-5 left-0 h-0.5 bg-[var(--status-success)] transition-all duration-500 -z-0"
            style={{ width: `${Math.max(0, (currentStageIndex / (workflowStages.length - 1)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-[var(--steel-200)] overflow-hidden">
            <div className="flex border-b border-[var(--steel-200)]">
              {['details', 'comments', 'activity'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-colors font-['DM_Sans'] ${
                    activeTab === tab
                      ? 'text-[var(--brand-accent)] border-b-2 border-[var(--brand-accent)] bg-[var(--brand-accent-muted)]'
                      : 'text-[var(--steel-600)] hover:text-[var(--steel-900)] hover:bg-[var(--steel-50)]'
                  }`}
                >
                  {tab === 'details' && 'Details'}
                  {tab === 'comments' && `Comments (${request.comments?.length || 0})`}
                  {tab === 'activity' && 'Activity Log'}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-bold text-[var(--steel-700)] mb-2 font-['Sora']">Description</h4>
                    <p className="text-[var(--steel-600)] whitespace-pre-wrap font-['DM_Sans']">
                      {request.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem 
                      label="Request Type" 
                      value={request.type.replace('_', ' ')}
                      icon={<Wrench className="w-4 h-4" />}
                    />
                    <InfoItem 
                      label="Request Date" 
                      value={formatDate(request.reportedDate)}
                      icon={<Calendar className="w-4 h-4" />}
                    />
                    <InfoItem 
                      label="Scheduled Date" 
                      value={formatDate(request.scheduledDate)}
                      icon={<Calendar className="w-4 h-4" />}
                    />
                    <InfoItem 
                      label="Due Date" 
                      value={formatDate(request.dueDate)}
                      icon={<Clock className="w-4 h-4" />}
                    />
                    <InfoItem 
                      label="Estimated Duration" 
                      value={formatDuration(request.estimatedHours)}
                      icon={<Clock className="w-4 h-4" />}
                    />
                    <InfoItem 
                      label="Actual Duration" 
                      value={formatDuration(request.actualHours)}
                      icon={<Clock className="w-4 h-4" />}
                    />
                  </div>

                  {/* Notes */}
                  {request.attachments?.notes && (
                    <div>
                      <h4 className="text-sm font-bold text-[var(--steel-700)] mb-2 font-['Sora']">Notes</h4>
                      <div className="bg-[var(--steel-50)] rounded-xl p-4 text-[var(--steel-600)] font-['DM_Sans']">
                        {request.attachments.notes}
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  {request.attachments?.instructions && (
                    <div>
                      <h4 className="text-sm font-bold text-[var(--steel-700)] mb-2 font-['Sora']">Instructions</h4>
                      <div className="bg-[var(--status-warning-bg)] rounded-xl p-4 text-[var(--status-warning)] border border-[var(--status-warning)]/20 font-['DM_Sans']">
                        {request.attachments.instructions}
                      </div>
                    </div>
                  )}

                  {/* Resolution (if completed) */}
                  {request.resolution && (
                    <div>
                      <h4 className="text-sm font-bold text-[var(--steel-700)] mb-2 font-['Sora']">Resolution</h4>
                      <div className="bg-[var(--status-success-bg)] rounded-xl p-4 text-[var(--status-success)] border border-[var(--status-success)]/20 font-['DM_Sans']">
                        {request.resolution}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="flex gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--brand-accent)] to-[#e85a2a] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white text-sm font-bold font-['DM_Sans']">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 relative">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={2}
                        className="w-full px-4 py-3 pr-12 bg-[var(--steel-50)] border-2 border-transparent rounded-xl focus:bg-white focus:border-[var(--brand-accent)] transition-all resize-none font-['DM_Sans']"
                      />
                      <button
                        type="submit"
                        disabled={!comment.trim() || submittingComment}
                        className="absolute right-3 bottom-3 p-2 bg-gradient-to-r from-[var(--brand-accent)] to-[#e85a2a] text-white rounded-lg hover:from-[#e85a2a] hover:to-[var(--brand-accent)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-4 mt-6">
                    {request.comments?.length === 0 ? (
                      <div className="text-center py-8 text-[var(--steel-500)]">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-['DM_Sans']">No comments yet. Be the first to comment!</p>
                      </div>
                    ) : (
                      request.comments?.map((c) => (
                        <div key={c.id} className="flex gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[var(--steel-400)] to-[var(--steel-500)] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                            {c.user?.avatar ? (
                              <img src={c.user.avatar} alt={c.user.name} className="w-full h-full rounded-full" />
                            ) : (
                              <span className="text-white text-sm font-bold font-['DM_Sans']">
                                {c.user?.name?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 bg-[var(--steel-50)] rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-[var(--steel-900)] font-['DM_Sans']">{c.user?.name}</span>
                              <span className="text-xs text-[var(--steel-500)] font-['DM_Sans']">{formatDate(c.createdAt)}</span>
                            </div>
                            <p className="text-[var(--steel-600)] font-['DM_Sans']">{c.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {request.activities?.length === 0 ? (
                    <div className="text-center py-8 text-[var(--steel-500)]">
                      <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-['DM_Sans']">No activity recorded yet.</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[var(--steel-200)]" />
                      {request.activities?.map((activity, index) => (
                        <div key={activity.id} className="flex gap-4 pb-4 relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                            activity.action === 'CREATE' ? 'bg-[var(--status-success-bg)] text-[var(--status-success)]' :
                            activity.action === 'STATUS_CHANGE' ? 'bg-[var(--status-info-bg)] text-[var(--status-info)]' :
                            'bg-[var(--steel-100)] text-[var(--steel-600)]'
                          }`}>
                            {activity.action === 'CREATE' && <CheckCircle2 className="w-5 h-5" />}
                            {activity.action === 'STATUS_CHANGE' && <RefreshCw className="w-5 h-5" />}
                            {activity.action === 'UPDATE' && <Edit3 className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-[var(--steel-900)] font-semibold font-['DM_Sans']">{activity.description}</p>
                            <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">
                              by {activity.user?.name} • {formatDate(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Equipment Info */}
          {request.equipment && (
            <div className="bg-white rounded-2xl border border-[var(--steel-200)] p-6">
              <h3 className="text-sm font-bold text-[var(--steel-700)] mb-4 flex items-center gap-2 font-['Sora']">
                <Wrench className="w-4 h-4" />
                Equipment
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-lg font-bold text-[var(--steel-900)] font-['Sora']">{request.equipment.name}</p>
                  <p className="text-sm text-[var(--steel-500)] font-['JetBrains_Mono']">{request.equipment.code}</p>
                </div>
                {request.equipment.category && (
                  <div className="flex items-center gap-2 text-sm text-[var(--steel-600)]">
                    <span className="px-2.5 py-1 bg-[var(--steel-100)] rounded-lg font-['DM_Sans']">{request.equipment.category.name}</span>
                  </div>
                )}
                <button
                  onClick={() => navigate(`/equipment/${request.equipment.id}`)}
                  className="w-full mt-2 px-4 py-2.5 text-sm text-[var(--brand-accent)] bg-[var(--brand-accent-muted)] rounded-xl hover:bg-[var(--brand-accent)] hover:text-white transition-all font-semibold font-['DM_Sans']"
                >
                  View Equipment
                </button>
              </div>
            </div>
          )}

          {/* Assignment */}
          <div className="bg-white rounded-2xl border border-[var(--steel-200)] p-6">
            <h3 className="text-sm font-bold text-[var(--steel-700)] mb-4 flex items-center gap-2 font-['Sora']">
              <User className="w-4 h-4" />
              Assignment
            </h3>
            <div className="space-y-4">
              {/* Created By */}
              <div>
                <p className="text-xs text-[var(--steel-500)] uppercase tracking-wide mb-1 font-['DM_Sans']">Created By</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--steel-400)] to-[var(--steel-500)] rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-bold font-['DM_Sans']">
                      {request.createdBy?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{request.createdBy?.name}</p>
                    <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">{request.createdBy?.email}</p>
                  </div>
                </div>
              </div>

              {/* Assigned To */}
              <div>
                <p className="text-xs text-[var(--steel-500)] uppercase tracking-wide mb-1 font-['DM_Sans']">Assigned To</p>
                {request.assignedTo ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--brand-accent)] to-[#e85a2a] rounded-full flex items-center justify-center shadow-md">
                      {request.assignedTo.avatar ? (
                        <img src={request.assignedTo.avatar} alt={request.assignedTo.name} className="w-full h-full rounded-full" />
                      ) : (
                        <span className="text-white text-sm font-bold font-['DM_Sans']">
                          {request.assignedTo.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{request.assignedTo.name}</p>
                      <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">{request.assignedTo.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[var(--steel-500)] italic font-['DM_Sans']">Unassigned</p>
                )}
              </div>

              {/* Team */}
              {request.team && (
                <div>
                  <p className="text-xs text-[var(--steel-500)] uppercase tracking-wide mb-1 font-['DM_Sans']">Team</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[var(--steel-400)]" />
                    <span className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{request.team.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-[var(--steel-200)] p-6">
            <h3 className="text-sm font-bold text-[var(--steel-700)] mb-4 font-['Sora']">Quick Actions</h3>
            <div className="space-y-2">
              {request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && (
                <>
                  <button
                    onClick={() => handleStatusChange('ON_HOLD')}
                    disabled={request.status === 'ON_HOLD'}
                    className="w-full px-4 py-2.5 text-sm text-[var(--status-warning)] bg-[var(--status-warning-bg)] rounded-xl hover:bg-[var(--status-warning)] hover:text-white disabled:opacity-50 transition-all font-semibold font-['DM_Sans']"
                  >
                    Put On Hold
                  </button>
                  <button
                    onClick={() => handleStatusChange('CANCELLED')}
                    className="w-full px-4 py-2.5 text-sm text-[var(--status-danger)] bg-[var(--status-danger-bg)] rounded-xl hover:bg-[var(--status-danger)] hover:text-white transition-all font-semibold font-['DM_Sans']"
                  >
                    Mark as Scrap
                  </button>
                </>
              )}
              {request.status === 'COMPLETED' && (
                <button
                  onClick={() => handleStatusChange('REOPENED')}
                  className="w-full px-4 py-2.5 text-sm text-[var(--status-warning)] bg-[var(--status-warning-bg)] rounded-xl hover:bg-[var(--status-warning)] hover:text-white transition-all font-semibold font-['DM_Sans']"
                >
                  Reopen Request
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper component for info items
const InfoItem = ({ label, value, icon }) => (
  <div className="flex items-start gap-3">
    <div className="p-2.5 bg-[var(--steel-100)] rounded-xl text-[var(--steel-500)]">
      {icon}
    </div>
    <div>
      <p className="text-xs text-[var(--steel-500)] uppercase tracking-wide font-['DM_Sans']">{label}</p>
      <p className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{value}</p>
    </div>
  </div>
);

export default MaintenanceDetail;
