import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  AlertCircle,
  User
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import KPICard from '../components/dashboard/KPICard';
import DataTable from '../components/ui/DataTable';
import { StatusBadge, PriorityBadge } from '../components/ui/StatusBadge';
import api from '../lib/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch KPIs
  const fetchKPIs = async () => {
    try {
      setKpiLoading(true);
      const response = await api.get('/dashboard/kpis');
      setKpis(response.data.data);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    } finally {
      setKpiLoading(false);
    }
  };

  // Fetch Recent Requests
  const fetchRequests = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/recent-requests', {
        params: { page, limit: pagination.limit }
      });
      setRequests(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
    fetchRequests();
  }, []);

  const handlePageChange = (page) => {
    fetchRequests(page);
  };

  const handleRefresh = () => {
    fetchKPIs();
    fetchRequests(pagination.page);
  };

  // Filter requests based on search and status
  const filteredRequests = requests.filter(req => {
    const matchesSearch = !searchQuery || 
      req.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.technicianName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.equipment?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Table columns configuration
  const columns = [
    {
      key: 'subject',
      header: 'Subject',
      width: '25%',
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{value}</span>
          <span className="text-xs text-[var(--steel-500)] font-['JetBrains_Mono']">{row.requestNumber}</span>
        </div>
      )
    },
    {
      key: 'technicianName',
      header: 'Technician',
      width: '15%',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--steel-700)] to-[var(--steel-800)] rounded-lg flex items-center justify-center">
            {row.technicianAvatar ? (
              <img src={row.technicianAvatar} alt={value} className="w-full h-full rounded-lg object-cover" />
            ) : (
              <span className="text-white text-xs font-semibold font-['Sora']">
                {value?.charAt(0)?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <span className="text-sm text-[var(--steel-700)] font-['DM_Sans']">{value}</span>
        </div>
      )
    },
    {
      key: 'equipment',
      header: 'Equipment',
      width: '20%',
      render: (value) => (
        <span className="text-sm text-[var(--steel-700)] font-['JetBrains_Mono']">{value}</span>
      )
    },
    {
      key: 'workCenter',
      header: 'Work Center',
      width: '15%',
      render: (value) => (
        <span className="text-sm text-[var(--steel-600)] font-['DM_Sans']">{value}</span>
      )
    },
    {
      key: 'company',
      header: 'Company',
      width: '15%',
      render: (value) => (
        <span className="text-sm text-[var(--steel-600)] font-['DM_Sans']">{value}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '10%',
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={value} />
          {row.isOverdue && (
            <span className="flex items-center gap-1 text-xs text-[var(--status-danger)] font-medium font-['DM_Sans']">
              <AlertCircle className="w-3 h-3" />
              Overdue
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">Dashboard</h1>
          <p className="text-[var(--steel-500)] mt-1 font-['DM_Sans']">Overview of your maintenance operations</p>
        </div>
        <button
          onClick={() => navigate('/maintenance/new')}
          className="group inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#ff6b35] to-[#e85a2a] text-white font-semibold rounded-xl hover:-translate-y-0.5 transition-all duration-200 font-['DM_Sans']"
          style={{ boxShadow: '0 4px 14px rgba(255, 107, 53, 0.35)' }}
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          New Request
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {kpiLoading ? (
          // Loading skeletons
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-36 bg-[var(--steel-200)] rounded-2xl animate-pulse" />
          ))
        ) : (
          <>
            <KPICard
              title="Critical Equipment"
              value={kpis?.criticalEquipment?.label || '0 Units'}
              subtitle={kpis?.criticalEquipment?.subtitle || '(Health < 30%)'}
              variant="critical"
              onClick={() => navigate('/equipment?health=critical')}
            />
            <KPICard
              title="Technician Load"
              value={kpis?.technicianLoad?.label || '0% Utilized'}
              subtitle={kpis?.technicianLoad?.subtitle || '(Available Capacity)'}
              variant="technician"
              onClick={() => navigate('/teams')}
            />
            <KPICard
              title="Open Requests"
              value={kpis?.openRequests?.label || '0 Pending'}
              subtitle={kpis?.openRequests?.subtitle || '0 Overdue'}
              variant="requests"
              onClick={() => navigate('/maintenance')}
            />
          </>
        )}
      </div>

      {/* Data Table Section */}
      <div className="space-y-4">
        {/* Table Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-xl p-4 border border-[var(--border-subtle)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div>
            <h2 className="text-lg font-semibold text-[var(--steel-900)] font-['Sora']">Maintenance Reports</h2>
            <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Track and manage maintenance requests</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--steel-400)]" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2.5 text-sm bg-[var(--steel-50)] border-2 border-transparent rounded-xl focus:bg-white focus:border-[var(--brand-accent)] focus:ring-2 focus:ring-[var(--brand-accent-muted)] transition-all font-['DM_Sans']"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 text-sm bg-[var(--steel-50)] border-2 border-transparent rounded-xl focus:bg-white focus:border-[var(--brand-accent)] focus:ring-2 focus:ring-[var(--brand-accent-muted)] transition-all cursor-pointer font-['DM_Sans']"
            >
              <option value="all">All Status</option>
              <option value="New Request">New Request</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="p-2.5 text-[var(--steel-500)] hover:text-[var(--steel-700)] hover:bg-[var(--steel-100)] rounded-xl transition-all group"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Export Button */}
            <button
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--steel-700)] bg-white border border-[var(--border-default)] rounded-xl hover:bg-[var(--steel-50)] hover:border-[var(--border-strong)] transition-all font-['DM_Sans']"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredRequests}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onRowClick={(row) => navigate(`/maintenance/${row.id}`)}
        />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
