import { Save } from 'lucide-react';
import { useReactFlow } from 'reactflow';
import { useCourseStore } from '../../store/courseStore';
import { useExecutionStore } from '../../store/executionStore';
import { type CourseMedia } from '../../types/media';

interface SaveControlsProps {
    media?: CourseMedia;
}

export function SaveControls({ media }: SaveControlsProps) {
    const { getNodes, getEdges } = useReactFlow();
    const { saveFlow } = useCourseStore();
    const { addLog } = useExecutionStore();

    const handleSave = () => {
        const nodes = getNodes();
        const edges = getEdges();

        // Validate that we have media before saving
        if (!media?.video && !media?.audio) {
            addLog('Please upload video or audio before saving', 'error');
            alert('Please upload at least a video or audio file before saving the course');
            return;
        }

        // Simple save implementation - saves as a new unique flow every time for now or updates fixed ID
        // Ideally we would have a flow ID in the URL.
        const newFlow = {
            id: `flow-${Date.now()}`,
            title: 'Custom Flow ' + new Date().toLocaleTimeString(),
            description: 'Created in Instructor Builder',
            nodes,
            edges,
            media, // Include the uploaded media
        };

        saveFlow(newFlow);
        addLog('Flow saved successfully with media!', 'success');
    };

    return (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-colors font-medium"
            >
                <Save size={18} />
                Save Flow
            </button>
        </div>
    );
}
