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
import MainLayout from '../components/layout/MainLayout';
import api from '../lib/api';

const statusConfig = {
  OPERATIONAL: { label: 'Operational', color: 'bg-[rgba(16,185,129,0.1)] text-[var(--status-success)] border border-[rgba(16,185,129,0.2)]', icon: CheckCircle },
  UNDER_MAINTENANCE: { label: 'Under Maintenance', color: 'bg-[rgba(245,158,11,0.1)] text-[var(--status-warning)] border border-[rgba(245,158,11,0.2)]', icon: Wrench },
  OUT_OF_SERVICE: { label: 'Out of Service', color: 'bg-[rgba(239,68,68,0.1)] text-[var(--status-danger)] border border-[rgba(239,68,68,0.2)]', icon: XCircle },
  DECOMMISSIONED: { label: 'Decommissioned', color: 'bg-[rgba(255,255,255,0.05)] text-muted border border-[var(--card-border)]', icon: AlertCircle }
};

const healthConfig = {
  HEALTHY: { label: 'Healthy', color: 'bg-[rgba(16,185,129,0.1)] text-[var(--status-success)] border border-[rgba(16,185,129,0.2)]' },
  WARNING: { label: 'Warning', color: 'bg-[rgba(245,158,11,0.1)] text-[var(--status-warning)] border border-[rgba(245,158,11,0.2)]' },
  CRITICAL: { label: 'Critical', color: 'bg-[rgba(239,68,68,0.1)] text-[var(--status-danger)] border border-[rgba(239,68,68,0.2)]' }
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
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-3 border-[var(--card-border)] border-t-[var(--brand-accent)] rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary tracking-tight">Equipment</h1>
          <p className="text-secondary mt-1">Manage machines and tools</p>
        </div>
        <Link
          to="/equipment/new"
          className="lux-btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          New Equipment
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border border-[var(--border-strong)] rounded-lg bg-transparent">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, code, serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="lux-input w-full pl-11 pr-4"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted opacity-70" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="lux-input px-4"
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
              className="lux-input px-4"
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
      <div className="overflow-hidden flex-1 flex flex-col border border-[var(--border-strong)] rounded-lg bg-transparent">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full divide-y divide-[var(--border-subtle)]">
            <thead className="bg-transparent">
              <tr>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Equipment
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Code
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Work Center
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Health
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Requests
                </th>
                <th className="px-5 py-2.5 text-right text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredEquipment.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <div className="w-14 h-14 bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Settings2 className="w-6 h-6 text-muted opacity-70" />
                    </div>
                    <p className="text-primary font-medium">No equipment found</p>
                    <p className="text-secondary text-sm mt-1">
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
                      className="hover:bg-[rgba(255,255,255,0.04)] cursor-pointer transition-colors"
                      onClick={() => navigate(`/equipment/${eq.id}`)}
                    >
                      <td className="px-5 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[var(--card-border)] flex items-center justify-center">
                            <Settings2 className="w-4 h-4 text-muted opacity-70" />
                          </div>
                          <div>
                            <div className="font-medium text-primary leading-snug">{eq.name}</div>
                            {eq.manufacturer && (
                              <div className="text-xs text-muted truncate max-w-xs">{eq.manufacturer}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap">
                        <span className="px-2 py-1 bg-[rgba(255,255,255,0.05)] text-secondary rounded-md font-mono text-[11px] font-medium border border-[var(--card-border)]">
                          {eq.code}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap">
                        {eq.workCenter ? (
                          <div className="flex items-center gap-2 text-secondary text-sm">
                            <MapPin className="w-3.5 h-3.5 text-muted opacity-70" />
                            <span className="font-light">{eq.workCenter.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3 opacity-80" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 w-16 bg-[rgba(255,255,255,0.1)] rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all ${
                                eq.healthScore >= 70 ? 'bg-[var(--status-success)]' :
                                eq.healthScore >= 40 ? 'bg-[var(--status-warning)]' : 'bg-[var(--status-danger)]'
                              }`}
                              style={{ width: `${eq.healthScore}%` }}
                            />
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${health.color}`}>
                            {eq.healthScore}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap">
                        <span className="text-primary font-medium text-sm">{eq.requestCount || 0}</span>
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap text-right">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(openDropdown === eq.id ? null : eq.id);
                            }}
                            className="p-2 hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-muted opacity-70" />
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
                              <div className="absolute right-0 mt-2 w-48 glass-card py-2 z-20" style={{ boxShadow: 'var(--shadow-md)' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/equipment/${eq.id}/edit`);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-primary hover:bg-[rgba(255,255,255,0.05)] flex items-center gap-2"
                                >
                                  <Pencil className="w-4 h-4 text-muted opacity-80" />
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteModal({ open: true, equipment: eq });
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-[var(--status-danger)] hover:bg-[rgba(239,68,68,0.1)] flex items-center gap-2"
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
          <div className="glass-card max-w-md w-full mx-4 p-6" style={{ boxShadow: 'var(--shadow-xl)' }}>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-[rgba(239,68,68,0.1)] flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[var(--status-danger)]" />
              </div>
              <h3 className="text-xl font-semibold text-primary">Delete Equipment</h3>
            </div>
            <p className="text-secondary mb-6">
              Are you sure you want to delete <strong className="text-primary">{deleteModal.equipment?.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, equipment: null })}
                className="px-5 py-2.5 text-primary bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-xl hover:bg-[rgba(255,255,255,0.1)] transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 bg-[var(--status-danger)] text-white rounded-xl hover:opacity-90 transition-all font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </MainLayout>
  );
}
