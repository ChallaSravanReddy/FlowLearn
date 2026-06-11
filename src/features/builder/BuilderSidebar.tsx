import { Database, Server, Globe, Smartphone, Layers, Timer, GitMerge, Cloud, LayoutTemplate, Compass, ShieldAlert, Lock, HardDrive, Search, Cpu, Bell, Zap, Radio, Shield, FolderOpen } from 'lucide-react';

interface BuilderSidebarProps {
    onOpenTemplates: () => void;
    onOpenCourseManager: () => void;
}

export function BuilderSidebar({ onOpenTemplates, onOpenCourseManager }: BuilderSidebarProps) {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 space-y-2">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Layers size={18} /> Component Library
                </h2>
                <p className="text-xs text-gray-500 mt-1 mb-3">Drag components to the canvas</p>

                <button
                    onClick={onOpenTemplates}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-750 px-3 py-2 rounded-md hover:bg-indigo-100 transition-colors text-sm font-medium"
                >
                    <LayoutTemplate size={16} />
                    Browse Templates
                </button>

                <button
                    onClick={onOpenCourseManager}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-3 py-2 rounded-md hover:bg-slate-200 transition-colors text-sm font-medium"
                >
                    <FolderOpen size={16} />
                    Manage Classes
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Client & Edge */}
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Client & Edge</h3>
                    <div className="space-y-2">
                        <DraggableNode
                            type="client"
                            label="Client / User"
                            icon={<Smartphone size={15} />}
                            color="border-blue-500 bg-blue-50/50 text-blue-700 hover:bg-blue-50"
                            onDragStart={onDragStart}
                        />
                        <DraggableNode
                            type="dns"
                            label="DNS Server"
                            icon={<Compass size={15} />}
                            color="border-cyan-500 bg-cyan-50/50 text-cyan-700 hover:bg-cyan-50"
                            onDragStart={onDragStart}
                        />
                        <DraggableNode
                            type="cdn"
                            label="CDN Edge"
                            icon={<Cloud size={15} />}
                            color="border-sky-500 bg-sky-50/50 text-sky-700 hover:bg-sky-50"
                            onDragStart={onDragStart}
                        />
                        <DraggableNode
                            type="waf"
                            label="Firewall (WAF)"
                            icon={<ShieldAlert size={15} />}
                            color="border-red-500 bg-red-50/50 text-red-700 hover:bg-red-50"
                            onDragStart={onDragStart}
                        />
                        <DraggableNode
                            type="firewall"
                            label="Network Firewall"
                            icon={<Shield size={15} />}
                            color="border-red-500 bg-red-50/50 text-red-700 hover:bg-red-50"
                            onDragStart={onDragStart}
                        />
                    </div>
                </div>

                {/* Routing & Gateway */}
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Routing & Gateway</h3>
                    <div className="space-y-2">
                        <DraggableNode
                            type="loadbalancer"
                            label="Load Balancer"
                            icon={<GitMerge size={15} />}
                            color="border-teal-500 bg-teal-50/50 text-teal-700 hover:bg-teal-50"
                            onDragStart={onDragStart}
                        />
                        <DraggableNode
                            type="api"
                            label="API Gateway"
                            icon={<Globe size={15} />}
                            color="border-purple-500 bg-purple-50/50 text-purple-700 hover:bg-purple-50"
                            onDragStart={onDragStart}
                        />
                        <DraggableNode
                            type="auth"
                            label="Auth Service"
                            icon={<Lock size={15} />}
                            color="border-emerald-500 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50"
                            onDragStart={onDragStart}
                        />
                    </div>
                </div>

                {/* Compute & Logic */}
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Compute & Logic</h3>
                    <div className="space-y-2">
                        <DraggableNode
                            type="service"
                            label="Backend Service"
                            icon={<Server size={15} />}
                            color="border-indigo-500 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-50"
                            onDragStart={onDragStart}
                        />
                        <DraggableNode
                            type="server"
                            label="VM Server"
                            icon={<HardDrive size={15} />}
                            color="border-blue-500 bg-blue-50/50 text-blue-700 hover:bg-blue-50"
                            onDragStart={onDragStart}
                        />
                        <DraggableNode
                            type="serverless"
                            label="Serverless Function"
                            icon={<Zap size={15} />}
                            color="border-amber-500 bg-amber-50/50 text-amber-700 hover:bg-amber-50"
                            onDragStart={onDragStart}
                        />
                        <DraggableNode
                            type="worker"
                            label="Background Worker"
                            icon={<Cpu size={15} />}
                            color="border-fuchsia-500 bg-fuchsia-50/50 text-fuchsia-700 hover:bg-fuchsia-50"
                            onDragStart={onDragStart}
                        />
                        <DraggableNode
                            type="queue"
                            label="Message Queue"
                            icon={<Timer size={15} />}
                            color="border-pink-500 bg-pink-50/50 text-pink-700 hover:bg-pink-50"
                            onDragStart={onDragStart}
                        />
                        <DraggableNode
                            type="broker"
                            label="Message Broker"
                            icon={<Radio size={15} />}
                            color="border-pink-500 bg-pink-50/50 text-pink-700 hover:bg-pink-50"
                            onDragStart={onDragStart}
                        />
                    </div>
                </div>

                {/* Data & Storage */}
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Data & Storage</h3>
                    <div className="space-y-2">
                        <DraggableNode
                            type="database"
                            label="Database (SQL)"
                            icon={<Database size={15} />}
                            color="border-green-500 bg-green-50/50 text-green-700 hover:bg-green-50"
                            onDragStart={onDragStart}
                        />
                        <DraggableNode
                            type="cache"
                            label="Cache (Redis)"
                            icon={<Layers size={15} />}
                            color="border-orange-500 bg-orange-50/50 text-orange-700 hover:bg-orange-50"
                            onDragStart={onDragStart}
                        />
                        <DraggableNode
                            type="storage"
                            label="Object Storage (S3)"
                            icon={<HardDrive size={15} />}
                            color="border-blue-400 bg-blue-50/30 text-blue-800 hover:bg-blue-50"
                            onDragStart={onDragStart}
                        />
                        <DraggableNode
                            type="search"
                            label="Search Index"
                            icon={<Search size={15} />}
                            color="border-violet-500 bg-violet-50/50 text-violet-700 hover:bg-violet-50"
                            onDragStart={onDragStart}
                        />
                    </div>
                </div>

                {/* Integrations */}
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Integrations</h3>
                    <div className="space-y-2">
                        <DraggableNode
                            type="notification"
                            label="Notification Hub"
                            icon={<Bell size={15} />}
                            color="border-amber-500 bg-amber-50/50 text-amber-700 hover:bg-amber-50"
                            onDragStart={onDragStart}
                        />
                    </div>
                </div>
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
            className={`p-2.5 rounded-lg border cursor-grab hover:shadow-sm transition-all flex items-center gap-2.5 ${color}`}
            draggable
            onDragStart={(event) => onDragStart(event, type)}
        >
            <div className="shrink-0">{icon}</div>
            <span className="text-xs font-semibold">{label}</span>
        </div>
    );
}
