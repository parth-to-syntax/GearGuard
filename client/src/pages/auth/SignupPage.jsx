import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Loader2, User, Wrench, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Validation schema matching design.json requirements
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be more than 8 characters')
    .regex(/[a-z]/, 'Must contain a small case letter')
    .regex(/[A-Z]/, 'Must contain a large case letter')
    .regex(/[^a-zA-Z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password', '');

  // Password strength indicator based on design.json requirements
  const passwordStrength = useMemo(() => {
    const checks = {
      length: password.length > 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    
    let strength = 'weak';
    let color = 'bg-[var(--status-danger)]';
    let width = '25%';
    
    if (passedChecks === 4) {
      strength = 'strong';
      color = 'bg-[var(--status-success)]';
      width = '100%';
    } else if (passedChecks >= 2) {
      strength = 'medium';
      color = 'bg-[var(--status-warning)]';
      width = '50%';
    }

    return { checks, strength, color, width };
  }, [password]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');

    const result = await signup({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMessage(result.message);
    }

    setIsLoading(false);
  };

  const PasswordRequirement = ({ met, text }) => (
    <div className={`flex items-center gap-2 text-sm font-['DM_Sans'] ${met ? 'text-[var(--status-success)]' : 'text-[var(--steel-400)]'}`}>
      {met ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {text}
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1a1d23] via-[#252931] to-[#1a1d23] relative overflow-hidden">
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
        
        {/* Gradient orb */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-[var(--brand-accent)] rounded-full blur-[120px] opacity-20" />
        
        <div className="relative z-10 flex flex-col justify-center p-16">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ff6b35] to-[#e85a2a] rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-2xl font-bold font-['Sora'] tracking-tight">GearGuard</span>
          </div>
          
          {/* Tagline */}
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 font-['Sora']">
            Join the Future of<br />
            <span className="text-[var(--brand-accent)]">Maintenance</span>
          </h1>
          <p className="text-[var(--steel-400)] text-lg max-w-md font-['DM_Sans']">
            Create your account and start optimizing your equipment maintenance workflow today.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--steel-50)]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ff6b35] to-[#e85a2a] rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <span className="text-[var(--steel-900)] text-2xl font-bold font-['Sora'] tracking-tight">GearGuard</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">Create Account</h2>
            <p className="text-[var(--steel-500)] mt-2 font-['DM_Sans']">Sign up to get started with GearGuard</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl p-8 border border-[var(--border-subtle)]" style={{ boxShadow: 'var(--shadow-lg)' }}>
            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-[var(--status-danger-bg)] border border-[var(--status-danger)]/20 rounded-xl text-[var(--status-danger)] text-sm font-['DM_Sans']">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                  Name <span className="text-[var(--status-danger)]">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--steel-400)]" />
                  <input
                    {...register('name')}
                    type="text"
                    id="name"
                    placeholder="Enter your full name"
                    className={`w-full pl-12 pr-4 py-3 bg-[var(--steel-50)] border-2 rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all ${
                      errors.name ? 'border-[var(--status-danger)] bg-[var(--status-danger-bg)]' : 'border-transparent'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-[var(--status-danger)] font-['DM_Sans']">{errors.name.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                  Email <span className="text-[var(--status-danger)]">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--steel-400)]" />
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    className={`w-full pl-12 pr-4 py-3 bg-[var(--steel-50)] border-2 rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all ${
                      errors.email ? 'border-[var(--status-danger)] bg-[var(--status-danger-bg)]' : 'border-transparent'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-[var(--status-danger)] font-['DM_Sans']">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                  Password <span className="text-[var(--status-danger)]">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--steel-400)]" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Create a strong password"
                    className={`w-full pl-12 pr-12 py-3 bg-[var(--steel-50)] border-2 rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all ${
                      errors.password ? 'border-[var(--status-danger)] bg-[var(--status-danger-bg)]' : 'border-transparent'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--steel-400)] hover:text-[var(--steel-600)]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength Bar */}
                {password && (
                  <div className="mt-3">
                    <div className="h-1.5 w-full bg-[var(--steel-200)] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.strength === 'strong' ? 'bg-[var(--status-success)]' :
                          passwordStrength.strength === 'medium' ? 'bg-[var(--status-warning)]' : 'bg-[var(--status-danger)]'
                        }`}
                        style={{ width: passwordStrength.width }}
                      />
                    </div>
                    <p className={`text-xs mt-1.5 capitalize font-['DM_Sans'] ${
                      passwordStrength.strength === 'strong' ? 'text-[var(--status-success)]' :
                      passwordStrength.strength === 'medium' ? 'text-[var(--status-warning)]' : 'text-[var(--status-danger)]'
                    }`}>
                      Password strength: {passwordStrength.strength}
                    </p>
                  </div>
                )}

                {/* Password Requirements - matching design.json */}
                {password && (
                  <div className="mt-3 p-4 bg-[var(--steel-50)] rounded-xl space-y-2">
                    <PasswordRequirement met={passwordStrength.checks.length} text="More than 8 characters" />
                    <PasswordRequirement met={passwordStrength.checks.lowercase} text="Contains a small case letter" />
                    <PasswordRequirement met={passwordStrength.checks.uppercase} text="Contains a large case letter" />
                    <PasswordRequirement met={passwordStrength.checks.special} text="Contains a special character" />
                  </div>
                )}
                
                {errors.password && (
                  <p className="mt-2 text-sm text-[var(--status-danger)] font-['DM_Sans']">{errors.password.message}</p>
                )}
              </div>

            {/* Re-Enter Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                Re-Enter password <span className="text-[var(--status-danger)]">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--steel-400)]" />
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="Re-enter your password"
                  className={`w-full pl-12 pr-12 py-3 bg-[var(--steel-50)] border-2 rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all ${
                    errors.confirmPassword ? 'border-[var(--status-danger)] bg-[var(--status-danger-bg)]' : 'border-transparent'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--steel-400)] hover:text-[var(--steel-600)]"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-[var(--status-danger)] font-['DM_Sans']">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 bg-gradient-to-r from-[var(--brand-accent)] to-[#e85a2a] hover:from-[#e85a2a] hover:to-[var(--brand-accent)] text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-[var(--brand-accent)]/20 hover:shadow-xl hover:shadow-[var(--brand-accent)]/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-['Sora']"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Sign In Link */}
            <div className="text-center pt-4">
              <span className="text-sm text-[var(--steel-500)] font-['DM_Sans']">Already have an account? </span>
              <Link
                to="/login"
                className="text-sm text-[var(--brand-accent)] hover:text-[#e85a2a] font-semibold font-['DM_Sans'] transition-colors"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
