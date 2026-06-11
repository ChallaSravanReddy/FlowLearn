import { useState, useEffect } from 'react';
import { Film, Trash2, Edit, X, Loader2, PlayCircle, FolderOpen } from 'lucide-react';
import { BuilderCanvas } from '../features/builder/BuilderCanvas';
import { BuilderSidebar } from '../features/builder/BuilderSidebar';
import { TemplateGallery } from '../features/builder/TemplateGallery';
import { MediaUploader } from '../features/builder/MediaUploader';
import { type Template } from '../data/templates';
import { type CourseMedia } from '../types/media';
import { supabase } from '../lib/supabaseClient';

export function BuilderPage() {
    const [showTemplates, setShowTemplates] = useState(false);
    const [showMediaUploader, setShowMediaUploader] = useState(false);
    const [showCourseManager, setShowCourseManager] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
    const [editingCourse, setEditingCourse] = useState<any | null>(null);
    const [courseMedia, setCourseMedia] = useState<CourseMedia>({ totalDuration: 0 });

    const handleTemplateSelect = (template: Template) => {
        // Clear active course edit state since we are starting from a template
        setEditingCourse(null);
        const templateCopy = JSON.parse(JSON.stringify(template));
        setCurrentTemplate(templateCopy);
        setShowTemplates(false);
    };

    const handleMediaUpdate = (media: CourseMedia) => {
        setCourseMedia(media);
        console.log('Media updated:', media);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden relative">
            {/* Sidebar */}
            <BuilderSidebar
                onOpenTemplates={() => setShowTemplates(true)}
                onOpenCourseManager={() => setShowCourseManager(true)}
            />

            {/* Main Canvas */}
            <div className="flex-1 relative">
                <BuilderCanvas
                    template={currentTemplate}
                    editingCourse={editingCourse}
                    onClearEditingCourse={() => {
                        setEditingCourse(null);
                        setCurrentTemplate(null);
                    }}
                    media={courseMedia}
                />

                {/* Action Button */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button
                        onClick={() => setShowMediaUploader(true)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg transition-colors flex items-center gap-2"
                    >
                        <Film size={20} />
                        Upload Media
                    </button>
                </div>

                {/* Media Status Indicator */}
                {(courseMedia.video || courseMedia.audio) && (
                    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
                        <div className="text-sm text-gray-600">
                            {courseMedia.video && (
                                <div className="flex items-center gap-2 text-purple-600">
                                    <Film size={16} />
                                    <span>{courseMedia.video.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Template Gallery Modal */}
            {showTemplates && (
                <TemplateGallery
                    onSelect={handleTemplateSelect}
                    onClose={() => setShowTemplates(false)}
                />
            )}

            {/* Media Uploader Modal */}
            {showMediaUploader && (
                <MediaUploader
                    isOpen={showMediaUploader}
                    onClose={() => setShowMediaUploader(false)}
                    onMediaUpdate={handleMediaUpdate}
                    initialMedia={courseMedia}
                />
            )}

            {/* Course Manager Modal */}
            {showCourseManager && (
                <CourseManagerModal
                    onClose={() => setShowCourseManager(false)}
                    onLoadCourse={(course) => {
                        setEditingCourse(course);
                        // Clean template so it doesn't override the course
                        setCurrentTemplate(null);
                        if (course.media) {
                            setCourseMedia(course.media);
                        } else {
                            setCourseMedia({ totalDuration: 0 });
                        }
                        setShowCourseManager(false);
                    }}
                />
            )}
        </div>
    );
}

interface CourseManagerModalProps {
    onClose: () => void;
    onLoadCourse: (course: any) => void;
}

function CourseManagerModal({ onClose, onLoadCourse }: CourseManagerModalProps) {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCourses = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('flowlearn_courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCourses(data || []);
        } catch (err: any) {
            console.error('Error fetching courses:', err);
            setError(err.message || 'Failed to load courses.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete the class "${title}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('flowlearn_courses')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchCourses();
        } catch (err: any) {
            alert(`Failed to delete course: ${err.message}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                        <FolderOpen className="text-indigo-400" size={22} />
                        Manage Your Classes
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="animate-spin text-indigo-500" size={32} />
                            <span className="text-sm text-slate-400">Loading your published classes...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-400 font-medium">
                            {error}
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-16 text-slate-500 space-y-4">
                            <PlayCircle size={40} className="mx-auto text-slate-600" />
                            <p className="text-sm">You haven't published any classes yet.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="bg-slate-950/80 border border-slate-850 p-5 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-all group"
                                >
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors truncate">
                                            {course.title}
                                        </h4>
                                        <p className="text-xs text-slate-400 line-clamp-2 min-h-[2rem]">
                                            {course.description || 'No description provided.'}
                                        </p>
                                        <div className="text-[10px] text-slate-500">
                                            Published: {new Date(course.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex gap-2.5 mt-5 pt-4 border-t border-slate-900 justify-end">
                                        <button
                                            onClick={() => handleDelete(course.id, course.title)}
                                            className="px-3.5 py-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border border-transparent hover:border-red-500/25"
                                        >
                                            <Trash2 size={13} />
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => onLoadCourse(course)}
                                            className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow shadow-indigo-950/50"
                                        >
                                            <Edit size={13} />
                                            Load & Edit
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
