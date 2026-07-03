import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, MessageSquare, User, CreditCard, ShieldAlert, LogOut, Gem, Crown } from 'lucide-react';
import { formatPlan } from '../lib/profile';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const links = [
    { path: '/', label: 'Discover', icon: Compass },
    { path: '/chat', label: 'Chat', icon: MessageSquare },
    { path: '/profile', label: 'My Profile', icon: User },
    { path: '/billing', label: 'Membership', icon: CreditCard },
  ];

  const isActive = (path) => location.pathname === path;
  const plan = formatPlan(user);
  const completion = Math.min(Number(user.profileCompleteness || 0), 100);

  return (
    <>
      {/* ==========================================
          DESKTOP SIDEBAR LAYOUT (md & up)
          ========================================== */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 glass-sidebar flex-col justify-between p-6 z-40 text-[#FAF8F5]">
        {/* Top Section: Brand Logo & Navigation */}
        <div className="flex flex-col gap-8">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center border border-[#D4AF37]/30 bg-[#800020] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)] rounded-lg">
              <Gem className="h-5 w-5 animate-pulse" />
            </span>
            <div>
              <span className="font-serif text-2xl font-black text-white tracking-wide">
                Shadii<span className="text-[#D4AF37]">.pk</span>
              </span>
              <span className="block text-[8px] uppercase tracking-[0.25em] text-[#C5A059] font-bold">
                Premium Matchmaking
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059]/60 font-bold pl-2 mb-2 block">
              Navigation
            </span>
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 group ${
                    active
                      ? 'bg-gradient-to-r from-[#800020] to-[#580820] text-white border-l-4 border-[#D4AF37] shadow-[0_4px_15px_rgba(128,0,32,0.25)]'
                      : 'text-[#FAF8F5]/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-[#D4AF37]' : 'text-[#FAF8F5]/50 group-hover:text-white'}`} />
                  {link.label}
                </Link>
              );
            })}

            {/* Admin Console Switcher */}
            {user.isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-3 px-4 py-3 mt-4 text-sm font-semibold rounded-lg border border-[#800020]/40 transition-all ${
                  isActive('/admin')
                    ? 'bg-[#800020] text-white'
                    : 'text-[#FAF8F5]/70 hover:bg-[#800020] hover:text-white'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
                Admin Console
              </Link>
            )}
          </nav>
        </div>

        {/* Bottom Section: Profile Completeness & User Info */}
        <div className="flex flex-col gap-6 pt-6 border-t border-white/10">
          {/* Profile Completeness Ring/Indicator */}
          <div className="flex flex-col gap-1.5 pl-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#FAF8F5]/60 font-medium">Profile Integrity</span>
              <span className="font-bold text-[#D4AF37]">{completion}%</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#D4AF37] to-[#800020] h-full rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          {/* User Details card */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-xl">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <TextTruncate text={user.name || 'User'} className="text-sm font-bold text-white truncate" />
                <Crown className={`h-3.5 w-3.5 shrink-0 ${plan === 'free' ? 'text-[#FAF8F5]/30' : 'text-[#D4AF37]'}`} />
              </div>
              <span className="block text-[10px] uppercase font-bold text-[#C5A059] mt-0.5 tracking-wider">
                {plan} Tier
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-[#FAF8F5]/50 hover:text-[#800020] hover:bg-white p-2 rounded-lg transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ==========================================
          MOBILE TOP NAVBAR & BOTTOM STICKY NAV (md & below)
          ========================================== */}
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 h-16 fixed top-0 left-0 right-0 z-40 bg-[#1F1515] border-b border-[#D4AF37]/20 text-white shadow-md">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center border border-[#D4AF37]/30 bg-[#800020] text-[#D4AF37] rounded-md">
            <Gem className="h-4 w-4" />
          </span>
          <span className="font-serif text-lg font-black text-white">
            Shadii<span className="text-[#D4AF37]">.pk</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-white/10 border border-white/20 text-[#D4AF37] rounded">
            {plan}
          </span>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-white/60 hover:text-[#800020] p-1.5"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Sticky Nav */}
      <nav className="md:hidden flex justify-around items-center border-t border-[#D4AF37]/15 bg-[#1F1515]/95 backdrop-blur-xl py-2 fixed bottom-0 left-0 right-0 h-16 z-40 shadow-[0_-12px_30px_rgba(31,21,21,0.15)]">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center text-[10px] font-bold tracking-wide transition-colors ${
                active ? 'text-[#D4AF37]' : 'text-white/60 hover:text-[#FAF8F5]'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${active ? 'text-[#D4AF37]' : 'text-white/40'}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

// Inline helper component for text truncation
function TextTruncate({ text, className }) {
  return <span className={className}>{text}</span>;
}
