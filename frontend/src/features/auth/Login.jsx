import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lightbulb, Mail, Lock, Eye, ShieldCheck } from 'lucide-react';
import { login } from '../../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-background text-on-surface min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center px-gutter py-section-gap relative overflow-hidden">
        {/* Abstract Brand Background Element */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent-ai/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-[480px] w-full z-10">
          {/* Brand Identity Section */}
          <div className="text-center mb-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Lightbulb className="text-white w-8 h-8" />
            </div>
            <h1 className="font-h1 text-h1 tracking-tight text-primary mb-2">Lumina Path</h1>
            <p className="font-body-md text-body-md text-text-secondary">Your agentic digital tutor for structured mastery.</p>
          </div>

          {/* Login Card */}
          <div className="bg-surface-card border border-border-subtle p-8 md:p-10 rounded-xl shadow-sm">
            <div className="mb-8">
              <h2 className="font-h2 text-h2 text-text-primary mb-1">Welcome back</h2>
              <p className="font-label-sm text-label-sm text-text-secondary">Please enter your details to access your learning roadmap.</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-error-container text-error rounded-lg text-sm">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="email">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                  <input 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md text-body-md" 
                    id="email" 
                    placeholder="name@company.com" 
                    required 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="password">Password</label>
                  <a className="font-label-sm text-label-sm text-primary hover:underline transition-colors" href="#">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                  <input 
                    className="w-full pl-10 pr-10 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md text-body-md" 
                    id="password" 
                    placeholder="••••••••" 
                    required 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors" type="button">
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <input className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary cursor-pointer" id="remember" type="checkbox"/>
                <label className="font-label-sm text-label-sm text-on-surface-variant cursor-pointer" htmlFor="remember">Stay signed in for 30 days</label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button type="submit" disabled={loading} className="block text-center w-full bg-primary text-on-primary font-h3 text-body-lg py-4 rounded-lg hover:bg-on-primary-container transition-all active:scale-[0.98] shadow-sm disabled:opacity-50">
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-border-subtle"></div>
                <span className="flex-shrink mx-4 font-label-sm text-label-sm text-outline">OR CONTINUE WITH</span>
                <div className="flex-grow border-t border-border-subtle"></div>
              </div>

              {/* SSO Options */}
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center px-4 py-2.5 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors active:scale-[0.98]" type="button">
                  <img alt="Google" className="w-5 h-5 mr-2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCE4zT26ghEJRDWt8_4Z2TFmPZJXmr1w1Uvc2HEpyGiCYA011a9c6ppMRbMhMeiafzYIJffYmMfFTa39Zi8Cm0SYhNzvGQ3ueVIAfIcv8N01cuBE3ymaZm7s5f4VxP_m-i74wyyY45e12VDYoA-B5TXOZRCvUuDMPorWbBhBilZbwVnGQNZ__GgmFts12za3QNK28v75k6VjltPy-QVoDvWZJrbdF4RUgnF3-aN9trpsCCrDkcbKv_SLme0NQKwO5Mx2-RHuj_qA54"/>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Google</span>
                </button>
                <button className="flex items-center justify-center px-4 py-2.5 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors active:scale-[0.98]" type="button">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-bold border border-current rounded px-1 mr-2 text-xs">SSO</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">SSO</span>
                </button>
              </div>
            </form>
          </div>

          {/* Sign Up Footer */}
          <div className="mt-8 text-center">
            <p className="font-body-md text-body-md text-text-secondary">
              New to Lumina Path? 
              <a className="text-primary font-bold hover:underline transition-colors ml-1" href="#">Create an account</a>
            </p>
          </div>
        </div>
      </main>

      {/* Visual Anchor: Contextual Image (Subtle Detail) */}
      <footer className="w-full max-w-7xl mx-auto px-gutter py-8 border-t border-border-subtle mt-auto flex flex-col md:flex-row justify-between items-center text-outline relative z-10">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <span className="font-label-sm text-label-sm">© 2024 Lumina Path AI</span>
          <span className="w-1 h-1 bg-outline rounded-full"></span>
          <a className="font-label-sm text-label-sm hover:text-primary" href="#">Privacy Policy</a>
          <span className="w-1 h-1 bg-outline rounded-full"></span>
          <a className="font-label-sm text-label-sm hover:text-primary" href="#">Terms of Service</a>
        </div>
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-label-sm text-label-sm">Academic standard encryption enabled</span>
        </div>
      </footer>

      {/* Decorative Image Side Graphic (Hidden on mobile) */}
      <div className="hidden lg:block fixed right-0 top-0 w-1/3 h-full overflow-hidden opacity-10 pointer-events-none z-0">
        <img className="w-full h-full object-cover" alt="abstract geometric pattern" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYcQL1ZOOFg30figrEd6OOa7eDufv-qWNpDmjnPRG9sbwjCEq6kfrA7RCjKS56rtKkU50dB0qWuQh-YQ3lhPlcVO_JSJDypEwPAbUhZ9rRy1yFOUQ9sdJCjih3Y3D6wz3Dlyg14KlGoa_Bqv2dFSMsRbEAhywqgowTWYKmEHwIpz3Plja5euXewJnKtBZV8Zt21H36cKSzDrt8nV_fYVudBu663FH0tfGeLB4EkhIkD_0mSBi8wt6akmPLsAd5AQy9uSuUZ5oCNSg"/>
      </div>
    </div>
  );
};

export default Login;
