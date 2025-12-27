import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Users, 
  Save, 
  X, 
  Search,
  Crown,
  Check,
  Building2
} from 'lucide-react';
import api from '../lib/api';

// Validation schema
const teamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  leaderId: z.string().optional(),
  workCenterId: z.string().optional()
});

const TeamForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      description: '',
      leaderId: '',
      workCenterId: ''
    }
  });

  const leaderId = watch('leaderId');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available users
        const usersRes = await api.get('/teams/available-users', {
          params: { teamId: id }
        });
        setAvailableUsers(usersRes.data.data || []);

        // If editing, fetch team data
        if (isEditing) {
          const teamRes = await api.get(`/teams/${id}`);
          const team = teamRes.data.data;
          setValue('name', team.name);
          setValue('description', team.description || '');
          setValue('leaderId', team.leaderId || '');
          setValue('workCenterId', team.workCenterId || '');
          setSelectedMembers(team.members?.map(m => m.id) || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 404) {
          navigate('/teams');
        }
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing, setValue, navigate]);

  // Toggle member selection
  const toggleMember = (userId) => {
    setSelectedMembers(prev => {
      if (prev.includes(userId)) {
        // If removing the leader, also clear leader field
        if (leaderId === userId) {
          setValue('leaderId', '');
        }
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  // Set leader
  const setLeader = (userId) => {
    // First ensure they're a member
    if (!selectedMembers.includes(userId)) {
      setSelectedMembers(prev => [...prev, userId]);
    }
    setValue('leaderId', userId);
  };

  // Submit form
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const payload = {
        ...data,
        leaderId: data.leaderId || null,
        workCenterId: data.workCenterId || null,
        memberIds: selectedMembers
      };

      if (isEditing) {
        await api.put(`/teams/${id}`, payload);
      } else {
        await api.post('/teams', payload);
      }

      navigate('/teams');
    } catch (error) {
      console.error('Error saving team:', error);
      alert(error.response?.data?.message || 'Failed to save team');
    } finally {
      setLoading(false);
    }
  };

  // Filter users for search
  const filteredUsers = availableUsers.filter(user => {
    if (!searchQuery) return true;
    return (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Get initials
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  };

  const getAvatarColor = (index) => {
    const colors = [
      'from-[var(--brand-accent)] to-[#e85a2a]',
      'from-[var(--status-info)] to-blue-600',
      'from-[var(--status-success)] to-emerald-600',
      'from-[var(--steel-500)] to-[var(--steel-700)]',
      'from-[var(--status-warning)] to-amber-600'
    ];
    return colors[index % colors.length];
  };

  if (initialLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[var(--steel-200)] rounded" />
        <div className="h-96 bg-[var(--steel-200)] rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/teams')}
          className="flex items-center gap-2 text-[var(--steel-600)] hover:text-[var(--steel-900)] transition-colors mb-4 font-['DM_Sans']"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Teams</span>
        </button>

        <h1 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">
          {isEditing ? 'Edit Team' : 'Create New Team'}
        </h1>
        <p className="text-[var(--steel-500)] mt-1 font-['DM_Sans']">
          {isEditing ? 'Update team details and members' : 'Set up a new maintenance team'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-[var(--steel-200)] p-6 mb-6">
          <h3 className="text-sm font-semibold text-[var(--steel-700)] mb-4 flex items-center gap-2 font-['DM_Sans'] uppercase tracking-wide">
            <Users className="w-4 h-4" />
            Team Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                Team Name <span className="text-[var(--status-danger)]">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g., Electrical Maintenance Team"
                className={`w-full px-4 py-3 bg-[var(--steel-50)] border-2 rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all ${
                  errors.name ? 'border-[var(--status-danger)] bg-[var(--status-danger-bg)]' : 'border-transparent'
                }`}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-[var(--status-danger)] font-['DM_Sans']">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Describe the team's responsibilities..."
                className="w-full px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] resize-none transition-all"
              />
            </div>

            {/* Work Center (optional) */}
            <div>
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                <Building2 className="w-4 h-4 inline mr-1" />
                Work Center (Optional)
              </label>
              <select
                {...register('workCenterId')}
                className="w-full px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
              >
                <option value="">No work center assigned</option>
                {workCenters.map(wc => (
                  <option key={wc.id} value={wc.id}>{wc.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-2xl border border-[var(--steel-200)] p-6 mb-6">
          <h3 className="text-sm font-semibold text-[var(--steel-700)] mb-4 flex items-center gap-2 font-['DM_Sans'] uppercase tracking-wide">
            <Users className="w-4 h-4" />
            Team Members
          </h3>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--steel-400)]" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
            />
          </div>

          {/* Selected Count */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--steel-100)]">
            <span className="text-sm text-[var(--steel-600)] font-['DM_Sans']">
              <span className="font-semibold text-[var(--steel-900)]">{selectedMembers.length}</span> members selected
            </span>
            {selectedMembers.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedMembers([]);
                  setValue('leaderId', '');
                }}
                className="text-sm text-[var(--status-danger)] hover:text-red-700 font-['DM_Sans']"
              >
                Clear all
              </button>
            )}
          </div>

          {/* User List */}
          <div className="max-h-80 overflow-y-auto space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-[var(--steel-300)] mx-auto mb-4" />
                <p className="text-[var(--steel-500)] font-['DM_Sans']">No users found</p>
              </div>
            ) : (
              filteredUsers.map((user, idx) => {
                const isSelected = selectedMembers.includes(user.id);
                const isLeader = leaderId === user.id;

                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-muted)]'
                        : 'border-transparent hover:bg-[var(--steel-50)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleMember(user.id)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white'
                            : 'border-[var(--steel-300)] hover:border-[var(--brand-accent)]'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4" />}
                      </button>

                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(idx)} flex items-center justify-center`}>
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-white text-sm font-semibold font-['DM_Sans']">{getInitials(user.name)}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{user.name}</span>
                          {isLeader && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--brand-accent-muted)] text-[var(--brand-accent)] text-xs font-semibold rounded-full font-['DM_Sans']">
                              <Crown className="w-3 h-3" />
                              Leader
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">{user.email}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-[var(--steel-100)] text-[var(--steel-600)] text-xs rounded-full capitalize font-['DM_Sans']">
                        {user.role?.toLowerCase()}
                      </span>
                      {isSelected && !isLeader && (
                        <button
                          type="button"
                          onClick={() => setLeader(user.id)}
                          className="p-1.5 text-[var(--steel-400)] hover:text-[var(--brand-accent)] hover:bg-[var(--brand-accent-muted)] rounded-lg transition-colors"
                          title="Set as team leader"
                        >
                          <Crown className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/teams')}
            className="px-6 py-3 text-[var(--steel-700)] bg-white border-2 border-[var(--steel-200)] rounded-xl hover:bg-[var(--steel-50)] hover:border-[var(--steel-300)] transition-all font-semibold font-['DM_Sans']"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--brand-accent)] to-[#e85a2a] text-white font-semibold rounded-xl shadow-lg shadow-[var(--brand-accent)]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 font-['DM_Sans']"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Update Team' : 'Create Team'}
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default TeamForm;
