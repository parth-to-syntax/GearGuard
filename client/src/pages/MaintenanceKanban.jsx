import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  DragDropContext, 
  Droppable, 
  Draggable 
} from '@hello-pangea/dnd';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import MainLayout from '../components/layout/MainLayout';
import StatusBadge from '../components/ui/StatusBadge';

const statusColumns = [
  { id: 'PENDING', label: 'Pending', color: 'bg-[var(--surface-card)]', accent: 'bg-[var(--text-muted)]' },
  { id: 'APPROVED', label: 'Approved', color: 'bg-[var(--surface-card)]', accent: 'bg-[var(--brand-accent)]' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-[var(--surface-card)]', accent: 'bg-[var(--status-warning)]' },
  { id: 'ON_HOLD', label: 'On Hold', color: 'bg-[var(--surface-card)]', accent: 'bg-[var(--priority-high)]' },
  { id: 'COMPLETED', label: 'Completed', color: 'bg-[var(--surface-card)]', accent: 'bg-[var(--status-success)]' },
  { id: 'CANCELLED', label: 'Cancelled', color: 'bg-[var(--surface-card)]', accent: 'bg-[var(--status-danger)]' },
];

const priorityColors = {
  LOW: 'border-l-[var(--text-muted)]',
  MEDIUM: 'border-l-[var(--priority-medium)]',
  HIGH: 'border-l-[var(--priority-high)]',
  CRITICAL: 'border-l-[var(--priority-critical)]',
};

export default function MaintenanceKanban() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    workCenterId: '',
    teamId: '',
    priority: '',
    type: '',
  });
  const [workCenters, setWorkCenters] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchKanbanData();
    fetchFiltersData();
  }, [filters]);

  const fetchKanbanData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/maintenance-requests/kanban?${params}`);
      
      // Initialize columns with empty arrays
      const newColumns = {};
      statusColumns.forEach(col => {
        newColumns[col.id] = response.data.data[col.id] || [];
      });
      
      setColumns(newColumns);
      setError(null);
    } catch (err) {
      setError('Failed to load kanban data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiltersData = async () => {
    try {
      const [wcRes, teamsRes] = await Promise.all([
        api.get('/work-centers'),
        api.get('/teams'),
      ]);
      setWorkCenters(wcRes.data.data || []);
      setTeams(teamsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load filter data:', err);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside list
    if (!destination) return;

    // Dropped in same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    // Check permission - only ADMIN, MANAGER, TECHNICIAN can move cards
    if (user?.role === 'REQUESTER') {
      alert('You do not have permission to change request status');
      return;
    }

    const sourceColumn = [...columns[source.droppableId]];
    const destColumn = source.droppableId === destination.droppableId 
      ? sourceColumn 
      : [...columns[destination.droppableId]];

    // Remove from source
    const [removed] = sourceColumn.splice(source.index, 1);

    // Add to destination
    if (source.droppableId === destination.droppableId) {
      sourceColumn.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: sourceColumn,
      });
    } else {
      destColumn.splice(destination.index, 0, { ...removed, status: destination.droppableId });
      setColumns({
        ...columns,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn,
      });

      // Update status on server
      try {
        await api.patch(`/maintenance-requests/${draggableId}/status`, {
          status: destination.droppableId,
        });
      } catch (err) {
        // Revert on error
        fetchKanbanData();
        alert('Failed to update status');
      }
    }
  };

  const RequestCard = ({ request, index }) => {
    const isOverdue = request.dueDate && new Date(request.dueDate) < new Date() && 
                      !['COMPLETED', 'CANCELLED'].includes(request.status);

    return (
      <Draggable draggableId={request.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`
              p-3 mb-3 cursor-pointer group
              ${priorityColors[request.priority]}
              ${snapshot.isDragging ? 'z-50' : ''}
              ${isOverdue ? 'ring-1 ring-[var(--status-danger)]' : ''}
            `}
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderLeftWidth: 4,
              borderRadius: '12px'
            }}
            onClick={() => navigate(`/maintenance/${request.id}`)}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-muted font-mono opacity-70">
                {request.requestNumber}
              </span>
              {isOverdue && (
                <span className="text-[10px] bg-[var(--status-danger-bg)] text-[var(--status-danger)] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide">
                  Overdue
                </span>
              )}
            </div>
            
            <h4 className="font-medium text-sm text-primary mb-2 line-clamp-2 leading-snug group-hover:text-[var(--brand-accent)] transition-colors">
              {request.title}
            </h4>

            <div className="space-y-1.5 text-xs text-secondary">
              {request.equipment && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate opacity-90">{request.equipment.name}</span>
                </div>
              )}
              
              {request.workCenter && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="truncate opacity-90">{request.workCenter.name}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--border-subtle)]">
              <span className={`
                text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider
                ${request.type === 'PREVENTIVE' ? 'bg-[var(--status-success-bg)] text-[var(--status-success)]' : 'bg-[var(--brand-accent-muted)] text-[var(--brand-accent)]'}
              `}>
                {request.type === 'PREVENTIVE' ? 'PM' : 'CM'}
              </span>

              {request.assignedTo && (
                <div className="flex items-center gap-1">
                  {request.assignedTo.avatar ? (
                    <img 
                      src={request.assignedTo.avatar} 
                      alt={request.assignedTo.name}
                      className="w-5 h-5 rounded-md object-cover ring-1 ring-[var(--card-border)]"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-md bg-[rgba(255,255,255,0.1)] flex items-center justify-center ring-1 ring-[var(--card-border)]">
                      <span className="text-primary text-[10px] font-medium">
                        {request.assignedTo.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <MainLayout>
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-primary tracking-tight">Maintenance Board</h1>
          <p className="text-secondary mt-1">Drag and drop to update status</p>
        </div>
        <div className="flex gap-2">
          <Link 
            to="/maintenance"
            className="lux-btn px-4 py-2 text-sm"
          >
            List View
          </Link>
          <Link 
            to="/maintenance/calendar"
            className="lux-btn px-4 py-2 text-sm"
          >
            Calendar
          </Link>
          <Link 
            to="/maintenance/new"
            className="lux-btn-primary px-4 py-2 text-sm"
          >
            + New Request
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6 shrink-0" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex gap-3 flex-wrap">
          <select
            value={filters.workCenterId}
            onChange={(e) => setFilters(prev => ({ ...prev, workCenterId: e.target.value }))}
            className="lux-input px-4 py-2 text-sm"
          >
            <option value="">All Work Centers</option>
            {workCenters.map(wc => (
              <option key={wc.id} value={wc.id}>{wc.name}</option>
            ))}
          </select>

          <select
            value={filters.teamId}
            onChange={(e) => setFilters(prev => ({ ...prev, teamId: e.target.value }))}
            className="lux-input px-4 py-2 text-sm"
          >
            <option value="">All Teams</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="lux-input px-4 py-2 text-sm"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="lux-input px-4 py-2 text-sm"
          >
            <option value="">All Types</option>
            <option value="PREVENTIVE">Preventive</option>
            <option value="CORRECTIVE">Corrective</option>
          </select>

          {Object.values(filters).some(Boolean) && (
            <button
              onClick={() => setFilters({ workCenterId: '', teamId: '', priority: '', type: '' })}
              className="px-4 py-2 text-sm text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] rounded-lg font-medium transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-[var(--card-border)] border-t-[var(--brand-accent)] rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-[var(--status-danger)]">
          {error}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-x-auto pb-2">
            <div className="flex gap-4 h-full min-w-max">
              {statusColumns.map(column => (
                <div 
                  key={column.id} 
                  className={`w-80 flex flex-col rounded-lg border border-[var(--border-subtle)] ${column.color}`}
                >
                  <div className="p-3 border-b border-[var(--border-subtle)] flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${column.accent}`}></div>
                      <h3 className="font-medium text-primary text-xs uppercase tracking-wider">
                        {column.label}
                      </h3>
                    </div>
                    <span className="bg-[rgba(255,255,255,0.05)] text-secondary text-xs font-medium px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                      {columns[column.id]?.length || 0}
                    </span>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-3 overflow-y-auto min-h-[100px] transition-colors duration-200`}
                      >
                        {columns[column.id]?.map((request, index) => (
                          <RequestCard 
                            key={request.id} 
                            request={request} 
                            index={index} 
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </div>
        </DragDropContext>
      )}
    </div>
    </MainLayout>
  );
}
