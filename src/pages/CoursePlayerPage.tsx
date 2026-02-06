import { useState, useMemo, useEffect } from 'react';
import ReactFlow, { Background, Controls, ReactFlowProvider, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseStore } from '../store/courseStore';
import { BackendNode } from '../nodes/BackendNode';
import { ControlPanel } from '../features/player/ControlPanel';
import { useFlowExecution } from '../features/player/useFlowExecution';
import { PacketLayer } from '../features/player/PacketLayer';
import { VideoPlayer } from '../features/player/VideoPlayer';
import { ArrowLeft, BookOpen, Video as VideoIcon } from 'lucide-react';
import { LessonSidebar } from '../features/player/LessonSidebar';
import { useExecutionStore } from '../store/executionStore';

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

    // Video Player State
    const [showVideo, setShowVideo] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Initialize execution engine
    useFlowExecution();

    const {
        setCurrentTime: setStoreTime,
        setTotalDuration: setStoreDuration,
        setIsRunning: setStoreRunning
    } = useExecutionStore();

    useEffect(() => {
        if (id) {
            const savedFlow = getFlow(id);
            if (savedFlow) {
                setFlow(savedFlow);
                setNodes(savedFlow.nodes);
                setEdges(savedFlow.edges);

                if (savedFlow.media?.totalDuration) {
                    setStoreDuration(savedFlow.media.totalDuration);
                }

                // Open lessons if available
                if (savedFlow.lessons && savedFlow.lessons.length > 0) {
                    setShowLessons(true);
                }
                // Auto-show video if media exists
                if (savedFlow.media?.video) {
                    setShowVideo(true);
                }
            } else {
                navigate('/student');
            }
        }
    }, [id, getFlow, navigate, setStoreDuration, setNodes, setEdges]);

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
    }, [showLessons, activeLessonIndex, flow, setNodes]);

    // Handle simulation events based on video time
    useEffect(() => {
        if (!flow?.simulationEvents || !isPlaying) return;

        // Find events that should trigger at current time
        const eventsToTrigger = flow.simulationEvents.filter(
            event => event.time <= currentTime && event.time > currentTime - 0.5
        );

        eventsToTrigger.forEach(event => {
            // Handle different event types
            switch (event.action) {
                case 'highlight':
                    setNodes(nds => nds.map(node => ({
                        ...node,
                        style: {
                            ...node.style,
                            opacity: node.id === event.nodeId ? 1 : 0.5,
                            filter: node.id === event.nodeId ? 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.8))' : 'none',
                            transition: 'all 0.3s ease'
                        }
                    })));
                    break;
                case 'pulse':
                    // Add pulse animation to specific node
                    setNodes(nds => nds.map(node => ({
                        ...node,
                        className: node.id === event.nodeId ? 'animate-pulse' : ''
                    })));
                    break;
            }
        });
    }, [currentTime, isPlaying, flow?.simulationEvents, setNodes]);

    const handleTimeUpdate = (time: number) => {
        setCurrentTime(time);
        setStoreTime(time);
    };

    const handlePlayStateChange = (playing: boolean) => {
        setIsPlaying(playing);
        setStoreRunning(playing);
    };

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

    const hasMedia = flow.media?.video || flow.media?.audio;

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

                <div className="flex items-center gap-2">
                    {hasMedia && (
                        <button
                            onClick={() => setShowVideo(!showVideo)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm font-medium
                                ${showVideo ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                            `}
                        >
                            <VideoIcon size={16} />
                            {showVideo ? 'Hide Video' : 'Show Video'}
                        </button>
                    )}
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

                    {/* Control Panel - only show if no video or video is hidden */}
                    {(!hasMedia || !showVideo) && <ControlPanel />}
                </div>

                {/* Video Player Overlay */}
                {showVideo && hasMedia && (
                    <div className="absolute top-4 right-4 w-[480px] z-20">
                        <VideoPlayer
                            videoUrl={flow.media?.video?.url}
                            audioUrl={flow.media?.audio?.url}
                            duration={flow.media?.totalDuration || 0}
                            onTimeUpdate={handleTimeUpdate}
                            onPlayStateChange={handlePlayStateChange}
                            className="shadow-2xl"
                        />
                    </div>
                )}

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
