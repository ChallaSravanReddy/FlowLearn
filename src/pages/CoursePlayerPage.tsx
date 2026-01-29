import { useState, useMemo, useEffect } from 'react';
import ReactFlow, { Background, Controls, ReactFlowProvider, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseStore } from '../store/courseStore';
import { BackendNode } from '../nodes/BackendNode';
import { ControlPanel } from '../features/player/ControlPanel';
import { useFlowExecution } from '../features/player/useFlowExecution';
import { PacketLayer } from '../features/player/PacketLayer';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { LessonSidebar } from '../features/player/LessonSidebar';

function CoursePlayerContent() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const getFlow = useCourseStore((state) => state.getFlow);

    // State
    const [flow, setFlow] = useState(id ? getFlow(id) : undefined);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Lesson State
    const [showLessons, setShowLessons] = useState(false);
    const [activeLessonIndex, setActiveLessonIndex] = useState(0);

    // Initialize execution engine
    useFlowExecution();

    useEffect(() => {
        if (id) {
            const savedFlow = getFlow(id);
            if (savedFlow) {
                setFlow(savedFlow);
                setNodes(savedFlow.nodes);
                setEdges(savedFlow.edges);
                // Open lessons if available
                if (savedFlow.lessons && savedFlow.lessons.length > 0) {
                    setShowLessons(true);
                }
            } else {
                navigate('/student');
            }
        }
    }, [id, getFlow, navigate]);

    // Handle lesson node highlighting
    useEffect(() => {
        if (showLessons && flow?.lessons && flow.lessons[activeLessonIndex]) {
            const highlightIds = flow.lessons[activeLessonIndex].highlightNodeIds || [];

            setNodes(nds => nds.map(node => ({
                ...node,
                style: {
                    ...node.style,
                    opacity: highlightIds.length === 0 || highlightIds.includes(node.id) ? 1 : 0.3,
                    filter: highlightIds.length === 0 || highlightIds.includes(node.id) ? 'none' : 'grayscale(100%)',
                    transition: 'all 0.3s ease'
                }
            })));
        } else {
            // Reset styles
            setNodes(nds => nds.map(node => ({
                ...node,
                style: { ...node.style, opacity: 1, filter: 'none' }
            })));
        }
    }, [showLessons, activeLessonIndex, flow]);

    const nodeTypes = useMemo(() => ({
        client: BackendNode,
        api: BackendNode,
        service: BackendNode,
        database: BackendNode,
        cache: BackendNode,
        queue: BackendNode,
        loadbalancer: BackendNode,
        cdn: BackendNode,
    }), []);

    if (!flow) {
        return <div className="p-8 text-center text-gray-500">Loading flow...</div>;
    }

    return (
        <div className="h-screen w-full flex bg-gray-50 flex-col">
            {/* Header */}
            <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/student')}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{flow.title}</h1>
                        <p className="text-xs text-gray-500">{flow.description}</p>
                    </div>
                </div>

                {flow.lessons && flow.lessons.length > 0 && (
                    <button
                        onClick={() => setShowLessons(!showLessons)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm font-medium
                            ${showLessons ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                        `}
                    >
                        <BookOpen size={16} />
                        {showLessons ? 'Hide Lessons' : 'Show Lessons'}
                    </button>
                )}
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Main Canvas */}
                <div className="flex-1 h-full relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        fitView
                    >
                        <Background gap={16} size={1} />
                        <Controls />
                        <PacketLayer />
                    </ReactFlow>
                    <ControlPanel />
                </div>

                {/* Lesson Sidebar */}
                {showLessons && flow.lessons && (
                    <LessonSidebar
                        lessons={flow.lessons}
                        activeLessonIndex={activeLessonIndex}
                        onLessonChange={setActiveLessonIndex}
                        onClose={() => setShowLessons(false)}
                    />
                )}
            </div>
        </div>
    );
}

export function CoursePlayerPage() {
    return (
        <ReactFlowProvider>
            <CoursePlayerContent />
        </ReactFlowProvider>
    )
}
