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
    <nav className="sticky top-0 z-40 border-b border-[#e7d8bb] bg-[#fffdf8]/95 backdrop-blur-xl shadow-[0_12px_32px_rgba(58,38,31,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between min-h-20 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-11 w-11 place-items-center border border-[#d8bd78] bg-[#871635] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]">
                <Gem className="h-5 w-5" />
              </span>
              <div>
                <span className="font-serif text-2xl font-bold text-[#871635]">Shadii<span className="text-[#b6903f]">.pk</span></span>
                <span className="block text-[9px] uppercase tracking-[0.18em] text-[#9d7c37] font-semibold">Matchmaking Portal</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-1 items-center">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
                    active
                      ? 'border-[#871635] text-[#871635]'
                      : 'border-transparent text-[#665c58] hover:text-[#871635] hover:border-[#e5d8bd]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-2 border border-[#eadcc1] bg-white px-3 py-2 text-xs font-bold capitalize text-[#322421]">
              <Crown className={`h-4 w-4 ${plan === 'free' ? 'text-[#a99b8c]' : 'text-[#b6903f]'}`} />
              {plan} account
            </div>

            {/* Profile Completeness Info */}
            <div className="hidden lg:flex flex-col items-end text-xs">
              <span className="text-[#665c58]">Profile: {completion}% Complete</span>
              <div className="w-36 bg-[#f3eadb] h-2 mt-1 border border-[#e0d0b1]">
                <div
                  className="bg-[linear-gradient(90deg,#b6903f,#871635)] h-full"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>

            {/* Admin Switcher */}
            {user.isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#871635] text-[#871635] hover:bg-[#871635] hover:text-white transition-all text-xs font-semibold uppercase tracking-[0.14em]"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin Console
              </Link>
            )}

            {/* Logout */}
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-[#665c58] hover:text-[#871635] p-2 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Sticky Bar */}
      <div className="md:hidden flex justify-around border-t border-[#E5DEC9] bg-[#fffdf8] py-2 fixed bottom-0 left-0 right-0 z-40 shadow-[0_-12px_30px_rgba(58,38,31,0.08)]">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center text-[10px] font-medium transition-colors ${
                active ? 'text-[#871635]' : 'text-[#665c58] hover:text-[#871635]'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
