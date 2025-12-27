import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../lib/api';

const priorityColors = {
  LOW: 'var(--steel-400)',
  MEDIUM: 'var(--status-info)',
  HIGH: 'var(--status-warning)',
  CRITICAL: 'var(--status-danger)',
};

export default function MaintenanceCalendar() {
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    workCenterId: '',
  });
  const [workCenters, setWorkCenters] = useState([]);

  useEffect(() => {
    fetchWorkCenters();
  }, []);

  const fetchWorkCenters = async () => {
    try {
      const response = await api.get('/work-centers');
      setWorkCenters(response.data.data || []);
    } catch (err) {
      console.error('Failed to load work centers:', err);
    }
  };

  const fetchEvents = async (fetchInfo, successCallback, failureCallback) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: fetchInfo.startStr,
        endDate: fetchInfo.endStr,
      });
      
      if (filters.type) params.append('type', filters.type);
      if (filters.workCenterId) params.append('workCenterId', filters.workCenterId);

      const response = await api.get(`/maintenance-requests/calendar?${params}`);
      const events = response.data.data || [];
      setEvents(events);
      successCallback(events);
    } catch (err) {
      console.error('Failed to load calendar events:', err);
      failureCallback(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (arg) => {
    // Navigate to create new request with pre-filled date
    navigate(`/maintenance/new?scheduledDate=${arg.dateStr}`);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
  };

  const closeModal = () => setSelectedEvent(null);

  const EventDetailModal = () => {
    if (!selectedEvent) return null;

    const props = selectedEvent.extendedProps;
    const isOverdue = props.isOverdue;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
          <div 
            className="p-5"
            style={{ backgroundColor: selectedEvent.backgroundColor }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-sm font-['JetBrains_Mono'] mb-1">
                  {props.requestNumber}
                </p>
                <h3 className="text-white font-bold text-lg font-['Sora']">
                  {selectedEvent.title}
                </h3>
              </div>
              <button 
                onClick={closeModal}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex gap-2">
              <span className={`
                px-2.5 py-1 rounded-lg text-xs font-semibold font-['DM_Sans']
                ${props.type === 'PREVENTIVE' ? 'bg-[var(--status-success-bg)] text-[var(--status-success)]' : 'bg-[var(--brand-accent-muted)] text-[var(--brand-accent)]'}
              `}>
                {props.type === 'PREVENTIVE' ? 'Preventive' : 'Corrective'}
              </span>
              <span className={`
                px-2.5 py-1 rounded-lg text-xs font-semibold font-['DM_Sans']
                ${props.status === 'COMPLETED' ? 'bg-[var(--status-success-bg)] text-[var(--status-success)]' : 
                  props.status === 'IN_PROGRESS' ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]' : 
                  'bg-[var(--steel-100)] text-[var(--steel-700)]'}
              `}>
                {props.status.replace('_', ' ')}
              </span>
              {isOverdue && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--status-danger-bg)] text-[var(--status-danger)] font-['DM_Sans']">
                  Overdue
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[var(--steel-500)] font-['DM_Sans']">Priority</p>
                <p className="font-semibold flex items-center gap-2 text-[var(--steel-900)] font-['DM_Sans']">
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: priorityColors[props.priority] }}
                  />
                  {props.priority}
                </p>
              </div>
              <div>
                <p className="text-[var(--steel-500)] font-['DM_Sans']">Est. Hours</p>
                <p className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{props.estimatedHours || '-'}</p>
              </div>
            </div>

            {props.equipment && (
              <div className="text-sm">
                <p className="text-[var(--steel-500)] font-['DM_Sans']">Equipment</p>
                <p className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{props.equipment.name}</p>
                <p className="text-[var(--steel-400)] text-xs font-['JetBrains_Mono']">{props.equipment.code}</p>
              </div>
            )}

            {props.workCenter && (
              <div className="text-sm">
                <p className="text-[var(--steel-500)] font-['DM_Sans']">Work Center</p>
                <p className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{props.workCenter.name}</p>
              </div>
            )}

            {props.assignedTo && (
              <div className="text-sm">
                <p className="text-[var(--steel-500)] font-['DM_Sans']">Assigned To</p>
                <div className="flex items-center gap-2">
                  {props.assignedTo.avatar ? (
                    <img 
                      src={props.assignedTo.avatar}
                      alt={props.assignedTo.name}
                      className="w-6 h-6 rounded-lg"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--steel-600)] to-[var(--steel-700)] flex items-center justify-center">
                      <span className="text-white text-xs font-semibold font-['Sora']">
                        {props.assignedTo.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{props.assignedTo.name}</span>
                </div>
              </div>
            )}

            {props.dueDate && (
              <div className="text-sm">
                <p className="text-[var(--steel-500)] font-['DM_Sans']">Due Date</p>
                <p className={`font-semibold font-['DM_Sans'] ${isOverdue ? 'text-[var(--status-danger)]' : 'text-[var(--steel-900)]'}`}>
                  {new Date(props.dueDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          <div className="p-5 border-t border-[var(--border-default)] flex gap-3">
            <button
              onClick={() => {
                navigate(`/maintenance/${selectedEvent.id}`);
                closeModal();
              }}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[var(--brand-accent)] to-[#e85a2a] text-white rounded-xl font-semibold font-['DM_Sans'] hover:-translate-y-0.5 transition-all shadow-lg shadow-[var(--brand-accent)]/20"
            >
              View Details
            </button>
            <button
              onClick={closeModal}
              className="px-4 py-2.5 border-2 border-[var(--steel-200)] rounded-xl text-[var(--steel-700)] font-semibold font-['DM_Sans'] hover:bg-[var(--steel-50)] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">Maintenance Calendar</h1>
          <p className="text-[var(--steel-500)] font-['DM_Sans']">Schedule and track maintenance activities</p>
        </div>
        <div className="flex gap-2">
          <Link 
            to="/maintenance"
            className="px-4 py-2.5 text-[var(--steel-600)] hover:text-[var(--steel-900)] border border-[var(--border-default)] rounded-xl font-semibold font-['DM_Sans'] hover:bg-[var(--steel-50)] transition-all"
          >
            List View
          </Link>
          <Link 
            to="/maintenance/board"
            className="px-4 py-2.5 text-[var(--steel-600)] hover:text-[var(--steel-900)] border border-[var(--border-default)] rounded-xl font-semibold font-['DM_Sans'] hover:bg-[var(--steel-50)] transition-all"
          >
            Board
          </Link>
          <Link 
            to="/maintenance/new"
            className="px-5 py-2.5 bg-gradient-to-r from-[var(--brand-accent)] to-[#e85a2a] text-white rounded-xl font-semibold font-['DM_Sans'] hover:-translate-y-0.5 transition-all shadow-lg shadow-[var(--brand-accent)]/20"
          >
            + New Request
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[var(--border-subtle)] p-4 mb-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex gap-4 items-center">
          <select
            value={filters.type}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, type: e.target.value }));
              calendarRef.current?.getApi().refetchEvents();
            }}
            className="px-4 py-2.5 bg-[var(--steel-50)] border-2 border-transparent rounded-xl text-sm font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
          >
            <option value="">All Types</option>
            <option value="PREVENTIVE">Preventive</option>
            <option value="CORRECTIVE">Corrective</option>
          </select>

          <select
            value={filters.workCenterId}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, workCenterId: e.target.value }));
              calendarRef.current?.getApi().refetchEvents();
            }}
            className="px-4 py-2.5 bg-[var(--steel-50)] border-2 border-transparent rounded-xl text-sm font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
          >
            <option value="">All Work Centers</option>
            {workCenters.map(wc => (
              <option key={wc.id} value={wc.id}>{wc.name}</option>
            ))}
          </select>

          {/* Legend */}
          <div className="flex gap-4 ml-auto text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--status-success)]"></span>
              <span className="text-[var(--steel-600)] font-['DM_Sans']">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--status-info)]"></span>
              <span className="text-[var(--steel-600)] font-['DM_Sans']">Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--status-danger)]"></span>
              <span className="text-[var(--steel-600)] font-['DM_Sans']">Overdue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 bg-white rounded-2xl border border-[var(--border-subtle)] p-4 overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={fetchEvents}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          selectable={true}
          editable={false}
          eventDisplay="block"
          dayMaxEvents={3}
          height="100%"
          eventContent={(eventInfo) => (
            <div className="px-1 py-0.5 overflow-hidden">
              <div className="text-xs font-semibold truncate font-['DM_Sans']">
                {eventInfo.event.title}
              </div>
              {eventInfo.event.extendedProps.equipment && (
                <div className="text-xs opacity-75 truncate font-['DM_Sans']">
                  {eventInfo.event.extendedProps.equipment.name}
                </div>
              )}
            </div>
          )}
        />
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal />
    </div>
  );
}
