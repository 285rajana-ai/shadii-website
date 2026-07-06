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
          DESKTOP LIGHT SIDEBAR LAYOUT (md & up)
          ========================================== */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 glass-sidebar flex-col justify-between p-6 z-40 text-[#202124]">
        {/* Top Section: Brand Logo & Navigation */}
        <div className="flex flex-col gap-8">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center border border-[#8A1538]/20 bg-[#FCE8EF] text-[#8A1538] shadow-[0_4px_12px_rgba(138,21,56,0.08)] rounded-lg">
              <Gem className="h-5 w-5 text-[#8A1538]" />
            </span>
            <div>
              <span className="font-serif text-2xl font-black text-[#8A1538] tracking-wide">
                Shadii<span className="text-[#245C54]">.pk</span>
              </span>
              <span className="block text-[8px] uppercase tracking-[0.25em] text-[#5F6673] font-bold">
                Matchmaking Portal
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#5F6673]/60 font-bold pl-2 mb-2 block">
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
                      ? 'bg-[#FCE8EF] text-[#8A1538] border-l-4 border-[#8A1538] shadow-sm'
                      : 'text-[#5F6673] hover:text-[#8A1538] hover:bg-[#F6F0E8]/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-[#8A1538]' : 'text-[#5F6673]/60 group-hover:text-[#8A1538]'}`} />
                  {link.label}
                </Link>
              );
            })}

            {/* Admin Console Switcher */}
            {user.isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-3 px-4 py-3 mt-4 text-sm font-semibold rounded-lg border border-[#8A1538]/20 transition-all ${
                  isActive('/admin')
                    ? 'bg-[#8A1538] text-white'
                    : 'text-[#5F6673] hover:bg-[#FCE8EF] hover:text-[#8A1538]'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-[#8A1538]" />
                Admin Console
              </Link>
            )}
          </nav>
        </div>

        {/* Bottom Section: Profile Completeness & User Info */}
        <div className="flex flex-col gap-6 pt-6 border-t border-[#E7DED3]">
          {/* Profile Completeness Progress bar */}
          <div className="flex flex-col gap-1.5 pl-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#5F6673] font-semibold">Profile Integrity</span>
              <span className="font-bold text-[#8A1538]">{completion}%</span>
            </div>
            <div className="w-full bg-[#E7DED3]/40 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#8A1538] to-[#B84A69] h-full rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          {/* User Details card */}
          <div className="flex items-center gap-3 bg-[#FAF7F2] border border-[#E7DED3] p-3 rounded-xl">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <TextTruncate text={user.name || 'User'} className="text-sm font-bold text-[#202124] truncate" />
                <Crown className={`h-3.5 w-3.5 shrink-0 ${plan === 'free' ? 'text-[#5F6673]/30' : 'text-[#8A1538]'}`} />
              </div>
              <span className="block text-[10px] uppercase font-bold text-[#245C54] mt-0.5 tracking-wider">
                {plan} Tier
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-[#5F6673] hover:text-[#8A1538] hover:bg-[#FCE8EF] p-2 rounded-lg transition-all cursor-pointer"
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
      <header className="md:hidden flex items-center justify-between px-4 h-16 fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#E7DED3] text-[#202124] shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center border border-[#8A1538]/20 bg-[#FCE8EF] text-[#8A1538] rounded-md">
            <Gem className="h-4 w-4" />
          </span>
          <span className="font-serif text-lg font-black text-[#8A1538]">
            Shadii<span className="text-[#245C54]">.pk</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-[#FCE8EF] border border-[#8A1538]/10 text-[#8A1538] rounded">
            {plan}
          </span>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-[#5F6673] hover:text-[#8A1538] p-1.5"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Sticky Nav */}
      <nav className="md:hidden flex justify-around items-center border-t border-[#E7DED3] bg-white py-2 fixed bottom-0 left-0 right-0 h-16 z-40 shadow-[0_-8px_20px_rgba(29,26,22,0.05)]">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center text-[10px] font-bold tracking-wide transition-colors ${
                active ? 'text-[#8A1538]' : 'text-[#5F6673] hover:text-[#8A1538]'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${active ? 'text-[#8A1538]' : 'text-[#5F6673]/50'}`} />
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
