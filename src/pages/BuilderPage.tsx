import { useState } from 'react';
import { Film } from 'lucide-react';
import { BuilderCanvas } from '../features/builder/BuilderCanvas';
import { BuilderSidebar } from '../features/builder/BuilderSidebar';
import { TemplateGallery } from '../features/builder/TemplateGallery';
import { MediaUploader } from '../features/builder/MediaUploader';
import { type Template } from '../data/templates';
import { type CourseMedia } from '../types/media';

export function BuilderPage() {
    const [showTemplates, setShowTemplates] = useState(false);
    const [showMediaUploader, setShowMediaUploader] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
    const [courseMedia, setCourseMedia] = useState<CourseMedia>({ totalDuration: 0 });

    const handleTemplateSelect = (template: Template) => {
        // Create deep copy to ensure new object reference for useEffect in Canvas
        const templateCopy = JSON.parse(JSON.stringify(template));
        setCurrentTemplate(templateCopy);
        setShowTemplates(false);
    };

    const handleMediaUpdate = (media: CourseMedia) => {
        setCourseMedia(media);
        console.log('Media updated:', media);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Sidebar */}
            <BuilderSidebar onOpenTemplates={() => setShowTemplates(true)} />

            {/* Main Canvas */}
            <div className="flex-1 relative">
                <BuilderCanvas template={currentTemplate} media={courseMedia} />

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

            {/* Modals */}
            {showTemplates && (
                <TemplateGallery
                    onSelect={handleTemplateSelect}
                    onClose={() => setShowTemplates(false)}
                />
            )}

            {showMediaUploader && (
                <MediaUploader
                    isOpen={showMediaUploader}
                    onClose={() => setShowMediaUploader(false)}
                    onMediaUpdate={handleMediaUpdate}
                    initialMedia={courseMedia}
                />
            )}
        </div>
    );
}
