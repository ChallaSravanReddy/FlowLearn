import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight, Activity, Server, Sparkles, PlayCircle,
    Zap, BookOpen, ChevronRight, Network, Shield, Clock,
    FlaskConical, Layers, GraduationCap, MousePointerClick, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

interface Course {
    id: string;
    title: string;
    description: string;
    created_at: string;
    nodes?: any[];
}

const ANIM_UP = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

const STATS = [
    { value: '50+', label: 'Architecture Templates', icon: <Layers size={16} className="text-indigo-400" /> },
    { value: '12+', label: 'Component Types', icon: <Network size={16} className="text-purple-400" /> },
    { value: 'Real-time', label: 'Packet Simulation', icon: <Zap size={16} className="text-amber-400" /> },
    { value: 'Free', label: 'For Students', icon: <GraduationCap size={16} className="text-emerald-400" /> },
];

const FEATURES = [
    {
        icon: <Server size={22} />,
        gradient: 'from-indigo-600 to-purple-600',
        glow: 'shadow-indigo-500/25',
        title: 'Design Real Architectures',
        description: 'Drag-and-drop load balancers, API gateways, databases, caches, CDNs, and 15+ more components. Build architectures used by Netflix, Uber, and Amazon.',
        tag: 'Builder'
    },
    {
        icon: <Activity size={22} />,
        gradient: 'from-emerald-600 to-teal-600',
        glow: 'shadow-emerald-500/25',
        title: 'Watch Live Packet Flow',
        description: 'See request/response packets travel across your diagram in real-time. Visual spinners show processing, color codes show success or failure.',
        tag: 'Simulation'
    },
    {
        icon: <FlaskConical size={22} />,
        gradient: 'from-amber-500 to-orange-600',
        glow: 'shadow-amber-500/25',
        title: 'Experiment & Break Things',
        description: 'Click any component and crank up its failure rate or latency. Watch how a 90% failure rate on your API Gateway cascades across the whole system.',
        tag: 'Hands-on'
    },
    {
        icon: <BookOpen size={22} />,
        gradient: 'from-pink-600 to-rose-600',
        glow: 'shadow-pink-500/25',
        title: 'Instructor-Authored Courses',
        description: 'Instructors build flow diagrams with embedded lessons and video walkthroughs. Students get guided, interactive learning — not just slides.',
        tag: 'Courses'
    },
    {
        icon: <Shield size={22} />,
        gradient: 'from-cyan-600 to-blue-600',
        glow: 'shadow-cyan-500/25',
        title: 'No Setup Required',
        description: 'Everything runs in the browser. No Docker, no VMs, no configuration. Open a course and your sandbox is ready in seconds.',
        tag: 'Zero friction'
    },
    {
        icon: <TrendingUp size={22} />,
        gradient: 'from-violet-600 to-purple-700',
        glow: 'shadow-violet-500/25',
        title: 'Learn by Comparing',
        description: 'Set Database latency to 5ms vs 2000ms. See the exact effect on end-to-end response time. Concepts that took weeks now click in minutes.',
        tag: 'Insight'
    },
];

const HOW_IT_WORKS = [
    {
        step: '01',
        title: 'Instructor Builds a Flow',
        desc: 'Use the builder to drag components, connect them, set default parameters, and optionally attach a video walkthrough.',
        color: 'text-indigo-400',
        border: 'border-indigo-500/30',
        bg: 'bg-indigo-500/10',
    },
    {
        step: '02',
        title: 'Students Open the Sandbox',
        desc: 'Students browse the catalog, pick a class, and land inside a live interactive diagram — ready to run.',
        color: 'text-purple-400',
        border: 'border-purple-500/30',
        bg: 'bg-purple-500/10',
    },
    {
        step: '03',
        title: 'Experiment & Understand',
        desc: 'Click any node, adjust latency or failure rate, hit play, and watch how the whole system responds. Learning by doing.',
        color: 'text-emerald-400',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/10',
    },
];

export function HomePage() {
    const navigate = useNavigate();
    const [latestCourses, setLatestCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLatestCourses() {
            try {
                const { data, error } = await supabase
                    .from('flowlearn_courses')
                    .select('id, title, description, created_at, nodes')
                    .order('created_at', { ascending: false })
                    .limit(3);
                if (error) throw error;
                setLatestCourses(data || []);
            } catch (err) {
                console.error('Error fetching featured courses:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchLatestCourses();
    }, []);

    return (
        <div className="w-full overflow-x-hidden">

            {/* ── HERO ─────────────────────────────────────────── */}
            <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
                {/* Gradient orbs */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[130px]" />
                    <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-[5%] w-[350px] h-[350px] bg-pink-600/10 rounded-full blur-[100px]" />
                    {/* Grid texture */}
                    <div className="absolute inset-0 opacity-[0.03]"
                        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto space-y-8">
                    <motion.div
                        initial={ANIM_UP.initial} animate={ANIM_UP.animate}
                        transition={{ duration: 0.5, delay: 0 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/25 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-widest">
                            <Sparkles size={11} /> Live Interactive Sandbox Platform
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={ANIM_UP.initial} animate={ANIM_UP.animate}
                        transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                        className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1]"
                    >
                        Learn backend systems{' '}
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                by breaking them.
                            </span>
                            <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-indigo-400/0 via-purple-400/60 to-pink-400/0" />
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={ANIM_UP.initial} animate={ANIM_UP.animate}
                        transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        FlowLearn turns abstract architecture diagrams into <strong className="text-white font-semibold">live, clickable sandboxes</strong>.
                        Tweak latency, inject failures, and watch how distributed systems truly behave.
                    </motion.p>

                    <motion.div
                        initial={ANIM_UP.initial} animate={ANIM_UP.animate}
                        transition={{ duration: 0.55, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col sm:flex-row justify-center gap-4 pt-2"
                    >
                        <Link
                            to="/student"
                            className="group inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/50 text-base"
                        >
                            <PlayCircle size={18} />
                            Explore Classes
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/builder"
                            className="group inline-flex items-center justify-center gap-2 px-7 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold rounded-2xl transition-all duration-300 text-base"
                        >
                            <Sparkles size={16} className="text-indigo-400" />
                            Build a Course
                        </Link>
                    </motion.div>

                    {/* Trust indicators */}
                    <motion.div
                        initial={ANIM_UP.initial} animate={ANIM_UP.animate}
                        transition={{ duration: 0.55, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-wrap items-center justify-center gap-6 pt-4"
                    >
                        {['No setup required', 'Free for students', 'Real-time simulation'].map(t => (
                            <span key={t} className="flex items-center gap-2 text-sm text-slate-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                {t}
                            </span>
                        ))}
                    </motion.div>
                </div>

                {/* Bottom fade */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />
            </section>

            {/* ── STATS BAR ─────────────────────────────────────── */}
            <section className="border-y border-slate-800/60 bg-slate-900/40 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08, duration: 0.4 }}
                            className="flex flex-col items-center text-center gap-1.5"
                        >
                            <div className="flex items-center gap-1.5 mb-1">
                                {s.icon}
                                <span className="text-2xl font-black text-white">{s.value}</span>
                            </div>
                            <span className="text-xs text-slate-500 font-medium">{s.label}</span>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── HOW IT WORKS ──────────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5 }}
                    className="text-center mb-16 space-y-3"
                >
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-xs font-bold uppercase tracking-widest">
                        <MousePointerClick size={11} /> How it works
                    </span>
                    <h2 className="text-4xl font-black text-white">From concept to hands-on in minutes</h2>
                    <p className="text-slate-400 max-w-xl mx-auto text-base">No slides. No abstract theory. Just live systems you can poke at.</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6 relative">
                    {/* Connector line */}
                    <div className="hidden md:block absolute top-12 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0" />
                    {HOW_IT_WORKS.map((step, i) => (
                        <motion.div
                            key={step.step}
                            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}
                            className={`relative p-6 rounded-2xl border ${step.border} ${step.bg} backdrop-blur-sm space-y-4`}
                        >
                            <div className={`w-10 h-10 rounded-xl border ${step.border} bg-slate-950/60 flex items-center justify-center`}>
                                <span className={`text-base font-black font-mono ${step.color}`}>{step.step}</span>
                            </div>
                            <h3 className="text-lg font-bold text-white">{step.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES GRID ─────────────────────────────────── */}
            <section className="bg-slate-900/30 border-y border-slate-800/50 py-24">
                <div className="max-w-6xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.5 }}
                        className="text-center mb-16 space-y-3"
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-widest">
                            <Zap size={11} /> Platform Features
                        </span>
                        <h2 className="text-4xl font-black text-white">Everything you need to <span className="text-indigo-400">really</span> get it</h2>
                        <p className="text-slate-400 max-w-xl mx-auto">Built for the way engineers actually learn — by doing, not watching.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {FEATURES.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.45 }}
                                className="group p-6 bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 rounded-2xl transition-all duration-300 hover:bg-slate-900/90 space-y-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} shadow-lg ${f.glow} flex items-center justify-center text-white`}>
                                        {f.icon}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 border border-slate-800 px-2 py-0.5 rounded-full">
                                        {f.tag}
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">{f.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── LATEST COURSES ────────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12"
                >
                    <div className="space-y-2">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-widest">
                            <BookOpen size={11} /> Live Classes
                        </span>
                        <h2 className="text-4xl font-black text-white">Start learning right now</h2>
                        <p className="text-slate-400 text-sm max-w-md">Instructor-crafted interactive sandboxes. Click play and start experimenting.</p>
                    </div>
                    <Link to="/student" className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 font-bold transition-colors shrink-0 group">
                        Browse all classes <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </motion.div>

                {loading ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-slate-900/50 border border-slate-800 rounded-2xl h-52 animate-pulse" />
                        ))}
                    </div>
                ) : latestCourses.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                        className="text-center py-16 bg-slate-900/30 border border-slate-800 rounded-2xl space-y-4"
                    >
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
                            <PlayCircle size={28} className="text-slate-600" />
                        </div>
                        <p className="text-slate-400 font-medium">No classes published yet.</p>
                        <Link to="/builder" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-sm font-bold transition-colors">
                            Create the first one <ArrowRight size={14} />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {latestCourses.map((course, i) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.45 }}
                                onClick={() => navigate(`/student/course/${course.id}`)}
                                className="group relative bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col"
                            >
                                {/* Card illustration header */}
                                <div className="h-32 bg-gradient-to-br from-indigo-950/60 via-slate-950 to-purple-950/40 flex items-center justify-center relative overflow-hidden border-b border-slate-800">
                                    <div className="absolute inset-0 opacity-[0.04]"
                                        style={{ backgroundImage: 'linear-gradient(#818cf8 1px, transparent 1px), linear-gradient(90deg, #818cf8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                                    <div className="relative flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-sm bg-indigo-400" />
                                        </div>
                                        <div className="w-px h-6 bg-indigo-500/30" />
                                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-full bg-purple-400" />
                                        </div>
                                        <div className="w-px h-6 bg-purple-500/30" />
                                        <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-sm bg-pink-400 rotate-45" />
                                        </div>
                                    </div>
                                    <span className="absolute top-2.5 right-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                                        Live
                                    </span>
                                    {course.nodes && (
                                        <span className="absolute top-2.5 left-2.5 bg-slate-950/70 border border-slate-800 text-slate-400 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                            {course.nodes.length} components
                                        </span>
                                    )}
                                </div>

                                <div className="p-5 flex flex-col flex-1 gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shrink-0">
                                            <PlayCircle size={13} className="text-white" />
                                        </div>
                                        <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                                            {course.title}
                                        </h3>
                                    </div>
                                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 flex-1">
                                        {course.description || 'An interactive backend architecture sandbox.'}
                                    </p>
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                            <Clock size={10} />
                                            {new Date(course.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <span className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold group-hover:gap-2 transition-all">
                                            Launch <ArrowRight size={10} />
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── CTA BANNER ────────────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-6 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.55 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-700 p-12 text-center"
                >
                    {/* Inner glow decoration */}
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute top-[-30%] left-[25%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px]" />
                        <div className="absolute bottom-[-20%] right-[15%] w-[300px] h-[300px] bg-pink-500/20 rounded-full blur-[60px]" />
                    </div>
                    <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-white/80 text-xs font-bold uppercase tracking-widest">
                            <GraduationCap size={12} /> For instructors & students
                        </div>
                        <h2 className="text-4xl font-black text-white leading-tight">
                            Ready to make your backend courses{' '}
                            <span className="underline decoration-pink-300 decoration-2 underline-offset-4">unforgettable?</span>
                        </h2>
                        <p className="text-white/70 text-base leading-relaxed">
                            Instructors build once. Students learn forever. No server. No setup. Just drag, connect, and teach.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                to="/builder"
                                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white text-indigo-700 font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-xl shadow-black/20 text-base"
                            >
                                <Sparkles size={16} /> Start Building Free
                            </Link>
                            <Link
                                to="/student"
                                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold rounded-2xl transition-all text-base"
                            >
                                Browse Classes <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
