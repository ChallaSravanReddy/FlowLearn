import { X } from 'lucide-react';
import { useState } from 'react';
import { type Node } from 'reactflow';
import { type NodeProperties } from '../../types/node';

interface NodePropertiesPanelProps {
    node: Node<NodeProperties>;
    onClose: () => void;
    onUpdate: (nodeId: string, properties: Partial<NodeProperties>) => void;
}

export function NodePropertiesPanel({ node, onClose, onUpdate }: NodePropertiesPanelProps) {
    const [label, setLabel] = useState(node.data.label || '');
    const [latency, setLatency] = useState(node.data.latency || 0);
    const [failureRate, setFailureRate] = useState(node.data.failureRate || 0);
    const [capacity, setCapacity] = useState(node.data.capacity || 10);

    const handleUpdate = (updates: Partial<NodeProperties>) => {
        onUpdate(node.id, updates);
    };

    return (
        <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Node Properties</h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                    <X size={18} className="text-gray-500" />
                </button>
            </div>

            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {/* Label */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Label
                    </label>
                    <input
                        type="text"
                        value={label}
                        onChange={(e) => {
                            setLabel(e.target.value);
                            handleUpdate({ label: e.target.value });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Node name"
                    />
                </div>

                {/* Latency */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latency: {latency}ms
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="5000"
                        step="100"
                        value={latency}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setLatency(val);
                            handleUpdate({ latency: val });
                        }}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0ms</span>
                        <span>5000ms</span>
                    </div>
                </div>

                {/* Failure Rate */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Failure Rate: {failureRate}%
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={failureRate}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setFailureRate(val);
                            handleUpdate({ failureRate: val });
                        }}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                    </div>
                </div>

                {/* Capacity */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacity (concurrent requests)
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={capacity}
                        onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setCapacity(val);
                            handleUpdate({ capacity: val });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-xs text-blue-800">
                        <strong>Latency:</strong> Processing time in milliseconds<br />
                        <strong>Failure Rate:</strong> Probability of request failure<br />
                        <strong>Capacity:</strong> Max simultaneous requests
                    </p>
                </div>
            </div>
        </div>
    );
}
