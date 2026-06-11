import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, Search, BookOpen, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

interface Course {
    id: string;
    title: string;
    description: string;
    created_at: string;
    nodes: any[];
    lessons?: any[];
}

export function StudentPage() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCourses() {
            setLoading(true);
            setError(null);
            try {
                const { data, error } = await supabase
                    .from('flowlearn_courses')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    throw error;
                }
                setCourses(data || []);
            } catch (err: any) {
                console.error('Error fetching courses from Supabase:', err);
                setError(err.message || 'Failed to connect to the database.');
            } finally {
                setLoading(false);
            }
        }

        fetchCourses();
    }, []);

    // Filter courses based on search query
    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                        Interactive Sandbox Classes
                    </h1>
                    <p className="text-slate-400">
                        Explore backend flows, watch classes, and interact with live diagrams in real-time.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search classes..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                    />
                </div>
            </div>

            {/* Error Notification */}
            {error && (
                <div className="bg-red-950/40 border border-red-900 text-red-200 rounded-xl p-4 flex items-start gap-3 mb-8">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold">Database Sync Warning</h4>
                        <p className="text-sm text-red-300/80 mt-0.5">{error}</p>
                        <p className="text-xs text-red-400/70 mt-2">
                            Make sure you run the SQL script in `supabase_schema.sql` on your Supabase project console!
                        </p>
                    </div>
                </div>
            )}

            {/* Catalog Grid */}
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl h-72 animate-pulse flex flex-col justify-between p-6">
                            <div className="space-y-3">
                                <div className="h-6 w-3/4 bg-slate-800 rounded" />
                                <div className="h-4 w-5/6 bg-slate-850 rounded" />
                                <div className="h-4 w-2/3 bg-slate-850 rounded" />
                            </div>
                            <div className="h-4 w-1/3 bg-slate-800 rounded" />
                        </div>
                    ))}
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 max-w-xl mx-auto space-y-4">
                    <BookOpen size={48} className="mx-auto text-slate-600 animate-pulse" />
                    <h3 className="text-lg font-bold text-white">No Classes Found</h3>
                    <p className="text-slate-400 text-sm">
                        {searchQuery ? "No published courses match your search criteria." : "Be the first to create and publish an interactive class!"}
                    </p>
                    {!searchQuery && (
                        <a href="/builder" className="inline-block px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors mt-2">
                            Create a Class
                        </a>
                    )}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            onClick={() => navigate(`/student/course/${course.id}`)}
                            className="bg-slate-900/60 border border-slate-800/80 rounded-2xl hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer overflow-hidden flex flex-col justify-between group shadow-lg hover:shadow-indigo-500/5"
                        >
                            {/* Card Header Illustration Placeholder */}
                            <div className="h-36 bg-gradient-to-br from-indigo-950/40 to-slate-950 flex items-center justify-center group-hover:from-indigo-950/60 group-hover:to-slate-900 transition-all border-b border-slate-850 relative">
                                <div className="text-indigo-500/80 group-hover:text-indigo-400 group-hover:scale-110 transition-all duration-350">
                                    <PlayCircle size={44} />
                                </div>
                                <span className="absolute top-3 right-3 bg-slate-950/80 border border-slate-850 px-2 py-0.5 rounded-full text-[10px] text-indigo-300 font-bold tracking-wider uppercase">
                                    {course.nodes ? `${course.nodes.length} Components` : 'Sandbox'}
                                </span>
                            </div>

                            {/* Card Content */}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div className="space-y-2.5">
                                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                                        {course.title}
                                    </h3>
                                    <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
                                        {course.description || "No description provided."}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-500 mt-6 pt-4 border-t border-slate-850">
                                    <div className="flex items-center gap-1">
                                        <Clock size={13} className="text-slate-500" />
                                        <span>{new Date(course.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {course.lessons && course.lessons.length > 0 ? (
                                        <span className="bg-indigo-950/60 border border-indigo-900/40 text-indigo-400 px-2 py-0.5 rounded-full font-bold tracking-wide">
                                            {course.lessons.length} Lessons
                                        </span>
                                    ) : (
                                        <span className="bg-emerald-950/60 border border-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded-full font-bold tracking-wide">
                                            Sandbox Mode
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
