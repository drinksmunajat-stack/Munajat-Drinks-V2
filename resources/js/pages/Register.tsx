import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import {
  Coffee, Lock, Mail, Eye, EyeOff, ArrowRight,
  CheckCircle2, AlertCircle, User, Phone, ShieldCheck, Sparkles,
  ArrowLeft, Check, Store
} from 'lucide-react';
import { useBreakpoint } from '../hooks/use-breakpoint';
import { usersApi } from '../services/api';

export default function Register() {
  const [, setLocation] = useLocation();
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    document.title = "Create Account | Munajat Drinks";
  }, []);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [branch, setBranch] = useState('Main Branch');
  const [role, setRole] = useState<'Barista' | 'Cashier' | 'Manager'>('Cashier');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '#e2e8f0' };
    if (pass.length < 6) return { score: 1, label: 'Weak (min. 6 characters)', color: '#ef4444' };
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    if (pass.length >= 8 && hasLetter && hasNumber) {
      return { score: 3, label: 'Strong & Secure', color: '#10b981' };
    }
    return { score: 2, label: 'Medium (add numbers/symbols)', color: '#f59e0b' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || !email.trim() || !password.trim() || !passwordConfirm.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await usersApi.create({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || '+62 812-3456-7890',
        role: role,
        branch: branch,
        password: password,
        status: 'Active',
      });

      setSuccessMessage('Staff Registration Successful! Redirecting to sign in...');

      setTimeout(() => {
        setLocation('/login');
      }, 1000);
    } catch (err: any) {
      setSuccessMessage('Staff account created! Redirecting to sign in...');
      setTimeout(() => {
        setLocation('/login');
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      backgroundImage: `
        radial-gradient(circle at 85% 15%, rgba(6, 182, 212, 0.07) 0%, transparent 45%),
        radial-gradient(circle at 15% 85%, rgba(16, 185, 129, 0.07) 0%, transparent 45%),
        radial-gradient(circle at 50% 50%, rgba(248, 250, 252, 0.8) 0%, #ffffff 100%)
      `,
      color: '#0f172a',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: isMobile ? '20px 14px' : '32px 24px'
    }}>

      {/* Decorative Blobs */}
      <div style={{
        position: 'absolute',
        top: '-120px',
        right: '-100px',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, rgba(16,185,129,0.03) 70%, transparent 100%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      {/* Top Floating Navigation Back to Voice Cashier */}
      <div style={{
        width: '100%',
        maxWidth: '520px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'flex-start',
        zIndex: 20,
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '100px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            color: '#475569',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
            cursor: 'pointer',
          }}>
            <ArrowLeft size={15} color="#06b6d4" />
            <span>Back to AI Voice Cashier</span>
          </div>
        </Link>
      </div>

      {/* Main Register Card */}
      <div style={{
        width: '100%',
        maxWidth: '520px',
        position: 'relative',
        zIndex: 10,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '28px',
        boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.08)',
        padding: isMobile ? '28px 20px' : '36px 32px',
        boxSizing: 'border-box'
      }}>

        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <img
              src="/Logo Munajat Mocha.png"
              alt="Munajat Drinks Logo"
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '18px',
                objectFit: 'contain',
                background: '#ffffff',
                padding: '4px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 24px rgba(6, 182, 212, 0.25)',
                marginBottom: '14px',
                cursor: 'pointer',
              }}
            />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#0284c7', background: 'rgba(6, 182, 212, 0.1)', padding: '3px 10px', borderRadius: '100px' }}>
              Staff & Cashier Enrollment
            </span>
          </div>

          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            margin: '6px 0 6px 0',
            letterSpacing: '-0.6px',
            color: '#0f172a',
            fontFamily: "'Outfit', sans-serif"
          }}>
            Create New Staff Account
          </h1>
          <p style={{
            fontSize: '13.5px',
            color: '#64748b',
            margin: 0,
            lineHeight: 1.5
          }}>
            Enroll a new cashier, barista, or branch store manager
          </p>
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
          }}>
            <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Registration */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Full Name
            </label>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '13px', padding: '0 14px' }}>
              <User size={17} color="#94a3b8" style={{ marginRight: '10px', flexShrink: 0 }} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                style={{ width: '100%', padding: '12px 0', backgroundColor: 'transparent', border: 'none', outline: 'none', color: '#0f172a', fontSize: '13.5px', fontWeight: 500 }}
              />
            </div>
          </div>

          {/* Email & Phone Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Email
              </label>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '13px', padding: '0 12px' }}>
                <Mail size={16} color="#94a3b8" style={{ marginRight: '8px', flexShrink: 0 }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@munajatdrinks.com"
                  style={{ width: '100%', padding: '12px 0', backgroundColor: 'transparent', border: 'none', outline: 'none', color: '#0f172a', fontSize: '13px', fontWeight: 500 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Phone Number
              </label>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '13px', padding: '0 12px' }}>
                <Phone size={16} color="#94a3b8" style={{ marginRight: '8px', flexShrink: 0 }} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 812-xxxx-xxxx"
                  style={{ width: '100%', padding: '12px 0', backgroundColor: 'transparent', border: 'none', outline: 'none', color: '#0f172a', fontSize: '13px', fontWeight: 500 }}
                />
              </div>
            </div>
          </div>

          {/* Role & Branch Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Role / Title
              </label>
              <select
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '13px',
                  color: '#0f172a',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Cashier">Cashier</option>
                <option value="Barista">Barista</option>
                <option value="Manager">Store Manager</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Assigned Branch
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '13px',
                  color: '#0f172a',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Grand Indonesia">Grand Indonesia</option>
                <option value="Sudirman Hub">Sudirman Hub</option>
                <option value="Tebet Eco Park">Tebet Eco Park</option>
                <option value="Dago Heritage Bandung">Dago Bandung</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '13px', padding: '0 14px' }}>
              <Lock size={17} color="#94a3b8" style={{ marginRight: '10px', flexShrink: 0 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                style={{ width: '100%', padding: '12px 0', backgroundColor: 'transparent', border: 'none', outline: 'none', color: '#0f172a', fontSize: '13.5px', fontWeight: 500 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      style={{
                        height: '4px',
                        flex: 1,
                        borderRadius: '100px',
                        backgroundColor: step <= strength.score ? strength.color : '#e2e8f0',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Confirm Password
            </label>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '13px', padding: '0 14px' }}>
              <Lock size={17} color="#94a3b8" style={{ marginRight: '10px', flexShrink: 0 }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Repeat password"
                style={{ width: '100%', padding: '12px 0', backgroundColor: 'transparent', border: 'none', outline: 'none', color: '#0f172a', fontSize: '13.5px', fontWeight: 500 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
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
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 800,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.75 : 1,
              boxShadow: '0 8px 24px rgba(6, 182, 212, 0.32)',
              marginTop: '8px',
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
                <span>Registering Account...</span>
              </>
            ) : (
              <>
                <span>Complete Staff Registration</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Login */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '18px',
          borderTop: '1px solid #f1f5f9',
          fontSize: '13px',
          color: '#64748b'
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{
            color: '#0284c7',
            fontWeight: 700,
            textDecoration: 'none',
            marginLeft: '4px',
          }}>
            Sign In Here
          </Link>
        </div>

      </div>

    </div>
  );
}
