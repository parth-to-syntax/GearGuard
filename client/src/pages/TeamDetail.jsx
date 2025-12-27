import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Crown, 
  Wrench, 
  Edit2, 
  Trash2,
  Plus,
  X,
  Mail,
  Phone,
  Building2,
  UserMinus,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../components/ui/StatusBadge';
import api from '../lib/api';

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');
  const [showAddMember, setShowAddMember] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);

  // Fetch team data
  const fetchTeam = async () => {
    try {
      setLoading(true);
      const [teamRes, statsRes] = await Promise.all([
        api.get(`/teams/${id}`),
        api.get(`/teams/${id}/stats`)
      ]);
      setTeam(teamRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching team:', error);
      if (error.response?.status === 404) {
        navigate('/teams');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch available users
  const fetchAvailableUsers = async () => {
    try {
      const response = await api.get('/teams/available-users', {
        params: { teamId: id }
      });
      setAvailableUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [id]);

  useEffect(() => {
    if (showAddMember) {
      fetchAvailableUsers();
    }
  }, [showAddMember]);

  // Add member
  const handleAddMember = async (userId) => {
    try {
      await api.post(`/teams/${id}/members`, { userId });
      setShowAddMember(false);
      fetchTeam();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add member');
    }
  };

  // Remove member
  const handleRemoveMember = async (userId, userName) => {
    if (!confirm(`Remove "${userName}" from this team?`)) return;
    
    try {
      await api.delete(`/teams/${id}/members/${userId}`);
      fetchTeam();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove member');
    }
  };

  // Delete team
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    
    try {
      await api.delete(`/teams/${id}`);
      navigate('/teams');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete team');
    }
  };

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
      'from-[var(--status-info)] to-[#0077b6]',
      'from-[var(--status-success)] to-[#0a8754]',
      'from-[var(--status-warning)] to-[#cc8400]',
      'from-[var(--steel-500)] to-[var(--steel-700)]'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[var(--steel-200)] rounded-xl" />
        <div className="h-64 bg-[var(--steel-200)] rounded-2xl" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-semibold text-[var(--steel-900)] font-['Sora']">Team not found</h3>
        <button onClick={() => navigate('/teams')} className="mt-4 text-[var(--brand-accent)] hover:text-[#e85a2a] font-['DM_Sans'] font-semibold">
          Back to Teams
        </button>
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

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--brand-accent)] to-[#e85a2a] flex items-center justify-center shadow-lg shadow-[var(--brand-accent)]/20">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">{team.name}</h1>
              {team.description && (
                <p className="text-[var(--steel-500)] mt-1 font-['DM_Sans']">{team.description}</p>
              )}
              {team.workCenter && (
                <div className="flex items-center gap-2 mt-2 text-sm text-[var(--steel-600)] font-['DM_Sans']">
                  <Building2 className="w-4 h-4" />
                  <span>{team.workCenter.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/teams/${id}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-[var(--steel-700)] bg-white border-2 border-[var(--steel-200)] rounded-xl hover:bg-[var(--steel-50)] hover:border-[var(--steel-300)] transition-all font-semibold font-['DM_Sans']"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-[var(--status-danger)] bg-white border-2 border-[var(--status-danger)]/20 rounded-xl hover:bg-[var(--status-danger-bg)] transition-all font-semibold font-['DM_Sans']"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-[var(--steel-200)] p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[var(--status-info-bg)] rounded-xl">
                <Activity className="w-5 h-5 text-[var(--status-info)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">{stats.totalRequests}</p>
                <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Total Requests</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[var(--steel-200)] p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[var(--status-success-bg)] rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-[var(--status-success)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">{stats.completionRate}%</p>
                <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Completion Rate</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[var(--steel-200)] p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[var(--status-warning-bg)] rounded-xl">
                <Clock className="w-5 h-5 text-[var(--status-warning)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">{stats.inProgressRequests}</p>
                <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">In Progress</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[var(--steel-200)] p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[var(--status-danger-bg)] rounded-xl">
                <AlertCircle className="w-5 h-5 text-[var(--status-danger)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">{stats.criticalRequests}</p>
                <p className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Critical</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[var(--steel-200)] overflow-hidden">
        <div className="flex border-b border-[var(--steel-200)]">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors font-['DM_Sans'] ${
              activeTab === 'members'
                ? 'text-[var(--brand-accent)] border-b-2 border-[var(--brand-accent)] bg-[var(--brand-accent-muted)]'
                : 'text-[var(--steel-600)] hover:text-[var(--steel-900)]'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              Members ({team.members?.length || 0})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors font-['DM_Sans'] ${
              activeTab === 'requests'
                ? 'text-[var(--brand-accent)] border-b-2 border-[var(--brand-accent)] bg-[var(--brand-accent-muted)]'
                : 'text-[var(--steel-600)] hover:text-[var(--steel-900)]'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Wrench className="w-4 h-4" />
              Active Requests ({team.maintenanceRequests?.length || 0})
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'members' && (
            <div>
              {/* Add Member Button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowAddMember(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--brand-accent)] to-[#e85a2a] text-white rounded-xl hover:from-[#e85a2a] hover:to-[var(--brand-accent)] transition-all font-semibold font-['DM_Sans'] shadow-lg shadow-[var(--brand-accent)]/20"
                >
                  <Plus className="w-4 h-4" />
                  Add Member
                </button>
              </div>

              {/* Members List */}
              {(!team.members || team.members.length === 0) ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-[var(--steel-300)] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[var(--steel-900)] mb-2 font-['Sora']">No members yet</h3>
                  <p className="text-[var(--steel-500)] font-['DM_Sans']">Add team members to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {team.members.map((member, idx) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-[var(--steel-50)] rounded-xl hover:bg-[var(--steel-100)] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(idx)} flex items-center justify-center shadow-md`}>
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-white font-semibold font-['DM_Sans']">{getInitials(member.name)}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{member.name}</span>
                            {team.leaderId === member.id && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--brand-accent-muted)] text-[var(--brand-accent)] text-xs font-semibold rounded-full">
                                <Crown className="w-3 h-3" />
                                Leader
                              </span>
                            )}
                            <span className="px-2 py-0.5 bg-[var(--steel-200)] text-[var(--steel-600)] text-xs font-semibold rounded-full capitalize font-['DM_Sans']">
                              {member.role?.toLowerCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-[var(--steel-500)] font-['DM_Sans']">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </span>
                            {member.department && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {member.department}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(member.id, member.name)}
                        className="p-2.5 text-[var(--steel-400)] hover:text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] rounded-xl transition-all"
                        title="Remove member"
                      >
                        <UserMinus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              {(!team.maintenanceRequests || team.maintenanceRequests.length === 0) ? (
                <div className="text-center py-12">
                  <Wrench className="w-12 h-12 text-[var(--steel-300)] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[var(--steel-900)] mb-2 font-['Sora']">No active requests</h3>
                  <p className="text-[var(--steel-500)] font-['DM_Sans']">This team has no pending maintenance requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {team.maintenanceRequests.map((request) => (
                    <div
                      key={request.id}
                      onClick={() => navigate(`/maintenance/${request.id}`)}
                      className="flex items-center justify-between p-4 bg-[var(--steel-50)] rounded-xl hover:bg-[var(--steel-100)] cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{request.title}</span>
                          <PriorityBadge priority={request.priority} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[var(--steel-500)] font-['DM_Sans']">
                          <span className="font-['JetBrains_Mono']">{request.requestNumber}</span>
                          <span>{new Date(request.reportedDate).toLocaleDateString()}</span>
                          {request.assignedTo && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {request.assignedTo.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden border border-[var(--steel-200)]">
            <div className="flex items-center justify-between p-5 border-b border-[var(--steel-200)]">
              <h3 className="text-lg font-bold text-[var(--steel-900)] font-['Sora']">Add Team Member</h3>
              <button
                onClick={() => setShowAddMember(false)}
                className="p-2 text-[var(--steel-400)] hover:text-[var(--steel-600)] hover:bg-[var(--steel-100)] rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {availableUsers.filter(u => u.isAvailable).length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-[var(--steel-300)] mx-auto mb-4" />
                  <p className="text-[var(--steel-500)] font-['DM_Sans']">No available users to add</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableUsers.filter(u => u.isAvailable && !team.members?.some(m => m.id === u.id)).map((user, idx) => (
                    <button
                      key={user.id}
                      onClick={() => handleAddMember(user.id)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-[var(--steel-50)] transition-colors text-left border-2 border-transparent hover:border-[var(--brand-accent)]"
                    >
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(idx)} flex items-center justify-center shadow-md`}>
                        <span className="text-white text-sm font-semibold font-['DM_Sans']">{getInitials(user.name)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{user.name}</p>
                        <p className="text-sm text-[var(--steel-500)] truncate font-['DM_Sans']">{user.email}</p>
                      </div>
                      <span className="px-3 py-1.5 bg-[var(--steel-100)] text-[var(--steel-600)] text-xs rounded-full capitalize font-semibold font-['DM_Sans']">
                        {user.role?.toLowerCase()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeamDetail;
