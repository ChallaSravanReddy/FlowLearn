import { X, PlayCircle, Layers, GitMerge } from 'lucide-react';
import { templates, type Template } from '../../data/templates';

interface TemplateGalleryProps {
    onSelect: (template: Template) => void;
    onClose: () => void;
}

export function TemplateGallery({ onSelect, onClose }: TemplateGalleryProps) {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Architecture Templates</h2>
                        <p className="text-gray-500 text-sm">Jumpstart your learning with pre-built patterns</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto grid md:grid-cols-2 gap-6 flex-1">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                            onClick={() => onSelect(template)}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-2 rounded-lg 
                                    ${template.difficulty === 'beginner' ? 'bg-green-100 text-green-700' : ''}
                                    ${template.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-700' : ''}
                                    ${template.difficulty === 'advanced' ? 'bg-purple-100 text-purple-700' : ''}
                                `}>
                                    {template.id === 'simple-api' && <PlayCircle size={20} />}
                                    {template.id === 'caching-pattern' && <Layers size={20} />}
                                    {template.id === 'microservices' && <GitMerge size={20} />}
                                    {template.id === 'msg-queue' && <Layers size={20} />}
                                </div>
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {template.title}
                                </h3>
                            </div>

                            <p className="text-gray-600 text-sm mb-4 h-10 line-clamp-2">
                                {template.description}
                            </p>

                            <div className="flex items-center justify-between text-xs">
                                <span className="uppercase tracking-wider font-semibold text-gray-500">
                                    {template.difficulty}
                                </span>
                                <span className="text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    Load Template →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
