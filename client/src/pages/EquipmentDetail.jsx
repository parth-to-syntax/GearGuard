import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings2, 
  MapPin, 
  Pencil, 
  Trash2, 
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Activity,
  Wrench,
  Tag,
  Building2,
  DollarSign,
  History,
  AlertCircle,
  Plus,
  Archive
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';

const statusConfig = {
  OPERATIONAL: { label: 'Operational', color: 'bg-[var(--status-success-bg)] text-[var(--status-success)]', icon: CheckCircle },
  UNDER_MAINTENANCE: { label: 'Under Maintenance', color: 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]', icon: Wrench },
  OUT_OF_SERVICE: { label: 'Out of Service', color: 'bg-[var(--status-danger-bg)] text-[var(--status-danger)]', icon: XCircle },
  DECOMMISSIONED: { label: 'Decommissioned', color: 'bg-[var(--steel-100)] text-[var(--steel-500)]', icon: AlertCircle }
};

export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission, hasRole } = useAuth();
  const [equipment, setEquipment] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteModal, setDeleteModal] = useState(false);
  const [scrapModal, setScrapModal] = useState(false);
  const [maintenanceModal, setMaintenanceModal] = useState(false);
  const [scrapReason, setScrapReason] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('CORRECTIVE');

  useEffect(() => {
    fetchEquipment();
    fetchStats();
  }, [id]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/equipment/${id}`);
      setEquipment(response.data.data);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
      if (error.response?.status === 404) {
        navigate('/equipment');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/equipment/${id}/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/equipment/${id}`);
      navigate('/equipment');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete equipment');
    }
  };

  const handleScrap = async () => {
    try {
      await api.put(`/equipment/${id}/scrap`, {
        reason: scrapReason
      });
      setScrapModal(false);
      fetchEquipment();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to scrap equipment');
    }
  };

  const handleCreateMaintenance = async () => {
    try {
      const response = await api.post(`/equipment/${id}/maintenance-request`, {
        type: maintenanceType,
        priority: 'MEDIUM'
      });
      setMaintenanceModal(false);
      navigate(`/maintenance/${response.data.data.id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create maintenance request');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-accent)]"></div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="text-center py-12">
        <Settings2 className="w-12 h-12 text-[var(--steel-300)] mx-auto mb-4" />
        <p className="text-[var(--steel-500)] font-['DM_Sans']">Equipment not found</p>
      </div>
    );
  }

  const status = statusConfig[equipment.status] || statusConfig.OPERATIONAL;
  const StatusIcon = status.icon;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'requests', label: 'Requests', icon: FileText },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/equipment')}
            className="p-2.5 hover:bg-[var(--steel-100)] rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--steel-600)]" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">{equipment.name}</h1>
              <span className="px-3 py-1.5 bg-[var(--steel-100)] text-[var(--steel-700)] rounded-lg font-['JetBrains_Mono'] text-sm">
                {equipment.code}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-['DM_Sans'] ${status.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {status.label}
              </span>
            </div>
            {equipment.manufacturer && (
              <p className="text-[var(--steel-500)] mt-1 font-['DM_Sans']">
                {equipment.manufacturer} {equipment.model && `• ${equipment.model}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Smart Button - Create Maintenance Request */}
          {equipment.status !== 'DECOMMISSIONED' && (
            <button
              onClick={() => setMaintenanceModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-white bg-gradient-to-r from-[var(--brand-accent)] to-[#e85a2a] rounded-xl hover:from-[#e85a2a] hover:to-[var(--brand-accent)] transition-all shadow-lg shadow-[var(--brand-accent)]/20 font-semibold font-['DM_Sans']"
            >
              <Plus className="w-4 h-4" />
              New Request
            </button>
          )}
          
          {hasPermission('canEdit') && (
            <Link
              to={`/equipment/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-[var(--steel-700)] bg-white border-2 border-[var(--steel-200)] rounded-xl hover:bg-[var(--steel-50)] hover:border-[var(--steel-300)] transition-all font-medium font-['DM_Sans']"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Link>
          )}
          
          {/* Scrap Button */}
          {hasRole('ADMIN', 'MANAGER') && equipment.status !== 'DECOMMISSIONED' && (
            <button
              onClick={() => setScrapModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-[var(--status-warning)] bg-white border-2 border-[var(--status-warning)]/30 rounded-xl hover:bg-[var(--status-warning-bg)] transition-all font-medium font-['DM_Sans']"
            >
              <Archive className="w-4 h-4" />
              Scrap
            </button>
          )}
          
          {hasPermission('canDelete') && (
            <button
              onClick={() => setDeleteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-[var(--status-danger)] bg-white border-2 border-[var(--status-danger)]/30 rounded-xl hover:bg-[var(--status-danger-bg)] transition-all font-medium font-['DM_Sans']"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Health Score Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[var(--steel-200)] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--steel-500)] mb-2 font-['DM_Sans'] uppercase tracking-wide">Health Score</h3>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-[var(--steel-900)] font-['Sora']">{equipment.healthScore}%</span>
              <span className={`px-3 py-1.5 rounded-full text-sm font-semibold font-['DM_Sans'] ${
                equipment.healthStatus === 'HEALTHY' ? 'bg-[var(--status-success-bg)] text-[var(--status-success)]' :
                equipment.healthStatus === 'WARNING' ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]' :
                'bg-[var(--status-danger-bg)] text-[var(--status-danger)]'
              }`}>
                {equipment.healthStatus}
              </span>
            </div>
          </div>
          <div className="w-48">
            <div className="w-full bg-[var(--steel-100)] rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${
                  equipment.healthScore >= 70 ? 'bg-[var(--status-success)]' :
                  equipment.healthScore >= 40 ? 'bg-[var(--status-warning)]' : 'bg-[var(--status-danger)]'
                }`}
                style={{ width: `${equipment.healthScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--steel-200)] p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--status-info-bg)] flex items-center justify-center">
              <FileText className="w-6 h-6 text-[var(--status-info)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">{stats?.totalRequests || 0}</p>
              <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Total Requests</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--steel-200)] p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--brand-accent-muted)] flex items-center justify-center">
              <Clock className="w-6 h-6 text-[var(--brand-accent)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">{stats?.pendingRequests || 0}</p>
              <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--steel-200)] p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--steel-100)] flex items-center justify-center">
              <Wrench className="w-6 h-6 text-[var(--steel-600)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">{stats?.totalHoursSpent?.toFixed(1) || 0}</p>
              <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Hours Spent</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--steel-200)] p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--status-success-bg)] flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[var(--status-success)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">${stats?.totalCost?.toFixed(0) || 0}</p>
              <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Total Cost</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-[var(--steel-900)] mb-4 font-['Sora']">Equipment Details</h3>
                  <div className="space-y-4">
                    {equipment.serialNumber && (
                      <div className="flex items-start gap-3">
                        <Tag className="w-5 h-5 text-[var(--steel-400)] mt-0.5" />
                        <div>
                          <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Serial Number</p>
                          <p className="text-[var(--steel-900)] font-['JetBrains_Mono']">{equipment.serialNumber}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[var(--steel-400)] mt-0.5" />
                      <div>
                        <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Location</p>
                        <p className="text-[var(--steel-900)] font-['DM_Sans']">{equipment.location || '—'}</p>
                      </div>
                    </div>
                    {equipment.workCenter && (
                      <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-[var(--steel-400)] mt-0.5" />
                        <div>
                          <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Work Center</p>
                          <Link 
                            to={`/work-centers/${equipment.workCenter.id}`}
                            className="text-[var(--brand-accent)] hover:underline font-['DM_Sans']"
                          >
                            {equipment.workCenter.name}
                          </Link>
                        </div>
                      </div>
                    )}
                    {equipment.category && (
                      <div className="flex items-start gap-3">
                        <Settings2 className="w-5 h-5 text-[var(--steel-400)] mt-0.5" />
                        <div>
                          <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Category</p>
                          <p className="text-[var(--steel-900)] font-['DM_Sans']">{equipment.category.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {equipment.description && (
                  <div>
                    <h3 className="font-semibold text-[var(--steel-900)] mb-2 font-['Sora']">Description</h3>
                    <p className="text-[var(--steel-600)] font-['DM_Sans']">{equipment.description}</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-[var(--steel-900)] mb-4 font-['Sora']">Dates</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-[var(--steel-400)] mt-0.5" />
                      <div>
                        <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Purchase Date</p>
                        <p className="text-[var(--steel-900)] font-['DM_Sans']">{formatDate(equipment.purchaseDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-[var(--steel-400)] mt-0.5" />
                      <div>
                        <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Warranty Expiry</p>
                        <p className={`font-['DM_Sans'] ${
                          equipment.warrantyExpiry && new Date(equipment.warrantyExpiry) < new Date()
                            ? 'text-[var(--status-danger)]'
                            : 'text-[var(--steel-900)]'
                        }`}>
                          {formatDate(equipment.warrantyExpiry)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Wrench className="w-5 h-5 text-[var(--steel-400)] mt-0.5" />
                      <div>
                        <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Last Maintenance</p>
                        <p className="text-[var(--steel-900)] font-['DM_Sans']">{formatDate(equipment.lastMaintenanceDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-[var(--steel-400)] mt-0.5" />
                      <div>
                        <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Next Maintenance</p>
                        <p className={`font-['DM_Sans'] ${
                          equipment.nextMaintenanceDate && new Date(equipment.nextMaintenanceDate) < new Date()
                            ? 'text-[var(--status-danger)] font-semibold'
                            : 'text-[var(--steel-900)]'
                        }`}>
                          {formatDate(equipment.nextMaintenanceDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              {equipment.maintenanceRequests && equipment.maintenanceRequests.length > 0 ? (
                <div className="space-y-3">
                  {equipment.maintenanceRequests.map((req) => (
                    <Link
                      key={req.id}
                      to={`/maintenance/${req.id}`}
                      className="flex items-center justify-between p-4 bg-[var(--steel-50)] rounded-xl hover:bg-[var(--steel-100)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--brand-accent-muted)] flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[var(--brand-accent)]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{req.title}</p>
                          <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">
                            {req.requestNumber} • {formatDate(req.reportedDate)}
                          </p>
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
                  <p className="text-[var(--steel-500)] font-['DM_Sans']">No maintenance requests</p>
                  <Link
                    to="/maintenance/new"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-[var(--brand-accent)] hover:bg-[var(--brand-accent-muted)] rounded-xl transition-colors font-semibold font-['DM_Sans']"
                  >
                    Create Request
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              {equipment.maintenanceHistory && equipment.maintenanceHistory.length > 0 ? (
                <div className="space-y-3">
                  {equipment.maintenanceHistory.map((record) => (
                    <div
                      key={record.id}
                      className="p-4 bg-[var(--steel-50)] rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-[var(--status-info-bg)] text-[var(--status-info)] rounded-lg text-xs font-semibold font-['DM_Sans']">
                            {record.type}
                          </span>
                          <span className="text-sm text-[var(--steel-500)] font-['DM_Sans']">
                            {formatDate(record.performedAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          {record.hoursSpent && (
                            <span className="text-[var(--steel-600)] font-['DM_Sans']">
                              <Clock className="w-4 h-4 inline mr-1" />
                              {record.hoursSpent}h
                            </span>
                          )}
                          {record.cost && (
                            <span className="text-[var(--steel-600)] font-['DM_Sans']">
                              <DollarSign className="w-4 h-4 inline mr-1" />
                              ${record.cost}
                            </span>
                          )}
                        </div>
                      </div>
                      {record.description && (
                        <p className="text-[var(--steel-600)] text-sm font-['DM_Sans']">{record.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-[var(--steel-300)] mx-auto mb-4" />
                  <p className="text-[var(--steel-500)] font-['DM_Sans']">No maintenance history</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--status-danger-bg)] flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[var(--status-danger)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--steel-900)] font-['Sora']">Delete Equipment</h3>
            </div>
            <p className="text-[var(--steel-600)] mb-6 font-['DM_Sans']">
              Are you sure you want to delete <strong className="text-[var(--steel-900)]">{equipment.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal(false)}
                className="px-4 py-2.5 text-[var(--steel-700)] bg-[var(--steel-100)] rounded-xl hover:bg-[var(--steel-200)] transition-colors font-medium font-['DM_Sans']"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2.5 bg-[var(--status-danger)] text-white rounded-xl hover:bg-red-700 transition-colors font-medium font-['DM_Sans']"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrap Modal */}
      {scrapModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--status-warning-bg)] flex items-center justify-center">
                <Archive className="w-6 h-6 text-[var(--status-warning)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--steel-900)] font-['Sora']">Scrap Equipment</h3>
            </div>
            <p className="text-[var(--steel-600)] mb-4 font-['DM_Sans']">
              This will mark <strong className="text-[var(--steel-900)]">{equipment.name}</strong> as decommissioned. 
              The equipment will no longer be available for maintenance requests.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                Reason for scrapping
              </label>
              <textarea
                value={scrapReason}
                onChange={(e) => setScrapReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl focus:bg-white focus:border-[var(--brand-accent)] transition-all font-['DM_Sans']"
                placeholder="Enter reason..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setScrapModal(false)}
                className="px-4 py-2.5 text-[var(--steel-700)] bg-[var(--steel-100)] rounded-xl hover:bg-[var(--steel-200)] transition-colors font-medium font-['DM_Sans']"
              >
                Cancel
              </button>
              <button
                onClick={handleScrap}
                className="px-4 py-2.5 bg-[var(--status-warning)] text-white rounded-xl hover:bg-orange-600 transition-colors font-medium font-['DM_Sans']"
              >
                Confirm Scrap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Maintenance Request Modal */}
      {maintenanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--brand-accent-muted)] flex items-center justify-center">
                <Plus className="w-6 h-6 text-[var(--brand-accent)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--steel-900)] font-['Sora']">New Maintenance Request</h3>
            </div>
            <p className="text-[var(--steel-600)] mb-4 font-['DM_Sans']">
              Create a maintenance request for <strong className="text-[var(--steel-900)]">{equipment.name}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                Request Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMaintenanceType('PREVENTIVE')}
                  className={`px-4 py-4 rounded-xl border-2 transition-all ${
                    maintenanceType === 'PREVENTIVE' 
                      ? 'border-[var(--status-success)] bg-[var(--status-success-bg)]' 
                      : 'border-[var(--steel-200)] hover:border-[var(--steel-300)]'
                  }`}
                >
                  <div className={`font-semibold font-['DM_Sans'] ${maintenanceType === 'PREVENTIVE' ? 'text-[var(--status-success)]' : 'text-[var(--steel-700)]'}`}>Preventive</div>
                  <div className="text-xs text-[var(--steel-500)] font-['DM_Sans']">Scheduled maintenance</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMaintenanceType('CORRECTIVE')}
                  className={`px-4 py-4 rounded-xl border-2 transition-all ${
                    maintenanceType === 'CORRECTIVE' 
                      ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-muted)]' 
                      : 'border-[var(--steel-200)] hover:border-[var(--steel-300)]'
                  }`}
                >
                  <div className={`font-semibold font-['DM_Sans'] ${maintenanceType === 'CORRECTIVE' ? 'text-[var(--brand-accent)]' : 'text-[var(--steel-700)]'}`}>Corrective</div>
                  <div className="text-xs text-[var(--steel-500)] font-['DM_Sans']">Fix an issue</div>
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMaintenanceModal(false)}
                className="px-4 py-2.5 text-[var(--steel-700)] bg-[var(--steel-100)] rounded-xl hover:bg-[var(--steel-200)] transition-colors font-medium font-['DM_Sans']"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMaintenance}
                className="px-4 py-2.5 bg-gradient-to-r from-[var(--brand-accent)] to-[#e85a2a] text-white rounded-xl hover:from-[#e85a2a] hover:to-[var(--brand-accent)] transition-all font-medium font-['DM_Sans']"
              >
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
