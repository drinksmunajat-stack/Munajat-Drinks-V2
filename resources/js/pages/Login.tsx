import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import {
  Coffee, Lock, Mail, Eye, EyeOff, ArrowRight,
  ShieldCheck, CheckCircle2, AlertCircle, Sparkles, UserPlus,
  ArrowLeft, KeyRound, Check
} from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Sign In | Munajat Drinks";
  }, []);
  const [email, setEmail] = useState('admin@munajatdrinks.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'kasir' | 'owner'>('admin');

  const DEMO_ACCOUNTS = [
    { role: 'admin' as const, label: 'Super Admin', email: 'admin@munajatdrinks.com', desc: 'Full System Management Access' },
    { role: 'kasir' as const, label: 'Barista / Cashier', email: 'kasir@munajatdrinks.com', desc: 'POS & Transaction Engine' },
    { role: 'owner' as const, label: 'Owner / Manager', email: 'owner@munajatdrinks.com', desc: 'Financial Reports & Analytics' },
  ];

  const handleSelectDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setSelectedRole(acc.role);
    setEmail(acc.email);
    setPassword('password123');
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter your email address and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Authentication Successful! Redirecting to Admin Portal...');

      setTimeout(() => {
        setLocation('/admin');
      }, 700);
    }, 900);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      backgroundImage: `
        radial-gradient(circle at 10% 15%, rgba(16, 185, 129, 0.07) 0%, transparent 45%),
        radial-gradient(circle at 90% 85%, rgba(6, 182, 212, 0.07) 0%, transparent 45%),
        radial-gradient(circle at 50% 50%, rgba(248, 250, 252, 0.8) 0%, #ffffff 100%)
      `,
      color: '#0f172a',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '24px'
    }}>

      {/* Ambient Decorative Blobs */}
      <div style={{
        position: 'absolute',
        top: '-120px',
        left: '-100px',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.03) 70%, transparent 100%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-140px',
        right: '-100px',
        width: '550px',
        height: '550px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, rgba(16,185,129,0.03) 70%, transparent 100%)',
        filter: 'blur(70px)',
        pointerEvents: 'none',
      }} />

      {/* Top Floating Navigation Back to Voice Cashier */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '28px',
        zIndex: 20,
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 16px',
            borderRadius: '100px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            color: '#475569',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.06)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.03)';
          }}
          >
            <ArrowLeft size={15} color="#10b981" />
            <span>Back to AI Voice Cashier</span>
          </div>
        </Link>
      </div>

      {/* Main Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        position: 'relative',
        zIndex: 10,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '28px',
        boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.6)',
        padding: '40px 36px',
        transition: 'all 0.3s ease'
      }}>

        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <img
              src="/Logo Munajat Mocha.png"
              alt="Munajat Drinks Logo"
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                objectFit: 'contain',
                background: '#ffffff',
                padding: '4px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 24px rgba(16, 185, 129, 0.25)',
                marginBottom: '16px',
                cursor: 'pointer',
                transition: 'transform 0.25s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06) rotate(3deg)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1) rotate(0deg)')}
            />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '3px 10px', borderRadius: '100px' }}>
              Management Portal
            </span>
          </div>

          <h1 style={{
            fontSize: '26px',
            fontWeight: 800,
            margin: '6px 0 6px 0',
            letterSpacing: '-0.6px',
            color: '#0f172a',
            fontFamily: "'Outfit', sans-serif"
          }}>
            Munajat Drinks
          </h1>
          <p style={{
            fontSize: '13.5px',
            color: '#64748b',
            margin: 0,
            lineHeight: 1.5
          }}>
            Sign in to manage orders, drink stock, branch outlets, & AI Cashier
          </p>
        </div>

        {/* Quick Demo Role Selector */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <KeyRound size={12} color="#10b981" />
            Quick Demo Login:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleSelectDemo(acc)}
                style={{
                  padding: '8px 4px',
                  borderRadius: '10px',
                  border: selectedRole === acc.role ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                  backgroundColor: selectedRole === acc.role ? 'rgba(16, 185, 129, 0.08)' : '#f8fafc',
                  color: selectedRole === acc.role ? '#047857' : '#64748b',
                  fontSize: '11.5px',
                  fontWeight: selectedRole === acc.role ? 700 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  textAlign: 'center',
                }}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alert Messages */}
        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '13px',
            marginBottom: '18px',
            animation: 'fadeIn 0.25s ease'
          }}>
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '12px',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#047857',
            fontSize: '13px',
            marginBottom: '18px',
            animation: 'fadeIn 0.25s ease'
          }}>
            <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Email Input */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 700,
              color: '#334155',
              marginBottom: '7px'
            }}>
              Email Address
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '14px',
              padding: '0 14px',
              transition: 'all 0.2s ease',
            }}>
              <Mail size={18} color="#94a3b8" style={{ marginRight: '10px', flexShrink: 0 }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@munajatdrinks.com"
                style={{
                  width: '100%',
                  padding: '13px 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#0f172a',
                  fontSize: '13.5px',
                  fontWeight: 500,
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
              <label style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#334155',
              }}>
                Password
              </label>
              <span
                onClick={() => alert('For demo purposes, please use the default password: password123')}
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#10b981',
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
              >
                Forgot password?
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '14px',
              padding: '0 14px',
              transition: 'all 0.2s ease',
            }}>
              <Lock size={18} color="#94a3b8" style={{ marginRight: '10px', flexShrink: 0 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '13px 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#0f172a',
                  fontSize: '13.5px',
                  fontWeight: 500,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.18s ease'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 800,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.75 : 1,
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.32)',
              marginTop: '6px',
              transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={e => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(16, 185, 129, 0.4)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.32)';
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '2.5px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span>Processing Sign In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div style={{
          textAlign: 'center',
          marginTop: '26px',
          paddingTop: '20px',
          borderTop: '1px solid #f1f5f9',
          fontSize: '13px',
          color: '#64748b'
        }}>
          Don't have a staff account yet?{' '}
          <Link href="/register" style={{
            color: '#10b981',
            fontWeight: 700,
            textDecoration: 'none',
            marginLeft: '4px',
            transition: 'color 0.18s ease'
          }}>
            Register New Account
          </Link>
        </div>

        {/* Security Badge Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '20px',
          fontSize: '11.5px',
          fontWeight: 600,
          color: '#94a3b8'
        }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>Encrypted System & Integrated MySQL Cloud Database</span>
        </div>

      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}
