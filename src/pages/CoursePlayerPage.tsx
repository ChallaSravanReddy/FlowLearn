import { useEffect, useMemo } from 'react';
import ReactFlow, { Background, Controls, ReactFlowProvider, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';
import { BackendNode } from '../nodes/BackendNode';
import { ControlPanel } from '../features/player/ControlPanel';
import { PacketLayer } from '../features/player/PacketLayer';
import { useFlowExecution } from '../features/player/useFlowExecution';

function CourseContent() {
    const { id } = useParams<{ id: string }>();
    const { getFlow } = useCourseStore();
    const flow = useMemo(() => id ? getFlow(id) : undefined, [id, getFlow]);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges] = useEdgesState([]);

    useEffect(() => {
        if (flow) {
            setNodes(flow.nodes);
            setEdges(flow.edges);
        }
    }, [flow, setNodes, setEdges]);

    // Read-Only: We don't implement onConnect or onDrop
    // We still use the execution engine
    useFlowExecution();

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
        return <div className="p-10 text-center">Course not found</div>;
    }

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Lesson Content Sidebar */}
            <aside className="w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto p-6">
                <Link to="/student" className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
                    <ArrowLeft size={16} /> Back to Courses
                </Link>

                <h1 className="text-2xl font-bold text-gray-900 mb-4">{flow.title}</h1>
                <div className="prose prose-sm prose-blue">
                    <p className="text-gray-600">{flow.description}</p>
                    <hr className="my-6 border-gray-100" />

                    <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
                    <ul className="list-disc pl-4 space-y-2 text-gray-600">
                        <li>Click <strong>Play</strong> to start the simulation.</li>
                        <li>Observe the blue request packets moving from the Client.</li>
                        <li>Use <strong>Pause</strong> to freeze time and analyze the state.</li>
                    </ul>
                </div>
            </aside>

            {/* Read-Only Canvas */}
            <div className="flex-1 bg-gray-50 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange} // Allow dragging for visibility? Or strictly readonly?
                    // Let's allow dragging to rearrange view, but not saving it.
                    // No connect, no add/delete.
                    nodeTypes={nodeTypes}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    fitView
                >
                    <Background gap={16} size={1} />
                    <Controls />
                </ReactFlow>
                <PacketLayer />
                <ControlPanel />
            </div>
        </div>
    );
}

export function CoursePlayerPage() {
    return (
        <ReactFlowProvider>
            <CourseContent />
        </ReactFlowProvider>
    )
}
