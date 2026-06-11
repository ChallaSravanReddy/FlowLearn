import { useState, useEffect } from 'react';
import { Save, Loader2, Copy, Check, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useReactFlow } from 'reactflow';
import { useExecutionStore } from '../../store/executionStore';
import { type CourseMedia } from '../../types/media';
import { supabase } from '../../lib/supabaseClient';

interface SaveControlsProps {
    media?: CourseMedia;
    editingCourse?: any | null;
}

interface LessonInput {
    title: string;
    content: string;
    highlightNodeIds: string[];
}

export function SaveControls({ media, editingCourse }: SaveControlsProps) {
    const { getNodes, getEdges } = useReactFlow();
    const { addLog } = useExecutionStore();

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [lessons, setLessons] = useState<LessonInput[]>([
        { title: 'Introduction', content: 'Welcome to this interactive backend class. Click Play to start.', highlightNodeIds: [] }
    ]);
    const [isSaving, setIsSaving] = useState(false);
    const [publishedId, setPublishedId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Sync state with active editing course when it is loaded
    useEffect(() => {
        if (editingCourse) {
            setTitle(editingCourse.title || '');
            setDescription(editingCourse.description || '');
            setLessons(editingCourse.lessons || [
                { title: 'Introduction', content: 'Welcome to this interactive backend class. Click Play to start.', highlightNodeIds: [] }
            ]);
        } else {
            setTitle('');
            setDescription('');
            setLessons([
                { title: 'Introduction', content: 'Welcome to this interactive backend class. Click Play to start.', highlightNodeIds: [] }
            ]);
        }
    }, [editingCourse]);

    const nodes = getNodes();
    const edges = getEdges();

    const handleAddLesson = () => {
        setLessons([...lessons, { title: '', content: '', highlightNodeIds: [] }]);
    };

    const handleRemoveLesson = (index: number) => {
        setLessons(lessons.filter((_, i) => i !== index));
    };

    const handleLessonChange = (index: number, field: keyof LessonInput, value: any) => {
        setLessons(lessons.map((lesson, i) => {
            if (i === index) {
                return { ...lesson, [field]: value };
            }
            return lesson;
        }));
    };

    const handleToggleHighlightNode = (lessonIndex: number, nodeId: string) => {
        setLessons(lessons.map((lesson, i) => {
            if (i === lessonIndex) {
                const alreadyHighlighted = lesson.highlightNodeIds.includes(nodeId);
                const highlightNodeIds = alreadyHighlighted
                    ? lesson.highlightNodeIds.filter(id => id !== nodeId)
                    : [...lesson.highlightNodeIds, nodeId];
                return { ...lesson, highlightNodeIds };
            }
            return lesson;
        }));
    };

    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('Please enter a class title');
            return;
        }

        setIsSaving(true);
        addLog('Publishing course to database...', 'info');

        try {
            // Shape the data for Supabase
            const courseData = {
                title,
                description,
                nodes,
                edges,
                media: media || { totalDuration: 0 },
                lessons: lessons.map((l, index) => ({
                    id: l.hasOwnProperty('id') ? (l as any).id : `lesson-${Date.now()}-${index}`,
                    ...l
                })),
                simulation_events: [] // Optional extension
            };

            if (editingCourse) {
                const { data, error } = await supabase
                    .from('flowlearn_courses')
                    .update(courseData)
                    .eq('id', editingCourse.id)
                    .select();

                if (error) throw error;

                if (data && data[0]) {
                    setPublishedId(data[0].id);
                    addLog('Course updated successfully!', 'success');
                } else {
                    throw new Error('No data returned from database update.');
                }
            } else {
                const { data, error } = await supabase
                    .from('flowlearn_courses')
                    .insert([courseData])
                    .select();

                if (error) throw error;

                if (data && data[0]) {
                    setPublishedId(data[0].id);
                    addLog('Course published successfully!', 'success');
                } else {
                    throw new Error('No data returned from database insert.');
                }
            }
        } catch (error: any) {
            console.error('Failed to save course:', error);
            addLog(`Error saving: ${error.message || error}`, 'error');
            alert(`Failed to save class: ${error.message || error}`);
        } finally {
            setIsSaving(false);
        }
    };

    const shareUrl = publishedId ? `${window.location.origin}/student/course/${publishedId}` : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="absolute top-4 right-48 z-10 flex gap-2">
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20 transition-all font-semibold"
            >
                <Save size={18} />
                {editingCourse ? 'Save & Update' : 'Publish Class'}
            </button>

            {/* Modal Backdrop */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">🚀</span>
                                {editingCourse ? 'Update Your Backend Class' : 'Publish Your Backend Class'}
                            </h3>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setPublishedId(null);
                                }}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        {!publishedId ? (
                            <form onSubmit={handlePublish} className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g., Understanding Redis Cache Aside"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description / Objectives</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Introduce students to what this diagram teaches and what steps they will follow."
                                            rows={3}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Interactive Syllabus Builder */}
                                <div className="border-t border-slate-800/80 pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Syllabus Steps</h4>
                                            <p className="text-xs text-slate-400">Add slides/lessons to explain the diagram to the student step-by-step.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddLesson}
                                            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-indigo-400 px-3 py-1.5 rounded-lg border border-slate-700 transition-all font-medium"
                                        >
                                            <Plus size={14} /> Add Step
                                        </button>
                                    </div>

                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                        {lessons.map((lesson, index) => (
                                            <div key={index} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 relative group">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-indigo-400">Step {index + 1}</span>
                                                    {lessons.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveLesson(index)}
                                                            className="text-slate-500 hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-3">
                                                    <input
                                                        type="text"
                                                        value={lesson.title}
                                                        onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                                                        placeholder="Step Title"
                                                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        required
                                                    />
                                                    <input
                                                        type="text"
                                                        value={lesson.content}
                                                        onChange={(e) => handleLessonChange(index, 'content', e.target.value)}
                                                        placeholder="Short instruction details..."
                                                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        required
                                                    />
                                                </div>

                                                {/* Node Highlight Options */}
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                                        Highlight Components:
                                                    </span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {nodes.map((node) => {
                                                            const isHighlighted = lesson.highlightNodeIds.includes(node.id);
                                                            return (
                                                                <button
                                                                    key={node.id}
                                                                    type="button"
                                                                    onClick={() => handleToggleHighlightNode(index, node.id)}
                                                                    className={`px-2 py-1 rounded text-[10px] border font-medium transition-all
                                                                        ${isHighlighted
                                                                            ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500'
                                                                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                                                        }
                                                                    `}
                                                                >
                                                                    {node.data.label || node.id}
                                                                </button>
                                                            );
                                                        })}
                                                        {nodes.length === 0 && (
                                                            <span className="text-xs text-slate-500">No components placed on canvas yet.</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer buttons */}
                                <div className="border-t border-slate-800 pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-sm text-slate-400 hover:text-white font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" /> Saving...
                                            </>
                                        ) : (
                                            editingCourse ? 'Save & Update' : 'Publish Live'
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* Success Screen */
                            <div className="p-8 text-center space-y-6">
                                <div className="w-16 h-16 bg-green-950/40 text-green-400 border border-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                    <Check size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-2xl font-bold text-white">
                                        {editingCourse ? 'Your Class is Updated!' : 'Your Class is Live!'}
                                    </h4>
                                    <p className="text-slate-400 max-w-md mx-auto text-sm">
                                        Students can now watch the media, read the lessons, and interact with the live simulation diagrams!
                                    </p>
                                </div>

                                {/* Share URL Box */}
                                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl max-w-lg mx-auto flex items-center gap-3 justify-between">
                                    <span className="text-slate-300 text-xs font-mono truncate select-all flex-1 text-left">
                                        {shareUrl}
                                    </span>
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-750 transition-all shrink-0"
                                    >
                                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>

                                <div className="pt-4 flex justify-center gap-4">
                                    <button
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setPublishedId(null);
                                        }}
                                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold border border-slate-750 transition-all"
                                    >
                                        Back to Editor
                                    </button>
                                    <a
                                        href={`/student/course/${publishedId}`}
                                        className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all"
                                    >
                                        View as Student <ArrowRight size={16} />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
