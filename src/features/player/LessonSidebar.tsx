import { BookOpen, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { type Lesson } from '../../types/lesson';
import ReactMarkdown from 'react-markdown';

interface LessonSidebarProps {
    lessons: Lesson[];
    activeLessonIndex: number;
    onLessonChange: (index: number) => void;
    onClose: () => void;
}

export function LessonSidebar({ lessons, activeLessonIndex, onLessonChange, onClose }: LessonSidebarProps) {
    const currentLesson = lessons[activeLessonIndex];

    if (!currentLesson) return null;

    return (
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-xl z-20">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-indigo-50">
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                    <BookOpen size={20} />
                    <span>Learning Guide</span>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-indigo-100 rounded text-indigo-700">
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 font-prose">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{currentLesson.title}</h2>
                <div className="prose prose-sm prose-indigo text-gray-600">
                    <ReactMarkdown>{currentLesson.content}</ReactMarkdown>
                </div>
            </div>

            {/* Navigation Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <button
                    onClick={() => onLessonChange(Math.max(0, activeLessonIndex - 1))}
                    disabled={activeLessonIndex === 0}
                    className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={16} /> Previous
                </button>

                <span className="text-xs text-gray-500 font-medium">
                    {activeLessonIndex + 1} / {lessons.length}
                </span>

                <button
                    onClick={() => onLessonChange(Math.min(lessons.length - 1, activeLessonIndex + 1))}
                    disabled={activeLessonIndex === lessons.length - 1}
                    className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next <ChevronRight size={16} />
                </button>
            </div>
        </aside>
    );
}
