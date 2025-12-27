import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Wrench, Settings2, Users, Building2, FileText } from 'lucide-react';
import api from '../../lib/api';

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    maintenance: [],
    equipment: [],
    teams: [],
    workCenters: [],
  });
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search when query changes
  useEffect(() => {
    if (query.length < 2) {
      setResults({ maintenance: [], equipment: [], teams: [], workCenters: [] });
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        const [maintenanceRes, equipmentRes, teamsRes, wcRes] = await Promise.all([
          api.get(`/maintenance-requests?search=${query}&limit=5`).catch(() => ({ data: { data: [] } })),
          api.get(`/equipment?search=${query}`).catch(() => ({ data: { data: [] } })),
          api.get(`/teams?search=${query}`).catch(() => ({ data: { data: [] } })),
          api.get(`/work-centers?search=${query}`).catch(() => ({ data: { data: [] } })),
        ]);

        setResults({
          maintenance: (maintenanceRes.data.data || []).slice(0, 5),
          equipment: (equipmentRes.data.data || []).slice(0, 5),
          teams: (teamsRes.data.data || []).slice(0, 5),
          workCenters: (wcRes.data.data || []).slice(0, 5),
        });
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const allResults = [
    ...results.maintenance.map((r) => ({ ...r, type: 'maintenance' })),
    ...results.equipment.map((r) => ({ ...r, type: 'equipment' })),
    ...results.teams.map((r) => ({ ...r, type: 'team' })),
    ...results.workCenters.map((r) => ({ ...r, type: 'workCenter' })),
  ];

  const handleKeyNav = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && allResults[activeIndex]) {
      handleSelect(allResults[activeIndex]);
    }
  };

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery('');
    switch (item.type) {
      case 'maintenance':
        navigate(`/maintenance/${item.id}`);
        break;
      case 'equipment':
        navigate(`/equipment/${item.id}`);
        break;
      case 'team':
        navigate(`/teams/${item.id}`);
        break;
      case 'workCenter':
        navigate(`/work-centers/${item.id}`);
        break;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'maintenance':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'equipment':
        return <Settings2 className="w-4 h-4 text-purple-500" />;
      case 'team':
        return <Users className="w-4 h-4 text-green-500" />;
      case 'workCenter':
        return <Building2 className="w-4 h-4 text-orange-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLabel = (type) => {
    switch (type) {
      case 'maintenance':
        return 'Maintenance';
      case 'equipment':
        return 'Equipment';
      case 'team':
        return 'Team';
      case 'workCenter':
        return 'Work Center';
      default:
        return '';
    }
  };

  if (!isOpen) {
    return (
      <div className="hidden md:flex items-center">
        <button
          onClick={() => setIsOpen(true)}
          className="gg-global-search-trigger w-64 px-3 py-2 text-sm bg-[rgba(255,255,255,0.05)] rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-all flex items-center gap-2"
        >
          <Search className="w-4 h-4 text-muted shrink-0" />
          <span className="text-muted leading-none">Search...</span>
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-xs bg-[rgba(255,255,255,0.1)] rounded text-secondary">
            ⌘K
          </kbd>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-xl z-50">
        <div className="glass-card overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center px-4 border-b border-[var(--card-border)]">
            <Search className="w-5 h-5 text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyNav}
              placeholder="Search maintenance, equipment, teams..."
              className="flex-1 px-4 py-4 bg-transparent text-primary placeholder-muted focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 hover:bg-[rgba(255,255,255,0.05)] rounded">
                <X className="w-4 h-4 text-muted" />
              </button>
            )}
          </div>

          {/* Results */}
          {query.length >= 2 && (
            <div ref={resultsRef} className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-secondary">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--brand-accent)] mx-auto"></div>
                </div>
              ) : allResults.length > 0 ? (
                <div className="py-2">
                  {allResults.map((item, index) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleSelect(item)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[rgba(59,130,246,0.08)] transition-colors ${
                        index === activeIndex ? 'bg-[var(--brand-accent-muted)]' : ''
                      }`}
                    >
                      {getIcon(item.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-light text-primary truncate">
                          {item.name || item.title || item.requestNumber}
                        </p>
                        <p className="text-xs text-muted truncate">
                          {item.code || item.description || ''}
                        </p>
                      </div>
                      <span className="text-xs text-secondary bg-[rgba(255,255,255,0.05)] px-2 py-1 rounded">
                        {getLabel(item.type)}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-secondary">
                  <Search className="w-8 h-8 mx-auto mb-2 text-muted" />
                  <p>No results found for "{query}"</p>
                </div>
              )}
            </div>
          )}

          {/* Hints */}
          <div className="px-4 py-2 bg-[rgba(255,255,255,0.03)] border-t border-[var(--card-border)] flex justify-between text-xs text-muted">
            <span>
              <kbd className="px-1.5 py-0.5 bg-[rgba(255,255,255,0.1)] rounded mr-1">↑↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-[rgba(255,255,255,0.1)] rounded mr-1">↵</kbd> to select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-[rgba(255,255,255,0.1)] rounded mr-1">esc</kbd> to close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
