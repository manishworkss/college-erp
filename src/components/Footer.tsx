import React from 'react';
import Link from 'next/link';
import { School, MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#002B5C] text-slate-200 text-xs mt-auto border-t border-[#001836]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#800000] text-white flex items-center justify-center font-bold">
                <School className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <span className="text-white font-bold text-sm">
                M.K.R. Dr. G.R.D. College ERP
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Matashri Kaushalya Ramdev Dr. Ganesh Ray Degree College, Punaura Dham, Sitamarhi, Bihar (843302). Affiliated with Babasaheb Bhimrao Ambedkar Bihar University (BRABU), Muzaffarpur.
            </p>
          </div>

          {/* Quick ERP Links */}
          <div>
            <div className="text-white font-bold uppercase tracking-wider text-[11px] mb-3">
              Direct ERP Modules
            </div>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/" className="hover:text-white transition">
                  • ERP Home
                </Link>
              </li>
              <li>
                <Link href="/admission" className="hover:text-white transition">
                  • Online Admission Form (UG CBCS)
                </Link>
              </li>
              <li>
                <Link href="/complaint" className="hover:text-white transition">
                  • Grievance & Complain Cell
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  • Campus Helpdesk & Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <div className="text-white font-bold uppercase tracking-wider text-[11px] mb-3">
              Campus Helpdesk
            </div>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Punaura Dham, Near Punaura Police Station, Sitamarhi – 843302</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>+91-7597052444, +91-7544052444</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>principal@mkrcollege.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} M.K.R. Dr. G.R.D. College. All rights reserved.
          </div>
          <div>
            Optimized for Hostinger & MySQL
          </div>
        </div>
      </div>
    </footer>
  );
}
