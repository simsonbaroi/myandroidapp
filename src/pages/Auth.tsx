import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useLocalAuthContext } from '@/contexts/LocalAuthContext';
import { Loader2, Mail, Lock, User, Info } from 'lucide-react';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100).optional();

const Auth = () => {
  const navigate = useNavigate();
  const { user, isLoading, signIn, signUp } = useLocalAuthContext();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('admin@mch.local');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    if (isSignUp && fullName) {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        newErrors.fullName = nameResult.error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName || undefined);
        if (!error) {
          navigate('/');
        }
      } else {
        const { error } = await signIn(email, password);
        if (!error) {
          navigate('/');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-foreground uppercase tracking-wide">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSignUp ? 'Sign up to access the billing system' : 'Sign in to continue'}
            </p>
          </div>

          {/* Default credentials hint */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-foreground">Default Admin Login:</p>
                <p className="text-muted-foreground">Email: admin@mch.local</p>
                <p className="text-muted-foreground">Password: Cash1234</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setErrors(prev => ({ ...prev, fullName: '' }));
                    }}
                    placeholder="Your full name"
                    className={`w-full bg-input border ${errors.fullName ? 'border-destructive' : 'border-border'} text-foreground pl-12 pr-4 py-3 rounded-xl outline-none font-semibold transition-all focus:border-primary focus:ring-2 focus:ring-primary/20`}
                  />
                </div>
                {errors.fullName && <span className="text-xs text-destructive mt-1">{errors.fullName}</span>}
              </div>
            )}

            <div>
              <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  placeholder="you@example.com"
                  className={`w-full bg-input border ${errors.email ? 'border-destructive' : 'border-border'} text-foreground pl-12 pr-4 py-3 rounded-xl outline-none font-semibold transition-all focus:border-primary focus:ring-2 focus:ring-primary/20`}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="text-xs text-destructive mt-1">{errors.email}</span>}
            </div>

            <div>
              <label className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  placeholder="••••••••"
                  className={`w-full bg-input border ${errors.password ? 'border-destructive' : 'border-border'} text-foreground pl-12 pr-4 py-3 rounded-xl outline-none font-semibold transition-all focus:border-primary focus:ring-2 focus:ring-primary/20`}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
              </div>
              {errors.password && <span className="text-xs text-destructive mt-1">{errors.password}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground font-extrabold rounded-xl py-4 text-sm transition-all duration-200 hover:bg-primary/90 uppercase tracking-wide disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
              }}
              className="text-primary font-semibold hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        {/* Local mode badge */}
        <div className="text-center mt-4">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/20 text-accent-foreground rounded-full text-xs font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Running Locally - No Internet Required
          </span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
