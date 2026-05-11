import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { motion } from 'motion/react';
import { ArrowRight, Mail, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';

export function LoginView({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false); // Used when app starts from link
  
  const hasFirebaseConfig = !!import.meta.env.VITE_FIREBASE_API_KEY;

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const actionCodeSettings = {
        url: window.location.href, // This must be registered in Firebase
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setMessage('A magic sign-in link has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send login link.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (auth && isSignInWithEmailLink(auth, window.location.href)) {
      setIsVerifying(true);
      let savedEmail = window.localStorage.getItem('emailForSignIn');
      if (!savedEmail) {
        // Fallback for if user opens the link on a different device
        savedEmail = window.prompt('Please provide your email for confirmation');
      }
      if (savedEmail) {
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then((result) => {
            window.localStorage.removeItem('emailForSignIn');
            onLoginSuccess();
          })
          .catch((err) => {
            setError(err.message || 'Error signing in with link.');
            setIsVerifying(false);
          });
      } else {
        setIsVerifying(false);
      }
    }
  }, [onLoginSuccess]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[var(--surface)]/60 backdrop-blur-md p-8 rounded-[3rem] border border-white dark:border-[var(--border)] shadow-xl flex flex-col items-center text-center"
      >
        <div className="w-16 h-16 bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-300)] rounded-full flex items-center justify-center mb-6">
          <Mail className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
        <p className="text-[var(--on-surface-variant)] mb-8 text-sm">Sign in with a magic link sent to your email. No password needed!</p>

        {!hasFirebaseConfig && (
          <div className="w-full bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 p-4 rounded-2xl mb-6 flex flex-col items-center gap-2 text-sm font-medium text-left">
            <div className="flex items-center gap-2 font-bold w-full text-center justify-center">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              Missing Firebase Configuration
            </div>
            <p className="opacity-90">Please add your Firebase config variables (VITE_FIREBASE_API_KEY, etc.) to your Environment Secrets to enable Email OTP Login.</p>
          </div>
        )}

        {isVerifying ? (
          <div className="font-bold text-[var(--color-primary-600)]">Verifying login link...</div>
        ) : (
          <form className="w-full" onSubmit={handleSendLink}>
            <div className="relative mb-6">
              <input
                type="email"
                required
                placeholder="yours@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-[var(--surface-variant)] border border-[var(--border)] rounded-2xl px-5 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-all font-medium placeholder:font-normal"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--on-surface-variant)]" />
            </div>

            {error && <div className="text-red-500 text-sm mb-4 font-medium">{error}</div>}
            {message && <div className="text-green-500 bg-green-50 dark:bg-green-500/10 dark:text-green-400 p-3 rounded-xl text-sm mb-4 font-medium">{message}</div>}

            <button 
              type="submit"
              disabled={loading || !hasFirebaseConfig}
              className="w-full bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[var(--color-primary-500)]/20 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
