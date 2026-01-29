import { Handle, Position, type NodeProps } from 'reactflow';
import { Database, Server, Globe, Smartphone, Layers, Clock, AlertTriangle, Timer, GitMerge, Cloud } from 'lucide-react';
import { memo } from 'react';
import { type NodeProperties } from '../types/node';

const icons = {
    client: Smartphone,
    api: Globe,
    service: Server,
    database: Database,
    cache: Layers,
    queue: Timer,
    loadbalancer: GitMerge,
    cdn: Cloud,
    default: Layers,
};

const colors = {
    client: 'border-blue-500 bg-blue-50',
    api: 'border-purple-500 bg-purple-50',
    service: 'border-indigo-500 bg-indigo-50',
    database: 'border-green-500 bg-green-50',
    cache: 'border-orange-500 bg-orange-50',
    queue: 'border-pink-500 bg-pink-50',
    loadbalancer: 'border-teal-500 bg-teal-50',
    cdn: 'border-sky-500 bg-sky-50',
    default: 'border-gray-500 bg-gray-50',
};

export const BackendNode = memo(({ data, selected }: NodeProps<NodeProperties>) => {
    const Icon = icons[data.type as keyof typeof icons] || icons.default;
    const colorClass = colors[data.type as keyof typeof colors] || colors.default;

    return (
        <div className={`px-4 py-2 shadow-md rounded-md border-2 ${colorClass} min-w-[150px] relative transition-all ${selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}>
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-400" />

            <div className="flex items-center gap-3">
                <div className="p-1 rounded bg-white/50">
                    <Icon size={16} />
                </div>
                <div className="flex-1">
                    <div className="text-sm font-bold text-gray-900">{data.label}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                        {data.type}
                    </div>

                    {/* Property Badges */}
                    <div className="flex gap-1 mt-1">
                        {data.latency !== undefined && data.latency > 0 && (
                            <div className="flex items-center gap-0.5 text-[9px] bg-white/70 px-1.5 py-0.5 rounded-full text-gray-700">
                                <Clock size={8} />
                                {data.latency}ms
                            </div>
                        )}
                        {data.failureRate !== undefined && data.failureRate > 0 && (
                            <div className="flex items-center gap-0.5 text-[9px] bg-red-100 px-1.5 py-0.5 rounded-full text-red-700">
                                <AlertTriangle size={8} />
                                {data.failureRate}%
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Processing State Indicator */}
            {data.state?.processing !== undefined && data.state.processing > 0 && (
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md">
                    {data.state.processing}
                </div>
            )}

            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-gray-400" />
        </div>
    );
});
