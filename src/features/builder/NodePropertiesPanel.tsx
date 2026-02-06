import { X } from 'lucide-react';
import { type Node } from 'reactflow';
import { type NodeProperties } from '../../types/node';

interface NodePropertiesPanelProps {
    node: Node<NodeProperties>;
    onClose: () => void;
    onUpdate: (nodeId: string, properties: Partial<NodeProperties>) => void;
}

export function NodePropertiesPanel({ node, onClose, onUpdate }: NodePropertiesPanelProps) {
    const PROPERTY_CONFIG: Record<string, Array<{
        key: keyof NodeProperties;
        label: string;
        type: 'text' | 'number' | 'range';
        min?: number;
        max?: number;
        step?: number;
        unit?: string;
        helpText?: string;
    }>> = {
        client: [
            { key: 'label', label: 'Label', type: 'text' },
            { key: 'latency', label: 'Network Latency', type: 'range', min: 0, max: 2000, step: 50, unit: 'ms', helpText: 'Time to send request to next hop' },
            { key: 'capacity', label: 'Request Limit', type: 'number', min: 1, max: 1000, helpText: 'Max concurrent outgoing requests' },
        ],
        api: [
            { key: 'label', label: 'Label', type: 'text' },
            { key: 'latency', label: 'Processing Latency', type: 'range', min: 0, max: 2000, step: 50, unit: 'ms', helpText: 'Time taken to process a request' },
            { key: 'failureRate', label: 'Error Rate', type: 'range', min: 0, max: 100, step: 1, unit: '%', helpText: 'Chance of returning a 500 error' },
            { key: 'capacity', label: 'Concurrency Limit', type: 'number', min: 1, max: 1000, helpText: 'Max simultaneous requests handled' },
            { key: 'sampleRate', label: 'Forward Rate', type: 'range', min: 0, max: 100, step: 10, unit: '%', helpText: 'Percentage of requests forwarded (e.g. 20% = 1 in 5)' },
        ],
        database: [
            { key: 'label', label: 'Label', type: 'text' },
            { key: 'latency', label: 'Query Latency', type: 'range', min: 0, max: 5000, step: 50, unit: 'ms', helpText: 'Simulated disk/query time' },
            { key: 'failureRate', label: 'Connection Failure', type: 'range', min: 0, max: 100, step: 1, unit: '%' },
            { key: 'capacity', label: 'Max Connections', type: 'number', min: 1, max: 500, helpText: 'Connection pool size' },
        ],
        cache: [
            { key: 'label', label: 'Label', type: 'text' },
            { key: 'latency', label: 'Access Latency', type: 'range', min: 0, max: 200, step: 5, unit: 'ms', helpText: 'Memory access time (usually fast)' },
            { key: 'capacity', label: 'Max Items', type: 'number', min: 1, max: 10000 },
        ],
        service: [
            { key: 'label', label: 'Label', type: 'text' },
            { key: 'latency', label: 'Processing Time', type: 'range', min: 0, max: 3000, step: 50, unit: 'ms' },
            { key: 'failureRate', label: 'Crash Probability', type: 'range', min: 0, max: 100, step: 5, unit: '%' },
            { key: 'capacity', label: 'Max Threads', type: 'number', min: 1, max: 100, helpText: 'Thread pool limit' },
            { key: 'sampleRate', label: 'Forward Rate', type: 'range', min: 0, max: 100, step: 10, unit: '%' },
        ],
        queue: [
            { key: 'label', label: 'Label', type: 'text' },
            { key: 'capacity', label: 'Buffer Size', type: 'number', min: 1, max: 10000, helpText: 'Max messages in queue' },
            { key: 'latency', label: 'Poll Latency', type: 'range', min: 0, max: 1000, step: 50, unit: 'ms' },
        ],
        loadbalancer: [
            { key: 'label', label: 'Label', type: 'text' },
            { key: 'latency', label: 'Routing Overhead', type: 'range', min: 0, max: 500, step: 10, unit: 'ms' },
            { key: 'capacity', label: 'Max Throughput', type: 'number', min: 10, max: 10000 },
            { key: 'sampleRate', label: 'Forward Rate', type: 'range', min: 0, max: 100, step: 10, unit: '%' },
        ],
        cdn: [
            { key: 'label', label: 'Label', type: 'text' },
            { key: 'latency', label: 'Edge Latency', type: 'range', min: 0, max: 500, step: 10, unit: 'ms' },
            { key: 'failureRate', label: 'Miss Rate', type: 'range', min: 0, max: 100, step: 1, unit: '%' },
        ],
        default: [
            { key: 'label', label: 'Label', type: 'text' },
            { key: 'latency', label: 'Latency', type: 'range', min: 0, max: 2000, step: 50, unit: 'ms' },
            { key: 'failureRate', label: 'Failure Rate', type: 'range', min: 0, max: 100, step: 1, unit: '%' },
            { key: 'capacity', label: 'Capacity', type: 'number', min: 1, max: 1000 },
        ]
    };

    const config = PROPERTY_CONFIG[node.data.type] || PROPERTY_CONFIG.default;

    const handleUpdate = (key: keyof NodeProperties, value: any) => {
        onUpdate(node.id, { [key]: value });
    };

    return (
        <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                <div>
                    <h3 className="font-semibold text-gray-900">Properties</h3>
                    <p className="text-xs text-gray-500 capitalize">{node.data.type} Node</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                    <X size={18} className="text-gray-500" />
                </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-5">
                {config.map((field) => (
                    <div key={field.key as string}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                            {field.label}
                            {field.unit && field.type === 'range' && (
                                <span className="text-gray-500 font-normal">
                                    {(node.data[field.key] as number) || 0}{field.unit}
                                </span>
                            )}
                        </label>

                        {field.type === 'text' && (
                            <input
                                type="text"
                                value={(node.data[field.key] as string) || ''}
                                onChange={(e) => handleUpdate(field.key, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        )}

                        {field.type === 'number' && (
                            <input
                                type="number"
                                min={field.min}
                                max={field.max}
                                value={(node.data[field.key] as number) || field.min || 0}
                                onChange={(e) => handleUpdate(field.key, parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        )}

                        {field.type === 'range' && (
                            <div>
                                <input
                                    type="range"
                                    min={field.min}
                                    max={field.max}
                                    step={field.step}
                                    value={(node.data[field.key] as number) || 0}
                                    onChange={(e) => handleUpdate(field.key, parseInt(e.target.value))}
                                    className="w-full accent-blue-600"
                                />
                                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                    <span>{field.min}{field.unit}</span>
                                    <span>{field.max}{field.unit}</span>
                                </div>
                            </div>
                        )}

                        {field.helpText && (
                            <p className="text-[10px] text-gray-500 mt-1.5 leading-snug">
                                {field.helpText}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200 rounded-b-lg flex-shrink-0">
                <p className="text-[10px] text-gray-500 text-center">
                    Adjusting these properties affects the simulation in real-time.
                </p>
            </div>
        </div>
    );
}
