import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Building2, Loader2, X } from 'lucide-react';
import api from '../lib/api';

const workCenterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  code: z.string()
    .min(2, 'Code must be at least 2 characters')
    .max(20)
    .regex(/^[A-Za-z0-9-]+$/, 'Code can only contain letters, numbers, and hyphens'),
  description: z.string().max(500).optional().or(z.literal('')),
  location: z.string().max(200).optional().or(z.literal('')),
  capacity: z.string().optional().or(z.literal('')),
  departmentId: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export default function WorkCenterForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(workCenterSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      location: '',
      capacity: '',
      departmentId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    fetchDepartments();
    fetchTeams();
    if (isEditMode) {
      fetchWorkCenter();
    } else {
      generateCode();
    }
  }, [id]);

  const fetchWorkCenter = async () => {
    try {
      setFetchingData(true);
      const response = await api.get(`/work-centers/${id}`);
      const wc = response.data.data;
      
      setValue('name', wc.name);
      setValue('code', wc.code);
      setValue('description', wc.description || '');
      setValue('location', wc.location || '');
      setValue('capacity', wc.capacity?.toString() || '');
      setValue('departmentId', wc.departmentId || '');
      setValue('isActive', wc.isActive);
      
      if (wc.teams) {
        setSelectedTeams(wc.teams.map(t => t.id));
      }
    } catch (error) {
      console.error('Failed to fetch work center:', error);
      navigate('/work-centers');
    } finally {
      setFetchingData(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      // For now, we'll use a placeholder. In a full implementation, 
      // you'd have a departments API endpoint
      setDepartments([]);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      setTeams(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const generateCode = async () => {
    try {
      const response = await api.get('/work-centers/generate-code');
      setValue('code', response.data.data.code);
    } catch (error) {
      console.error('Failed to generate code:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const payload = {
        ...data,
        capacity: data.capacity ? parseInt(data.capacity) : null,
        departmentId: data.departmentId || null,
        teamIds: selectedTeams,
      };

      if (isEditMode) {
        await api.put(`/work-centers/${id}`, payload);
      } else {
        await api.post('/work-centers', payload);
      }

      navigate('/work-centers');
    } catch (error) {
      console.error('Failed to save work center:', error);
      alert(error.response?.data?.message || 'Failed to save work center');
    } finally {
      setLoading(false);
    }
  };

  const toggleTeam = (teamId) => {
    setSelectedTeams(prev => 
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-accent)]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/work-centers')}
          className="p-2.5 hover:bg-[var(--steel-100)] rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--steel-600)]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">
            {isEditMode ? 'Edit Work Center' : 'New Work Center'}
          </h1>
          <p className="text-[var(--steel-500)] mt-1 font-['DM_Sans']">
            {isEditMode ? 'Update work center information' : 'Create a new work center'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--steel-200)] p-6">
          <h2 className="text-lg font-semibold text-[var(--steel-900)] mb-4 font-['Sora']">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                Work Center Name <span className="text-[var(--status-danger)]">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                className={`w-full px-4 py-3 bg-[var(--steel-50)] border-2 rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all ${
                  errors.name ? 'border-[var(--status-danger)] bg-[var(--status-danger-bg)]' : 'border-transparent'
                }`}
                placeholder="e.g., Assembly Line 1"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-[var(--status-danger)] font-['DM_Sans']">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                Code <span className="text-[var(--status-danger)]">*</span>
              </label>
              <input
                type="text"
                {...register('code')}
                className={`w-full px-4 py-3 bg-[var(--steel-50)] border-2 rounded-xl font-['JetBrains_Mono'] uppercase focus:bg-white focus:border-[var(--brand-accent)] transition-all ${
                  errors.code ? 'border-[var(--status-danger)] bg-[var(--status-danger-bg)]' : 'border-transparent'
                }`}
                placeholder="e.g., WC001"
              />
              {errors.code && (
                <p className="mt-2 text-sm text-[var(--status-danger)] font-['DM_Sans']">{errors.code.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                Location
              </label>
              <input
                type="text"
                {...register('location')}
                className="w-full px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
                placeholder="e.g., Building A, Floor 2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all resize-none"
                placeholder="Brief description of this work center..."
              />
            </div>
          </div>
        </div>

        {/* Capacity & Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--steel-200)] p-6">
          <h2 className="text-lg font-semibold text-[var(--steel-900)] mb-4 font-['Sora']">Capacity & Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                Capacity
              </label>
              <input
                type="number"
                {...register('capacity')}
                min="0"
                className="w-full px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
                placeholder="e.g., 100"
              />
              <p className="mt-2 text-sm text-[var(--steel-500)] font-['DM_Sans']">Maximum units per hour</p>
            </div>

            {isEditMode && (
              <div>
                <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                  Status
                </label>
                <div className="flex items-center gap-3 h-12">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isActive')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[var(--steel-200)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--brand-accent)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--steel-300)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand-accent)]"></div>
                    <span className="ml-3 text-sm font-semibold text-[var(--steel-700)] font-['DM_Sans']">
                      {watch('isActive') ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assigned Teams */}
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--steel-200)] p-6">
          <h2 className="text-lg font-semibold text-[var(--steel-900)] mb-4 font-['Sora']">Assigned Teams</h2>
          
          {teams.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-[var(--steel-500)] mb-3 font-['DM_Sans']">
                Select teams that will be responsible for this work center
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teams.map((team) => (
                  <label
                    key={team.id}
                    className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedTeams.includes(team.id)
                        ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-muted)]'
                        : 'border-[var(--steel-200)] hover:bg-[var(--steel-50)]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTeams.includes(team.id)}
                      onChange={() => toggleTeam(team.id)}
                      className="w-4 h-4 text-[var(--brand-accent)] border-[var(--steel-300)] rounded focus:ring-[var(--brand-accent)] accent-[var(--brand-accent)]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--steel-900)] truncate font-['DM_Sans']">{team.name}</p>
                      <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">
                        {team._count?.members || team.memberCount || 0} members
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="w-10 h-10 text-[var(--steel-300)] mx-auto mb-2" />
              <p className="text-[var(--steel-500)] font-['DM_Sans']">No teams available</p>
              <p className="text-sm text-[var(--steel-400)] font-['DM_Sans']">Create teams first to assign them here</p>
            </div>
          )}

          {selectedTeams.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedTeams.map((teamId) => {
                const team = teams.find(t => t.id === teamId);
                return team ? (
                  <span
                    key={teamId}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--brand-accent-muted)] text-[var(--brand-accent)] rounded-full text-sm font-semibold font-['DM_Sans']"
                  >
                    {team.name}
                    <button
                      type="button"
                      onClick={() => toggleTeam(teamId)}
                      className="hover:bg-[var(--brand-accent)]/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/work-centers')}
            className="px-6 py-3 text-[var(--steel-700)] bg-white border-2 border-[var(--steel-200)] rounded-xl hover:bg-[var(--steel-50)] hover:border-[var(--steel-300)] transition-all font-semibold font-['DM_Sans']"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="px-6 py-3 bg-gradient-to-r from-[var(--brand-accent)] to-[#e85a2a] text-white rounded-xl hover:from-[#e85a2a] hover:to-[var(--brand-accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 font-semibold font-['DM_Sans'] shadow-lg shadow-[var(--brand-accent)]/20"
          >
            {(isSubmitting || loading) && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditMode ? 'Update Work Center' : 'Create Work Center'}
          </button>
        </div>
      </form>
    </div>
  );
}
