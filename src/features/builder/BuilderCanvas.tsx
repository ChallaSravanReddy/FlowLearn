import { useCallback, useRef, useMemo, useState, useEffect } from 'react';
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

interface BuilderCanvasProps {
    template?: Template | null;
}

function BuilderCanvasContent({ template }: BuilderCanvasProps) {
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
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);
    const { project } = useReactFlow();

    // Initialize execution engine
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

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
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

    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node<NodeProperties>) => {
        setSelectedNodeId(node.id);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
    }, []);

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
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background gap={16} size={1} />
                <Controls />
            </ReactFlow>
            <PacketLayer />
            <ControlPanel />
            <SaveControls />
            {selectedNode && (
                <NodePropertiesPanel
                    key={selectedNode.id}
                    node={selectedNode}
                    onClose={() => setSelectedNodeId(null)}
                    onUpdate={handleNodePropertiesUpdate}
                />
            )}
        </div>
    );
}

export function BuilderCanvas({ template }: BuilderCanvasProps) {
    return (
        <ReactFlowProvider>
            <BuilderCanvasContent template={template} />
        </ReactFlowProvider>
    );
}
