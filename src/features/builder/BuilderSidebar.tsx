import { Database, Server, Globe, Smartphone, Layers, Timer, GitMerge, Cloud, LayoutTemplate } from 'lucide-react';

interface BuilderSidebarProps {
    onOpenTemplates: () => void;
}

export function BuilderSidebar({ onOpenTemplates }: BuilderSidebarProps) {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Layers size={18} /> Component Library
                </h2>
                <p className="text-xs text-gray-500 mt-1 mb-3">Drag components to the canvas</p>

                <button
                    onClick={onOpenTemplates}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md hover:bg-indigo-100 transition-colors text-sm font-medium"
                >
                    <LayoutTemplate size={16} />
                    Browse Templates
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <DraggableNode
                    type="client"
                    label="Client / User"
                    icon={<Smartphone size={16} />}
                    color="border-blue-500 bg-blue-50 text-blue-700"
                    onDragStart={onDragStart}
                />
                <DraggableNode
                    type="api"
                    label="API Gateway"
                    icon={<Globe size={16} />}
                    color="border-purple-500 bg-purple-50 text-purple-700"
                    onDragStart={onDragStart}
                />
                <DraggableNode
                    type="service"
                    label="Backend Service"
                    icon={<Server size={16} />}
                    color="border-indigo-500 bg-indigo-50 text-indigo-700"
                    onDragStart={onDragStart}
                />
                <DraggableNode
                    type="database"
                    label="Database"
                    icon={<Database size={16} />}
                    color="border-green-500 bg-green-50 text-green-700"
                    onDragStart={onDragStart}
                />
                <DraggableNode
                    type="cache"
                    label="Cache (Redis)"
                    icon={<Layers size={16} />}
                    color="border-orange-500 bg-orange-50 text-orange-700"
                    onDragStart={onDragStart}
                />
                <DraggableNode
                    type="queue"
                    label="Message Queue"
                    icon={<Timer size={16} />}
                    color="border-pink-500 bg-pink-50 text-pink-700"
                    onDragStart={onDragStart}
                />
                <DraggableNode
                    type="load_balancer"
                    label="Load Balancer"
                    icon={<GitMerge size={16} />}
                    color="border-teal-500 bg-teal-50 text-teal-700"
                    onDragStart={onDragStart}
                />
                <DraggableNode
                    type="cdn"
                    label="CDN"
                    icon={<Cloud size={16} />}
                    color="border-sky-500 bg-sky-50 text-sky-700"
                    onDragStart={onDragStart}
                />
            </div>
        </aside>
    );
}

interface DraggableNodeProps {
    type: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

function DraggableNode({ type, label, icon, color, onDragStart }: DraggableNodeProps) {
    return (
        <div
            className={`p-3 rounded-lg border cursor-grab hover:shadow-md transition-all flex items-center gap-3 ${color}`}
            draggable
            onDragStart={(event) => onDragStart(event, type)}
        >
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </div>
    );
}
