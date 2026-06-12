import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import ReactFlow, { Background, Controls, ReactFlowProvider, useNodesState, useEdgesState, addEdge, type Connection, type Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { useParams, useNavigate } from 'react-router-dom';
import { BackendNode } from '../nodes/BackendNode';
import { ControlPanel } from '../features/player/ControlPanel';
import { useFlowExecution } from '../features/player/useFlowExecution';
import { PacketLayer } from '../features/player/PacketLayer';
import { VideoPlayer } from '../features/player/VideoPlayer';
import { ArrowLeft, Video as VideoIcon, Sparkles, MousePointerClick, GripHorizontal, X } from 'lucide-react';
import { useExecutionStore } from '../store/executionStore';
import { supabase } from '../lib/supabaseClient';
import { StudentExperimentPanel } from '../features/player/StudentExperimentPanel';
import { type NodeProperties } from '../types/node';
import { isValidConnectionRule } from '../utils/connectionValidation';

function CoursePlayerContent() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Course Loading States
    const [flow, setFlow] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Hands-on properties state
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

    // Lesson State (sidebar removed — kept for future use)
    const [activeLessonIndex] = useState(0);

    // Video Player State
    const [showVideo, setShowVideo] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);

    // Draggable Video Player State
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const positionStart = useRef({ x: 0, y: 0 });

    // Initialize position on mount/load
    useEffect(() => {
        if (showVideo && !position) {
            const parent = document.getElementById('player-container');
            if (parent) {
                const parentRect = parent.getBoundingClientRect();
                const initialX = parentRect.width - 480 - 16;
                const initialY = 16;
                setPosition({ x: initialX, y: initialY });
            }
        }
    }, [showVideo, position]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only drag with left click
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        positionStart.current = position || { x: window.innerWidth - 480 - 16, y: 16 };
        e.preventDefault();
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length !== 1) return;
        setIsDragging(true);
        dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        positionStart.current = position || { x: window.innerWidth - 480 - 16, y: 16 };
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const parent = document.getElementById('player-container');
            const player = document.getElementById('draggable-video-container');
            if (!parent || !player) return;

            const parentRect = parent.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();

            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;

            let newX = positionStart.current.x + dx;
            let newY = positionStart.current.y + dy;

            // Clamp bounds
            const maxX = parentRect.width - playerRect.width;
            const maxY = parentRect.height - playerRect.height;

            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            setPosition({ x: newX, y: newY });
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length !== 1) return;
            const parent = document.getElementById('player-container');
            const player = document.getElementById('draggable-video-container');
            if (!parent || !player) return;

            const parentRect = parent.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();

            const dx = e.touches[0].clientX - dragStart.current.x;
            const dy = e.touches[0].clientY - dragStart.current.y;

            let newX = positionStart.current.x + dx;
            let newY = positionStart.current.y + dy;

            const maxX = parentRect.width - playerRect.width;
            const maxY = parentRect.height - playerRect.height;

            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging]);

    // Resize Handler
    useEffect(() => {
        const handleResize = () => {
            if (!position) return;
            const parent = document.getElementById('player-container');
            const player = document.getElementById('draggable-video-container');
            if (!parent || !player) return;

            const parentRect = parent.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();

            setPosition(prev => {
                if (!prev) return null;
                const maxX = parentRect.width - playerRect.width;
                const maxY = parentRect.height - playerRect.height;
                return {
                    x: Math.max(0, Math.min(prev.x, maxX)),
                    y: Math.max(0, Math.min(prev.y, maxY))
                };
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [position]);

    // Initialize execution engine
    useFlowExecution();

    const {
        isRunning,
        setCurrentTime: setStoreTime,
        setTotalDuration: setStoreDuration
    } = useExecutionStore();

    // Fetch Course from Supabase
    useEffect(() => {
        if (!id) return;

        async function fetchCourseFlow() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('flowlearn_courses')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                if (data) {
                    setFlow(data);
                    setNodes(data.nodes || []);
                    setEdges(data.edges || []);

                    if (data.media?.totalDuration) {
                        setStoreDuration(data.media.totalDuration);
                    }

                    // Lesson sidebar removed from student view
                    // Auto-show video if media exists
                    if (data.media?.video) {
                        setShowVideo(true);
                    }
                }
            } catch (err) {
                console.error('Failed to load course from Supabase:', err);
                alert('Failed to load course from Supabase database.');
                navigate('/student');
            } finally {
                setLoading(false);
            }
        }

        fetchCourseFlow();
    }, [id, navigate, setStoreDuration, setNodes, setEdges]);

    // Node highlight effect driven by activeLessonIndex (sidebar hidden but logic preserved)
    useEffect(() => {
        setNodes(nds => nds.map(node => ({
            ...node,
            style: { ...node.style, opacity: 1, filter: 'none' }
        })));
    }, [activeLessonIndex, setNodes]);

    // Handle simulation events based on video time
    useEffect(() => {
        if (!flow?.simulationEvents || !isRunning) return;

        // Find events that should trigger at current time
        const eventsToTrigger = flow.simulationEvents.filter(
            (event: any) => event.time <= currentTime && event.time > currentTime - 0.5
        );

        eventsToTrigger.forEach((event: any) => {
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
                    setNodes(nds => nds.map(node => ({
                        ...node,
                        className: node.id === event.nodeId ? 'animate-pulse' : ''
                    })));
                    break;
            }
        });
    }, [currentTime, isRunning, flow?.simulationEvents, setNodes]);

    const handleTimeUpdate = (time: number) => {
        setCurrentTime(time);
        setStoreTime(time);
    };

    const handlePlayStateChange = () => {
        // Handled directly via useExecutionStore subscription
    };

    // Hands-on controls
    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
    }, []);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
        [setEdges]
    );

    const isValidConnection = useCallback(
        (connection: Connection) => {
            const sourceNode = nodes.find(n => n.id === connection.source);
            const targetNode = nodes.find(n => n.id === connection.target);
            if (!sourceNode || !targetNode) return false;

            const sourceType = sourceNode.data?.type || sourceNode.type || '';
            const targetType = targetNode.data?.type || targetNode.type || '';

            return isValidConnectionRule(sourceType, targetType);
        },
        [nodes]
    );

    const handleNodePropertiesUpdate = useCallback((nodeId: string, properties: Partial<NodeProperties>) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === nodeId) {
                return {
                    ...node,
                    data: { ...node.data, ...properties }
                };
            }
            return node;
        }));
    }, [setNodes]);

    const nodeTypes = useMemo(() => ({
        client: BackendNode,
        api: BackendNode,
        service: BackendNode,
        server: BackendNode,
        serverless: BackendNode,
        database: BackendNode,
        cache: BackendNode,
        queue: BackendNode,
        broker: BackendNode,
        loadbalancer: BackendNode,
        cdn: BackendNode,
        dns: BackendNode,
        waf: BackendNode,
        firewall: BackendNode,
        auth: BackendNode,
        storage: BackendNode,
        search: BackendNode,
        worker: BackendNode,
        notification: BackendNode,
    }), []);

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 font-medium">Syncing class sandbox from database...</p>
            </div>
        );
    }

    if (!flow) {
        return <div className="p-8 text-center text-gray-500">Failed to load class.</div>;
    }

    const hasMedia = flow.media?.video || flow.media?.audio;

    return (
        <div className="h-screen w-full flex bg-slate-950 flex-col">
            {/* Header */}
            <div className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/student')}
                        className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            {flow.title}
                            <span className="flex items-center gap-1 text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">
                                <Sparkles size={10} /> Live Sandbox
                            </span>
                        </h1>
                        <p className="text-xs text-slate-400">{flow.description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {hasMedia && (
                        <button
                            onClick={() => setShowVideo(!showVideo)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors text-xs font-semibold
                                ${showVideo
                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                                }
                            `}
                        >
                            <VideoIcon size={14} />
                            {showVideo ? 'Hide Video' : 'Show Video'}
                        </button>
                    )}

                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative" id="player-container">
                {/* Main Canvas */}
                <div className="flex-1 h-full relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        isValidConnection={isValidConnection}
                        fitView
                    >
                        <Background color="#334155" gap={16} size={1} />
                        <Controls className="bg-slate-900 border border-slate-800 text-white rounded shadow-md" />
                        <PacketLayer />
                    </ReactFlow>

                    {/* Control Panel - only show if no video or video is hidden */}
                    {(!hasMedia || !showVideo) && <ControlPanel />}
                </div>

                {/* Video Player Overlay */}
                {showVideo && hasMedia && (
                    <div
                        id="draggable-video-container"
                        className="absolute z-20 w-[480px] rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden transition-shadow duration-200"
                        style={position ? { left: `${position.x}px`, top: `${position.y}px` } : { top: '16px', right: '16px' }}
                    >
                        {/* Drag Handle Header */}
                        <div
                            onMouseDown={handleMouseDown}
                            onTouchStart={handleTouchStart}
                            className="h-10 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 cursor-grab active:cursor-grabbing select-none"
                        >
                            <div className="flex items-center gap-2 text-slate-400">
                                <GripHorizontal size={16} className="text-slate-500" />
                                <span className="text-xs font-semibold text-slate-300">Walkthrough Lesson</span>
                            </div>
                            <button
                                onClick={() => setShowVideo(false)}
                                className="p-1 hover:bg-slate-800/80 rounded text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Video Player */}
                        <VideoPlayer
                            videoUrl={flow.media?.video?.url}
                            audioUrl={flow.media?.audio?.url}
                            duration={flow.media?.totalDuration || 0}
                            onTimeUpdate={handleTimeUpdate}
                            onPlayStateChange={handlePlayStateChange}
                            className="aspect-video w-full rounded-t-none rounded-b-2xl shadow-none border-none"
                        />
                    </div>
                )}



                {/* Click-to-experiment hint — only shown when nothing is selected */}
                {!selectedNode && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 rounded-full px-4 py-2 shadow-xl animate-bounce">
                            <MousePointerClick size={14} className="text-indigo-400" />
                            <span className="text-xs text-slate-300 font-medium whitespace-nowrap">
                                Click any component to experiment with its settings!
                            </span>
                        </div>
                    </div>
                )}

                {/* Student Experiment Panel — appears when a node is selected */}
                {selectedNode && (
                    <div className="absolute top-4 left-4 z-20">
                        <StudentExperimentPanel
                            key={selectedNode.id}
                            node={selectedNode}
                            onClose={() => setSelectedNodeId(null)}
                            onUpdate={handleNodePropertiesUpdate}
                        />
                    </div>
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
