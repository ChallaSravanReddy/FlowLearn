import { Link, useLocation } from 'react-router-dom';
import { Network, BookOpen, Layers, Sparkles, GraduationCap } from 'lucide-react';

export function Navbar() {
    const location = useLocation();

    // Hide Navbar on the student course player page to prevent double headers
    if (location.pathname.startsWith('/student/course/')) {
        return null;
    }

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="h-16 sticky top-0 z-50 flex items-center justify-between px-6 border-b border-white/[0.06] bg-slate-950/70 backdrop-blur-xl">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                    <Network size={16} className="text-white" />
                </div>
                <span className="text-base font-black text-white tracking-tight">
                    Flow<span className="text-indigo-400">Learn</span>
                </span>
            </Link>

            {/* Center Nav Links */}
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-2xl px-1.5 py-1">
                <NavLink to="/" active={isActive('/') && location.pathname === '/'} icon={<Layers size={14} />} label="Home" />
                <NavLink to="/student" active={isActive('/student')} icon={<BookOpen size={14} />} label="Learn catalog" />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 shrink-0">
                <Link
                    to="/student"
                    className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all
                        ${isActive('/student') && !isActive('/builder')
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <GraduationCap size={14} />
                    Student
                </Link>
                <Link
                    to="/builder"
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all border
                        ${isActive('/builder')
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 border-transparent text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40'
                        }`}
                >
                    <Sparkles size={12} />
                    Instructor Builder
                </Link>
            </div>
        </nav>
    );
}

function NavLink({ to, active, icon, label }: { to: string; active: boolean; icon: React.ReactNode; label: string }) {
    return (
        <Link
            to={to}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all
                ${active
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}

export default Navbar;
