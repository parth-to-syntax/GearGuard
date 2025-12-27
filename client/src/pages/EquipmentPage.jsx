import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Settings2, 
  MoreVertical, 
  Pencil, 
  Trash2,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Activity,
  Wrench,
  AlertCircle
} from 'lucide-react';
import api from '../lib/api';

const statusConfig = {
  OPERATIONAL: { label: 'Operational', color: 'bg-[var(--status-success-bg)] text-[var(--status-success)]', icon: CheckCircle },
  UNDER_MAINTENANCE: { label: 'Under Maintenance', color: 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]', icon: Wrench },
  OUT_OF_SERVICE: { label: 'Out of Service', color: 'bg-[var(--status-danger-bg)] text-[var(--status-danger)]', icon: XCircle },
  DECOMMISSIONED: { label: 'Decommissioned', color: 'bg-[var(--steel-100)] text-[var(--steel-500)]', icon: AlertCircle }
};

const healthConfig = {
  HEALTHY: { label: 'Healthy', color: 'bg-[var(--status-success-bg)] text-[var(--status-success)]' },
  WARNING: { label: 'Warning', color: 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]' },
  CRITICAL: { label: 'Critical', color: 'bg-[var(--status-danger-bg)] text-[var(--status-danger)]' }
};

export default function EquipmentPage() {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterHealth, setFilterHealth] = useState('all');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, equipment: null });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await api.get('/equipment');
      setEquipment(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.equipment) return;
    
    try {
      await api.delete(`/equipment/${deleteModal.equipment.id}`);
      setEquipment(equipment.filter(eq => eq.id !== deleteModal.equipment.id));
      setDeleteModal({ open: false, equipment: null });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete equipment');
    }
  };

  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = 
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (eq.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (eq.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || eq.status === filterStatus;
    const matchesHealth = filterHealth === 'all' || eq.healthStatus === filterHealth;

    return matchesSearch && matchesStatus && matchesHealth;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-[var(--steel-200)] border-t-[var(--brand-accent)] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">Equipment</h1>
          <p className="text-[var(--steel-500)] mt-1 font-['DM_Sans']">Manage machines and tools</p>
        </div>
        <Link
          to="/equipment/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#e85a2a] text-white rounded-xl font-semibold font-['DM_Sans'] hover:-translate-y-0.5 transition-all"
          style={{ boxShadow: '0 4px 14px rgba(255, 107, 53, 0.35)' }}
        >
          <Plus className="w-5 h-5" />
          New Equipment
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-[var(--border-subtle)] p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--steel-400)] w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, code, serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl focus:bg-white focus:border-[var(--brand-accent)] transition-all font-['DM_Sans']"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-[var(--steel-400)]" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl focus:bg-white focus:border-[var(--brand-accent)] transition-all font-['DM_Sans'] text-sm"
            >
              <option value="all">All Status</option>
              <option value="OPERATIONAL">Operational</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
              <option value="DECOMMISSIONED">Decommissioned</option>
            </select>
            <select
              value={filterHealth}
              onChange={(e) => setFilterHealth(e.target.value)}
              className="px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl focus:bg-white focus:border-[var(--brand-accent)] transition-all font-['DM_Sans'] text-sm"
            >
              <option value="all">All Health</option>
              <option value="HEALTHY">Healthy</option>
              <option value="WARNING">Warning</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-xl border border-[var(--border-subtle)] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border-default)]">
            <thead className="bg-[var(--steel-50)]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--steel-600)] uppercase tracking-wider font-['Sora']">
                  Equipment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--steel-600)] uppercase tracking-wider font-['Sora']">
                  Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--steel-600)] uppercase tracking-wider font-['Sora']">
                  Work Center
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--steel-600)] uppercase tracking-wider font-['Sora']">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--steel-600)] uppercase tracking-wider font-['Sora']">
                  Health
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--steel-600)] uppercase tracking-wider font-['Sora']">
                  Requests
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--steel-600)] uppercase tracking-wider font-['Sora']">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[var(--border-default)]">
              {filteredEquipment.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-[var(--steel-100)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Settings2 className="w-8 h-8 text-[var(--steel-400)]" />
                    </div>
                    <p className="text-[var(--steel-700)] font-semibold font-['Sora']">No equipment found</p>
                    <p className="text-[var(--steel-500)] text-sm mt-1 font-['DM_Sans']">
                      {searchTerm || filterStatus !== 'all' || filterHealth !== 'all'
                        ? 'Try adjusting your search or filters' 
                        : 'Get started by adding new equipment'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEquipment.map((eq) => {
                  const status = statusConfig[eq.status] || statusConfig.OPERATIONAL;
                  const health = healthConfig[eq.healthStatus] || healthConfig.HEALTHY;
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr 
                      key={eq.id} 
                      className="hover:bg-[var(--steel-50)] cursor-pointer transition-colors"
                      onClick={() => navigate(`/equipment/${eq.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--steel-100)] to-[var(--steel-200)] flex items-center justify-center">
                            <Settings2 className="w-5 h-5 text-[var(--steel-600)]" />
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{eq.name}</div>
                            {eq.manufacturer && (
                              <div className="text-sm text-[var(--steel-500)] font-['DM_Sans']">{eq.manufacturer}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1.5 bg-[var(--steel-100)] text-[var(--steel-700)] rounded-lg font-['JetBrains_Mono'] text-sm font-medium">
                          {eq.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {eq.workCenter ? (
                          <div className="flex items-center gap-2 text-[var(--steel-600)] font-['DM_Sans']">
                            <MapPin className="w-4 h-4" />
                            {eq.workCenter.name}
                          </div>
                        ) : (
                          <span className="text-[var(--steel-400)]">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${status.color} font-['DM_Sans']`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 w-20 bg-[var(--steel-200)] rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                eq.healthScore >= 70 ? 'bg-[var(--status-success)]' :
                                eq.healthScore >= 40 ? 'bg-[var(--status-warning)]' : 'bg-[var(--status-danger)]'
                              }`}
                              style={{ width: `${eq.healthScore}%` }}
                            />
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${health.color} font-['DM_Sans']`}>
                            {eq.healthScore}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[var(--steel-700)] font-semibold font-['DM_Sans']">{eq.requestCount || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(openDropdown === eq.id ? null : eq.id);
                            }}
                            className="p-2 hover:bg-[var(--steel-100)] rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-[var(--steel-500)]" />
                          </button>
                          
                          {openDropdown === eq.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(null);
                                }}
                              />
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-[var(--border-default)] py-2 z-20" style={{ boxShadow: 'var(--shadow-lg)' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/equipment/${eq.id}/edit`);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-[var(--steel-700)] hover:bg-[var(--steel-50)] flex items-center gap-2 font-['DM_Sans']"
                                >
                                  <Pencil className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteModal({ open: true, equipment: eq });
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] flex items-center gap-2 font-['DM_Sans']"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6" style={{ boxShadow: 'var(--shadow-xl)' }}>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-[var(--status-danger-bg)] flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[var(--status-danger)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--steel-900)] font-['Sora']">Delete Equipment</h3>
            </div>
            <p className="text-[var(--steel-600)] mb-6 font-['DM_Sans']">
              Are you sure you want to delete <strong className="text-[var(--steel-900)]">{deleteModal.equipment?.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, equipment: null })}
                className="px-5 py-2.5 text-[var(--steel-700)] bg-[var(--steel-100)] rounded-xl hover:bg-[var(--steel-200)] transition-all font-semibold font-['DM_Sans']"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 bg-[var(--status-danger)] text-white rounded-xl hover:opacity-90 transition-all font-semibold font-['DM_Sans']"
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
