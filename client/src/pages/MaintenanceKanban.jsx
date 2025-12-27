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
  { id: 'PENDING', label: 'Pending', color: 'bg-[var(--steel-100)]', accent: 'bg-[var(--steel-400)]' },
  { id: 'APPROVED', label: 'Approved', color: 'bg-blue-50', accent: 'bg-blue-500' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-[var(--brand-accent-muted)]', accent: 'bg-[var(--brand-accent)]' },
  { id: 'ON_HOLD', label: 'On Hold', color: 'bg-orange-50', accent: 'bg-orange-500' },
  { id: 'COMPLETED', label: 'Completed', color: 'bg-[var(--status-success-bg)]', accent: 'bg-[var(--status-success)]' },
  { id: 'CANCELLED', label: 'Cancelled', color: 'bg-[var(--status-danger-bg)]', accent: 'bg-[var(--status-danger)]' },
];

const priorityColors = {
  LOW: 'border-l-[var(--steel-400)]',
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
              bg-white rounded-xl shadow-sm border-l-4 p-3 mb-2 cursor-pointer
              hover:shadow-md transition-shadow
              ${priorityColors[request.priority]}
              ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}
              ${isOverdue ? 'ring-2 ring-[var(--status-danger)]' : ''}
            `}
            onClick={() => navigate(`/maintenance/${request.id}`)}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-[var(--steel-500)] font-['JetBrains_Mono']">
                {request.requestNumber}
              </span>
              {isOverdue && (
                <span className="text-xs bg-[var(--status-danger-bg)] text-[var(--status-danger)] px-1.5 py-0.5 rounded font-['DM_Sans']">
                  Overdue
                </span>
              )}
            </div>
            
            <h4 className="font-semibold text-sm text-[var(--steel-900)] mb-2 line-clamp-2 font-['DM_Sans']">
              {request.title}
            </h4>

            <div className="space-y-1 text-xs text-[var(--steel-500)] font-['DM_Sans']">
              {request.equipment && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{request.equipment.name}</span>
                </div>
              )}
              
              {request.workCenter && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="truncate">{request.workCenter.name}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-3 pt-2 border-t border-[var(--border-default)]">
              <span className={`
                text-xs font-medium px-2 py-0.5 rounded
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
                      className="w-6 h-6 rounded-lg"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--steel-600)] to-[var(--steel-700)] flex items-center justify-center">
                      <span className="text-white text-xs font-semibold font-['Sora']">
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">Maintenance Board</h1>
          <p className="text-[var(--steel-500)] font-['DM_Sans']">Drag and drop to update status</p>
        </div>
        <div className="flex gap-2">
          <Link 
            to="/maintenance"
            className="px-4 py-2.5 text-[var(--steel-600)] hover:text-[var(--steel-900)] border border-[var(--border-default)] rounded-xl font-medium font-['DM_Sans'] hover:bg-[var(--steel-50)] transition-all"
          >
            List View
          </Link>
          <Link 
            to="/maintenance/calendar"
            className="px-4 py-2.5 text-[var(--steel-600)] hover:text-[var(--steel-900)] border border-[var(--border-default)] rounded-xl font-medium font-['DM_Sans'] hover:bg-[var(--steel-50)] transition-all"
          >
            Calendar
          </Link>
          <Link 
            to="/maintenance/new"
            className="px-5 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#e85a2a] text-white rounded-xl font-semibold font-['DM_Sans'] hover:-translate-y-0.5 transition-all"
            style={{ boxShadow: '0 4px 14px rgba(255, 107, 53, 0.35)' }}
          >
            + New Request
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[var(--border-subtle)] p-4 mb-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex gap-3 flex-wrap">
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

          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="px-4 py-2.5 bg-[var(--steel-50)] border-2 border-transparent rounded-xl text-sm font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
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
            className="px-4 py-2.5 bg-[var(--steel-50)] border-2 border-transparent rounded-xl text-sm font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
          >
            <option value="">All Types</option>
            <option value="PREVENTIVE">Preventive</option>
            <option value="CORRECTIVE">Corrective</option>
          </select>

          {Object.values(filters).some(Boolean) && (
            <button
              onClick={() => setFilters({ workCenterId: '', teamId: '', priority: '', type: '' })}
              className="px-4 py-2.5 text-sm text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] rounded-xl font-medium font-['DM_Sans'] transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-3 border-[var(--steel-200)] border-t-[var(--brand-accent)] rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-[var(--status-danger)] font-['DM_Sans']">
          {error}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-4 h-full min-w-max pb-4">
              {statusColumns.map(column => (
                <div 
                  key={column.id} 
                  className={`w-80 flex flex-col rounded-xl ${column.color} border border-[var(--border-subtle)]`}
                >
                  <div className="p-4 border-b border-[var(--border-default)] bg-white/60 backdrop-blur-sm rounded-t-xl">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${column.accent}`}></div>
                        <h3 className="font-semibold text-[var(--steel-800)] font-['Sora'] text-sm uppercase tracking-wide">
                          {column.label}
                        </h3>
                      </div>
                      <span className="bg-white text-[var(--steel-600)] text-xs font-bold px-2.5 py-1 rounded-lg border border-[var(--border-default)] font-['DM_Sans']">
                        {columns[column.id]?.length || 0}
                      </span>
                    </div>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`
                          flex-1 p-3 overflow-y-auto min-h-[200px] transition-colors duration-200
                          ${snapshot.isDraggingOver ? 'bg-[var(--brand-accent-muted)]' : ''}
                        `}
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
