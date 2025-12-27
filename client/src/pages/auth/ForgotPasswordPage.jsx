import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Mail, ArrowLeft, CheckCircle, Shield, Key } from 'lucide-react';
import api from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
              Check Your Inbox
            </h1>
            <p className="text-[var(--steel-300)] text-lg font-['DM_Sans'] leading-relaxed max-w-md">
              We've sent a secure password reset link to your email address. Follow the instructions to regain access to your account.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="w-10 h-10 bg-[var(--brand-accent)]/20 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-[var(--brand-accent)]" />
            </div>
            <div>
              <p className="text-white font-semibold font-['DM_Sans']">Secure Reset Process</p>
              <p className="text-[var(--steel-400)] text-sm font-['DM_Sans']">Link expires in 1 hour for security</p>
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
              <h2 className="text-2xl font-bold text-[var(--steel-900)] mb-3 font-['Sora']">Email Sent!</h2>
              <p className="text-[var(--steel-600)] mb-8 font-['DM_Sans'] leading-relaxed">
                If an account exists with <span className="font-semibold text-[var(--steel-800)]">{email}</span>, we've sent a password reset link to your inbox.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-[var(--brand-accent)] hover:text-[#e85a2a] font-semibold font-['DM_Sans'] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
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
            Forgot Your<br />Password?
          </h1>
          <p className="text-[var(--steel-300)] text-lg font-['DM_Sans'] leading-relaxed max-w-md">
            No worries! It happens to the best of us. Enter your email and we'll send you a secure link to reset your password.
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
                <Key className="w-7 h-7 text-[var(--steel-600)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--steel-900)] font-['Sora']">Reset Password</h2>
              <p className="text-[var(--steel-500)] mt-2 font-['DM_Sans']">
                Enter your email to receive reset instructions
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-[var(--status-danger-bg)] border border-[var(--status-danger)]/20 text-[var(--status-danger)] rounded-xl text-sm font-['DM_Sans']">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[var(--steel-700)] mb-2 font-['DM_Sans']">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--steel-400)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-[var(--steel-50)] border-2 border-transparent rounded-xl font-['DM_Sans'] focus:bg-white focus:border-[var(--brand-accent)] transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-[var(--brand-accent)] to-[#e85a2a] hover:from-[#e85a2a] hover:to-[var(--brand-accent)] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[var(--brand-accent)]/20 hover:shadow-xl hover:shadow-[var(--brand-accent)]/30 disabled:opacity-50 disabled:cursor-not-allowed font-['Sora']"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-[var(--steel-600)] hover:text-[var(--brand-accent)] font-['DM_Sans'] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
