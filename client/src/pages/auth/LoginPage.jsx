import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Loader2, Wrench, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');

    const result = await login(data.email, data.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMessage(result.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1a2e] relative overflow-hidden">
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#ff6b35] rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#ff6b35] rounded-full blur-[150px] opacity-10" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 bg-gradient-to-br from-[#ff6b35] to-[#e85a2a] rounded-xl flex items-center justify-center"
              style={{ boxShadow: '0 8px 24px rgba(255, 107, 53, 0.4)' }}
            >
              <Wrench className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-['Sora'] font-bold text-2xl text-white tracking-tight">
              GearGuard
            </span>
          </div>

          {/* Hero Text */}
          <div className="max-w-md">
            <h1 className="font-['Sora'] text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              Industrial-Grade
              <br />
              <span className="text-[#ff6b35]">Maintenance</span>
              <br />
              Management
            </h1>
            <p className="text-[#9ba4b4] text-lg leading-relaxed">
              Track equipment, manage teams, and ensure zero downtime with precision-engineered maintenance workflows.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-12">
            <div>
              <p className="font-['Sora'] text-3xl font-bold text-white">99.9%</p>
              <p className="text-[#6b7688] text-sm mt-1">Uptime Achieved</p>
            </div>
            <div>
              <p className="font-['Sora'] text-3xl font-bold text-white">50%</p>
              <p className="text-[#6b7688] text-sm mt-1">Faster Response</p>
            </div>
            <div>
              <p className="font-['Sora'] text-3xl font-bold text-white">24/7</p>
              <p className="text-[#6b7688] text-sm mt-1">Real-time Tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[var(--surface-ground)]">
        <div className={`w-full max-w-md animate-fade-in ${errorMessage ? 'animate-shake' : ''}`}>
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div 
              className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#ff6b35] to-[#e85a2a] rounded-xl mb-4"
              style={{ boxShadow: '0 8px 24px rgba(255, 107, 53, 0.35)' }}
            >
              <Wrench className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="font-['Sora'] font-bold text-xl text-[var(--steel-900)]">GearGuard</h2>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-['Sora'] text-2xl sm:text-3xl font-bold text-[var(--steel-900)] mb-2">
              Welcome back
            </h1>
            <p className="text-[var(--steel-500)] font-['DM_Sans']">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-[var(--border-subtle)] p-8" style={{ boxShadow: 'var(--shadow-lg)' }}>
            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] rounded-xl text-[var(--status-danger)] text-sm font-medium flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--status-danger)] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg">!</span>
                </div>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                  Email Address <span className="text-[var(--status-danger)]">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--steel-400)]" />
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    placeholder="you@company.com"
                    className={`w-full pl-12 pr-4 py-3.5 bg-[var(--steel-50)] border-2 rounded-xl text-[var(--steel-900)] font-['DM_Sans'] placeholder:text-[var(--steel-400)] focus:outline-none focus:bg-white transition-all duration-200 ${
                      errors.email 
                        ? 'border-[var(--status-danger)] bg-[var(--status-danger-bg)] focus:ring-2 focus:ring-[var(--status-danger-bg)]' 
                        : 'border-transparent focus:border-[var(--brand-accent)] focus:ring-2 focus:ring-[var(--brand-accent-muted)]'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-[var(--status-danger)] font-['DM_Sans']">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                  Password <span className="text-[var(--status-danger)]">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--steel-400)]" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Enter your password"
                    className={`w-full pl-12 pr-14 py-3.5 bg-[var(--steel-50)] border-2 rounded-xl text-[var(--steel-900)] font-['DM_Sans'] placeholder:text-[var(--steel-400)] focus:outline-none focus:bg-white transition-all duration-200 ${
                      errors.password 
                        ? 'border-[var(--status-danger)] bg-[var(--status-danger-bg)] focus:ring-2 focus:ring-[var(--status-danger-bg)]' 
                        : 'border-transparent focus:border-[var(--brand-accent)] focus:ring-2 focus:ring-[var(--brand-accent-muted)]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--steel-400)] hover:text-[var(--steel-600)] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-[var(--status-danger)] font-['DM_Sans']">{errors.password.message}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-[var(--brand-accent)] hover:text-[var(--brand-accent-hover)] font-medium font-['DM_Sans'] transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full bg-gradient-to-r from-[#ff6b35] to-[#e85a2a] hover:from-[#ff8c5a] hover:to-[#ff6b35] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-['DM_Sans'] text-base"
                style={{ boxShadow: '0 4px 14px rgba(255, 107, 53, 0.4)' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-[var(--steel-500)] mt-8 font-['DM_Sans']">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-[var(--brand-accent)] hover:text-[var(--brand-accent-hover)] font-semibold transition-colors"
            >
              Create Account
            </Link>
          </p>

          {/* Footer */}
          <p className="text-center text-sm text-[var(--steel-400)] mt-8 font-['DM_Sans']">
            © {new Date().getFullYear()} GearGuard. Industrial Precision.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
