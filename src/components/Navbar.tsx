'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CollegeLogo from '@/components/CollegeLogo';
import { Menu, X, ShieldCheck, GraduationCap, AlertCircle } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Online Admission Form', href: '/admission', icon: GraduationCap },
    { name: 'Complain / Grievance', href: '/complaint', icon: AlertCircle },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Top Banner - Complementary to mkrcollege.com with #800000 Maroon */}
      <div className="bg-[#800000] text-white py-1.5 px-4 text-xs font-medium border-b border-[#5C0000]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 text-center sm:text-left">
          <span>Affiliated with Babasaheb Bhimrao Ambedkar Bihar University (BRABU), Muzaffarpur</span>
          <div className="flex items-center gap-3 text-white/90">
            <span>Helpline: +91-7597052444</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Sitamarhi, Bihar – 843302</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          {/* Logo & College Identity */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <CollegeLogo size={46} className="group-hover:scale-105 transition-transform" />
            <div>
              <div className="text-base sm:text-lg font-extrabold text-[#800000] tracking-tight leading-none">
                M.K.R. Dr. G.R.D. College
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-none hidden sm:block">
                College ERP Portal • Punaura Dham, Sitamarhi
              </p>
            </div>
          </Link>

          {/* Desktop Single-Line Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-[#800000] text-white shadow-sm'
                      : 'text-slate-700 hover:text-[#800000] hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Single Clean ERP Login Action Button */}
          <div className="hidden sm:flex items-center shrink-0">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#002B5C] hover:bg-[#001836] border border-[#001836] rounded-lg shadow-sm whitespace-nowrap transition-all duration-150 hover:shadow"
            >
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>ERP Login</span>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#800000] hover:bg-slate-100 rounded-lg"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap ${
                    active
                      ? 'bg-[#800000] text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-white bg-[#002B5C] rounded-lg shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                ERP Login
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
