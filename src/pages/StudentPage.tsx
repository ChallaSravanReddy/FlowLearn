import { useNavigate } from 'react-router-dom';
import { useCourseStore } from '../store/courseStore';
import { PlayCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function StudentPage() {
    const { savedFlows } = useCourseStore();
    const navigate = useNavigate();

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Lessons</h1>
                <p className="text-gray-600">Explore interactive backend flows created by your instructors.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedFlows.map((flow, index) => (
                    <motion.div
                        key={flow.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group"
                        onClick={() => navigate(`/student/course/${flow.id}`)}
                    >
                        <div className="h-40 bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            {/* Preview Placeholder */}
                            <div className="text-blue-200">
                                <PlayCircle size={48} />
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{flow.title}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{flow.description}</p>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    <span>{new Date(flow.createdAt).toLocaleDateString()}</span>
                                </div>
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Beginner</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
