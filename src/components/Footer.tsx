import React from 'react';
import Link from 'next/link';
import { School, MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0f2744] text-slate-300 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: College Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 text-[#d4af37] flex items-center justify-center font-bold">
                <School className="w-6 h-6" />
              </div>
              <span className="text-white font-bold text-base leading-tight">
                M.K.R. Dr. G.R.D. College
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Matashri Kaushalya Ramdev Dr. Ganesh Ray Degree College, Punaura Dham, Sitamarhi, Bihar. A premier institution affiliated with Babasaheb Bhimrao Ambedkar Bihar University (BRABU), Muzaffarpur.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Affiliated to B.R.A. Bihar University</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              ERP Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition">
                  • Institutional Home
                </Link>
              </li>
              <li>
                <Link href="/admission" className="hover:text-white transition">
                  • Online Admission Form (UG CBCS)
                </Link>
              </li>
              <li>
                <Link href="/complaint" className="hover:text-white transition">
                  • Student & Staff Grievance Cell
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  • Contact & Helpdesk
                </Link>
              </li>
              <li>
                <Link href="/admin/students" className="hover:text-white transition">
                  • Admin Student Directory & Auto-Promotion
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Campus */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Campus Location
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                <span>
                  Near Punaura Police Station & Fulmat Petrol Pump, Punaura Dham, Sitamarhi, Bihar – 843302
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span>+91-7597052444, +91-7544052444</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span>principal@mkrcollege.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Office Timings */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Office Hours
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Monday – Saturday</div>
                  <div className="text-slate-400">10:00 AM – 04:30 PM</div>
                </div>
              </li>
              <li className="pt-2 text-slate-400">
                Closed on Sundays and State / University declared holidays.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} M.K.R. Dr. G.R.D. College, Sitamarhi. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5">
            <span>Enterprise ERP engineered for Hostinger & MySQL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
