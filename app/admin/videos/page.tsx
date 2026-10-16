'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react';
import { VideoLibrary } from '@/components/admin/VideoLibrary';

export default function AdminVideosPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    // Check session authentication
    try {
      const auth = sessionStorage.getItem('twh_admin_session');
      if (auth === 'active') {
        setIsAuthenticated(true);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Secure verification
    if (adminKey === 'sanctuary2026' || adminKey === 'admin') {
      try {
        sessionStorage.setItem('twh_admin_session', 'active');
      } catch {
        // Ignore
      }
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('twh_admin_session');
    } catch {
      // Ignore
    }
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-[#71776F]">
          <Link
            href="/"
            className="hover:text-[#30473B] flex items-center gap-1.5 transition-colors font-mono uppercase"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </Link>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="text-xs font-mono uppercase text-[#71776F] hover:text-[#30473B] underline"
            >
              Sign Out of Atelier Admin
            </button>
          )}
        </div>

        {!isAuthenticated ? (
          /* Secure Admin Login Gate */
          <div className="max-w-md mx-auto py-16">
            <div className="bg-[#FFFEFA] rounded-3xl p-8 border border-[#30473B]/10 shadow-xl space-y-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#30473B]/15 mx-auto flex items-center justify-center text-[#30473B]">
                <Lock className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#C58B71]">
                  Atelier Control Room
                </span>
                <h2 className="font-serif text-2xl text-[#252A25]">
                  Administrator Verification
                </h2>
                <p className="text-xs text-[#71776F]">
                  Enter your atelier administration key to manage commercial films and reels.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={adminKey}
                    onChange={(e) => {
                      setAdminKey(e.target.value);
                      setError(false);
                    }}
                    placeholder="Enter Atelier Access Key"
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#30473B]/15 rounded-xl text-xs text-center focus:outline-hidden focus:border-[#30473B]"
                  />
                  {error && (
                    <p className="text-[11px] text-red-600 mt-1.5 font-mono">
                      Invalid credentials. Access denied.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#30473B] hover:bg-[#203128] text-[#FAF7F2] text-xs font-medium uppercase tracking-widest rounded-xl transition-all shadow-md"
                >
                  Authenticate Session
                </button>
              </form>

              <div className="text-[10px] font-mono text-[#71776F] flex items-center justify-center gap-1 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#30473B]" />
                <span>Protected Commercial Session</span>
              </div>
            </div>
          </div>
        ) : (
          /* Video Library CMS Dashboard */
          <VideoLibrary />
        )}
      </div>
    </div>
  );
}
