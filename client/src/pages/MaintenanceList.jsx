import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  RefreshCw,
  AlertTriangle,
  Clock,
  User,
  ChevronRight,
  GripVertical
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { StatusBadge, PriorityBadge } from '../components/ui/StatusBadge';
import api from '../lib/api';

const priorityColors = {
  LOW: 'border-l-[var(--steel-400)]',
  MEDIUM: 'border-l-[var(--status-info)]',
  HIGH: 'border-l-[var(--status-warning)]',
  CRITICAL: 'border-l-[var(--status-danger)]'
};

const MaintenanceList = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [kanbanData, setKanbanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/maintenance-requests/kanban');
      setKanbanData(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, request, sourceColumnId) => {
    setDraggedItem({ request, sourceColumnId });
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.sourceColumnId === targetColumnId) return;

    const targetColumn = kanbanData.find(c => c.id === targetColumnId);
    if (!targetColumn) return;

    // Determine new status based on target column
    const statusMap = {
      new: 'SUBMITTED',
      inProgress: 'IN_PROGRESS',
      onHold: 'ON_HOLD',
      completed: 'COMPLETED'
    };

    const newStatus = statusMap[targetColumnId];
    if (!newStatus) return;

    try {
      await api.patch(`/maintenance-requests/${draggedItem.request.id}/status`, {
        status: newStatus
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter kanban data based on search
  const filteredKanbanData = kanbanData.map(column => ({
    ...column,
    requests: column.requests.filter(req =>
      !searchQuery ||
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }));

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">Maintenance Requests</h1>
          <p className="text-[var(--steel-500)] mt-1 font-['DM_Sans']">Manage and track all maintenance work</p>
        </div>
        <button
          onClick={() => navigate('/maintenance/new')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#e85a2a] text-white font-semibold rounded-xl hover:-translate-y-0.5 transition-all font-['DM_Sans']"
          style={{ boxShadow: '0 4px 14px rgba(255, 107, 53, 0.35)' }}
        >
          <Plus className="w-5 h-5" />
          New Request
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--steel-400)]" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-11 pr-4 py-2.5 text-sm bg-[var(--steel-50)] border-2 border-transparent rounded-xl focus:bg-white focus:border-[var(--brand-accent)] transition-all font-['DM_Sans']"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-[var(--steel-100)] rounded-xl p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2.5 rounded-lg transition-colors ${
                viewMode === 'kanban' 
                  ? 'bg-white text-[var(--brand-accent)]' 
                  : 'text-[var(--steel-500)] hover:text-[var(--steel-700)]'
              }`}
              style={viewMode === 'kanban' ? { boxShadow: 'var(--shadow-sm)' } : {}}
              title="Kanban View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-[var(--brand-accent)]' 
                  : 'text-[var(--steel-500)] hover:text-[var(--steel-700)]'
              }`}
              style={viewMode === 'list' ? { boxShadow: 'var(--shadow-sm)' } : {}}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--steel-600)] hover:text-[var(--steel-900)] hover:bg-[var(--steel-100)] rounded-xl transition-colors font-['DM_Sans']"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Kanban Board */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            // Loading skeletons
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-[var(--steel-100)] rounded-xl p-4 animate-pulse">
                <div className="h-6 bg-[var(--steel-200)] rounded w-1/2 mb-4" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-24 bg-[var(--steel-200)] rounded-lg" />
                  ))}
                </div>
              </div>
            ))
          ) : (
            filteredKanbanData.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
                onCardClick={(req) => navigate(`/maintenance/${req.id}`)}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                formatDate={formatDate}
              />
            ))
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-[var(--border-subtle)] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
          {loading ? (
            <div className="p-8 text-center text-[var(--steel-500)] font-['DM_Sans']">Loading...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-[var(--steel-50)] border-b border-[var(--border-default)]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--steel-600)] uppercase font-['Sora']">Request</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--steel-600)] uppercase font-['Sora']">Equipment</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--steel-600)] uppercase font-['Sora']">Assignee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--steel-600)] uppercase font-['Sora']">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--steel-600)] uppercase font-['Sora']">Priority</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                {filteredKanbanData.flatMap(col => col.requests).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[var(--steel-500)] font-['DM_Sans']">
                      No maintenance requests found
                    </td>
                  </tr>
                ) : (
                  filteredKanbanData.flatMap(col => col.requests).map((req) => (
                    <tr 
                      key={req.id}
                      onClick={() => navigate(`/maintenance/${req.id}`)}
                      className="hover:bg-[var(--steel-50)] cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{req.title}</p>
                          <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">{req.requestNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[var(--steel-700)] font-['DM_Sans']">
                          {req.equipment?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {req.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-[var(--steel-600)] to-[var(--steel-700)] rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-semibold font-['Sora']">
                                {req.assignedTo.name?.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm text-[var(--steel-700)] font-['DM_Sans']">{req.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-[var(--steel-400)] italic font-['DM_Sans']">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={formatStatusLabel(req.status)} />
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={req.priority} />
                      </td>
                      <td className="px-6 py-4">
                        <ChevronRight className="w-5 h-5 text-[var(--steel-400)]" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </MainLayout>
  );
};

// Kanban Column Component
const KanbanColumn = ({ 
  column, 
  onDragOver, 
  onDrop, 
  onCardClick,
  onDragStart,
  onDragEnd,
  formatDate
}) => {
  const columnColors = {
    new: 'bg-[var(--status-info)]',
    inProgress: 'bg-[var(--brand-accent)]',
    onHold: 'bg-[var(--status-warning)]',
    completed: 'bg-[var(--status-success)]'
  };

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="bg-[var(--steel-100)] rounded-2xl p-4 min-h-[500px]"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${columnColors[column.id]}`} />
          <h3 className="font-semibold text-[var(--steel-700)] font-['Sora']">{column.title}</h3>
          <span className="px-2.5 py-0.5 bg-white text-[var(--steel-600)] text-xs font-bold rounded-lg border border-[var(--border-default)] font-['DM_Sans']">
            {column.count}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {column.requests.length === 0 ? (
          <div className="py-8 text-center text-[var(--steel-400)] border-2 border-dashed border-[var(--steel-300)] rounded-xl">
            <p className="text-sm font-['DM_Sans']">No requests</p>
            <p className="text-xs mt-1 font-['DM_Sans']">Drag cards here</p>
          </div>
        ) : (
          column.requests.map((request) => (
            <KanbanCard
              key={request.id}
              request={request}
              columnId={column.id}
              onClick={() => onCardClick(request)}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Kanban Card Component
const KanbanCard = ({ 
  request, 
  columnId, 
  onClick, 
  onDragStart, 
  onDragEnd,
  formatDate
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, request, columnId)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`
        bg-white rounded-xl border border-[var(--border-default)] p-4 
        cursor-pointer hover:shadow-md hover:-translate-y-0.5 
        transition-all duration-200 group
        border-l-4 ${priorityColors[request.priority]}
      `}
    >
      {/* Drag Handle */}
      <div className="flex items-start justify-between mb-2">
        <GripVertical className="w-4 h-4 text-[var(--steel-300)] group-hover:text-[var(--steel-400)] cursor-grab" />
        <span className="text-xs font-['JetBrains_Mono'] text-[var(--steel-400)]">{request.requestNumber}</span>
      </div>

      {/* Title */}
      <h4 className="font-semibold text-[var(--steel-900)] mb-2 line-clamp-2 font-['DM_Sans']">{request.title}</h4>

      {/* Equipment */}
      {request.equipment && (
        <p className="text-xs text-[var(--steel-500)] mb-3 truncate font-['DM_Sans']">
          📦 {request.equipment.name}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignee */}
        {request.assignedTo ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[var(--steel-600)] to-[var(--steel-700)] rounded-lg flex items-center justify-center">
              {request.assignedTo.avatar ? (
                <img src={request.assignedTo.avatar} alt="" className="w-full h-full rounded-lg" />
              ) : (
                <span className="text-white text-xs font-semibold font-['Sora']">
                  {request.assignedTo.name?.charAt(0)}
                </span>
              )}
            </div>
            <span className="text-xs text-[var(--steel-600)] truncate max-w-[80px] font-['DM_Sans']">
              {request.assignedTo.name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-[var(--steel-400)] italic font-['DM_Sans']">Unassigned</span>
        )}

        {/* Due Date / Overdue */}
        {request.isOverdue ? (
          <span className="flex items-center gap-1 text-xs text-[var(--status-danger)] font-semibold font-['DM_Sans']">
            <AlertTriangle className="w-3 h-3" />
            Overdue
          </span>
        ) : request.scheduledDate ? (
          <span className="flex items-center gap-1 text-xs text-[var(--steel-500)] font-['DM_Sans']">
            <Clock className="w-3 h-3" />
            {formatDate(request.scheduledDate)}
          </span>
        ) : null}
      </div>
    </div>
  );
};

// Helper to format status label
const formatStatusLabel = (status) => {
  const labels = {
    DRAFT: 'Draft',
    SUBMITTED: 'New Request',
    IN_REVIEW: 'In Review',
    APPROVED: 'Approved',
    IN_PROGRESS: 'In Progress',
    ON_HOLD: 'On Hold',
    COMPLETED: 'Completed',
    REOPENED: 'Reopened',
    CANCELLED: 'Cancelled'
  };
  return labels[status] || status;
};

export default MaintenanceList;
