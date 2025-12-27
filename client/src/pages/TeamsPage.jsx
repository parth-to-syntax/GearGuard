import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Users, 
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Wrench,
  Crown,
  UserPlus,
  Filter
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import api from '../lib/api';

const TeamsPage = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);

  // Fetch teams
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teams', {
        params: { search: searchQuery || undefined }
      });
      setTeams(response.data.data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [searchQuery]);

  // Delete team
  const handleDelete = async (teamId, teamName) => {
    if (!confirm(`Are you sure you want to delete "${teamName}"?`)) return;

    try {
      await api.delete(`/teams/${teamId}`);
      fetchTeams();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete team');
    }
    setMenuOpen(null);
  };

  // Get initials from name
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  };

  // Get avatar colors based on index
  const getAvatarColor = (index) => {
    const colors = [
      'from-[var(--brand-accent)] to-[#e85a2a]',
      'from-[var(--steel-600)] to-[var(--steel-800)]',
      'from-[var(--status-success)] to-[#059669]',
      'from-[var(--status-warning)] to-[#d97706]',
      'from-[#6366f1] to-[#4f46e5]',
      'from-[#8b5cf6] to-[#7c3aed]'
    ];
    return colors[index % colors.length];
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">Teams</h1>
          <p className="text-[var(--steel-500)] mt-1 font-['DM_Sans']">Manage maintenance teams and their members</p>
        </div>
        <button
          onClick={() => navigate('/teams/new')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#e85a2a] text-white font-semibold rounded-xl hover:-translate-y-0.5 transition-all font-['DM_Sans']"
          style={{ boxShadow: '0 4px 14px rgba(255, 107, 53, 0.35)' }}
        >
          <Plus className="w-5 h-5" />
          New Team
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--steel-400)]" />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm bg-[var(--steel-50)] border-2 border-transparent rounded-xl focus:bg-white focus:border-[var(--brand-accent)] transition-all font-['DM_Sans']"
          />
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-[var(--steel-100)] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-[var(--steel-100)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[var(--steel-400)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--steel-900)] mb-2 font-['Sora']">No teams found</h3>
          <p className="text-[var(--steel-500)] mb-6 font-['DM_Sans']">Get started by creating your first maintenance team</p>
          <button
            onClick={() => navigate('/teams/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#e85a2a] text-white font-semibold rounded-xl hover:-translate-y-0.5 transition-all font-['DM_Sans']"
            style={{ boxShadow: '0 4px 14px rgba(255, 107, 53, 0.35)' }}
          >
            <Plus className="w-4 h-4" />
            Create Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team, teamIndex) => (
            <div
              key={team.id}
              className="group bg-white rounded-2xl border border-[var(--border-subtle)] overflow-hidden hover:border-[var(--border-default)] hover:-translate-y-1 transition-all duration-300"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              {/* Card Header */}
              <div className="relative p-5 pb-4">
                {/* Menu Button */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setMenuOpen(menuOpen === team.id ? null : team.id)}
                    className="p-1.5 text-[var(--steel-400)] hover:text-[var(--steel-600)] hover:bg-[var(--steel-100)] rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {menuOpen === team.id && (
                    <div className="absolute right-0 top-8 w-44 bg-white rounded-xl border border-[var(--border-default)] py-2 z-10" style={{ boxShadow: 'var(--shadow-lg)' }}>
                      <button
                        onClick={() => { navigate(`/teams/${team.id}`); setMenuOpen(null); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--steel-700)] hover:bg-[var(--steel-50)] font-['DM_Sans']"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => { navigate(`/teams/${team.id}/edit`); setMenuOpen(null); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--steel-700)] hover:bg-[var(--steel-50)] font-['DM_Sans']"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Team
                      </button>
                      <button
                        onClick={() => handleDelete(team.id, team.name)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] font-['DM_Sans']"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Team Icon & Name */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarColor(teamIndex)} flex items-center justify-center flex-shrink-0`}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[var(--steel-900)] truncate font-['Sora']">{team.name}</h3>
                    {team.description && (
                      <p className="text-sm text-[var(--steel-500)] line-clamp-2 mt-0.5 font-['DM_Sans']">{team.description}</p>
                    )}
                  </div>
                </div>

                {/* Leader Badge */}
                {team.leader && (
                  <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-[var(--brand-accent-muted)] rounded-xl border border-[var(--brand-accent)]/20">
                    <Crown className="w-4 h-4 text-[var(--brand-accent)]" />
                    <span className="text-sm text-[var(--steel-600)] font-medium font-['DM_Sans']">Leader:</span>
                    <span className="text-sm text-[var(--steel-900)] font-['DM_Sans']">{team.leader.name}</span>
                  </div>
                )}
              </div>

              {/* Members Section */}
              <div className="px-5 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[var(--steel-500)] uppercase tracking-wider font-['Sora']">Members</span>
                  <span className="text-xs text-[var(--steel-400)] font-['DM_Sans']">{team.memberCount || team.members?.length || 0} members</span>
                </div>
                
                {/* Member Avatars */}
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {(team.members || []).slice(0, 5).map((member, idx) => (
                      <div
                        key={member.id}
                        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${getAvatarColor(idx)} flex items-center justify-center text-white text-xs font-semibold border-2 border-white font-['Sora']`}
                        title={member.name}
                      >
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full rounded-lg object-cover" />
                        ) : (
                          getInitials(member.name)
                        )}
                      </div>
                    ))}
                    {(team.members?.length || 0) > 5 && (
                      <div className="w-9 h-9 rounded-lg bg-[var(--steel-200)] flex items-center justify-center text-[var(--steel-600)] text-xs font-semibold border-2 border-white font-['DM_Sans']">
                        +{team.members.length - 5}
                      </div>
                    )}
                  </div>
                  {(!team.members || team.members.length === 0) && (
                    <span className="text-sm text-[var(--steel-400)] italic font-['DM_Sans']">No members yet</span>
                  )}
                </div>
              </div>

              {/* Stats Footer */}
              <div className="px-5 py-3.5 bg-[var(--steel-50)] border-t border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Wrench className="w-4 h-4 text-[var(--steel-400)]" />
                    <span className="text-[var(--steel-600)] font-['DM_Sans']">{team.activeRequests || 0} active</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/teams/${team.id}`)}
                  className="text-sm font-semibold text-[var(--brand-accent)] hover:text-[#e85a2a] transition-colors font-['DM_Sans']"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Click outside to close menu */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setMenuOpen(null)}
        />
      )}
    </MainLayout>
  );
};

export default TeamsPage;
