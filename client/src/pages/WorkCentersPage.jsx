import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Building2, 
  MoreVertical, 
  Pencil, 
  Trash2,
  MapPin,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import api from '../lib/api';

export default function WorkCentersPage() {
  const navigate = useNavigate();
  const [workCenters, setWorkCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, workCenter: null });

  useEffect(() => {
    fetchWorkCenters();
  }, []);

  const fetchWorkCenters = async () => {
    try {
      setLoading(true);
      const response = await api.get('/work-centers');
      setWorkCenters(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch work centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.workCenter) return;
    
    try {
      await api.delete(`/work-centers/${deleteModal.workCenter.id}`);
      setWorkCenters(workCenters.filter(wc => wc.id !== deleteModal.workCenter.id));
      setDeleteModal({ open: false, workCenter: null });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete work center');
    }
  };

  const filteredWorkCenters = workCenters.filter(wc => {
    const matchesSearch = 
      wc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (wc.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterActive === 'all' ||
      (filterActive === 'active' && wc.isActive) ||
      (filterActive === 'inactive' && !wc.isActive);

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-[rgba(255,255,255,0.05)] text-secondary border border-[var(--card-border)]'
      : 'bg-[rgba(239,68,68,0.10)] text-[rgba(239,68,68,0.92)] border border-[rgba(239,68,68,0.22)]';
  };

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
          <h1 className="text-2xl font-semibold text-primary tracking-tight">Work Centers</h1>
          <p className="text-secondary mt-1">Manage your facility work centers</p>
        </div>
        <Link
          to="/work-centers/new"
          className="lux-btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          New Work Center
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border border-[var(--border-strong)] rounded-lg bg-transparent">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Search work centers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="lux-input w-full pl-11 pr-4"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted opacity-70" />
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="lux-input px-4"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Work Centers Table */}
      <div className="overflow-hidden flex-1 flex flex-col border border-[var(--border-strong)] rounded-lg bg-transparent">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full divide-y divide-[var(--border-subtle)]">
            <thead className="bg-transparent">
              <tr>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Work Center
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Code
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Location
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Department
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Equipment
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Teams
                </th>
                <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-2.5 text-right text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredWorkCenters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center">
                    <div className="w-14 h-14 bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-6 h-6 text-muted opacity-70" />
                    </div>
                    <p className="text-primary font-medium">No work centers found</p>
                    <p className="text-secondary text-sm mt-1">
                      {searchTerm || filterActive !== 'all' 
                        ? 'Try adjusting your search or filters' 
                        : 'Get started by creating a new work center'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredWorkCenters.map((workCenter) => (
                  <tr 
                    key={workCenter.id} 
                    className="hover:bg-[rgba(255,255,255,0.04)] cursor-pointer transition-colors"
                    onClick={() => navigate(`/work-centers/${workCenter.id}`)}
                  >
                    <td className="px-5 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[var(--card-border)] flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-muted opacity-70" />
                        </div>
                        <div>
                          <div className="font-medium text-primary leading-snug">{workCenter.name}</div>
                          {workCenter.description && (
                            <div className="text-xs text-muted truncate max-w-xs">
                              {workCenter.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-1 bg-[rgba(255,255,255,0.05)] text-secondary rounded-md font-mono text-[11px] font-medium border border-[var(--card-border)]">
                        {workCenter.code}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap">
                      {workCenter.location ? (
                        <div className="flex items-center gap-2 text-secondary text-sm">
                          <MapPin className="w-3.5 h-3.5 text-muted opacity-70" />
                          <span className="font-light">{workCenter.location}</span>
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap">
                      {workCenter.department ? (
                        <span className="text-secondary text-sm font-light">{workCenter.department.name}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm">
                        <Wrench className="w-3.5 h-3.5 text-muted opacity-70" />
                        <span className="text-primary font-medium">{workCenter.equipmentCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap">
                      {workCenter.teams && workCenter.teams.length > 0 ? (
                        <div className="flex items-center gap-1">
                          {workCenter.teams.slice(0, 2).map((team, idx) => (
                            <span 
                              key={team.id} 
                              className="px-2 py-0.5 bg-[rgba(255,255,255,0.05)] text-secondary border border-[var(--card-border)] rounded-md text-[11px] font-medium"
                            >
                              {team.name}
                            </span>
                          ))}
                          {workCenter.teams.length > 2 && (
                            <span className="text-muted text-xs">
                              +{workCenter.teams.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium ${getStatusColor(workCenter.isActive)}`}>
                        {workCenter.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3 opacity-80" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 opacity-80" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap text-right">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === workCenter.id ? null : workCenter.id);
                          }}
                          className="p-2 hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-muted opacity-70" />
                        </button>
                        
                        {openDropdown === workCenter.id && (
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
                                  navigate(`/work-centers/${workCenter.id}/edit`);
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
                                  setDeleteModal({ open: true, workCenter });
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4 opacity-90" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-[var(--status-danger-bg)] flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[var(--status-danger)]" />
              </div>
              <h3 className="text-xl font-semibold text-primary">Delete Work Center</h3>
            </div>
            <p className="text-secondary mb-6">
              Are you sure you want to delete <strong className="text-primary">{deleteModal.workCenter?.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, workCenter: null })}
                className="lux-btn px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="lux-btn-primary px-4 py-2 text-sm"
                style={{ background: 'var(--status-danger)' }}
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
