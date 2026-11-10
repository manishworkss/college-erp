'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { School, Menu, X, ShieldCheck, PhoneCall, GraduationCap, AlertCircle, Home } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Online Admission Form', href: '/admission', icon: GraduationCap },
    { name: 'Complain / Grievance', href: '/complaint', icon: AlertCircle },
    { name: 'Contact Us', href: '/contact', icon: PhoneCall },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-[#0f2744] text-white py-1.5 px-4 text-xs font-medium border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
          <span>Affiliated with Babasaheb Bhimrao Ambedkar Bihar University (BRABU), Muzaffarpur</span>
          <div className="flex items-center gap-4 text-slate-300">
            <span>Helpline: +91-7597052444</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Sitamarhi, Bihar (843302)</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Logo & College Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-[#0f2744] text-[#d4af37] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <School className="w-7 h-7" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-extrabold text-[#0f2744] tracking-tight leading-snug">
                M.K.R. Dr. G.R.D. College
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Matashri Kaushalya Ramdev Dr. Ganesh Ray Degree College, Punaura Dham
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                    active
                      ? 'bg-[#0f2744] text-white shadow-sm'
                      : 'text-slate-700 hover:text-[#0f2744] hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Admin / Staff Login */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/admin/students"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0f2744] hover:bg-[#1b4374] rounded-lg shadow-sm transition"
            >
              <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
              ERP Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#0f2744] hover:bg-slate-100 rounded-lg focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${
                    active
                      ? 'bg-[#0f2744] text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-100 mt-2">
              <Link
                href="/admin/students"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-white bg-[#0f2744] hover:bg-[#1b4374] rounded-lg transition"
              >
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                Admin & ERP Console
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
