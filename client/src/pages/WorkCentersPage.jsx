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
      ? 'bg-[var(--status-success-bg)] text-[var(--status-success)]' 
      : 'bg-[var(--steel-100)] text-[var(--steel-500)]';
  };

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
          <h1 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">Work Centers</h1>
          <p className="text-[var(--steel-500)] mt-1 font-['DM_Sans']">Manage your facility work centers</p>
        </div>
        <Link
          to="/work-centers/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#e85a2a] text-white rounded-xl font-semibold font-['DM_Sans'] hover:-translate-y-0.5 transition-all"
          style={{ boxShadow: '0 4px 14px rgba(255, 107, 53, 0.35)' }}
        >
          <Plus className="w-5 h-5" />
          New Work Center
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-[var(--border-subtle)] p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--steel-400)] w-5 h-5" />
            <input
              type="text"
              placeholder="Search work centers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl focus:bg-white focus:border-[var(--brand-accent)] transition-all font-['DM_Sans']"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-[var(--steel-400)]" />
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl focus:bg-white focus:border-[var(--brand-accent)] transition-all font-['DM_Sans'] text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Work Centers Table */}
      <div className="bg-white rounded-xl border border-[var(--border-subtle)] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border-default)]">
            <thead className="bg-[var(--steel-50)]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--steel-600)] uppercase tracking-wider font-['Sora']">
                  Work Center
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--steel-600)] uppercase tracking-wider font-['Sora']">
                  Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--steel-600)] uppercase tracking-wider font-['Sora']">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--steel-600)] uppercase tracking-wider font-['Sora']">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--steel-600)] uppercase tracking-wider font-['Sora']">
                  Equipment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--steel-600)] uppercase tracking-wider font-['Sora']">
                  Teams
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--steel-600)] uppercase tracking-wider font-['Sora']">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--steel-600)] uppercase tracking-wider font-['Sora']">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[var(--border-default)]">
              {filteredWorkCenters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-[var(--steel-100)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-8 h-8 text-[var(--steel-400)]" />
                    </div>
                    <p className="text-[var(--steel-700)] font-semibold font-['Sora']">No work centers found</p>
                    <p className="text-[var(--steel-500)] text-sm mt-1 font-['DM_Sans']">
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
                    className="hover:bg-[var(--steel-50)] cursor-pointer transition-colors"
                    onClick={() => navigate(`/work-centers/${workCenter.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--steel-100)] to-[var(--steel-200)] flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-[var(--steel-600)]" />
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{workCenter.name}</div>
                          {workCenter.description && (
                            <div className="text-sm text-[var(--steel-500)] truncate max-w-xs font-['DM_Sans']">
                              {workCenter.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1.5 bg-[var(--steel-100)] text-[var(--steel-700)] rounded-lg font-['JetBrains_Mono'] text-sm font-medium">
                        {workCenter.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {workCenter.location ? (
                        <div className="flex items-center gap-2 text-[var(--steel-600)] font-['DM_Sans']">
                          <MapPin className="w-4 h-4" />
                          {workCenter.location}
                        </div>
                      ) : (
                        <span className="text-[var(--steel-400)]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {workCenter.department ? (
                        <span className="text-[var(--steel-700)] font-['DM_Sans']">{workCenter.department.name}</span>
                      ) : (
                        <span className="text-[var(--steel-400)]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-[var(--steel-400)]" />
                        <span className="text-[var(--steel-700)] font-semibold font-['DM_Sans']">{workCenter.equipmentCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {workCenter.teams && workCenter.teams.length > 0 ? (
                        <div className="flex items-center gap-1">
                          {workCenter.teams.slice(0, 2).map((team, idx) => (
                            <span 
                              key={team.id} 
                              className="px-2.5 py-1 bg-[var(--brand-accent-muted)] text-[var(--brand-accent)] rounded-lg text-xs font-semibold font-['DM_Sans']"
                            >
                              {team.name}
                            </span>
                          ))}
                          {workCenter.teams.length > 2 && (
                            <span className="text-[var(--steel-500)] text-xs font-['DM_Sans']">
                              +{workCenter.teams.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[var(--steel-400)]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(workCenter.isActive)} font-['DM_Sans']`}>
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === workCenter.id ? null : workCenter.id);
                          }}
                          className="p-2 hover:bg-[var(--steel-100)] rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-[var(--steel-500)]" />
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
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-[var(--border-default)] py-2 z-20" style={{ boxShadow: 'var(--shadow-lg)' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/work-centers/${workCenter.id}/edit`);
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
                                  setDeleteModal({ open: true, workCenter });
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
                ))
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
              <h3 className="text-xl font-bold text-[var(--steel-900)] font-['Sora']">Delete Work Center</h3>
            </div>
            <p className="text-[var(--steel-600)] mb-6 font-['DM_Sans']">
              Are you sure you want to delete <strong className="text-[var(--steel-900)]">{deleteModal.workCenter?.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, workCenter: null })}
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
