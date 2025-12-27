import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Wrench, Lock, Eye, EyeOff, CheckCircle, AlertTriangle, Shield, Check, X } from 'lucide-react';
import api from '../../lib/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Password validation
  const passwordChecks = {
    length: password.length >= 9,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }) => (
    <div className={`flex items-center gap-2 text-sm font-['DM_Sans'] ${met ? 'text-[var(--status-success)]' : 'text-[var(--steel-400)]'}`}>
      {met ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {text}
    </div>
  );

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--steel-100)] flex">
        {/* Left Brand Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--steel-900)] via-[var(--steel-800)] to-[var(--steel-900)] p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-64 h-64 border border-white rounded-full"></div>
            <div className="absolute bottom-40 right-10 w-96 h-96 border border-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--brand-accent)] to-[#e85a2a] rounded-xl flex items-center justify-center shadow-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-2xl text-white font-['Sora']">GearGuard</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-6 font-['Sora'] leading-tight">
              Password<br />Updated!
            </h1>
            <p className="text-[var(--steel-300)] text-lg font-['DM_Sans'] leading-relaxed max-w-md">
              Your password has been successfully reset. You can now access your account with your new credentials.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="w-10 h-10 bg-[var(--status-success)]/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-[var(--status-success)]" />
            </div>
            <div>
              <p className="text-white font-semibold font-['DM_Sans']">Account Secured</p>
              <p className="text-[var(--steel-400)] text-sm font-['DM_Sans']">Your password is now updated</p>
            </div>
          </div>
        </div>

        {/* Right Success Panel */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl shadow-[var(--steel-200)]/50 p-8 text-center">
              <div className="w-20 h-20 bg-[var(--status-success-bg)] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-[var(--status-success)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--steel-900)] mb-3 font-['Sora']">Password Reset Complete!</h2>
              <p className="text-[var(--steel-600)] mb-8 font-['DM_Sans'] leading-relaxed">
                Your password has been updated successfully. You can now log in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-[var(--brand-accent)] to-[#e85a2a] hover:from-[#e85a2a] hover:to-[var(--brand-accent)] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[var(--brand-accent)]/20 hover:shadow-xl hover:shadow-[var(--brand-accent)]/30 font-['Sora']"
              >
                Continue to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--steel-100)] flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--steel-900)] via-[var(--steel-800)] to-[var(--steel-900)] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 border border-white rounded-full"></div>
          <div className="absolute bottom-40 right-10 w-96 h-96 border border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 border border-white rounded-full"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--brand-accent)] to-[#e85a2a] rounded-xl flex items-center justify-center shadow-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-white font-['Sora']">GearGuard</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-6 font-['Sora'] leading-tight">
            Create Your<br />New Password
          </h1>
          <p className="text-[var(--steel-300)] text-lg font-['DM_Sans'] leading-relaxed max-w-md">
            Choose a strong, unique password to keep your account secure. Your new password must meet all security requirements.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="w-10 h-10 bg-[var(--brand-accent)]/20 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-[var(--brand-accent)]" />
          </div>
          <div>
            <p className="text-white font-semibold font-['DM_Sans']">Enterprise Security</p>
            <p className="text-[var(--steel-400)] text-sm font-['DM_Sans']">Bank-level encryption for all data</p>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--brand-accent)] to-[#e85a2a] rounded-xl flex items-center justify-center shadow-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-[var(--steel-900)] font-['Sora']">GearGuard</span>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-[var(--steel-200)]/50 p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-[var(--steel-100)] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-[var(--steel-600)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">Set New Password</h2>
              <p className="text-[var(--steel-500)] mt-2 font-['DM_Sans']">
                Must be at least 9 characters
              </p>
            </div>

            {!token ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-[var(--status-danger-bg)] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10 text-[var(--status-danger)]" />
                </div>
                <p className="text-[var(--steel-600)] mb-6 font-['DM_Sans']">{error}</p>
                <Link
                  to="/forgot-password"
                  className="text-[var(--brand-accent)] hover:text-[#e85a2a] font-semibold font-['DM_Sans'] transition-colors"
                >
                  Request new reset link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-[var(--status-danger-bg)] border border-[var(--status-danger)]/20 text-[var(--status-danger)] rounded-xl text-sm font-['DM_Sans']">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--steel-400)]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--steel-400)] hover:text-[var(--steel-600)]"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Password requirements */}
                {password && (
                  <div className="p-4 bg-[var(--steel-50)] rounded-xl space-y-2">
                    <PasswordRequirement met={passwordChecks.length} text="At least 9 characters" />
                    <PasswordRequirement met={passwordChecks.lowercase} text="One lowercase letter" />
                    <PasswordRequirement met={passwordChecks.uppercase} text="One uppercase letter" />
                    <PasswordRequirement met={passwordChecks.special} text="One special character" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--steel-400)]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 bg-[var(--steel-50)] border-2 rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all ${
                        confirmPassword && !passwordsMatch ? 'border-[var(--status-danger)] bg-[var(--status-danger-bg)]' : 'border-transparent'
                      }`}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-sm text-[var(--status-danger)] mt-2 font-['DM_Sans']">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !isPasswordValid || !passwordsMatch}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-[var(--brand-accent)] to-[#e85a2a] hover:from-[#e85a2a] hover:to-[var(--brand-accent)] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[var(--brand-accent)]/20 hover:shadow-xl hover:shadow-[var(--brand-accent)]/30 disabled:opacity-50 disabled:cursor-not-allowed font-['Sora']"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
