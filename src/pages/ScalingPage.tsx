import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Server, Cpu, Database, Zap, Plus, Minus, RotateCcw,
    Activity, ShieldAlert, CheckCircle, TrendingUp, Info, HelpCircle
} from 'lucide-react';

interface Packet {
    id: number;
    type: 'request' | 'response';
    status: 'success' | 'failure' | 'processing';
    progress: number; // 0 to 1
    serverId: number;
    yOffset: number; // For rendering vertical spacing
}

interface ServerSpec {
    name: string;
    cpu: string;
    ram: string;
    capacity: number; // requests/sec
    baseLatency: number; // ms
    color: string;
    glow: string;
}

const VERTICAL_SPECS: ServerSpec[] = [
    { name: 't3.nano (Micro)', cpu: '1 vCPU', ram: '0.5 GB', capacity: 30, baseLatency: 120, color: 'text-sky-400', glow: 'shadow-sky-500/20' },
    { name: 't3.small (Small)', cpu: '2 vCPU', ram: '2 GB', capacity: 70, baseLatency: 90, color: 'text-indigo-400', glow: 'shadow-indigo-500/20' },
    { name: 'm5.large (Medium)', cpu: '4 vCPU', ram: '8 GB', capacity: 150, baseLatency: 60, color: 'text-purple-400', glow: 'shadow-purple-500/20' },
    { name: 'c5.2xlarge (Large)', cpu: '8 vCPU', ram: '16 GB', capacity: 300, baseLatency: 40, color: 'text-pink-400', glow: 'shadow-pink-500/20' },
    { name: 'r5.8xlarge (Enterprise)', cpu: '32 vCPU', ram: '128 GB', capacity: 600, baseLatency: 20, color: 'text-amber-400', glow: 'shadow-amber-500/30' }
];

export function ScalingPage() {
    const [mode, setMode] = useState<'horizontal' | 'vertical'>('horizontal');
    const [trafficRate, setTrafficRate] = useState<number>(40); // requests per second

    // Horizontal State
    const [horizontalInstances, setHorizontalInstances] = useState<number>(2); // 1 to 5
    const nextServerIndex = useRef<number>(0);

    // Vertical State
    const [specIndex, setSpecIndex] = useState<number>(1); // 0 to 4 (Small default)
    const currentSpec = VERTICAL_SPECS[specIndex];

    // Simulation Stats
    const [packets, setPackets] = useState<Packet[]>([]);
    const [serverLoads, setServerLoads] = useState<number[]>([0, 0, 0, 0, 0]); // Loads for up to 5 servers
    const [stats, setStats] = useState({
        total: 0,
        success: 0,
        errors: 0,
        avgLatency: 0
    });

    const [latencyHistory, setLatencyHistory] = useState<number[]>(Array(30).fill(0));
    const [errorHistory, setErrorHistory] = useState<number[]>(Array(30).fill(0));

    const packetIdCounter = useRef<number>(0);
    const lastSpawnTime = useRef<number>(0);
    const animFrameId = useRef<number>(0);
    const lastLoadUpdateTime = useRef<number>(0);

    // Get Server Y-coordinate percentage
    const getServerY = useCallback((index: number, total: number) => {
        if (total === 1) return 50;
        const step = 64 / (total - 1); // span from 18% to 82%
        return 18 + index * step;
    }, []);

    // Reset statistics
    const handleResetStats = () => {
        setStats({ total: 0, success: 0, errors: 0, avgLatency: 0 });
        setLatencyHistory(Array(30).fill(0));
        setErrorHistory(Array(30).fill(0));
        setServerLoads([0, 0, 0, 0, 0]);
        setPackets([]);
    };

    // Switch mode resets
    const handleModeChange = (newMode: 'horizontal' | 'vertical') => {
        setMode(newMode);
        handleResetStats();
    };

    // Spawn and update animation loop
    useEffect(() => {
        const tick = (now: number) => {
            if (!lastSpawnTime.current) lastSpawnTime.current = now;
            if (!lastLoadUpdateTime.current) lastLoadUpdateTime.current = now;

            const spawnInterval = 1000 / trafficRate;
            const elapsedSpawn = now - lastSpawnTime.current;

            // 1. Packet Spawning
            let newPackets: Packet[] = [];
            if (elapsedSpawn >= spawnInterval) {
                const spawnsCount = Math.floor(elapsedSpawn / spawnInterval);
                lastSpawnTime.current = now - (elapsedSpawn % spawnInterval);

                for (let k = 0; k < Math.min(spawnsCount, 5); k++) {
                    packetIdCounter.current += 1;
                    let targetServerId = 0;

                    if (mode === 'horizontal') {
                        // Round Robin routing through Load Balancer
                        targetServerId = nextServerIndex.current % horizontalInstances;
                        nextServerIndex.current = (nextServerIndex.current + 1) % horizontalInstances;
                    } else {
                        targetServerId = 0; // Only 1 server in vertical scaling
                    }

                    newPackets.push({
                        id: packetIdCounter.current,
                        type: 'request',
                        status: 'processing',
                        progress: 0,
                        serverId: targetServerId,
                        yOffset: (Math.random() - 0.5) * 12 // slight offset for visual separation
                    });
                }
            }

            // 2. Load Decay / Processing simulation
            const deltaSec = (now - lastLoadUpdateTime.current) / 1000;
            lastLoadUpdateTime.current = now;

            setServerLoads(prevLoads => {
                const nextLoads = [...prevLoads];
                const activeTotal = mode === 'horizontal' ? horizontalInstances : 1;
                const capacityPerServer = mode === 'horizontal' ? 100 : currentSpec.capacity;

                for (let i = 0; i < 5; i++) {
                    if (i < activeTotal) {
                        // Decay the load representing completed jobs
                        // Higher capacity means faster request depletion
                        const decay = capacityPerServer * deltaSec;
                        nextLoads[i] = Math.max(0, nextLoads[i] - decay);
                    } else {
                        nextLoads[i] = 0;
                    }
                }
                return nextLoads;
            });

            // 3. Update active packets progress
            setPackets(prevPackets => {
                const nextPackets: Packet[] = [];

                prevPackets.forEach(p => {
                    let nextProgress = p.progress + 0.016; // speed factor (approx 1 second roundtrip)

                    if (p.type === 'request') {
                        if (nextProgress >= 1.0) {
                            // Request reached the server!
                            // Increase load on target server
                            setServerLoads(prev => {
                                const copy = [...prev];
                                copy[p.serverId] = (copy[p.serverId] || 0) + 1.2; // increment request backlog
                                return copy;
                            });

                            // Calculate outcome
                            const capacity = mode === 'horizontal' ? 100 : currentSpec.capacity;
                            const currentLoad = serverLoads[p.serverId] || 0;
                            const capacityRatio = currentLoad / capacity;

                            // Overloaded threshold logic
                            let failed = false;
                            if (capacityRatio > 1.0) {
                                // Linear failure scaling above 100% capacity
                                const failChance = Math.min(0.95, (capacityRatio - 1.0) * 1.6);
                                failed = Math.random() < failChance;
                            }

                            // Calculate transaction stats
                            const baseLat = mode === 'horizontal' ? 50 : currentSpec.baseLatency;
                            const packetLatency = Math.round(baseLat + (capacityRatio * 150) + (failed ? 400 : 0));

                            setStats(prevStats => {
                                const newTotal = prevStats.total + 1;
                                const newSuccess = prevStats.success + (failed ? 0 : 1);
                                const newErrors = prevStats.errors + (failed ? 1 : 0);
                                const newLatency = prevStats.avgLatency === 0
                                    ? packetLatency
                                    : Math.round(prevStats.avgLatency * 0.95 + packetLatency * 0.05);

                                return {
                                    total: newTotal,
                                    success: newSuccess,
                                    errors: newErrors,
                                    avgLatency: newLatency
                                };
                            });

                            // Send response packet back
                            nextPackets.push({
                                ...p,
                                type: 'response',
                                status: failed ? 'failure' : 'success',
                                progress: 0
                            });
                        } else {
                            nextPackets.push({
                                ...p,
                                progress: nextProgress
                            });
                        }
                    } else {
                        // Response traveling back to client
                        if (nextProgress < 1.0) {
                            nextPackets.push({
                                ...p,
                                progress: nextProgress
                            });
                        }
                        // If progress >= 1.0, response reached client; discard packet
                    }
                });

                return [...nextPackets, ...newPackets];
            });

            animFrameId.current = requestAnimationFrame(tick);
        };

        animFrameId.current = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(animFrameId.current);
        };
    }, [trafficRate, mode, horizontalInstances, specIndex, serverLoads, currentSpec.capacity, currentSpec.baseLatency]);

    // Graph history tracker
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(curr => {
                setLatencyHistory(prev => [...prev.slice(1), curr.avgLatency]);

                const totalInWindow = curr.total || 1;
                const errorPercentage = Math.round((curr.errors / totalInWindow) * 100);
                setErrorHistory(prev => [...prev.slice(1), errorPercentage]);

                return curr;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Get packet positions for SVG canvas
    const getPacketCoordinates = (p: Packet) => {
        const clientX = 15;
        const clientY = 50;

        if (mode === 'horizontal') {
            const lbX = 42;
            const lbY = 50;
            const srvX = 80;
            const srvY = getServerY(p.serverId, horizontalInstances);

            if (p.type === 'request') {
                // Client to LB: progress 0 -> 0.4
                if (p.progress < 0.4) {
                    const t = p.progress / 0.4;
                    return {
                        x: clientX + t * (lbX - clientX),
                        y: clientY + p.yOffset
                    };
                } else {
                    // LB to Server: progress 0.4 -> 1.0
                    const t = (p.progress - 0.4) / 0.6;
                    return {
                        x: lbX + t * (srvX - lbX),
                        y: lbY + t * (srvY - lbY) + p.yOffset
                    };
                }
            } else {
                // Server to LB: progress 0 -> 0.6
                if (p.progress < 0.6) {
                    const t = p.progress / 0.6;
                    return {
                        x: srvX - t * (srvX - lbX),
                        y: srvY - t * (srvY - lbY) + p.yOffset
                    };
                } else {
                    // LB to Client: progress 0.6 -> 1.0
                    const t = (p.progress - 0.6) / 0.4;
                    return {
                        x: lbX - t * (lbX - clientX),
                        y: clientY + p.yOffset
                    };
                }
            }
        } else {
            // Vertical mode: direct client to server path
            const srvX = 78;
            const srvY = 50;

            if (p.type === 'request') {
                return {
                    x: clientX + p.progress * (srvX - clientX),
                    y: clientY + p.yOffset
                };
            } else {
                return {
                    x: srvX - p.progress * (srvX - clientX),
                    y: clientY + p.yOffset
                };
            }
        }
    };

    // Calculate aggregated server metrics
    const totalCapacity = mode === 'horizontal' ? horizontalInstances * 100 : currentSpec.capacity;
    const currentTotalLoad = serverLoads.reduce((sum, val) => sum + val, 0);
    const avgCpuUtilization = Math.min(100, Math.round((currentTotalLoad / totalCapacity) * 100));

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 text-white min-h-[90vh] flex flex-col gap-10">
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        Horizontal vs Vertical Scaling <span className="text-indigo-400">Simulation</span>
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">
                        Visualize packet routing, capacity overload, latency spikes, and system failure rates live.
                    </p>
                </div>

                {/* Mode Selector */}
                <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
                    <button
                        onClick={() => handleModeChange('horizontal')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'horizontal'
                                ? 'bg-indigo-600 text-white shadow'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Horizontal (Scale Out)
                    </button>
                    <button
                        onClick={() => handleModeChange('vertical')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'vertical'
                                ? 'bg-indigo-600 text-white shadow'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Vertical (Scale Up)
                    </button>
                </div>
            </div>

            {/* Main simulation workspace Grid */}
            <div className="grid lg:grid-cols-4 gap-8">

                {/* Left Side: Controls Panel */}
                <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-6 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Simulation Controls</h2>
                        <button
                            onClick={handleResetStats}
                            title="Reset Stats"
                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            <RotateCcw size={14} />
                        </button>
                    </div>

                    {/* Traffic Rate Slider */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-400">Traffic Load Rate</span>
                            <span className="text-indigo-400 font-bold">{trafficRate} req/sec</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="250"
                            step="10"
                            value={trafficRate}
                            onChange={(e) => setTrafficRate(parseInt(e.target.value))}
                            className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Light (10)</span>
                            <span>Moderate</span>
                            <span>Overload (250)</span>
                        </div>
                    </div>

                    <hr className="border-slate-800/60" />

                    {/* Horizontal Scaling Controls */}
                    {mode === 'horizontal' && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xs font-bold text-slate-300">Active Server Instances</h3>
                                <p className="text-[11px] text-slate-500 mt-1">Scale out/in to share the packet load.</p>
                            </div>

                            <div className="flex items-center justify-between bg-slate-950/40 border border-slate-800/60 rounded-xl p-3">
                                <button
                                    disabled={horizontalInstances <= 1}
                                    onClick={() => setHorizontalInstances(prev => Math.max(1, prev - 1))}
                                    className="p-2 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 rounded-lg transition-colors"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="text-lg font-black text-white">{horizontalInstances}</span>
                                <button
                                    disabled={horizontalInstances >= 5}
                                    onClick={() => setHorizontalInstances(prev => Math.min(5, prev + 1))}
                                    className="p-2 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 rounded-lg transition-colors"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            <div className="text-xs text-slate-400 space-y-2 bg-indigo-950/20 border border-indigo-900/30 p-3 rounded-xl">
                                <div className="flex justify-between">
                                    <span>Server Spec:</span>
                                    <span className="font-medium text-slate-300">Standard Tier</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Individual Cap:</span>
                                    <span className="font-semibold text-slate-300">100 req/s</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-800/40 pt-1.5 font-bold text-indigo-300">
                                    <span>Total Capacity:</span>
                                    <span>{horizontalInstances * 100} req/s</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vertical Scaling Controls */}
                    {mode === 'vertical' && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xs font-bold text-slate-300">Server Instance Size</h3>
                                <p className="text-[11px] text-slate-500 mt-1">Scale up/down to upgrade node resources.</p>
                            </div>

                            <div className="space-y-2.5">
                                {VERTICAL_SPECS.map((spec, idx) => (
                                    <button
                                        key={spec.name}
                                        onClick={() => setSpecIndex(idx)}
                                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between
                                            ${specIndex === idx
                                                ? 'bg-indigo-600/10 border-indigo-500 shadow-md'
                                                : 'bg-slate-950/40 border-slate-850 hover:border-slate-750 text-slate-400 hover:text-slate-200'
                                            }
                                        `}
                                    >
                                        <div className="space-y-0.5">
                                            <span className={`font-bold block ${specIndex === idx ? spec.color : 'text-slate-300'}`}>{spec.name}</span>
                                            <span className="text-[10px] text-slate-500 block">{spec.cpu} • {spec.ram}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold ${specIndex === idx ? 'text-indigo-300' : 'text-slate-500'}`}>
                                            Cap: {spec.capacity} req/s
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Center: Live visual connection canvas */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-2xl relative h-[450px] overflow-hidden lg:col-span-2 flex items-center justify-center">
                    {/* SVG Connector Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                        {mode === 'horizontal' ? (
                            <>
                                {/* Client -> LB Line */}
                                <line x1="15%" y1="50%" x2="42%" y2="50%" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

                                {/* LB -> Server Lines */}
                                {Array.from({ length: horizontalInstances }).map((_, idx) => (
                                    <line
                                        key={idx}
                                        x1="42%"
                                        y1="50%"
                                        x2="80%"
                                        y2={`${getServerY(idx, horizontalInstances)}%`}
                                        stroke="#334155"
                                        strokeWidth="2"
                                        strokeDasharray="4 4"
                                    />
                                ))}
                            </>
                        ) : (
                            // Client -> Server Direct Line
                            <line x1="15%" y1="50%" x2="78%" y2="50%" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                        )}
                    </svg>

                    {/* Client Node */}
                    <div className="absolute left-[8%] top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg group hover:border-slate-700 transition-colors">
                            <Cpu className="text-indigo-400 group-hover:scale-105 transition-transform" size={24} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Users/Client</span>
                    </div>

                    {/* Load Balancer Node (Horizontal Mode Only) */}
                    {mode === 'horizontal' && (
                        <div className="absolute left-[37%] top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex flex-col items-center justify-center shadow-lg shadow-indigo-500/5">
                                <Activity className="text-indigo-400 animate-pulse" size={24} />
                                <span className="text-[8px] font-black text-indigo-300 tracking-wide uppercase mt-1">LB</span>
                            </div>
                            <div className="text-center">
                                <span className="text-[10px] font-bold text-slate-400 block">Load Balancer</span>
                                <span className="text-[8px] text-slate-600 block">Round Robin</span>
                            </div>
                        </div>
                    )}

                    {/* Server Nodes (Horizontal Mode) */}
                    {mode === 'horizontal' && (
                        <div className="absolute right-[12%] inset-y-0 w-32 flex flex-col justify-between py-6 z-10 pointer-events-none">
                            <AnimatePresence>
                                {Array.from({ length: horizontalInstances }).map((_, idx) => {
                                    const capacity = 100;
                                    const currentLoad = serverLoads[idx] || 0;
                                    const cpuUtil = Math.min(100, Math.round((currentLoad / capacity) * 100));
                                    const isOverloaded = cpuUtil >= 90;

                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, scale: 0.8, x: 20 }}
                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, x: 20 }}
                                            style={{
                                                position: 'absolute',
                                                top: `${getServerY(idx, horizontalInstances)}%`,
                                                transform: 'translateY(-50%)',
                                                right: 0
                                            }}
                                            className={`w-36 bg-slate-900 border rounded-xl p-3 flex flex-col gap-1.5 shadow-xl transition-all pointer-events-auto
                                                ${isOverloaded
                                                    ? 'border-red-500 shadow-red-500/10'
                                                    : 'border-slate-800 hover:border-slate-750'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Server size={14} className={isOverloaded ? 'text-red-400 animate-bounce' : 'text-emerald-400'} />
                                                <span className="text-[10px] font-bold text-slate-200">srv-instance-0{idx + 1}</span>
                                            </div>

                                            {/* CPU Meter */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[9px] text-slate-500">
                                                    <span>CPU Utilization</span>
                                                    <span className={isOverloaded ? 'text-red-400 font-bold' : 'text-slate-300'}>{cpuUtil}%</span>
                                                </div>
                                                <div className="w-full h-1 bg-slate-850 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-150 ${isOverloaded ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                        style={{ width: `${cpuUtil}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Single Server Node (Vertical Mode) */}
                    {mode === 'vertical' && (
                        <div className="absolute right-[12%] top-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center">
                            <motion.div
                                layout
                                animate={{
                                    scale: 0.85 + specIndex * 0.12,
                                    boxShadow: specIndex === 4 ? '0 0 25px rgba(245, 158, 11, 0.25)' : '0 0 15px rgba(99, 102, 241, 0.15)'
                                }}
                                transition={{ type: 'spring', stiffness: 150, damping: 12 }}
                                className={`w-36 bg-slate-900 border rounded-2xl p-4 flex flex-col gap-3 shadow-2xl relative
                                    ${specIndex === 4
                                        ? 'border-amber-500/60'
                                        : 'border-slate-800'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    <Server size={16} className={specIndex === 4 ? 'text-amber-400' : 'text-indigo-400'} />
                                    <div className="leading-none">
                                        <span className="text-[10px] font-bold text-slate-200 block">scale-server</span>
                                        <span className="text-[7px] text-slate-500 block uppercase font-black">{currentSpec.cpu}</span>
                                    </div>
                                </div>

                                {/* CPU Meter */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] text-slate-500">
                                        <span>CPU Utilization</span>
                                        <span className={serverLoads[0] / currentSpec.capacity >= 0.9 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                                            {Math.min(100, Math.round(((serverLoads[0] || 0) / currentSpec.capacity) * 100))}%
                                        </span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-850 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-150 ${serverLoads[0] / currentSpec.capacity >= 0.9 ? 'bg-red-500' : 'bg-indigo-500'}`}
                                            style={{ width: `${Math.min(100, Math.round(((serverLoads[0] || 0) / currentSpec.capacity) * 100))}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="text-[8px] text-slate-500 flex justify-between border-t border-slate-800/80 pt-2 font-mono">
                                    <span>Cap: {currentSpec.capacity} req/s</span>
                                    <span>RAM: {currentSpec.ram}</span>
                                </div>
                            </motion.div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-4">Vertical Node</span>
                        </div>
                    )}

                    {/* Animated Packets layer */}
                    {packets.map(p => {
                        const coords = getPacketCoordinates(p);
                        let color = 'bg-indigo-400 shadow-[0_0_8px_#818cf8]'; // Default request

                        if (p.type === 'response') {
                            if (p.status === 'success') {
                                color = 'bg-emerald-400 shadow-[0_0_8px_#34d399]';
                            } else if (p.status === 'failure') {
                                color = 'bg-red-500 shadow-[0_0_8px_#f87171] animate-pulse';
                            }
                        }

                        return (
                            <div
                                key={p.id}
                                className={`absolute w-2.5 h-2.5 rounded-full z-20 pointer-events-none transition-all duration-75 ${color}`}
                                style={{
                                    left: `${coords.x}%`,
                                    top: `${coords.y}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            />
                        );
                    })}
                </div>

                {/* Right Side: Stats Panel & Historical Sparklines */}
                <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-6 lg:col-span-1">
                    <h2 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Live Metrics</h2>

                    {/* Latency gauge */}
                    <div className="space-y-1">
                        <span className="text-xs text-slate-500 block">Average Latency</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black tracking-tight text-white">
                                {stats.avgLatency || 0}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">ms</span>
                        </div>
                        <div className="pt-2">
                            {/* Latency Sparkline */}
                            <svg className="w-full h-10 stroke-indigo-400/80 fill-none" viewBox="0 0 100 25">
                                <path
                                    d={latencyHistory.map((val, i) => `${i === 0 ? 'M' : 'L'} ${(i / 29) * 100} ${25 - Math.min(23, (val / 600) * 23)}`).join(' ')}
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>

                    <hr className="border-slate-800/60" />

                    {/* Success / Error Counters */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950/35 border border-slate-850 p-3 rounded-xl flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-emerald-400">
                                <CheckCircle size={12} />
                                <span className="text-[10px] font-bold uppercase">Success</span>
                            </div>
                            <span className="text-xl font-bold">{stats.success}</span>
                        </div>

                        <div className="bg-slate-950/35 border border-slate-850 p-3 rounded-xl flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-red-400">
                                <ShieldAlert size={12} />
                                <span className="text-[10px] font-bold uppercase">Errors</span>
                            </div>
                            <span className="text-xl font-bold">{stats.errors}</span>
                        </div>
                    </div>

                    {/* Overall CPU utilization gauge */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Total Pool CPU Usage</span>
                            <span className={avgCpuUtilization >= 95 ? 'text-red-400 font-bold' : 'text-slate-300'}>{avgCpuUtilization}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-850 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${avgCpuUtilization >= 90 ? 'bg-red-500' : 'bg-indigo-500'}`}
                                style={{ width: `${avgCpuUtilization}%` }}
                            />
                        </div>
                    </div>

                    <hr className="border-slate-800/60" />

                    {/* Real-time stats summary */}
                    <div className="space-y-2 text-xs text-slate-400">
                        <div className="flex justify-between">
                            <span>System Status:</span>
                            {avgCpuUtilization >= 90 ? (
                                <span className="text-red-400 font-black animate-pulse uppercase text-[10px]">Overloaded</span>
                            ) : (
                                <span className="text-emerald-400 font-bold uppercase text-[10px]">Healthy</span>
                            )}
                        </div>
                        <div className="flex justify-between">
                            <span>Total Requests:</span>
                            <span className="font-semibold text-slate-200">{stats.total}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Global Capacity:</span>
                            <span className="font-semibold text-slate-200">{totalCapacity} req/s</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom: Informational & Educational Panel */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Info className="text-indigo-400" size={18} /> Understanding Horizontal vs Vertical Scaling
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Scaling is the mechanism of adjusting computing power to match load requirements. Let's compare both philosophies.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-2">
                    {/* Horizontal Scaling column */}
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-bold uppercase">
                            Horizontal Scaling (Scale Out)
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">
                            Horizontal scaling involves adding more identical computing nodes (servers) to your existing resource pool instead of increasing the power of a single node. It relies on a <strong>Load Balancer</strong> to distribute traffic evenly.
                        </p>
                        <div className="space-y-2 text-xs">
                            <div className="flex gap-2">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span className="text-slate-400"><strong>Infinite Scale:</strong> Virtually no limit to growth. Add 10, 100, or 1000 servers.</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span className="text-slate-400"><strong>High Availability:</strong> If server 1 dies, servers 2, 3, and 4 keep running. No single point of failure.</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-red-400 font-bold">✗</span>
                                <span className="text-slate-400"><strong>Complex Architecture:</strong> Requires stateless applications, session sharing mechanisms, and load balancers.</span>
                            </div>
                        </div>
                    </div>

                    {/* Vertical Scaling column */}
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-xs font-bold uppercase">
                            Vertical Scaling (Scale Up)
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">
                            Vertical scaling involves upgrading the hardware specs (CPU, RAM, Storage, Network capacity) of a single server. It is the equivalent of upgrading from a laptop to a high-powered workstation machine.
                        </p>
                        <div className="space-y-2 text-xs">
                            <div className="flex gap-2">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span className="text-slate-400"><strong>Extreme Simplicity:</strong> No changes to code or configuration. Runs exactly the same as a local machine.</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span className="text-slate-400"><strong>Lowest Latency:</strong> No network hops between servers or load balancers. Zero routing overhead.</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-red-400 font-bold">✗</span>
                                <span className="text-slate-400"><strong>Hard Limits:</strong> You cannot go bigger than the largest commercially available hardware/VM instances.</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-red-400 font-bold">✗</span>
                                <span className="text-slate-400"><strong>Single Point of Failure:</strong> If the single upgraded server crashes, your entire system goes offline.</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800/80 pt-6">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <HelpCircle size={14} className="text-indigo-400" /> Interactive Experiments to try:
                    </h3>
                    <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                        <li>
                            <strong>Horizontal Overload:</strong> Set active instances to <span className="text-white">1</span> and slide Traffic Load up to <span className="text-white">150 req/sec</span>. Watch the CPU indicator hit 100% and requests fail (red dots). Click <span className="text-indigo-400 font-semibold">Scale Out (+)</span> to add 2 more instances and watch the load distribute and errors clear.
                        </li>
                        <li>
                            <strong>Vertical Overload:</strong> Select <span className="text-white">Micro</span> instance tier and set Traffic to <span className="text-white">80 req/sec</span>. Notice the extreme CPU spike and dropped packets. Upgrade the node to <span className="text-indigo-400 font-semibold">Medium</span> or <span className="text-indigo-400 font-semibold">Large</span>; observe the server resize visually and resolve the traffic.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default ScalingPage;
