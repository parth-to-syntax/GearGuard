import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/ui/DataTable';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
  Folder,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
  Box,
  X,
} from 'lucide-react';

const CategoriesPage = () => {
  const { hasPermission } = useAuth();
  const [categories, setCategories] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'table'
  const [expandedIds, setExpandedIds] = useState(new Set());
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    parentId: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const [hierarchical, flat] = await Promise.all([
        api.get('/categories'),
        api.get('/categories?flat=true'),
      ]);
      setCategories(hierarchical.data);
      setFlatCategories(flat.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        icon: category.icon || '',
        parentId: category.parentId || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        icon: '',
        parentId: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      parentId: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        parentId: formData.parentId || null,
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, payload);
      } else {
        await api.post('/categories', payload);
      }

      handleCloseModal();
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;

    try {
      await api.delete(`/categories/${category.id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const renderTreeNode = (category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);
    const equipmentCount = category._count?.equipment || 0;

    return (
      <div key={category.id}>
        <div
          className={`flex items-center py-3 px-4 hover:bg-[var(--steel-50)] rounded-xl group transition-colors ${
            level > 0 ? 'ml-6' : ''
          }`}
        >
          {/* Expand/collapse button */}
          <button
            onClick={() => toggleExpand(category.id)}
            className={`mr-3 p-1.5 rounded-lg hover:bg-[var(--steel-200)] transition-colors ${
              !hasChildren ? 'invisible' : ''
            }`}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-[var(--steel-500)]" />
            ) : (
              <ChevronRight className="h-4 w-4 text-[var(--steel-500)]" />
            )}
          </button>

          {/* Icon */}
          <div className="flex-shrink-0 mr-4">
            {category.icon ? (
              <span className="text-2xl">{category.icon}</span>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand-accent-muted)] to-[var(--steel-100)] flex items-center justify-center">
                <Folder className="h-5 w-5 text-[var(--brand-accent)]" />
              </div>
            )}
          </div>

          {/* Name and info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{category.name}</p>
            {category.description && (
              <p className="text-sm text-[var(--steel-500)] truncate font-['DM_Sans']">{category.description}</p>
            )}
          </div>

          {/* Equipment count */}
          <div className="flex items-center text-sm text-[var(--steel-500)] mr-4 font-['DM_Sans']">
            <Box className="h-4 w-4 mr-1.5" />
            {equipmentCount}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {hasPermission('canEdit') && (
              <button
                onClick={() => handleOpenModal(category)}
                className="p-2 rounded-lg hover:bg-[var(--steel-200)] text-[var(--steel-600)] transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {hasPermission('canDelete') && (
              <button
                onClick={() => handleDelete(category)}
                className="p-2 rounded-lg hover:bg-[var(--status-danger-bg)] text-[var(--status-danger)] transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="border-l-2 border-[var(--steel-200)] ml-5">
            {category.children.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Table columns for flat view
  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <div className="flex items-center">
          {row.icon ? (
            <span className="text-xl mr-3">{row.icon}</span>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand-accent-muted)] to-[var(--steel-100)] flex items-center justify-center mr-3">
              <Folder className="h-4 w-4 text-[var(--brand-accent)]" />
            </div>
          )}
          <span className="font-semibold text-[var(--steel-900)] font-['DM_Sans']">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (row) => (
        <span className="text-[var(--steel-600)] truncate max-w-xs block font-['DM_Sans']">
          {row.description || '-'}
        </span>
      ),
    },
    {
      key: 'parent',
      label: 'Parent Category',
      render: (row) => {
        const parent = flatCategories.find((c) => c.id === row.parentId);
        return parent ? (
          <span className="text-[var(--steel-600)] font-['DM_Sans']">{parent.name}</span>
        ) : (
          <span className="text-[var(--steel-400)]">-</span>
        );
      },
    },
    {
      key: 'equipment',
      label: 'Equipment',
      render: (row) => (
        <span className="text-[var(--steel-600)] font-semibold font-['DM_Sans']">{row._count?.equipment || 0}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          {hasPermission('canEdit') && (
            <button
              onClick={() => handleOpenModal(row)}
              className="p-2 rounded-lg hover:bg-[var(--steel-100)] text-[var(--steel-600)] transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {hasPermission('canDelete') && (
            <button
              onClick={() => handleDelete(row)}
              className="p-2 rounded-lg hover:bg-[var(--status-danger-bg)] text-[var(--status-danger)] transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">Equipment Categories</h1>
            <p className="text-[var(--steel-500)] font-['DM_Sans']">Organize your equipment into categories</p>
          </div>

          <div className="flex items-center space-x-3">
            {/* View mode toggle */}
            <div className="flex rounded-xl border border-[var(--border-default)] overflow-hidden">
              <button
                onClick={() => setViewMode('tree')}
                className={`px-4 py-2 text-sm font-medium font-['DM_Sans'] transition-all ${
                  viewMode === 'tree'
                    ? 'bg-[var(--brand-accent)] text-white'
                    : 'bg-white text-[var(--steel-700)] hover:bg-[var(--steel-50)]'
                }`}
              >
                Tree
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 text-sm font-medium font-['DM_Sans'] transition-all ${
                  viewMode === 'table'
                    ? 'bg-[var(--brand-accent)] text-white'
                    : 'bg-white text-[var(--steel-700)] hover:bg-[var(--steel-50)]'
                }`}
              >
                Table
              </button>
            </div>

            {hasPermission('canCreate') && (
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center px-5 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#e85a2a] text-white rounded-xl font-semibold font-['DM_Sans'] hover:-translate-y-0.5 transition-all"
                style={{ boxShadow: '0 4px 14px rgba(255, 107, 53, 0.35)' }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Category
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-[var(--status-danger-bg)] border border-[var(--status-danger)]/20 text-[var(--status-danger)] px-4 py-3 rounded-xl font-['DM_Sans']">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-3 border-[var(--steel-200)] border-t-[var(--brand-accent)] rounded-full animate-spin"></div>
          </div>
        ) : viewMode === 'tree' ? (
          <div className="bg-white rounded-xl border border-[var(--border-subtle)] p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
            {categories.length === 0 ? (
              <div className="text-center py-16 text-[var(--steel-500)]">
                <div className="w-16 h-16 bg-[var(--steel-100)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Folder className="h-8 w-8 text-[var(--steel-400)]" />
                </div>
                <p className="font-semibold text-[var(--steel-700)] font-['Sora']">No categories found</p>
                {hasPermission('canCreate') && (
                  <button
                    onClick={() => handleOpenModal()}
                    className="mt-4 text-[var(--brand-accent)] hover:text-[#e85a2a] font-semibold font-['DM_Sans']"
                  >
                    Create your first category
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {categories.map((category) => renderTreeNode(category))}
              </div>
            )}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={flatCategories}
            emptyMessage="No categories found"
          />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={handleCloseModal}
            ></div>

            <div className="relative inline-block w-full max-w-md p-6 my-8 text-left bg-white rounded-2xl transform transition-all" style={{ boxShadow: 'var(--shadow-xl)' }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-[var(--steel-900)] font-['Sora']">
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-lg hover:bg-[var(--steel-100)] text-[var(--steel-500)] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl focus:bg-white focus:border-[var(--brand-accent)] transition-all font-['DM_Sans']"
                    placeholder="Category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl focus:bg-white focus:border-[var(--brand-accent)] transition-all font-['DM_Sans'] resize-none"
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                    Icon (emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl focus:bg-white focus:border-[var(--brand-accent)] transition-all font-['DM_Sans']"
                    placeholder="🔧 or 🏭"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                    Parent Category
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) =>
                      setFormData({ ...formData, parentId: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl focus:bg-white focus:border-[var(--brand-accent)] transition-all font-['DM_Sans']"
                  >
                    <option value="">None (top-level)</option>
                    {flatCategories
                      .filter((c) => c.id !== editingCategory?.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 text-[var(--steel-700)] bg-[var(--steel-100)] rounded-xl hover:bg-[var(--steel-200)] font-semibold font-['DM_Sans'] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#e85a2a] text-white rounded-xl font-semibold font-['DM_Sans'] disabled:opacity-50 hover:-translate-y-0.5 transition-all"
                    style={{ boxShadow: '0 4px 14px rgba(255, 107, 53, 0.35)' }}
                  >
                    {saving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoriesPage;
