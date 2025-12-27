import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import api from '../lib/api';

export default function ReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [selectedReport, setSelectedReport] = useState('overview');
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    workCenterId: '',
    teamId: '',
    equipmentId: '',
  });
  const [workCenters, setWorkCenters] = useState([]);
  const [teams, setTeams] = useState([]);
  const [equipment, setEquipment] = useState([]);

  useEffect(() => {
    fetchFilterData();
    fetchReportData();
  }, [selectedReport, dateRange, filters]);

  const fetchFilterData = async () => {
    try {
      const [wcRes, teamsRes, eqRes] = await Promise.all([
        api.get('/work-centers'),
        api.get('/teams'),
        api.get('/equipment'),
      ]);
      setWorkCenters(wcRes.data.data || []);
      setTeams(teamsRes.data.data || []);
      setEquipment(eqRes.data.data || []);
    } catch (err) {
      console.error('Failed to load filter data:', err);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        reportType: selectedReport,
      });
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/dashboard/reports?${params}`);
      setReportData(response.data.data);
    } catch (err) {
      console.error('Failed to load report data:', err);
      // Use mock data if API not ready
      setReportData(generateMockData(selectedReport));
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (type) => {
    switch (type) {
      case 'overview':
        return {
          totalRequests: 156,
          completedRequests: 98,
          pendingRequests: 42,
          inProgressRequests: 16,
          avgCompletionTime: 4.2,
          completionRate: 62.8,
          overdueRequests: 8,
          preventiveCount: 67,
          correctiveCount: 89,
        };
      case 'equipment':
        return {
          topEquipmentByRequests: [
            { name: 'CNC Machine A', requests: 24, downtime: 48 },
            { name: 'Hydraulic Press B', requests: 18, downtime: 36 },
            { name: 'Conveyor Belt C', requests: 15, downtime: 22 },
            { name: 'Assembly Robot D', requests: 12, downtime: 18 },
            { name: 'Packaging Unit E', requests: 10, downtime: 14 },
          ],
          mtbf: 720, // Mean Time Between Failures (hours)
          mttr: 4.5, // Mean Time To Repair (hours)
        };
      case 'team':
        return {
          teamPerformance: [
            { name: 'Alpha Team', completed: 34, avgTime: 3.2, rating: 4.8 },
            { name: 'Beta Team', completed: 28, avgTime: 4.1, rating: 4.5 },
            { name: 'Gamma Team', completed: 22, avgTime: 3.8, rating: 4.6 },
          ],
          technicianStats: [
            { name: 'John Doe', completed: 18, avgTime: 3.0 },
            { name: 'Jane Smith', completed: 15, avgTime: 3.5 },
            { name: 'Mike Johnson', completed: 12, avgTime: 4.0 },
          ],
        };
      case 'workCenter':
        return {
          workCenterStats: [
            { name: 'Production Hall A', requests: 45, completed: 38, utilization: 84 },
            { name: 'Warehouse B', requests: 32, completed: 28, utilization: 75 },
            { name: 'Assembly Line C', requests: 28, completed: 22, utilization: 68 },
          ],
        };
      default:
        return {};
    }
  };

  const exportReport = async (format) => {
    if (!reportData) {
      alert('No data to export');
      return;
    }

    if (format === 'csv') {
      exportToCSV();
    } else if (format === 'pdf') {
      // PDF export would require a library like jsPDF
      alert('PDF export coming soon! Use CSV for now.');
    }
  };

  const exportToCSV = () => {
    let csvContent = '';
    const timestamp = new Date().toISOString().split('T')[0];

    switch (selectedReport) {
      case 'overview':
        csvContent = 'Metric,Value\n';
        csvContent += `Total Requests,${reportData.totalRequests || 0}\n`;
        csvContent += `Completed Requests,${reportData.completedRequests || 0}\n`;
        csvContent += `Pending Requests,${reportData.pendingRequests || 0}\n`;
        csvContent += `In Progress,${reportData.inProgressRequests || 0}\n`;
        csvContent += `Avg Completion Time (hours),${reportData.avgCompletionTime || 0}\n`;
        csvContent += `Completion Rate (%),${reportData.completionRate || 0}\n`;
        csvContent += `Overdue Requests,${reportData.overdueRequests || 0}\n`;
        csvContent += `Preventive Maintenance,${reportData.preventiveCount || 0}\n`;
        csvContent += `Corrective Maintenance,${reportData.correctiveCount || 0}\n`;
        break;
      case 'equipment':
        csvContent = 'Equipment Name,Requests,Downtime (hours)\n';
        (reportData.topEquipmentByRequests || []).forEach(eq => {
          csvContent += `"${eq.name}",${eq.requests},${eq.downtime}\n`;
        });
        csvContent += `\nMTBF (hours),${reportData.mtbf || 0}\n`;
        csvContent += `MTTR (hours),${reportData.mttr || 0}\n`;
        break;
      case 'team':
        csvContent = 'Team Name,Completed,Avg Time (hours),Rating\n';
        (reportData.teamPerformance || []).forEach(team => {
          csvContent += `"${team.name}",${team.completed},${team.avgTime},${team.rating}\n`;
        });
        csvContent += '\nTechnician Name,Completed,Avg Time (hours)\n';
        (reportData.technicianStats || []).forEach(tech => {
          csvContent += `"${tech.name}",${tech.completed},${tech.avgTime}\n`;
        });
        break;
      case 'workCenter':
        csvContent = 'Work Center,Requests,Completed,Utilization (%)\n';
        (reportData.workCenterStats || []).forEach(wc => {
          csvContent += `"${wc.name}",${wc.requests},${wc.completed},${wc.utilization}\n`;
        });
        break;
      default:
        csvContent = 'No data available\n';
    }

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report-${selectedReport}-${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const reportTypes = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'equipment', label: 'Equipment Analysis', icon: '⚙️' },
    { id: 'team', label: 'Team Performance', icon: '👥' },
    { id: 'workCenter', label: 'Work Center', icon: '🏭' },
  ];

  const StatCard = ({ title, value, subtitle, trend, icon }) => (
    <div className="bg-white rounded-2xl p-6 border border-[var(--border-subtle)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-2xl">{icon}</span>
        {trend !== undefined && (
          <span className={`text-sm font-semibold font-['DM_Sans'] ${trend >= 0 ? 'text-[var(--status-success)]' : 'text-[var(--status-danger)]'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-[var(--steel-900)] font-['Sora']">{value}</p>
      <p className="text-[var(--steel-500)] text-sm mt-1 font-['DM_Sans']">{title}</p>
      {subtitle && <p className="text-[var(--steel-400)] text-xs mt-1 font-['DM_Sans']">{subtitle}</p>}
    </div>
  );

  const ProgressBar = ({ value, max, color = 'blue' }) => (
    <div className="w-full bg-[var(--steel-200)] rounded-full h-2">
      <div 
        className={`bg-${color}-500 h-2 rounded-full transition-all`}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">Reports & Analytics</h1>
            <p className="text-[var(--steel-500)] font-['DM_Sans']">Comprehensive maintenance insights</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportReport('csv')}
              className="px-4 py-2.5 text-[var(--steel-600)] hover:text-[var(--steel-900)] border border-[var(--border-default)] rounded-xl flex items-center gap-2 font-semibold font-['DM_Sans'] hover:bg-[var(--steel-50)] transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={() => exportReport('pdf')}
              className="px-4 py-2.5 bg-gradient-to-r from-[var(--brand-accent)] to-[#e85a2a] text-white rounded-xl flex items-center gap-2 font-semibold font-['DM_Sans'] hover:-translate-y-0.5 transition-all shadow-lg shadow-[var(--brand-accent)]/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-[var(--border-subtle)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-xs text-[var(--steel-500)] mb-1 font-['DM_Sans']">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-4 py-2.5 bg-[var(--steel-50)] border-2 border-transparent rounded-xl text-sm font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--steel-500)] mb-1 font-['DM_Sans']">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-4 py-2.5 bg-[var(--steel-50)] border-2 border-transparent rounded-xl text-sm font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--steel-500)] mb-1 font-['DM_Sans']">Work Center</label>
              <select
                value={filters.workCenterId}
                onChange={(e) => setFilters(prev => ({ ...prev, workCenterId: e.target.value }))}
                className="px-4 py-2.5 bg-[var(--steel-50)] border-2 border-transparent rounded-xl text-sm font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
              >
                <option value="">All Work Centers</option>
                {workCenters.map(wc => (
                  <option key={wc.id} value={wc.id}>{wc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--steel-500)] mb-1 font-['DM_Sans']">Team</label>
              <select
                value={filters.teamId}
                onChange={(e) => setFilters(prev => ({ ...prev, teamId: e.target.value }))}
                className="px-4 py-2.5 bg-[var(--steel-50)] border-2 border-transparent rounded-xl text-sm font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
              >
                <option value="">All Teams</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="flex gap-2 border-b border-[var(--border-default)] pb-4">
          {reportTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedReport(type.id)}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-['DM_Sans'] ${
                selectedReport === type.id
                  ? 'bg-[var(--brand-accent-muted)] text-[var(--brand-accent)] font-semibold'
                  : 'text-[var(--steel-600)] hover:bg-[var(--steel-100)]'
              }`}
            >
              <span>{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>

        {/* Report Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-3 border-[var(--steel-200)] border-t-[var(--brand-accent)] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {selectedReport === 'overview' && reportData && (
              <>
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon="📋"
                    title="Total Requests"
                    value={reportData.totalRequests}
                    subtitle={`${reportData.preventiveCount} PM / ${reportData.correctiveCount} CM`}
                  />
                  <StatCard
                    icon="✅"
                    title="Completion Rate"
                    value={`${reportData.completionRate}%`}
                    subtitle={`${reportData.completedRequests} completed`}
                    trend={5.2}
                  />
                  <StatCard
                    icon="⏱️"
                    title="Avg. Completion Time"
                    value={`${reportData.avgCompletionTime}h`}
                    subtitle="Hours per request"
                    trend={-8.1}
                  />
                  <StatCard
                    icon="⚠️"
                    title="Overdue Requests"
                    value={reportData.overdueRequests}
                    subtitle="Requires attention"
                  />
                </div>

                {/* Status Distribution */}
                <div className="bg-white rounded-2xl p-6 border border-[var(--border-subtle)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <h3 className="text-lg font-bold mb-4 font-['Sora'] text-[var(--steel-900)]">Request Status Distribution</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-[var(--steel-50)] rounded-xl">
                      <p className="text-2xl font-bold text-[var(--steel-600)] font-['Sora']">{reportData.pendingRequests}</p>
                      <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Pending</p>
                    </div>
                    <div className="text-center p-4 bg-[var(--status-warning-bg)] rounded-xl">
                      <p className="text-2xl font-bold text-[var(--status-warning)] font-['Sora']">{reportData.inProgressRequests}</p>
                      <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">In Progress</p>
                    </div>
                    <div className="text-center p-4 bg-[var(--status-success-bg)] rounded-xl">
                      <p className="text-2xl font-bold text-[var(--status-success)] font-['Sora']">{reportData.completedRequests}</p>
                      <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Completed</p>
                    </div>
                    <div className="text-center p-4 bg-[var(--brand-accent-muted)] rounded-xl">
                      <p className="text-2xl font-bold text-[var(--brand-accent)] font-['Sora']">{reportData.overdueRequests}</p>
                      <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Overdue</p>
                    </div>
                    <div className="text-center p-4 bg-[var(--status-info-bg)] rounded-xl">
                      <p className="text-2xl font-bold text-[var(--status-info)] font-['Sora']">
                        {Math.round((reportData.preventiveCount / reportData.totalRequests) * 100)}%
                      </p>
                      <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Preventive</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedReport === 'equipment' && reportData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard
                    icon="📈"
                    title="Mean Time Between Failures"
                    value={`${reportData.mtbf}h`}
                    subtitle="Average uptime"
                    trend={12.5}
                  />
                  <StatCard
                    icon="🔧"
                    title="Mean Time To Repair"
                    value={`${reportData.mttr}h`}
                    subtitle="Average repair time"
                    trend={-5.2}
                  />
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[var(--border-subtle)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <h3 className="text-lg font-bold mb-4 font-['Sora'] text-[var(--steel-900)]">Top Equipment by Maintenance Requests</h3>
                  <div className="space-y-4">
                    {reportData.topEquipmentByRequests.map((eq, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <span className="text-[var(--steel-400)] font-['JetBrains_Mono'] w-6">{index + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{eq.name}</span>
                            <span className="text-sm text-[var(--steel-500)] font-['DM_Sans']">{eq.requests} requests</span>
                          </div>
                          <div className="w-full bg-[var(--steel-200)] rounded-full h-2">
                            <div 
                              className="bg-[var(--brand-accent)] h-2 rounded-full"
                              style={{ width: `${(eq.requests / reportData.topEquipmentByRequests[0].requests) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-[var(--steel-400)] mt-1 font-['DM_Sans']">{eq.downtime}h downtime</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {selectedReport === 'team' && reportData && (
              <>
                <div className="bg-white rounded-2xl p-6 border border-[var(--border-subtle)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <h3 className="text-lg font-bold mb-4 font-['Sora'] text-[var(--steel-900)]">Team Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--border-default)]">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--steel-500)] font-['Sora'] uppercase tracking-wide">Team</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-[var(--steel-500)] font-['Sora'] uppercase tracking-wide">Completed</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-[var(--steel-500)] font-['Sora'] uppercase tracking-wide">Avg. Time (h)</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-[var(--steel-500)] font-['Sora'] uppercase tracking-wide">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.teamPerformance.map((team, index) => (
                          <tr key={index} className="border-b border-[var(--border-default)]">
                            <td className="py-3 px-4 font-semibold text-[var(--steel-900)] font-['DM_Sans']">{team.name}</td>
                            <td className="py-3 px-4 text-center text-[var(--steel-700)] font-['DM_Sans']">{team.completed}</td>
                            <td className="py-3 px-4 text-center text-[var(--steel-700)] font-['DM_Sans']">{team.avgTime}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center gap-1 text-[var(--steel-700)] font-['DM_Sans']">
                                <span className="text-[var(--status-warning)]">★</span>
                                {team.rating}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[var(--border-subtle)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <h3 className="text-lg font-bold mb-4 font-['Sora'] text-[var(--steel-900)]">Top Technicians</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {reportData.technicianStats.map((tech, index) => (
                      <div key={index} className="p-4 bg-[var(--steel-50)] rounded-xl flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          index === 0 ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]' :
                          index === 1 ? 'bg-[var(--steel-200)] text-[var(--steel-600)]' :
                          'bg-[var(--brand-accent-muted)] text-[var(--brand-accent)]'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{tech.name}</p>
                          <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">
                            {tech.completed} completed • {tech.avgTime}h avg
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {selectedReport === 'workCenter' && reportData && (
              <div className="bg-white rounded-2xl p-6 border border-[var(--border-subtle)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <h3 className="text-lg font-bold mb-4 font-['Sora'] text-[var(--steel-900)]">Work Center Statistics</h3>
                <div className="space-y-6">
                  {reportData.workCenterStats.map((wc, index) => (
                    <div key={index} className="border-b border-[var(--border-default)] pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{wc.name}</h4>
                          <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">
                            {wc.completed}/{wc.requests} requests completed
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-sm font-semibold font-['DM_Sans'] ${
                          wc.utilization >= 80 ? 'bg-[var(--status-success-bg)] text-[var(--status-success)]' :
                          wc.utilization >= 60 ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]' :
                          'bg-[var(--status-danger-bg)] text-[var(--status-danger)]'
                        }`}>
                          {wc.utilization}% utilization
                        </span>
                      </div>
                      <div className="w-full bg-[var(--steel-200)] rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            wc.utilization >= 80 ? 'bg-[var(--status-success)]' :
                            wc.utilization >= 60 ? 'bg-[var(--status-warning)]' :
                            'bg-[var(--status-danger)]'
                          }`}
                          style={{ width: `${wc.utilization}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
