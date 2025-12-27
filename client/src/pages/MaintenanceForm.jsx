import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Wrench, 
  Building2, 
  Save,
  Send,
  Calendar,
  Clock,
  AlertCircle,
  Diamond
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

// Validation schema
const requestSchema = z.object({
  title: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  description: z.string().optional(),
  requestType: z.enum(['equipment', 'workCenter']),
  equipmentId: z.string().optional(),
  workCenterId: z.string().optional(),
  type: z.enum(['BREAKDOWN', 'PREVENTIVE', 'CORRECTIVE', 'CALIBRATION', 'INSPECTION']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  teamId: z.string().optional(),
  assignedToId: z.string().optional(),
  scheduledDate: z.string().optional(),
  estimatedHours: z.string().optional(),
  notes: z.string().optional(),
  instructions: z.string().optional()
}).refine(data => {
  if (data.requestType === 'equipment' && !data.equipmentId) {
    return false;
  }
  if (data.requestType === 'workCenter' && !data.workCenterId) {
    return false;
  }
  return true;
}, {
  message: 'Please select an equipment or work center',
  path: ['equipmentId']
});

const MaintenanceForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [equipment, setEquipment] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [teams, setTeams] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [activeNoteTab, setActiveNoteTab] = useState('notes');

  // Get pre-fill data from URL params (from equipment smart button)
  const prefillEquipmentId = searchParams.get('equipmentId');
  const prefillWorkCenterId = searchParams.get('workCenterId');
  const prefillType = searchParams.get('type');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: '',
      description: '',
      requestType: prefillWorkCenterId ? 'workCenter' : 'equipment',
      type: prefillType || 'BREAKDOWN',
      priority: 'MEDIUM',
      notes: '',
      instructions: ''
    }
  });

  const requestType = watch('requestType');
  const equipmentId = watch('equipmentId');

  // Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        const [equipmentRes, workCentersRes, teamsRes] = await Promise.all([
          api.get('/equipment'),
          api.get('/work-centers'),
          api.get('/teams')
        ]);

        const equipmentData = equipmentRes.data.data || equipmentRes.data || [];
        const workCentersData = workCentersRes.data.data || workCentersRes.data || [];
        const teamsData = teamsRes.data.data || teamsRes.data || [];

        setEquipment(equipmentData);
        setWorkCenters(workCentersData);
        setTeams(teamsData);
        
        // Extract technicians from teams
        const allTechnicians = teamsData.flatMap(team => 
          (team.members || []).filter(member => 
            member.role === 'TECHNICIAN' || member.role === 'ADMIN' || member.role === 'MANAGER'
          )
        );
        setTechnicians(allTechnicians);

        // Handle pre-fill from URL params
        if (prefillEquipmentId) {
          setValue('equipmentId', prefillEquipmentId);
          setValue('requestType', 'equipment');
          
          // Find the equipment and auto-fill related fields
          const eq = equipmentData.find(e => e.id === prefillEquipmentId);
          if (eq) {
            setSelectedEquipment(eq);
            if (eq.workCenterId) {
              setValue('workCenterId', eq.workCenterId);
            }
            // Find team associated with this equipment's work center
            const wcTeams = teamsData.filter(t => t.workCenterId === eq.workCenterId);
            if (wcTeams.length === 1) {
              setValue('teamId', wcTeams[0].id);
            }
          }
        }
        
        if (prefillWorkCenterId) {
          setValue('workCenterId', prefillWorkCenterId);
          setValue('requestType', 'workCenter');
          
          // Find team associated with this work center
          const wcTeams = teamsData.filter(t => t.workCenterId === prefillWorkCenterId);
          if (wcTeams.length === 1) {
            setValue('teamId', wcTeams[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [prefillEquipmentId, prefillWorkCenterId, setValue]);

  // Auto-fill team when equipment is selected
  useEffect(() => {
    if (equipmentId && equipment.length > 0) {
      const selected = equipment.find(e => e.id === equipmentId);
      if (selected) {
        setSelectedEquipment(selected);
        if (selected.teamId) {
          setValue('teamId', selected.teamId);
        }
      }
    }
  }, [equipmentId, equipment, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const payload = {
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority,
        equipmentId: data.requestType === 'equipment' ? data.equipmentId : null,
        workCenterId: data.requestType === 'workCenter' ? data.workCenterId : null,
        teamId: data.teamId || null,
        assignedToId: data.assignedToId || null,
        scheduledDate: data.scheduledDate || null,
        estimatedHours: data.estimatedHours || null,
        notes: data.notes || null,
        instructions: data.instructions || null
      };

      const response = await api.post('/maintenance-requests', payload);
      
      if (response.data.success) {
        navigate(`/maintenance/${response.data.data.id}`);
      }
    } catch (error) {
      console.error('Error creating request:', error);
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    { value: 'LOW', label: 'Low', color: 'steel', diamonds: 1 },
    { value: 'MEDIUM', label: 'Medium', color: 'info', diamonds: 2 },
    { value: 'HIGH', label: 'High', color: 'warning', diamonds: 3 },
    { value: 'CRITICAL', label: 'Critical', color: 'danger', diamonds: 4 }
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[var(--steel-600)] hover:text-[var(--steel-900)] transition-colors mb-4 font-['DM_Sans']"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">New Maintenance Request</h1>
        <p className="text-[var(--steel-500)] mt-1 font-['DM_Sans']">Create a new maintenance or repair request</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl">
        {/* Request Type Selector */}
        <div className="bg-white rounded-2xl border border-[var(--steel-200)] p-6 mb-6">
          <h3 className="text-sm font-bold text-[var(--steel-700)] mb-4 font-['Sora']">Request Type</h3>
          <div className="flex gap-4">
            <label className={`
              flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${requestType === 'equipment' 
                ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-muted)]' 
                : 'border-[var(--steel-200)] hover:border-[var(--steel-300)]'}
            `}>
              <input
                type="radio"
                value="equipment"
                {...register('requestType')}
                className="sr-only"
              />
              <div className={`p-3 rounded-xl ${requestType === 'equipment' ? 'bg-gradient-to-br from-[var(--brand-accent)] to-[#e85a2a] text-white shadow-lg shadow-[var(--brand-accent)]/20' : 'bg-[var(--steel-100)] text-[var(--steel-500)]'}`}>
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">Equipment</p>
                <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Request for equipment maintenance</p>
              </div>
            </label>

            <label className={`
              flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${requestType === 'workCenter' 
                ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-muted)]' 
                : 'border-[var(--steel-200)] hover:border-[var(--steel-300)]'}
            `}>
              <input
                type="radio"
                value="workCenter"
                {...register('requestType')}
                className="sr-only"
              />
              <div className={`p-3 rounded-xl ${requestType === 'workCenter' ? 'bg-gradient-to-br from-[var(--brand-accent)] to-[#e85a2a] text-white shadow-lg shadow-[var(--brand-accent)]/20' : 'bg-[var(--steel-100)] text-[var(--steel-500)]'}`}>
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">Work Center</p>
                <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Request for work center location</p>
              </div>
            </label>
          </div>
        </div>

        {/* Workflow Progress */}
        <div className="bg-white rounded-2xl border border-[var(--steel-200)] p-6 mb-6">
          <h3 className="text-sm font-bold text-[var(--steel-700)] mb-4 font-['Sora']">Workflow Status</h3>
          <div className="flex items-center gap-4">
            {['New Request', 'In Progress', 'Completed'].map((stage, index) => (
              <div key={stage} className="flex items-center gap-2">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-['DM_Sans']
                  ${index === 0 ? 'bg-[var(--brand-accent)] text-white shadow-md shadow-[var(--brand-accent)]/20' : 'bg-[var(--steel-200)] text-[var(--steel-500)]'}
                `}>
                  {index + 1}
                </div>
                <span className={`text-sm font-['DM_Sans'] ${index === 0 ? 'text-[var(--brand-accent)] font-semibold' : 'text-[var(--steel-500)]'}`}>
                  {stage}
                </span>
                {index < 2 && (
                  <div className="w-12 h-0.5 bg-[var(--steel-200)] mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div className="bg-white rounded-2xl border border-[var(--steel-200)] p-6 mb-6">
          <h3 className="text-sm font-bold text-[var(--steel-700)] mb-4 font-['Sora']">Request Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                Subject <span className="text-[var(--status-danger)]">*</span>
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder="e.g., Leaking oil from machine"
                className={`w-full px-4 py-3 border-2 rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all ${
                  errors.title ? 'border-[var(--status-danger)] bg-[var(--status-danger-bg)]' : 'border-transparent bg-[var(--steel-50)]'
                }`}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-[var(--status-danger)] flex items-center gap-1 font-['DM_Sans']">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Created By (readonly) */}
            <div>
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">Created By</label>
              <input
                type="text"
                value={user?.name || ''}
                readOnly
                className="w-full px-4 py-3 border-2 border-transparent bg-[var(--steel-100)] rounded-xl text-[var(--steel-600)] font-['DM_Sans']"
              />
            </div>

            {/* Equipment / Work Center Selection */}
            {requestType === 'equipment' ? (
              <div>
                <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                  Maintenance For <span className="text-[var(--status-danger)]">*</span>
                </label>
                <select
                  {...register('equipmentId')}
                  className={`w-full px-4 py-3 border-2 rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all ${
                    errors.equipmentId ? 'border-[var(--status-danger)]' : 'border-transparent bg-[var(--steel-50)]'
                  }`}
                >
                  <option value="">Select equipment...</option>
                  {equipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} / {eq.code}
                    </option>
                  ))}
                </select>
                {equipment.length === 0 && (
                  <p className="mt-2 text-sm text-[var(--status-warning)] font-['DM_Sans']">No equipment available. Please add equipment first.</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                  Work Center <span className="text-[var(--status-danger)]">*</span>
                </label>
                <select
                  {...register('workCenterId')}
                  className="w-full px-4 py-3 border-2 border-transparent bg-[var(--steel-50)] rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
                >
                  <option value="">Select work center...</option>
                  {workCenters.map((wc) => (
                    <option key={wc.id} value={wc.id}>
                      {wc.name} ({wc.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Equipment Category (auto-filled) */}
            {requestType === 'equipment' && selectedEquipment && (
              <div>
                <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">Equipment Category</label>
                <input
                  type="text"
                  value={selectedEquipment.category?.name || '-'}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-transparent bg-[var(--steel-100)] rounded-xl text-[var(--steel-600)] font-['DM_Sans']"
                />
              </div>
            )}

            {/* Maintenance Type */}
            <div>
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">Maintenance Type</label>
              <div className="flex gap-4">
                {['CORRECTIVE', 'PREVENTIVE'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={type}
                      {...register('type')}
                      className="w-4 h-4 text-[var(--brand-accent)] focus:ring-[var(--brand-accent)] accent-[var(--brand-accent)]"
                    />
                    <span className="text-sm text-[var(--steel-700)] capitalize font-['DM_Sans']">{type.toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Team */}
            <div>
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">Team</label>
              <select
                {...register('teamId')}
                className="w-full px-4 py-3 border-2 border-transparent bg-[var(--steel-50)] rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
              >
                <option value="">Select team...</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            {/* Technician */}
            <div>
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">Technician</label>
              <select
                {...register('assignedToId')}
                className="w-full px-4 py-3 border-2 border-transparent bg-[var(--steel-50)] rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
              >
                <option value="">Assign later...</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>{tech.name}</option>
                ))}
              </select>
            </div>

            {/* Scheduled Date */}
            <div>
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                <Calendar className="w-4 h-4 inline mr-1" />
                Scheduled Date
              </label>
              <input
                type="datetime-local"
                {...register('scheduledDate')}
                className="w-full px-4 py-3 border-2 border-transparent bg-[var(--steel-50)] rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
              />
            </div>

            {/* Estimated Duration */}
            <div>
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                <Clock className="w-4 h-4 inline mr-1" />
                Estimated Duration (hours)
              </label>
              <input
                type="number"
                step="0.5"
                {...register('estimatedHours')}
                placeholder="e.g., 2.5"
                className="w-full px-4 py-3 border-2 border-transparent bg-[var(--steel-50)] rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
              />
            </div>

            {/* Priority */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-3 font-['DM_Sans']">Priority</label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-4">
                    {priorityOptions.map((option) => {
                      const isSelected = field.value === option.value;
                      const colorClasses = {
                        steel: isSelected ? 'border-[var(--steel-500)] bg-[var(--steel-100)]' : '',
                        info: isSelected ? 'border-[var(--status-info)] bg-[var(--status-info-bg)]' : '',
                        warning: isSelected ? 'border-[var(--status-warning)] bg-[var(--status-warning-bg)]' : '',
                        danger: isSelected ? 'border-[var(--status-danger)] bg-[var(--status-danger-bg)]' : ''
                      };
                      const diamondColors = {
                        steel: isSelected ? 'text-[var(--steel-500)] fill-[var(--steel-500)]' : 'text-[var(--steel-300)]',
                        info: isSelected ? 'text-[var(--status-info)] fill-[var(--status-info)]' : 'text-[var(--steel-300)]',
                        warning: isSelected ? 'text-[var(--status-warning)] fill-[var(--status-warning)]' : 'text-[var(--steel-300)]',
                        danger: isSelected ? 'text-[var(--status-danger)] fill-[var(--status-danger)]' : 'text-[var(--steel-300)]'
                      };
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          className={`
                            flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all font-['DM_Sans']
                            ${isSelected 
                              ? colorClasses[option.color]
                              : 'border-[var(--steel-200)] hover:border-[var(--steel-300)]'}
                          `}
                        >
                          <div className="flex gap-0.5">
                            {[...Array(option.diamonds)].map((_, i) => (
                              <Diamond 
                                key={i} 
                                className={`w-3 h-3 ${diamondColors[option.color]}`}
                              />
                            ))}
                          </div>
                          <span className={`text-sm font-semibold ${isSelected ? 'text-[var(--steel-900)]' : 'text-[var(--steel-600)]'}`}>
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Provide detailed description of the issue..."
                className="w-full px-4 py-3 border-2 border-transparent bg-[var(--steel-50)] rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-2xl border border-[var(--steel-200)] overflow-hidden mb-6">
          {/* Tabs */}
          <div className="flex border-b border-[var(--steel-200)]">
            <button
              type="button"
              onClick={() => setActiveNoteTab('notes')}
              className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-colors font-['DM_Sans'] ${
                activeNoteTab === 'notes'
                  ? 'text-[var(--brand-accent)] border-b-2 border-[var(--brand-accent)] bg-[var(--brand-accent-muted)]'
                  : 'text-[var(--steel-600)] hover:text-[var(--steel-900)]'
              }`}
            >
              Notes
            </button>
            <button
              type="button"
              onClick={() => setActiveNoteTab('instructions')}
              className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-colors font-['DM_Sans'] ${
                activeNoteTab === 'instructions'
                  ? 'text-[var(--brand-accent)] border-b-2 border-[var(--brand-accent)] bg-[var(--brand-accent-muted)]'
                  : 'text-[var(--steel-600)] hover:text-[var(--steel-900)]'
              }`}
            >
              Instructions
            </button>
          </div>
          
          <div className="p-6">
            {activeNoteTab === 'notes' ? (
              <textarea
                {...register('notes')}
                rows={5}
                placeholder="Add any additional notes..."
                className="w-full px-4 py-3 border-2 border-transparent bg-[var(--steel-50)] rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all resize-none"
              />
            ) : (
              <textarea
                {...register('instructions')}
                rows={5}
                placeholder="Add specific instructions for the technician..."
                className="w-full px-4 py-3 border-2 border-transparent bg-[var(--steel-50)] rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all resize-none"
              />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 text-[var(--steel-700)] bg-white border-2 border-[var(--steel-200)] rounded-xl hover:bg-[var(--steel-50)] hover:border-[var(--steel-300)] transition-all font-semibold font-['DM_Sans']"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--brand-accent)] to-[#e85a2a] text-white font-semibold rounded-xl shadow-lg shadow-[var(--brand-accent)]/20 hover:from-[#e85a2a] hover:to-[var(--brand-accent)] transition-all disabled:opacity-50 font-['DM_Sans']"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Request
              </>
            )}
          </button>
        </div>
      </form>
    </MainLayout>
  );
};

export default MaintenanceForm;
