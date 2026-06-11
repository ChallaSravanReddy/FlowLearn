import { useCallback, useRef, useMemo, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    type Connection,
    type Node,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { BackendNode } from '../../nodes/BackendNode';
import { ControlPanel } from '../../features/player/ControlPanel';
import { useFlowExecution } from '../../features/player/useFlowExecution';
import { PacketLayer } from '../../features/player/PacketLayer';
import { SaveControls } from './SaveControls';
import { NodePropertiesPanel } from './NodePropertiesPanel';
import { type NodeProperties } from '../../types/node';
import { X } from 'lucide-react';

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'client',
        data: { label: 'User Mobile', type: 'client' },
        position: { x: 100, y: 200 },
    },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

import { type Template } from '../../data/templates';
import { type CourseMedia } from '../../types/media';
import { isValidConnectionRule } from '../../utils/connectionValidation';

interface BuilderCanvasProps {
    template?: Template | null;
    editingCourse?: any | null;
    onClearEditingCourse?: () => void;
    media?: CourseMedia;
}

function BuilderCanvasContent({ template, editingCourse, onClearEditingCourse, media }: BuilderCanvasProps) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Load template when it changes
    useEffect(() => {
        if (template) {
            setNodes(template.nodes);
            setEdges(template.edges);
        }
    }, [template, setNodes, setEdges]);

    // Load course when it changes
    useEffect(() => {
        if (editingCourse) {
            setNodes(editingCourse.nodes || []);
            setEdges(editingCourse.edges || []);
        }
    }, [editingCourse, setNodes, setEdges]);
    const selectedNode = useMemo(() => nodes.find((n) => n.selected) || null, [nodes]);
    const selectedEdge = useMemo(() => edges.find((e) => e.selected) || null, [edges]);
    const { project } = useReactFlow();

    // Initialize execution engine
    useFlowExecution();

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

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();

            if (!reactFlowBounds) return;

            const position = project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            const newNode: Node = {
                id: getId(),
                type: type,
                position,
                data: { label: `New ${type}`, type: type },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [project, setNodes]
    );

    // Selection is tracked automatically via nodes.find(n => n.selected)

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

    return (
        <div className="flex-1 h-full w-full bg-gray-50 relative" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDragOver={onDragOver}
                onDrop={onDrop}
                nodeTypes={nodeTypes}
                isValidConnection={isValidConnection}
                fitView
            >
                <Background gap={16} size={1} />
                <Controls />
                <PacketLayer />
            </ReactFlow>

            {editingCourse && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-indigo-900/90 backdrop-blur-sm border border-indigo-700/50 rounded-xl px-4 py-2 flex items-center gap-3 shadow-xl">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-xs text-indigo-100 font-medium">
                            Editing: <strong className="text-white font-semibold">{editingCourse.title}</strong>
                        </span>
                    </div>
                    <button
                        onClick={onClearEditingCourse}
                        className="text-[10px] bg-slate-900/60 hover:bg-slate-900 text-indigo-300 hover:text-white px-2.5 py-1 rounded-lg transition-all border border-indigo-800/30 font-bold"
                    >
                        Start Fresh (New Class)
                    </button>
                </div>
            )}

            <ControlPanel />
            <SaveControls media={media} editingCourse={editingCourse} />
            {selectedNode ? (
                <NodePropertiesPanel
                    key={selectedNode.id}
                    node={selectedNode}
                    onClose={() => {
                        setNodes((nds) => nds.map((n) => n.id === selectedNode.id ? { ...n, selected: false } : n));
                    }}
                    onUpdate={handleNodePropertiesUpdate}
                    onDelete={(nodeId) => {
                        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
                        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
                    }}
                />
            ) : selectedEdge ? (
                <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 flex flex-col p-4 gap-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 text-sm">Connection</h3>
                        <button
                            onClick={() => {
                                setEdges((eds) => eds.map((e) => e.id === selectedEdge.id ? { ...e, selected: false } : e));
                            }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <p className="text-xs text-gray-600">
                        Connects <strong className="text-gray-900">{nodes.find(n => n.id === selectedEdge.source)?.data.label || 'Node'}</strong> to <strong className="text-gray-900">{nodes.find(n => n.id === selectedEdge.target)?.data.label || 'Node'}</strong>.
                    </p>
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to delete this connection?')) {
                                setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
                            }
                        }}
                        className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shadow"
                    >
                        Delete Connection
                    </button>
                </div>
            ) : null}
        </div>
    );
}

export function BuilderCanvas({ template, editingCourse, onClearEditingCourse, media }: BuilderCanvasProps) {
    return (
        <ReactFlowProvider>
            <BuilderCanvasContent
                template={template}
                editingCourse={editingCourse}
                onClearEditingCourse={onClearEditingCourse}
                media={media}
            />
        </ReactFlowProvider>
    );
}
