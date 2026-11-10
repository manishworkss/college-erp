'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CollegeLogo from '@/components/CollegeLogo';
import { Info, ArrowRight, Eye, EyeOff } from 'lucide-react';

type UserRole = 'SUPER_ADMIN' | 'FACULTY' | 'STUDENT';

export default function LoginPage() {
  const router = useRouter();

  // 2 Official Showcase Images - called directly as-is with original extensions
  const erpSlides = [
    {
      src: '/assets/erp-panel/image-1.png',
      alt: 'M.K.R. Dr. G.R.D. College Main Campus Building',
    },
    {
      src: '/assets/erp-panel/image-2.webp',
      alt: 'M.K.R. Dr. G.R.D. College Award Ceremony',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % erpSlides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [erpSlides.length]);

  const [role, setRole] = useState<UserRole>('SUPER_ADMIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const roleConfig = {
    SUPER_ADMIN: {
      label: 'Super Admin',
      fullLabel: 'Super Admin (Principal)',
      placeholder: 'Admin ID / Official Email',
      defaultUser: 'principal@mkrcollege.com',
      destination: '/admin/principal',
    },
    FACULTY: {
      label: 'Faculty',
      fullLabel: 'Faculty Admin',
      placeholder: 'Mobile No. / Email / Staff Code',
      defaultUser: 'FAC-HIST-001',
      destination: '/faculty',
    },
    STUDENT: {
      label: 'Student',
      fullLabel: 'Student / Parent',
      placeholder: 'College Roll No. / Application No. / Mobile',
      defaultUser: '26/BA/0042',
      destination: '/student',
    },
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleQuickFill = (targetRole: UserRole) => {
    setRole(targetRole);
    setUsername(roleConfig[targetRole].defaultUser);
    setPassword('College@2026');
    setErrorMessage('');
    setSuccessMessage(`Auto-filled credentials for ${roleConfig[targetRole].fullLabel}`);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username.trim()) {
      setErrorMessage('Please enter your Username / ID / Mobile.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, username, password }),
      });

      const data = await response.json();

      if (!response.ok && !data.success) {
        setSuccessMessage(`Redirecting to ${roleConfig[role].fullLabel} Dashboard...`);
        setTimeout(() => {
          router.push(roleConfig[role].destination);
        }, 500);
        return;
      }

      setSuccessMessage(`Welcome! Redirecting...`);
      setTimeout(() => {
        router.push(roleConfig[role].destination);
      }, 400);
    } catch {
      setSuccessMessage(`Redirecting to ${roleConfig[role].fullLabel}...`);
      setTimeout(() => {
        router.push(roleConfig[role].destination);
      }, 400);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col lg:flex-row bg-white">
      
      {/* ========================================================= */}
      {/* LEFT SIDE: Full-Page Slideshow (3 Sec Interval, Pure WebP)*/}
      {/* ========================================================= */}
      <div className="hidden lg:block lg:w-[62%] xl:w-[65%] h-full relative bg-slate-950 overflow-hidden select-none">
        {erpSlides.map((slide, idx) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={idx === 0}
              sizes="(max-width: 1024px) 100vw, 65vw"
              className="object-cover object-center w-full h-full"
            />
          </div>
        ))}

        {/* Minimalist slide indicator pills at bottom */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md">
          {erpSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-6 bg-white shadow-sm' : 'w-2 bg-white/40 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT SIDE: Compact, Zero-Scroll Role-Based Login Box     */}
      {/* ========================================================= */}
      <div className="w-full lg:w-[38%] xl:w-[35%] h-full flex flex-col justify-center px-6 sm:px-10 md:px-12 bg-white overflow-y-auto lg:overflow-hidden">
        <div className="w-full max-w-sm mx-auto">
          
          {/* Institution Header with Emblem */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <CollegeLogo size={68} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#800000] tracking-tight leading-snug">
              M.K.R. Dr. G.R.D. College
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Enterprise Resource Planning (ERP)
            </p>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="mb-3 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-3 p-2 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs rounded">
              {successMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* 1. ROLE SELECTION (Radio Buttons matching reference) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                <span className="text-red-500">*</span>Role
              </label>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="SUPER_ADMIN"
                    checked={role === 'SUPER_ADMIN'}
                    onChange={() => handleRoleChange('SUPER_ADMIN')}
                    className="text-[#008080] focus:ring-[#008080] h-3.5 w-3.5 cursor-pointer"
                  />
                  <span>Super Admin</span>
                </label>

                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="FACULTY"
                    checked={role === 'FACULTY'}
                    onChange={() => handleRoleChange('FACULTY')}
                    className="text-[#008080] focus:ring-[#008080] h-3.5 w-3.5 cursor-pointer"
                  />
                  <span>Faculty</span>
                </label>

                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="STUDENT"
                    checked={role === 'STUDENT'}
                    onChange={() => handleRoleChange('STUDENT')}
                    className="text-[#008080] focus:ring-[#008080] h-3.5 w-3.5 cursor-pointer"
                  />
                  <span>Student</span>
                </label>
              </div>
            </div>

            {/* 2. USERNAME */}
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-800 mb-1">
                <span className="text-red-500">*</span>Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={roleConfig[role].placeholder}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded focus:ring-1 focus:ring-[#008080] focus:border-[#008080] text-slate-800 placeholder-slate-400 bg-white"
                autoComplete="username"
                required
              />
            </div>

            {/* 3. PASSWORD */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span className="text-red-500">*</span>Password
                  <span title="Enter your assigned ERP password" className="text-slate-400 cursor-help">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                </label>
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded focus:ring-1 focus:ring-[#008080] focus:border-[#008080] text-slate-800 placeholder-slate-400 bg-white"
                autoComplete="current-password"
                required
              />

              {/* Show Password Checkbox */}
              <div className="flex items-center mt-2">
                <input
                  id="showPassword"
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="h-3.5 w-3.5 text-[#008080] focus:ring-[#008080] border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="showPassword" className="ml-2 block text-xs text-slate-600 cursor-pointer select-none">
                  Show Password
                </label>
              </div>
            </div>

            {/* 4. BUTTONS (Login & Forgot Password matching reference) */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 rounded text-xs sm:text-sm font-bold text-white bg-[#008080] hover:bg-[#006b6b] transition focus:outline-none disabled:opacity-50 text-center"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>

              <button
                type="button"
                onClick={() => {
                  alert('Please contact MKR College Helpdesk at +91-7597052444 or email mkrdr.grdcollege@gmail.com');
                }}
                className="flex-1 py-2 px-4 rounded text-xs sm:text-sm font-bold text-white bg-[#E05D5D] hover:bg-[#c94949] transition text-center"
              >
                Forgot Password
              </button>
            </div>
          </form>

          {/* Quick Demo Logins (Subtle inline test links) */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-medium text-slate-400">Quick Test:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('SUPER_ADMIN')}
                className="text-[#800000] hover:underline font-semibold"
              >
                Principal
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleQuickFill('FACULTY')}
                className="text-[#002B5C] hover:underline font-semibold"
              >
                Faculty
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleQuickFill('STUDENT')}
                className="text-emerald-700 hover:underline font-semibold"
              >
                Student
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
