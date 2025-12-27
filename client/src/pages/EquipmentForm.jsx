import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Settings2, Loader2 } from 'lucide-react';
import api from '../lib/api';

const equipmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  code: z.string()
    .min(2, 'Code must be at least 2 characters')
    .max(20)
    .regex(/^[A-Za-z0-9-]+$/, 'Code can only contain letters, numbers, and hyphens'),
  description: z.string().max(1000).optional().or(z.literal('')),
  serialNumber: z.string().max(100).optional().or(z.literal('')),
  model: z.string().max(100).optional().or(z.literal('')),
  manufacturer: z.string().max(100).optional().or(z.literal('')),
  purchaseDate: z.string().optional().or(z.literal('')),
  warrantyExpiry: z.string().optional().or(z.literal('')),
  location: z.string().max(200).optional().or(z.literal('')),
  status: z.string().optional(),
  workCenterId: z.string().optional().or(z.literal('')),
  categoryId: z.string().optional().or(z.literal('')),
});

const statusOptions = [
  { value: 'OPERATIONAL', label: 'Operational' },
  { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
  { value: 'DECOMMISSIONED', label: 'Decommissioned' }
];

const healthStatusOptions = [
  { value: 'HEALTHY', label: 'Healthy' },
  { value: 'WARNING', label: 'Warning' },
  { value: 'CRITICAL', label: 'Critical' }
];

export default function EquipmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);
  const [workCenters, setWorkCenters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [healthScore, setHealthScore] = useState(100);
  const [healthStatus, setHealthStatus] = useState('HEALTHY');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      serialNumber: '',
      model: '',
      manufacturer: '',
      purchaseDate: '',
      warrantyExpiry: '',
      location: '',
      status: 'OPERATIONAL',
      workCenterId: '',
      categoryId: '',
    },
  });

  useEffect(() => {
    fetchWorkCenters();
    fetchCategories();
    if (isEditMode) {
      fetchEquipment();
    } else {
      generateCode();
    }
  }, [id]);

  const fetchEquipment = async () => {
    try {
      setFetchingData(true);
      const response = await api.get(`/equipment/${id}`);
      const eq = response.data.data;
      
      setValue('name', eq.name);
      setValue('code', eq.code);
      setValue('description', eq.description || '');
      setValue('serialNumber', eq.serialNumber || '');
      setValue('model', eq.model || '');
      setValue('manufacturer', eq.manufacturer || '');
      setValue('purchaseDate', eq.purchaseDate ? eq.purchaseDate.split('T')[0] : '');
      setValue('warrantyExpiry', eq.warrantyExpiry ? eq.warrantyExpiry.split('T')[0] : '');
      setValue('location', eq.location || '');
      setValue('status', eq.status);
      setValue('workCenterId', eq.workCenterId || '');
      setValue('categoryId', eq.categoryId || '');
      setHealthScore(eq.healthScore || 100);
      setHealthStatus(eq.healthStatus || 'HEALTHY');
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
      navigate('/equipment');
    } finally {
      setFetchingData(false);
    }
  };

  const fetchWorkCenters = async () => {
    try {
      const response = await api.get('/work-centers');
      setWorkCenters(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch work centers:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/equipment/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const generateCode = async () => {
    try {
      const response = await api.get('/equipment/generate-code');
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
        workCenterId: data.workCenterId || null,
        categoryId: data.categoryId || null,
        purchaseDate: data.purchaseDate || null,
        warrantyExpiry: data.warrantyExpiry || null,
      };

      if (isEditMode) {
        payload.healthScore = healthScore;
        payload.healthStatus = healthStatus;
        await api.put(`/equipment/${id}`, payload);
      } else {
        await api.post('/equipment', payload);
      }

      navigate('/equipment');
    } catch (error) {
      console.error('Failed to save equipment:', error);
      alert(error.response?.data?.message || 'Failed to save equipment');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-accent)]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/equipment')}
          className="p-2.5 hover:bg-[var(--steel-100)] rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--steel-600)]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">
            {isEditMode ? 'Edit Equipment' : 'New Equipment'}
          </h1>
          <p className="text-[var(--steel-500)] mt-1 font-['DM_Sans']">
            {isEditMode ? 'Update equipment information' : 'Add new equipment to the system'}
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
                Equipment Name <span className="text-[var(--status-danger)]">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                className={`w-full px-4 py-3 bg-[var(--steel-50)] border-2 rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all ${
                  errors.name ? 'border-[var(--status-danger)] bg-[var(--status-danger-bg)]' : 'border-transparent'
                }`}
                placeholder="e.g., CNC Milling Machine"
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
                placeholder="e.g., EQ0001"
              />
              {errors.code && (
                <p className="mt-2 text-sm text-[var(--status-danger)] font-['DM_Sans']">{errors.code.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                Serial Number
              </label>
              <input
                type="text"
                {...register('serialNumber')}
                className="w-full px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl font-['JetBrains_Mono'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
                placeholder="e.g., SN-123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                Manufacturer
              </label>
              <input
                type="text"
                {...register('manufacturer')}
                className="w-full px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
                placeholder="e.g., Siemens"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                Model
              </label>
              <input
                type="text"
                {...register('model')}
                className="w-full px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
                placeholder="e.g., XYZ-1000"
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
                placeholder="Brief description of this equipment..."
              />
            </div>
          </div>
        </div>

        {/* Location & Assignment */}
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--steel-200)] p-6">
          <h2 className="text-lg font-semibold text-[var(--steel-900)] mb-4 font-['Sora']">Location & Assignment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                Work Center
              </label>
              <select
                {...register('workCenterId')}
                className="w-full px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
              >
                <option value="">Select work center</option>
                {workCenters.map((wc) => (
                  <option key={wc.id} value={wc.id}>
                    {wc.name} ({wc.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                Category
              </label>
              <select
                {...register('categoryId')}
                className="w-full px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--steel-200)] p-6">
          <h2 className="text-lg font-semibold text-[var(--steel-900)] mb-4 font-['Sora']">Purchase & Warranty</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                Purchase Date
              </label>
              <input
                type="date"
                {...register('purchaseDate')}
                className="w-full px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                Warranty Expiry
              </label>
              <input
                type="date"
                {...register('warrantyExpiry')}
                className="w-full px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Health Status (Edit Mode Only) */}
        {isEditMode && (
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--steel-200)] p-6">
            <h2 className="text-lg font-semibold text-[var(--steel-900)] mb-4 font-['Sora']">Health Status</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                  Health Score: <span className="text-[var(--brand-accent)]">{healthScore}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={healthScore}
                  onChange={(e) => {
                    const score = parseInt(e.target.value);
                    setHealthScore(score);
                    if (score >= 70) setHealthStatus('HEALTHY');
                    else if (score >= 40) setHealthStatus('WARNING');
                    else setHealthStatus('CRITICAL');
                  }}
                  className="w-full h-2 bg-[var(--steel-200)] rounded-lg appearance-none cursor-pointer accent-[var(--brand-accent)]"
                />
                <div className="flex justify-between text-xs text-[var(--steel-500)] mt-2 font-['DM_Sans']">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                  Health Status
                </label>
                <select
                  value={healthStatus}
                  onChange={(e) => setHealthStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
                >
                  {healthStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/equipment')}
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
            {isEditMode ? 'Update Equipment' : 'Create Equipment'}
          </button>
        </div>
      </form>
    </div>
  );
}
