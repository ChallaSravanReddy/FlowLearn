import { useState } from 'react';
import { BuilderCanvas } from '../features/builder/BuilderCanvas';
import { BuilderSidebar } from '../features/builder/BuilderSidebar';
import { TemplateGallery } from '../features/builder/TemplateGallery';
import { type Template } from '../data/templates';

export function BuilderPage() {
    const [showTemplates, setShowTemplates] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);

    const handleTemplateSelect = (template: Template) => {
        // Create deep copy to ensure new object reference for useEffect in Canvas
        const templateCopy = JSON.parse(JSON.stringify(template));
        setCurrentTemplate(templateCopy);
        setShowTemplates(false);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            <BuilderSidebar onOpenTemplates={() => setShowTemplates(true)} />
            <BuilderCanvas template={currentTemplate} />

            {showTemplates && (
                <TemplateGallery
                    onSelect={handleTemplateSelect}
                    onClose={() => setShowTemplates(false)}
                />
            )}
        </div>
    );
}
