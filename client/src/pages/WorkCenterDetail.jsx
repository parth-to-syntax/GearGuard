import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Pencil, 
  Trash2, 
  Users, 
  Wrench,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Activity,
  MoreVertical
} from 'lucide-react';
import api from '../lib/api';
import StatusBadge from '../components/ui/StatusBadge';

export default function WorkCenterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workCenter, setWorkCenter] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    fetchWorkCenter();
    fetchStats();
  }, [id]);

  const fetchWorkCenter = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/work-centers/${id}`);
      setWorkCenter(response.data.data);
    } catch (error) {
      console.error('Failed to fetch work center:', error);
      if (error.response?.status === 404) {
        navigate('/work-centers');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/work-centers/${id}/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/work-centers/${id}`);
      navigate('/work-centers');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete work center');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-accent)]"></div>
      </div>
    );
  }

  if (!workCenter) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 text-[var(--steel-300)] mx-auto mb-4" />
        <p className="text-[var(--steel-500)] font-['DM_Sans']">Work center not found</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'equipment', label: 'Equipment', icon: Wrench },
    { id: 'requests', label: 'Requests', icon: FileText },
    { id: 'teams', label: 'Teams', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/work-centers')}
            className="p-2.5 hover:bg-[var(--steel-100)] rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--steel-600)]" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">{workCenter.name}</h1>
              <span className="px-2.5 py-1 bg-[var(--steel-100)] text-[var(--steel-700)] rounded-lg font-['JetBrains_Mono'] text-sm">
                {workCenter.code}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                workCenter.isActive ? 'bg-[var(--status-success-bg)] text-[var(--status-success)]' : 'bg-[var(--steel-100)] text-[var(--steel-600)]'
              }`}>
                {workCenter.isActive ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    Inactive
                  </>
                )}
              </span>
            </div>
            {workCenter.description && (
              <p className="text-[var(--steel-500)] mt-1 font-['DM_Sans']">{workCenter.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/work-centers/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-[var(--steel-700)] bg-white border-2 border-[var(--steel-200)] rounded-xl hover:bg-[var(--steel-50)] hover:border-[var(--steel-300)] transition-all font-semibold font-['DM_Sans']"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => setDeleteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-[var(--status-danger)] bg-white border-2 border-[var(--status-danger)]/20 rounded-xl hover:bg-[var(--status-danger-bg)] transition-all font-semibold font-['DM_Sans']"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--steel-200)] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--status-info-bg)] flex items-center justify-center">
              <Wrench className="w-5 h-5 text-[var(--status-info)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">{stats?.totalEquipment || 0}</p>
              <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Total Equipment</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--steel-200)] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--status-success-bg)] flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[var(--status-success)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">{stats?.operationalEquipment || 0}</p>
              <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Operational</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--steel-200)] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--status-warning-bg)] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[var(--status-warning)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">{stats?.pendingRequests || 0}</p>
              <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Pending Requests</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--steel-200)] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-accent-muted)] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[var(--brand-accent)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">{stats?.totalHoursWorked?.toFixed(1) || 0}</p>
              <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Hours Worked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-[var(--steel-200)]">
        <div className="border-b border-[var(--steel-200)]">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-semibold text-sm transition-colors font-['DM_Sans'] ${
                    activeTab === tab.id
                      ? 'border-[var(--brand-accent)] text-[var(--brand-accent)]'
                      : 'border-transparent text-[var(--steel-500)] hover:text-[var(--steel-700)] hover:border-[var(--steel-300)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-[var(--steel-900)] font-['Sora']">Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[var(--steel-400)] mt-0.5" />
                    <div>
                      <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Location</p>
                      <p className="text-[var(--steel-900)] font-['DM_Sans']">{workCenter.location || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-[var(--steel-400)] mt-0.5" />
                    <div>
                      <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Department</p>
                      <p className="text-[var(--steel-900)] font-['DM_Sans']">{workCenter.department?.name || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-[var(--steel-400)] mt-0.5" />
                    <div>
                      <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Capacity</p>
                      <p className="text-[var(--steel-900)] font-['DM_Sans']">{workCenter.capacity || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment Health */}
              {stats?.equipmentHealth && (
                <div className="space-y-4">
                  <h3 className="font-bold text-[var(--steel-900)] font-['Sora']">Equipment Health</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--steel-600)] font-['DM_Sans']">Healthy</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-[var(--steel-200)] rounded-full h-2">
                          <div 
                            className="bg-[var(--status-success)] h-2 rounded-full" 
                            style={{ 
                              width: `${stats.totalEquipment > 0 
                                ? (stats.equipmentHealth.healthy / stats.totalEquipment) * 100 
                                : 0}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-[var(--steel-900)] font-['DM_Sans']">
                          {stats.equipmentHealth.healthy}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--steel-600)] font-['DM_Sans']">Warning</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-[var(--steel-200)] rounded-full h-2">
                          <div 
                            className="bg-[var(--status-warning)] h-2 rounded-full" 
                            style={{ 
                              width: `${stats.totalEquipment > 0 
                                ? (stats.equipmentHealth.warning / stats.totalEquipment) * 100 
                                : 0}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-[var(--steel-900)] font-['DM_Sans']">
                          {stats.equipmentHealth.warning}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--steel-600)] font-['DM_Sans']">Critical</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-[var(--steel-200)] rounded-full h-2">
                          <div 
                            className="bg-[var(--status-danger)] h-2 rounded-full" 
                            style={{ 
                              width: `${stats.totalEquipment > 0 
                                ? (stats.equipmentHealth.critical / stats.totalEquipment) * 100 
                                : 0}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-[var(--steel-900)] font-['DM_Sans']">
                          {stats.equipmentHealth.critical}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Equipment Tab */}
          {activeTab === 'equipment' && (
            <div>
              {workCenter.equipment && workCenter.equipment.length > 0 ? (
                <div className="space-y-3">
                  {workCenter.equipment.map((eq) => (
                    <div
                      key={eq.id}
                      className="flex items-center justify-between p-4 bg-[var(--steel-50)] rounded-xl hover:bg-[var(--steel-100)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--status-info-bg)] flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-[var(--status-info)]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{eq.name}</p>
                          <p className="text-sm text-[var(--steel-500)] font-['JetBrains_Mono']">{eq.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={eq.status} />
                        {eq.healthStatus && (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            eq.healthStatus === 'HEALTHY' ? 'bg-[var(--status-success-bg)] text-[var(--status-success)]' :
                            eq.healthStatus === 'WARNING' ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]' :
                            'bg-[var(--status-danger-bg)] text-[var(--status-danger)]'
                          }`}>
                            {eq.healthStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wrench className="w-12 h-12 text-[var(--steel-300)] mx-auto mb-4" />
                  <p className="text-[var(--steel-500)] font-['DM_Sans']">No equipment assigned to this work center</p>
                </div>
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              {workCenter.maintenanceRequests && workCenter.maintenanceRequests.length > 0 ? (
                <div className="space-y-3">
                  {workCenter.maintenanceRequests.map((req) => (
                    <Link
                      key={req.id}
                      to={`/maintenance-requests/${req.id}`}
                      className="flex items-center justify-between p-4 bg-[var(--steel-50)] rounded-xl hover:bg-[var(--steel-100)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--status-warning-bg)] flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[var(--status-warning)]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{req.title}</p>
                          <p className="text-sm text-[var(--steel-500)] font-['JetBrains_Mono']">{req.requestNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={req.status} />
                        <StatusBadge status={req.priority} type="priority" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-[var(--steel-300)] mx-auto mb-4" />
                  <p className="text-[var(--steel-500)] font-['DM_Sans']">No active maintenance requests</p>
                </div>
              )}
            </div>
          )}

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <div>
              {workCenter.teams && workCenter.teams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workCenter.teams.map((team) => (
                    <Link
                      key={team.id}
                      to={`/teams/${team.id}`}
                      className="p-4 bg-[var(--steel-50)] rounded-xl hover:bg-[var(--steel-100)] transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--brand-accent-muted)] flex items-center justify-center">
                          <Users className="w-5 h-5 text-[var(--brand-accent)]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{team.name}</p>
                          <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">
                            {team.members?.length || 0} members
                          </p>
                        </div>
                      </div>
                      {team.members && team.members.length > 0 && (
                        <div className="flex -space-x-2">
                          {team.members.slice(0, 5).map((member) => (
                            <div
                              key={member.id}
                              className="w-8 h-8 rounded-full bg-[var(--steel-300)] border-2 border-white flex items-center justify-center text-xs font-semibold text-[var(--steel-700)] font-['DM_Sans']"
                              title={member.name}
                            >
                              {member.avatar ? (
                                <img 
                                  src={member.avatar} 
                                  alt={member.name} 
                                  className="w-full h-full rounded-full object-cover" 
                                />
                              ) : (
                                member.name?.charAt(0).toUpperCase()
                              )}
                            </div>
                          ))}
                          {team.members.length > 5 && (
                            <div className="w-8 h-8 rounded-full bg-[var(--steel-200)] border-2 border-white flex items-center justify-center text-xs font-semibold text-[var(--steel-600)] font-['DM_Sans']">
                              +{team.members.length - 5}
                            </div>
                          )}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-[var(--steel-300)] mx-auto mb-4" />
                  <p className="text-[var(--steel-500)] font-['DM_Sans']">No teams assigned to this work center</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 border border-[var(--steel-200)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--status-danger-bg)] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[var(--status-danger)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--steel-900)] font-['Sora']">Delete Work Center</h3>
            </div>
            <p className="text-[var(--steel-600)] mb-6 font-['DM_Sans']">
              Are you sure you want to delete <strong>{workCenter.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal(false)}
                className="px-5 py-2.5 text-[var(--steel-700)] bg-[var(--steel-100)] rounded-xl hover:bg-[var(--steel-200)] transition-colors font-semibold font-['DM_Sans']"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 bg-[var(--status-danger)] text-white rounded-xl hover:bg-red-700 transition-colors font-semibold font-['DM_Sans']"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
