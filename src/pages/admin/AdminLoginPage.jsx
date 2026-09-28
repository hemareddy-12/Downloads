import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  KeyRound, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBrand } from '../../context/BrandContext';
import { apiGet } from '../../services/apiClient';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { adminLogin, adminSetup, isAdmin } = useAuth();
  const { brandSettings } = useBrand();

  const brandName = brandSettings?.brandName || 'hemareddy';
  const logoUrl = brandSettings?.logoUrl;

  const [mode, setMode] = useState('signin'); // 'signin' | 'setup'
  const [setupStatus, setSetupStatus] = useState({ initialSetupCompleted: null, adminEmail: 'labelhemareddy@gmail.com' });
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Form states
  const [email, setEmail] = useState('labelhemareddy@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  // Check setup status on mount
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        const data = await apiGet('/api/admin/setup-status');
        if (isMounted && data) {
          setSetupStatus(data);
          if (data.adminEmail) {
            setEmail(data.adminEmail);
          }
          // If permanent setup has not been performed yet, automatically focus on setup tab
          if (data.initialSetupCompleted === false) {
            setMode('setup');
          } else {
            setMode('signin');
          }
        }
      } catch (err) {
        console.warn('Unable to query setup-status:', err);
      } finally {
        if (isMounted) setCheckingStatus(false);
      }
    };
    checkStatus();
    return () => { isMounted = false; };
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      await adminLogin(email.trim().toLowerCase(), password);
      navigate('/admin');
    } catch (err) {
      console.error('Sign-in error:', err);
      setError(err.message || 'Invalid administrator credentials. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please provide the owner email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Please choose a secure permanent password of at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-type your chosen password accurately.');
      return;
    }

    try {
      setLoading(true);
      const res = await adminSetup(cleanEmail, password);
      setSuccessMsg('Permanent credentials saved! Logging you in...');
      setTimeout(() => {
        navigate('/admin');
      }, 600);
    } catch (err) {
      console.error('Setup error:', err);
      setError(err.message || 'Failed to save permanent password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md bg-charcoal-900 border border-charcoal-800 rounded-sm p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Brand Logo in Login */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block group">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={brandName}
                className="h-16 w-auto object-contain mx-auto brightness-110 mb-1"
              />
            ) : (
              <div className="font-serif text-3xl font-normal text-gold-200 tracking-widest-luxury uppercase">
                {brandName}
              </div>
            )}
          </Link>
          <div className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest text-gold-500 font-semibold">
            <ShieldCheck className="w-4 h-4 text-gold-400" />
            <span>Owner & Admin Portal</span>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-charcoal-950 border border-charcoal-800 rounded-sm text-xs">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}
            className={`py-2 px-3 rounded-xs font-semibold uppercase tracking-wider transition ${
              mode === 'signin'
                ? 'bg-charcoal-800 text-gold-300 shadow-sm'
                : 'text-charcoal-400 hover:text-gold-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('setup'); setError(''); setSuccessMsg(''); }}
            className={`py-2 px-3 rounded-xs font-semibold uppercase tracking-wider transition flex items-center justify-center gap-1.5 ${
              mode === 'setup'
                ? 'bg-charcoal-800 text-gold-300 shadow-sm'
                : 'text-charcoal-400 hover:text-gold-200'
            }`}
          >
            <span>Set Password</span>
            {setupStatus.initialSetupCompleted === false && (
              <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Informative notification if setup is needed */}
        {setupStatus.initialSetupCompleted === false && mode === 'setup' && (
          <div className="p-3 bg-gold-950/40 border border-gold-700/50 rounded-sm text-gold-300 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Initial Admin Setup</span>
              <span className="text-gold-200/80 text-[11px]">
                Enter your secret password below once. It will be encrypted permanently with 128-bit security for all your future logins.
              </span>
            </div>
          </div>
        )}

        {/* Alert Messages */}
        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-sm">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="block uppercase tracking-wider text-charcoal-300 font-semibold mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="labelhemareddy@gmail.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-charcoal-950 border border-charcoal-700 text-gold-100 rounded-sm focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-charcoal-300 font-semibold mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your permanent password"
                  className="w-full pl-9 pr-10 py-2.5 bg-charcoal-950 border border-charcoal-700 text-gold-100 rounded-sm focus:outline-none focus:border-gold-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-gold-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-600 hover:bg-gold-500 text-charcoal-950 py-3 px-4 rounded-sm uppercase tracking-widest font-semibold transition shadow-luxury flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In as Owner'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {setupStatus.initialSetupCompleted === false && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('setup'); setError(''); }}
                  className="text-gold-400 hover:text-gold-300 text-xs underline underline-offset-4"
                >
                  First time? Set your permanent password here →
                </button>
              </div>
            )}
          </form>
        )}

        {/* INITIAL SETUP FORM */}
        {mode === 'setup' && (
          <>
            {setupStatus.initialSetupCompleted === true ? (
              <div className="space-y-4 text-xs text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gold-200 uppercase tracking-wider text-sm">
                    Permanent Credentials Configured
                  </h4>
                  <p className="text-charcoal-400 mt-1 text-xs">
                    Initial setup for <strong className="text-gold-300">{setupStatus.adminEmail}</strong> is already complete and permanently secured.
                  </p>
                </div>
                <div className="p-3 bg-charcoal-950 border border-charcoal-800 rounded-sm text-charcoal-300 text-left text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 text-gold-400 font-semibold">
                    <Info className="w-3.5 h-3.5" />
                    <span>How to log in:</span>
                  </div>
                  <p>Switch to the <strong>Sign In</strong> tab and enter your email and password.</p>
                  <p className="text-charcoal-400">To change your password in the future, sign in and use the Change Password option in Settings.</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(''); }}
                  className="w-full bg-gold-600 hover:bg-gold-500 text-charcoal-950 py-3 px-4 rounded-sm uppercase tracking-widest font-semibold transition shadow-luxury flex items-center justify-center gap-2"
                >
                  <span>Go to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSetup} className="space-y-4 text-xs">
                <div>
                  <label className="block uppercase tracking-wider text-charcoal-300 font-semibold mb-1">
                    Owner Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-charcoal-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="labelhemareddy@gmail.com"
                      className="w-full pl-9 pr-4 py-2.5 bg-charcoal-950 border border-charcoal-700 text-gold-100 rounded-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-charcoal-300 font-semibold mb-1">
                    Set Permanent Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-charcoal-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-10 py-2.5 bg-charcoal-950 border border-charcoal-700 text-gold-100 rounded-sm focus:outline-none focus:border-gold-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-gold-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block uppercase tracking-wider text-charcoal-300 font-semibold mb-1">
                    Confirm Permanent Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-charcoal-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type your password"
                      className="w-full pl-9 pr-10 py-2.5 bg-charcoal-950 border border-charcoal-700 text-gold-100 rounded-sm focus:outline-none focus:border-gold-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-gold-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold-600 hover:bg-gold-500 text-charcoal-950 py-3 px-4 rounded-sm uppercase tracking-widest font-semibold transition shadow-luxury flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Saving Permanent Password...' : 'Save Password & Enter Admin'}</span>
                </button>
              </form>
            )}
          </>
        )}

        <div className="text-center pt-2 border-t border-charcoal-800/60">
          <Link to="/" className="text-xs text-charcoal-400 hover:text-gold-300 transition inline-flex items-center gap-1">
            <span>← Return to Public Customer Website</span>
          </Link>
        </div>

      </div>

    </div>
  );
};
