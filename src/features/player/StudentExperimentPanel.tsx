import { useState } from 'react';
import { X, Zap, FlaskConical, ChevronRight, Info, RotateCcw } from 'lucide-react';
import { type Node } from 'reactflow';
import { type NodeProperties } from '../../types/node';

interface StudentExperimentPanelProps {
    node: Node<NodeProperties>;
    onClose: () => void;
    onUpdate: (nodeId: string, properties: Partial<NodeProperties>) => void;
}

// Config per node type — student-friendly descriptions
const EXPERIMENT_CONFIG: Record<string, {
    icon: string;
    color: string;
    borderColor: string;
    glowColor: string;
    experiments: Array<{
        key: keyof NodeProperties;
        label: string;
        emoji: string;
        unit: string;
        min: number;
        max: number;
        step: number;
        tip: string;
        consequence: (val: number) => string;
    }>;
}> = {
    client: {
        icon: '🖥️',
        color: 'text-blue-400',
        borderColor: 'border-blue-500/40',
        glowColor: 'shadow-blue-500/20',
        experiments: [
            {
                key: 'latency',
                label: 'Network Speed',
                emoji: '🌐',
                unit: 'ms',
                min: 0,
                max: 2000,
                step: 50,
                tip: 'How fast the client sends requests over the network.',
                consequence: (v) => v === 0 ? 'Instant (fibre / localhost)' : v < 100 ? 'Fast (LAN / WiFi)' : v < 500 ? 'Average (4G mobile)' : 'Slow (3G / poor connection)',
            },
            {
                key: 'traffic',
                label: 'Generated Traffic (RPS)',
                emoji: '🚦',
                unit: ' rps',
                min: 1,
                max: 25,
                step: 1,
                tip: 'How many requests this client generates per second. Higher traffic tests server limit.',
                consequence: (v) => v <= 3 ? 'Low traffic — Easy load' : v <= 10 ? 'Medium traffic — Moderate load' : v <= 18 ? 'High traffic — Heavy load' : 'Heavy traffic — Risk of overload!',
            },
            {
                key: 'capacity',
                label: 'Request Limit',
                emoji: '⚡',
                unit: ' rps',
                min: 1,
                max: 100,
                step: 5,
                tip: 'Maximum concurrent requests that can be outstanding.',
                consequence: (v) => `Max ${v} concurrent queries outstanding`,
            }
        ],
    },
    api: {
        icon: '⚙️',
        color: 'text-purple-400',
        borderColor: 'border-purple-500/40',
        glowColor: 'shadow-purple-500/20',
        experiments: [
            {
                key: 'latency',
                label: 'Processing Time',
                emoji: '⏱️',
                unit: 'ms',
                min: 0,
                max: 2000,
                step: 50,
                tip: 'Time the API takes to handle each request before forwarding it.',
                consequence: (v) => v === 0 ? 'Instant gateway passthrough' : v < 100 ? 'Very fast (optimized API)' : v < 500 ? 'Normal API latency' : 'Slow (rate limiting or heavy logic)',
            },
            {
                key: 'failureRate',
                label: 'Error Rate',
                emoji: '💥',
                unit: '%',
                min: 0,
                max: 100,
                step: 1,
                tip: 'Probability of the API returning a 500 error. Try cranking this up!',
                consequence: (v) => v === 0 ? 'Rock solid — no errors' : v < 5 ? 'Occasional blip (production-like)' : v < 30 ? 'Degraded — clients will notice' : v < 70 ? 'Highly unstable gateway' : '🔥 Gateway is on fire!',
            },
        ],
    },
    database: {
        icon: '🗄️',
        color: 'text-green-400',
        borderColor: 'border-green-500/40',
        glowColor: 'shadow-green-500/20',
        experiments: [
            {
                key: 'latency',
                label: 'Query Time',
                emoji: '🔍',
                unit: 'ms',
                min: 0,
                max: 5000,
                step: 50,
                tip: 'Simulates disk I/O and query execution time. Databases are usually the bottleneck!',
                consequence: (v) => v === 0 ? 'In-memory / index hit' : v < 50 ? 'Fast indexed query' : v < 200 ? 'Normal query time' : v < 1000 ? 'Slow — needs indexing?' : '🐢 Full table scan detected!',
            },
            {
                key: 'failureRate',
                label: 'Connection Failure',
                emoji: '🔌',
                unit: '%',
                min: 0,
                max: 100,
                step: 1,
                tip: 'Simulates dropped database connections. Watch the whole system fail!',
                consequence: (v) => v === 0 ? 'Healthy connection pool' : v < 10 ? 'Occasional timeouts' : v < 50 ? 'Connection pool exhausted' : '💀 Database is unreachable',
            },
            {
                key: 'capacity',
                label: 'Max Connections',
                emoji: '👥',
                unit: ' connections',
                min: 1,
                max: 20,
                step: 1,
                tip: 'Maximum concurrent queries the database can handle before degrading performance or rejecting connections.',
                consequence: (v) => `Pool size limit: ${v} concurrent connection slots`,
            }
        ],
    },
    cache: {
        icon: '⚡',
        color: 'text-orange-400',
        borderColor: 'border-orange-500/40',
        glowColor: 'shadow-orange-500/20',
        experiments: [
            {
                key: 'latency',
                label: 'Cache Access Time',
                emoji: '⚡',
                unit: 'ms',
                min: 0,
                max: 200,
                step: 5,
                tip: 'Cache is stored in RAM — it should be MUCH faster than a database!',
                consequence: (v) => v <= 5 ? '⚡ Blazing fast (in-memory)' : v < 20 ? 'Fast Redis/Memcached' : v < 50 ? 'Slower than expected' : '❗ Cache overhead too high',
            },
        ],
    },
    service: {
        icon: '🔧',
        color: 'text-indigo-400',
        borderColor: 'border-indigo-500/40',
        glowColor: 'shadow-indigo-500/20',
        experiments: [
            {
                key: 'latency',
                label: 'Processing Time',
                emoji: '⏱️',
                unit: 'ms',
                min: 0,
                max: 3000,
                step: 50,
                tip: 'Time for this microservice to compute and respond.',
                consequence: (v) => v === 0 ? 'Near-instant computation' : v < 100 ? 'Fast service response' : v < 500 ? 'Moderate processing' : '🐌 Slow service (CPU-bound?)',
            },
            {
                key: 'failureRate',
                label: 'Crash Probability',
                emoji: '💣',
                unit: '%',
                min: 0,
                max: 100,
                step: 5,
                tip: 'Percentage of requests that cause this service to crash. Chaos engineering!',
                consequence: (v) => v === 0 ? 'Bulletproof service' : v < 10 ? 'Some instability' : v < 50 ? 'Half the requests fail' : '🔥 Service is crashing constantly',
            },
        ],
    },
    loadbalancer: {
        icon: '⚖️',
        color: 'text-teal-400',
        borderColor: 'border-teal-500/40',
        glowColor: 'shadow-teal-500/20',
        experiments: [
            {
                key: 'latency',
                label: 'Routing Overhead',
                emoji: '🔄',
                unit: 'ms',
                min: 0,
                max: 500,
                step: 10,
                tip: 'Time the load balancer takes to inspect and route each request.',
                consequence: (v) => v === 0 ? 'Transparent routing' : v < 20 ? 'Minimal overhead' : v < 100 ? 'Normal routing cost' : 'High routing latency!',
            },
        ],
    },
    server: {
        icon: '🖧',
        color: 'text-blue-400',
        borderColor: 'border-blue-500/40',
        glowColor: 'shadow-blue-500/20',
        experiments: [
            {
                key: 'latency',
                label: 'Execution Time',
                emoji: '⏱️',
                unit: 'ms',
                min: 0,
                max: 2000,
                step: 50,
                tip: 'Time for the server to execute the request logic.',
                consequence: (v) => v < 50 ? 'Fast server execution' : v < 300 ? 'Normal server time' : '🐢 Server is under heavy load',
            },
            {
                key: 'failureRate',
                label: 'Failure Rate',
                emoji: '💥',
                unit: '%',
                min: 0,
                max: 100,
                step: 1,
                tip: 'Simulate server hardware failures or application crashes.',
                consequence: (v) => v === 0 ? 'All requests succeed' : v < 5 ? 'Rare failures' : v < 50 ? 'Degraded performance' : '🔥 Server is failing!',
            },
            {
                key: 'capacity',
                label: 'Concurrency Limit',
                emoji: '👥',
                unit: ' threads',
                min: 1,
                max: 20,
                step: 1,
                tip: 'Maximum concurrent threads/requests the server can handle before degrading or queue overflowing.',
                consequence: (v) => `Server thread limit: ${v} simultaneous request capacity`,
            }
        ],
    },
    serverless: {
        icon: 'λ',
        color: 'text-amber-400',
        borderColor: 'border-amber-500/40',
        glowColor: 'shadow-amber-500/20',
        experiments: [
            {
                key: 'latency',
                label: 'Cold Start + Run Time',
                emoji: '🧊',
                unit: 'ms',
                min: 0,
                max: 4000,
                step: 100,
                tip: 'Serverless functions can have cold starts. Try setting this high to simulate one!',
                consequence: (v) => v === 0 ? 'Warm function (fast!)' : v < 300 ? 'Warm execution' : v < 1000 ? 'Cold start penalty' : '🧊 Extreme cold start!',
            },
            {
                key: 'failureRate',
                label: 'Timeout Rate',
                emoji: '⏰',
                unit: '%',
                min: 0,
                max: 100,
                step: 1,
                tip: 'Percentage of function invocations that time out.',
                consequence: (v) => v === 0 ? 'Always completes' : v < 10 ? 'Occasional timeouts' : '⏰ Function keeps timing out!',
            },
        ],
    },
    queue: {
        icon: '📬',
        color: 'text-pink-400',
        borderColor: 'border-pink-500/40',
        glowColor: 'shadow-pink-500/20',
        experiments: [
            {
                key: 'latency',
                label: 'Poll Interval',
                emoji: '📥',
                unit: 'ms',
                min: 0,
                max: 1000,
                step: 50,
                tip: 'How quickly the consumer polls for new messages.',
                consequence: (v) => v === 0 ? 'Instant polling' : v < 100 ? 'Fast consumer' : v < 500 ? 'Moderate consumer' : '📬 Queue is backing up!',
            },
        ],
    },
    firewall: {
        icon: '🔥',
        color: 'text-red-400',
        borderColor: 'border-red-500/40',
        glowColor: 'shadow-red-500/20',
        experiments: [
            {
                key: 'latency',
                label: 'Inspection Overhead',
                emoji: '🔎',
                unit: 'ms',
                min: 0,
                max: 500,
                step: 5,
                tip: 'Time for deep packet inspection — security has a cost!',
                consequence: (v) => v === 0 ? 'No inspection (fast but risky)' : v < 50 ? 'Light inspection' : v < 200 ? 'Standard DPI' : '🔒 Maximum security scanning',
            },
            {
                key: 'failureRate',
                label: 'Block Rate',
                emoji: '🚫',
                unit: '%',
                min: 0,
                max: 100,
                step: 1,
                tip: 'Percentage of requests the firewall blocks (too high = denial of service!)',
                consequence: (v) => v === 0 ? 'Allow all traffic' : v < 20 ? 'Selective filtering' : v < 80 ? 'Strict firewall policy' : '🚫 Blocking almost everything!',
            },
        ],
    },
};

const DEFAULT_CONFIG = {
    icon: '⚙️',
    color: 'text-slate-400',
    borderColor: 'border-slate-500/40',
    glowColor: 'shadow-slate-500/20',
    experiments: [
        {
            key: 'latency' as keyof NodeProperties,
            label: 'Latency',
            emoji: '⏱️',
            unit: 'ms',
            min: 0,
            max: 2000,
            step: 50,
            tip: 'Time this component takes to process requests.',
            consequence: (v: number) => v === 0 ? 'Instant' : v < 200 ? 'Fast' : v < 1000 ? 'Moderate' : 'Slow',
        },
        {
            key: 'failureRate' as keyof NodeProperties,
            label: 'Failure Rate',
            emoji: '💥',
            unit: '%',
            min: 0,
            max: 100,
            step: 1,
            tip: 'Probability of this component failing on each request.',
            consequence: (v: number) => v === 0 ? 'No failures' : v < 10 ? 'Rarely fails' : v < 50 ? 'Often fails' : 'Almost always fails!',
        },
    ],
};

// Get the consequence color based on severity
function getConsequenceColor(key: keyof NodeProperties, value: number): string {
    if (key === 'latency') {
        if (value === 0) return 'text-emerald-400';
        if (value < 100) return 'text-teal-400';
        if (value < 500) return 'text-yellow-400';
        return 'text-red-400';
    }
    if (key === 'failureRate') {
        if (value === 0) return 'text-emerald-400';
        if (value < 5) return 'text-yellow-400';
        if (value < 30) return 'text-orange-400';
        return 'text-red-400';
    }
    if (key === 'traffic') {
        if (value <= 3) return 'text-emerald-400';
        if (value <= 10) return 'text-teal-400';
        if (value <= 18) return 'text-yellow-400';
        return 'text-red-400';
    }
    if (key === 'capacity') {
        if (value >= 12) return 'text-emerald-400';
        if (value >= 6) return 'text-teal-400';
        return 'text-yellow-400';
    }
    return 'text-slate-400';
}

// Simple bar chart showing impact level — reserved for future use
// function ImpactBar({ value, max, color }: { value: number; max: number; color: string }) {
//     const pct = Math.round((value / max) * 100);
//     return (
//         <div className="flex items-center gap-2 mt-1">
//             <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
//                 <div
//                     className={`h-full rounded-full transition-all duration-300 ${color}`}
//                     style={{ width: `${pct}%` }}
//                 />
//             </div>
//             <span className="text-[10px] text-slate-500 w-8 text-right">{pct}%</span>
//         </div>
//     );
// }

export function StudentExperimentPanel({ node, onClose, onUpdate }: StudentExperimentPanelProps) {
    const typeKey = (node.data.type || 'default').replace('_', '') as string;
    const config = EXPERIMENT_CONFIG[typeKey] || DEFAULT_CONFIG;
    const [showTip, setShowTip] = useState<string | null>(null);

    // Track original values for reset
    const [originalValues] = useState(() => {
        const vals: Partial<NodeProperties> = {};
        (EXPERIMENT_CONFIG[typeKey] || DEFAULT_CONFIG).experiments.forEach(exp => {
            vals[exp.key] = node.data[exp.key] as any;
        });
        return vals;
    });

    const handleUpdate = (key: keyof NodeProperties, value: number) => {
        onUpdate(node.id, { [key]: value });
    };

    const handleReset = () => {
        onUpdate(node.id, originalValues);
    };

    return (
        <div
            className={`
                w-80 bg-slate-900/95 backdrop-blur-xl rounded-2xl border ${config.borderColor}
                shadow-2xl ${config.glowColor} flex flex-col overflow-hidden
                animate-in slide-in-from-left-2 duration-200
            `}
        >
            {/* Header */}
            <div className={`px-4 py-3 border-b ${config.borderColor} flex items-center justify-between flex-shrink-0`}>
                <div className="flex items-center gap-3">
                    <div className={`
                        w-9 h-9 rounded-xl flex items-center justify-center text-lg
                        bg-slate-800/80 border ${config.borderColor}
                    `}>
                        {config.icon}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white leading-none">{node.data.label}</h3>
                        <p className={`text-[10px] font-semibold uppercase tracking-widest mt-0.5 ${config.color}`}>
                            {node.data.type?.replace('_', ' ')} · Experiment
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleReset}
                        title="Reset to original values"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                        <RotateCcw size={14} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Lab Banner */}
            <div className="px-4 py-2.5 bg-indigo-950/50 border-b border-indigo-900/30 flex items-center gap-2 flex-shrink-0">
                <FlaskConical size={13} className="text-indigo-400 shrink-0" />
                <p className="text-[11px] text-indigo-300 font-medium">
                    Adjust parameters below and watch the simulation react in real-time!
                </p>
            </div>

            {/* Experiment Controls */}
            <div className="p-4 space-y-5 flex-1">
                {config.experiments.map((exp) => {
                    const currentValue = (node.data[exp.key] as number) ?? 0;
                    const consequenceColor = getConsequenceColor(exp.key, currentValue);

                    return (
                        <div key={exp.key as string} className="space-y-2">
                            {/* Label row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-base leading-none">{exp.emoji}</span>
                                    <span className="text-sm font-semibold text-white">{exp.label}</span>
                                    <button
                                        onClick={() => setShowTip(showTip === exp.key ? null : exp.key as string)}
                                        className="text-slate-600 hover:text-slate-400 transition-colors"
                                    >
                                        <Info size={12} />
                                    </button>
                                </div>
                                <span className={`text-sm font-bold font-mono tabular-nums ${config.color}`}>
                                    {currentValue}{exp.unit}
                                </span>
                            </div>

                            {/* Tooltip */}
                            {showTip === exp.key && (
                                <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-2 text-[11px] text-slate-300 leading-relaxed">
                                    {exp.tip}
                                </div>
                            )}

                            {/* Slider */}
                            <div className="relative">
                                <input
                                    type="range"
                                    min={exp.min}
                                    max={exp.max}
                                    step={exp.step}
                                    value={currentValue}
                                    onChange={(e) => handleUpdate(exp.key, parseInt(e.target.value))}
                                    className="w-full h-2 appearance-none bg-slate-800 rounded-full cursor-pointer
                                        [&::-webkit-slider-thumb]:appearance-none
                                        [&::-webkit-slider-thumb]:w-4
                                        [&::-webkit-slider-thumb]:h-4
                                        [&::-webkit-slider-thumb]:rounded-full
                                        [&::-webkit-slider-thumb]:bg-white
                                        [&::-webkit-slider-thumb]:shadow-md
                                        [&::-webkit-slider-thumb]:border-2
                                        [&::-webkit-slider-thumb]:border-indigo-500
                                        [&::-webkit-slider-thumb]:cursor-pointer
                                        [&::-webkit-slider-thumb]:transition-transform
                                        [&::-webkit-slider-thumb]:hover:scale-125
                                    "
                                    style={{
                                        background: `linear-gradient(to right, ${
                                            exp.key === 'failureRate' ? '#ef4444' : '#f59e0b'
                                        } 0%, ${
                                            exp.key === 'failureRate' ? '#ef4444' : '#f59e0b'
                                        } ${((currentValue - exp.min) / (exp.max - exp.min)) * 100}%, #1e293b ${((currentValue - exp.min) / (exp.max - exp.min)) * 100}%, #1e293b 100%)`
                                    }}
                                />
                                <div className="flex justify-between text-[9px] text-slate-600 mt-0.5">
                                    <span>{exp.min}{exp.unit}</span>
                                    <span>{exp.max}{exp.unit}</span>
                                </div>
                            </div>

                            {/* Live consequence text */}
                            <div className={`flex items-center gap-1.5 text-[11px] font-medium ${consequenceColor}`}>
                                <ChevronRight size={10} />
                                {exp.consequence(currentValue)}
                            </div>

                            {/* Quick presets */}
                            <div className="flex gap-1.5 flex-wrap">
                                {exp.key === 'traffic' && [
                                    { label: 'Low', val: 2 },
                                    { label: 'Medium', val: 8 },
                                    { label: 'High', val: 15 },
                                    { label: 'Heavy', val: 25 },
                                ].map(preset => (
                                    <button
                                        key={preset.label}
                                        onClick={() => handleUpdate(exp.key, preset.val)}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors
                                            ${currentValue === preset.val
                                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                                                : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600'
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                                {exp.key === 'capacity' && [
                                    { label: 'Low', val: 2 },
                                    { label: 'Medium', val: 6 },
                                    { label: 'High', val: 12 },
                                    { label: 'Max', val: 20 },
                                ].map(preset => (
                                    <button
                                        key={preset.label}
                                        onClick={() => handleUpdate(exp.key, preset.val)}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors
                                            ${currentValue === preset.val
                                                ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                                                : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600'
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                                {exp.key === 'latency' && [
                                    { label: '0ms', val: 0 },
                                    { label: '100ms', val: 100 },
                                    { label: '500ms', val: 500 },
                                    { label: '1s', val: 1000 },
                                ].filter(p => p.val <= exp.max).map(preset => (
                                    <button
                                        key={preset.label}
                                        onClick={() => handleUpdate(exp.key, preset.val)}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors
                                            ${currentValue === preset.val
                                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                                : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600'
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                                {exp.key === 'failureRate' && [
                                    { label: '0%', val: 0 },
                                    { label: '10%', val: 10 },
                                    { label: '50%', val: 50 },
                                    { label: '90%', val: 90 },
                                ].map(preset => (
                                    <button
                                        key={preset.label}
                                        onClick={() => handleUpdate(exp.key, preset.val)}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors
                                            ${currentValue === preset.val
                                                ? 'bg-red-500/20 border-red-500/50 text-red-300'
                                                : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600'
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-3 bg-slate-950/60 border-t border-slate-800/60 flex items-center gap-2 flex-shrink-0">
                <Zap size={11} className="text-indigo-400 shrink-0" />
                <p className="text-[10px] text-slate-500 leading-snug">
                    Changes apply immediately to the live simulation. Click anywhere on the canvas to deselect.
                </p>
            </div>
        </div>
    );
}
