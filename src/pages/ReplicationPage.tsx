import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Database, Cpu, Zap, Activity, ShieldAlert, CheckCircle2,
    Clock, RefreshCw, HelpCircle, ArrowRight, Settings, Info
} from 'lucide-react';

interface Packet {
    id: number;
    type: 'read' | 'write' | 'sync';
    status: 'success' | 'stale' | 'syncing' | 'processing';
    progress: number;
    targetReplicaId: number; // 0 or 1
    version: number;
    yOffset: number;
}

interface LogEntry {
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    time: string;
}

export function ReplicationPage() {
    const [replicationMode, setReplicationMode] = useState<'async' | 'sync'>('async');
    const [queryRate, setQueryRate] = useState<number>(30); // req/sec
    const [readRatio, setReadRatio] = useState<number>(80); // % reads, rest writes
    const [replicationLag, setReplicationLag] = useState<number>(1500); // ms

    // Database Versions
    const [primaryVersion, setPrimaryVersion] = useState<number>(1);
    const [replicaVersions, setReplicaVersions] = useState<number[]>([1, 1]); // Replica 1, Replica 2

    // Stats
    const [packets, setPackets] = useState<Packet[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [stats, setStats] = useState({
        totalReads: 0,
        staleReads: 0,
        totalWrites: 0,
        avgReadLat: 15,
        avgWriteLat: 25
    });

    const [staleReadHistory, setStaleReadHistory] = useState<number[]>(Array(30).fill(0));

    const packetIdCounter = useRef<number>(0);
    const logIdCounter = useRef<number>(0);
    const lastSpawnTime = useRef<number>(0);
    const animFrameId = useRef<number>(0);
    const nextReplicaIndex = useRef<number>(0);

    // Add log entries helper
    const addLog = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        logIdCounter.current += 1;
        const newEntry = { id: logIdCounter.current, message, type, time };
        setLogs(prev => [newEntry, ...prev.slice(0, 19)]); // Keep last 20 logs
    }, []);

    // Reset stats
    const handleReset = () => {
        setPrimaryVersion(1);
        setReplicaVersions([1, 1]);
        setPackets([]);
        setLogs([]);
        setStats({
            totalReads: 0,
            staleReads: 0,
            totalWrites: 0,
            avgReadLat: 15,
            avgWriteLat: 25
        });
        setStaleReadHistory(Array(30).fill(0));
        addLog('Simulation reset. Primary and replicas version synchronized to v1.', 'info');
    };

    // Mode toggling
    const handleModeChange = (mode: 'async' | 'sync') => {
        setReplicationMode(mode);
        handleReset();
    };

    // Main animation & spawning loop
    useEffect(() => {
        const tick = (now: number) => {
            if (!lastSpawnTime.current) lastSpawnTime.current = now;

            const spawnInterval = 1000 / queryRate;
            const elapsed = now - lastSpawnTime.current;

            // 1. Spawning queries
            let newPackets: Packet[] = [];
            if (elapsed >= spawnInterval) {
                const spawnCount = Math.floor(elapsed / spawnInterval);
                lastSpawnTime.current = now - (elapsed % spawnInterval);

                for (let k = 0; k < Math.min(spawnCount, 4); k++) {
                    packetIdCounter.current += 1;
                    const isRead = Math.random() * 100 < readRatio;

                    if (isRead) {
                        // Round Robin across 2 Read Replicas
                        const targetRep = nextReplicaIndex.current % 2;
                        nextReplicaIndex.current += 1;

                        newPackets.push({
                            id: packetIdCounter.current,
                            type: 'read',
                            status: 'processing',
                            progress: 0,
                            targetReplicaId: targetRep,
                            version: 0,
                            yOffset: (Math.random() - 0.5) * 10
                        });
                    } else {
                        // Writes go directly to Primary
                        newPackets.push({
                            id: packetIdCounter.current,
                            type: 'write',
                            status: 'processing',
                            progress: 0,
                            targetReplicaId: 0,
                            version: 0,
                            yOffset: (Math.random() - 0.5) * 10
                        });
                    }
                }
            }

            // 2. Update existing packets progress
            setPackets(prevPackets => {
                const nextPackets: Packet[] = [];

                prevPackets.forEach(p => {
                    let speedFactor = 0.016; // default speed (approx 1 second roundtrip)

                    if (p.type === 'sync') {
                        // Sync packet speed is proportional to replication lag
                        // If lag is 100ms, sync is instant. If lag is 5000ms, it crawls
                        const durationSec = Math.max(0.1, replicationLag / 1000);
                        speedFactor = 0.016 / durationSec;
                    }

                    let nextProgress = p.progress + speedFactor;

                    if (p.type === 'write' && p.status === 'processing') {
                        if (nextProgress >= 1.0) {
                            // Write reached the Primary Database!
                            setPrimaryVersion(curr => {
                                const nextVer = curr + 1;

                                if (replicationMode === 'async') {
                                    // Async: Respond to client instantly; trigger replicas sync in background
                                    addLog(`Write processed on Primary DB: updated to v${nextVer}`, 'success');

                                    // Spawn sync packets to Replicas
                                    nextPackets.push({
                                        id: packetIdCounter.current + 1000 + nextVer * 2,
                                        type: 'sync',
                                        status: 'syncing',
                                        progress: 0,
                                        targetReplicaId: 0,
                                        version: nextVer,
                                        yOffset: -5
                                    });
                                    nextPackets.push({
                                        id: packetIdCounter.current + 2000 + nextVer * 2,
                                        type: 'sync',
                                        status: 'syncing',
                                        progress: 0,
                                        targetReplicaId: 1,
                                        version: nextVer,
                                        yOffset: 5
                                    });

                                    // Update stats
                                    const writeLat = 20 + Math.round(Math.random() * 10);
                                    setStats(currStats => ({
                                        ...currStats,
                                        totalWrites: currStats.totalWrites + 1,
                                        avgWriteLat: Math.round(currStats.avgWriteLat * 0.9 + writeLat * 0.1)
                                    }));
                                } else {
                                    // Sync: Wait for replication confirmation before responding
                                    addLog(`Write pending replication on Replicas (v${nextVer})...`, 'info');

                                    // Spawning sync packets
                                    nextPackets.push({
                                        id: packetIdCounter.current + 1000 + nextVer * 2,
                                        type: 'sync',
                                        status: 'syncing',
                                        progress: 0,
                                        targetReplicaId: 0,
                                        version: nextVer,
                                        yOffset: -5
                                    });
                                    nextPackets.push({
                                        id: packetIdCounter.current + 2000 + nextVer * 2,
                                        type: 'sync',
                                        status: 'syncing',
                                        progress: 0,
                                        targetReplicaId: 1,
                                        version: nextVer,
                                        yOffset: 5
                                    });

                                    // High latency overhead equivalent to replication lag
                                    const writeLat = Math.round(25 + replicationLag + Math.random() * 15);
                                    setStats(currStats => ({
                                        ...currStats,
                                        totalWrites: currStats.totalWrites + 1,
                                        avgWriteLat: Math.round(currStats.avgWriteLat * 0.9 + writeLat * 0.1)
                                    }));
                                }

                                return nextVer;
                            });

                            // Convert write packet to response
                            nextPackets.push({
                                ...p,
                                progress: 0,
                                status: 'success'
                            });
                        } else {
                            nextPackets.push({
                                ...p,
                                progress: nextProgress
                            });
                        }
                    } else if (p.type === 'write' && p.status === 'success') {
                        // Write response traveling back to client
                        if (nextProgress < 1.0) {
                            nextPackets.push({
                                ...p,
                                progress: nextProgress
                            });
                        }
                    } else if (p.type === 'read' && p.status === 'processing') {
                        if (nextProgress >= 1.0) {
                            // Read reached target replica
                            let versionRead = 1;
                            setReplicaVersions(reps => {
                                versionRead = reps[p.targetReplicaId];
                                return reps;
                            });

                            let isStale = false;
                            setPrimaryVersion(prim => {
                                isStale = versionRead < prim;
                                return prim;
                            });

                            if (isStale) {
                                addLog(`Stale Read Warning! Replica ${p.targetReplicaId + 1} served stale v${versionRead} (Primary is at v${primaryVersion})`, 'warning');
                            } else {
                                addLog(`Read successful from Replica ${p.targetReplicaId + 1} (Consistent v${versionRead})`, 'success');
                            }

                            const readLat = 10 + Math.round(Math.random() * 8);

                            setStats(currStats => ({
                                ...currStats,
                                totalReads: currStats.totalReads + 1,
                                staleReads: currStats.staleReads + (isStale ? 1 : 0),
                                avgReadLat: Math.round(currStats.avgReadLat * 0.95 + readLat * 0.05)
                            }));

                            // Send read response back
                            nextPackets.push({
                                ...p,
                                progress: 0,
                                status: isStale ? 'stale' : 'success',
                                version: versionRead
                            });
                        } else {
                            nextPackets.push({
                                ...p,
                                progress: nextProgress
                            });
                        }
                    } else if (p.type === 'read' && (p.status === 'success' || p.status === 'stale')) {
                        // Read response traveling back to client
                        if (nextProgress < 1.0) {
                            nextPackets.push({
                                ...p,
                                progress: nextProgress
                            });
                        }
                    } else if (p.type === 'sync') {
                        if (nextProgress >= 1.0) {
                            // Sync packet reached target replica database!
                            setReplicaVersions(prev => {
                                const nextReps = [...prev];
                                nextReps[p.targetReplicaId] = Math.max(nextReps[p.targetReplicaId], p.version);
                                return nextReps;
                            });
                            addLog(`Replica ${p.targetReplicaId + 1} synced to v${p.version}`, 'info');
                            // Discard packet (do not push to list)
                        } else {
                            nextPackets.push({
                                ...p,
                                progress: nextProgress
                            });
                        }
                    }
                });

                return nextPackets;
            });

            animFrameId.current = requestAnimationFrame(tick);
        };

        animFrameId.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animFrameId.current);
    }, [queryRate, readRatio, replicationLag, replicationMode, primaryVersion, addLog]);

    // Graph history tracker
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(curr => {
                const totalInWindow = curr.totalReads || 1;
                const stalePct = Math.round((curr.staleReads / totalInWindow) * 100);
                setStaleReadHistory(prev => [...prev.slice(1), stalePct]);
                return curr;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Get coordinates for SVG Canvas
    const getPacketCoordinates = (p: Packet) => {
        const clientX = 12;
        const clientY = 50;
        const routerX = 35;
        const routerY = 50;
        const primaryX = 62;
        const primaryY = 20;

        const replicaX = [80, 80];
        const replicaY = [45, 78];

        if (p.type === 'write') {
            if (p.status === 'processing') {
                // Client -> Router (0 to 0.4)
                if (p.progress < 0.4) {
                    const t = p.progress / 0.4;
                    return {
                        x: clientX + t * (routerX - clientX),
                        y: clientY + p.yOffset
                    };
                } else {
                    // Router -> Primary DB (0.4 to 1.0)
                    const t = (p.progress - 0.4) / 0.6;
                    return {
                        x: routerX + t * (primaryX - routerX),
                        y: routerY + t * (primaryY - routerY) + p.yOffset
                    };
                }
            } else {
                // Primary -> Router (0 to 0.6)
                if (p.progress < 0.6) {
                    const t = p.progress / 0.6;
                    return {
                        x: primaryX - t * (primaryX - routerX),
                        y: primaryY - t * (primaryY - routerY) + p.yOffset
                    };
                } else {
                    // Router -> Client (0.6 to 1.0)
                    const t = (p.progress - 0.6) / 0.4;
                    return {
                        x: routerX - t * (routerX - clientX),
                        y: clientY + p.yOffset
                    };
                }
            }
        } else if (p.type === 'read') {
            const rx = replicaX[p.targetReplicaId];
            const ry = replicaY[p.targetReplicaId];

            if (p.status === 'processing') {
                // Client -> Router (0 to 0.4)
                if (p.progress < 0.4) {
                    const t = p.progress / 0.4;
                    return {
                        x: clientX + t * (routerX - clientX),
                        y: clientY + p.yOffset
                    };
                } else {
                    // Router -> Replica DB (0.4 to 1.0)
                    const t = (p.progress - 0.4) / 0.6;
                    return {
                        x: routerX + t * (rx - routerX),
                        y: routerY + t * (ry - routerY) + p.yOffset
                    };
                }
            } else {
                // Replica DB -> Router (0 to 0.6)
                if (p.progress < 0.6) {
                    const t = p.progress / 0.6;
                    return {
                        x: rx - t * (rx - routerX),
                        y: ry - t * (ry - routerY) + p.yOffset
                    };
                } else {
                    // Router -> Client (0.6 to 1.0)
                    const t = (p.progress - 0.6) / 0.4;
                    return {
                        x: routerX - t * (routerX - clientX),
                        y: clientY + p.yOffset
                    };
                }
            }
        } else {
            // sync packet: Primary DB -> Replica DB direct path (0 to 1.0)
            const rx = replicaX[p.targetReplicaId];
            const ry = replicaY[p.targetReplicaId];
            return {
                x: primaryX + p.progress * (rx - primaryX),
                y: primaryY + p.progress * (ry - primaryY) + p.yOffset
            };
        }
    };

    const staleReadRate = stats.totalReads === 0
        ? 0
        : Math.round((stats.staleReads / stats.totalReads) * 100);

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 text-white min-h-[90vh] flex flex-col gap-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        Read/Write Splitting & Replication <span className="text-indigo-400">Simulation</span>
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">
                        Visualize how writes flow to Primary and reads balance across Replicas, exposing eventual consistency delay.
                    </p>
                </div>

                {/* Mode Selector */}
                <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
                    <button
                        onClick={() => handleModeChange('async')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${replicationMode === 'async'
                                ? 'bg-indigo-600 text-white shadow'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Asynchronous (Eventual Consistency)
                    </button>
                    <button
                        onClick={() => handleModeChange('sync')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${replicationMode === 'sync'
                                ? 'bg-indigo-600 text-white shadow'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Synchronous (Strong Consistency)
                    </button>
                </div>
            </div>

            {/* Simulation Workspace Grid */}
            <div className="grid lg:grid-cols-4 gap-8">

                {/* Left Controls Panel */}
                <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-6 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Parameters</h2>
                        <button
                            onClick={handleReset}
                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>

                    {/* Query Rate Slider */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-400">Request Rate</span>
                            <span className="text-indigo-400 font-bold">{queryRate} rps</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="120"
                            step="10"
                            value={queryRate}
                            onChange={(e) => setQueryRate(parseInt(e.target.value))}
                            className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Read / Write Mix Ratio */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-400">Query Mix (Reads vs Writes)</span>
                            <span className="text-indigo-400 font-bold">{readRatio}% Reads</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="90"
                            step="10"
                            value={readRatio}
                            onChange={(e) => setReadRatio(parseInt(e.target.value))}
                            className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Writes Heavy</span>
                            <span>Reads Heavy</span>
                        </div>
                    </div>

                    <hr className="border-slate-800/60" />

                    {/* Replication Lag Slider (Only applicable / noticeable in Async mode) */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-400">Replication Lag</span>
                            <span className="text-amber-400 font-bold">{replicationLag} ms</span>
                        </div>
                        <input
                            type="range"
                            min="100"
                            max="5000"
                            step="200"
                            value={replicationLag}
                            onChange={(e) => setReplicationLag(parseInt(e.target.value))}
                            className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Sync (100ms)</span>
                            <span>Heavy Lag (5s)</span>
                        </div>
                    </div>

                    <hr className="border-slate-800/60" />

                    {/* Description Text block */}
                    <div className="bg-slate-950/45 border border-slate-850/80 rounded-xl p-3.5 space-y-2 text-xs text-slate-400 leading-relaxed">
                        <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                            <Info size={13} className="text-indigo-400" />
                            {replicationMode === 'async' ? 'Asynchronous Mode' : 'Synchronous Mode'}
                        </h4>
                        {replicationMode === 'async' ? (
                            <p>
                                Primary database commits changes immediately and syncs replicas in the background. <strong>Result:</strong> Fast writes, but reads from replica databases can return outdated stale data if replication lag is high.
                            </p>
                        ) : (
                            <p>
                                Primary database holds client writes until both replica databases confirm sync is completed. <strong>Result:</strong> Zero stale reads (strong consistency), but write latency increases by the lag duration.
                            </p>
                        )}
                    </div>
                </div>

                {/* Center Canvas: Live visualization */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-2xl relative h-[450px] overflow-hidden lg:col-span-2 flex items-center justify-center">

                    {/* SVG Connector Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                        {/* Client -> Router */}
                        <line x1="12%" y1="50%" x2="35%" y2="50%" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

                        {/* Router -> Primary DB (Writes) */}
                        <line x1="35%" y1="50%" x2="62%" y2="20%" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="3 3" />

                        {/* Router -> Replicas (Reads) */}
                        <line x1="35%" y1="50%" x2="80%" y2="45%" stroke="#06b6d4" strokeWidth="2" strokeDasharray="3 3" />
                        <line x1="35%" y1="50%" x2="80%" y2="78%" stroke="#06b6d4" strokeWidth="2" strokeDasharray="3 3" />

                        {/* Primary DB -> Replicas (Sync Lines) */}
                        <line x1="62%" y1="20%" x2="80%" y2="45%" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 5" />
                        <line x1="62%" y1="20%" x2="80%" y2="78%" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 5" />
                    </svg>

                    {/* Client Node */}
                    <div className="absolute left-[6%] top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1.5">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
                            <Cpu className="text-slate-400" size={20} />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Client</span>
                    </div>

                    {/* Router / API Gateway Node */}
                    <div className="absolute left-[30%] top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1.5">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-950/20 border border-indigo-500/25 flex flex-col items-center justify-center shadow-lg shadow-indigo-500/5">
                            <Activity className="text-indigo-400 animate-pulse" size={20} />
                            <span className="text-[7px] font-black text-indigo-300 tracking-wider uppercase mt-0.5">Router</span>
                        </div>
                        <span className="text-[8px] font-medium text-slate-500 uppercase tracking-widest leading-none">Read/Write Split</span>
                    </div>

                    {/* Primary Database (Writes Only) */}
                    <div className="absolute left-[54%] top-[10%] z-10 flex flex-col items-center gap-1.5">
                        <div className="w-20 bg-slate-900 border border-purple-500/50 rounded-xl p-2.5 flex flex-col items-center gap-1 shadow-xl shadow-purple-500/5">
                            <Database size={16} className="text-purple-400" />
                            <span className="text-[9px] font-bold text-slate-200">Primary DB</span>
                            <span className="text-[9px] font-black font-mono bg-purple-950/60 border border-purple-900/40 text-purple-300 px-1.5 py-0.5 rounded">
                                v{primaryVersion}
                            </span>
                        </div>
                        <span className="text-[8px] font-bold text-purple-400/80 uppercase tracking-widest">Writes (POST)</span>
                    </div>

                    {/* Replica Databases (Reads Only) */}
                    <div className="absolute right-[12%] inset-y-0 w-24 flex flex-col justify-around py-4 z-10">
                        {replicaVersions.map((ver, idx) => {
                            const isStale = ver < primaryVersion;
                            return (
                                <div
                                    key={idx}
                                    className={`w-24 bg-slate-900 border rounded-xl p-2.5 flex flex-col items-center gap-1.5 shadow-xl transition-all
                                        ${isStale
                                            ? 'border-amber-500/60 shadow-amber-500/10'
                                            : 'border-cyan-500/40'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Database size={12} className="text-cyan-400" />
                                        <span className="text-[9px] font-semibold text-slate-300">Replica {idx + 1}</span>
                                    </div>
                                    <span className={`text-[9px] font-black font-mono px-1.5 py-0.5 rounded border
                                        ${isStale
                                            ? 'bg-amber-950/60 border-amber-900/40 text-amber-400'
                                            : 'bg-cyan-950/60 border-cyan-900/40 text-cyan-300'
                                        }
                                    `}>
                                        v{ver}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Packets Layer */}
                    {packets.map(p => {
                        const coords = getPacketCoordinates(p);
                        let color = 'bg-purple-400 shadow-[0_0_8px_#a78bfa]'; // Write

                        if (p.type === 'read') {
                            if (p.status === 'processing') {
                                color = 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]';
                            } else if (p.status === 'success') {
                                color = 'bg-emerald-400 shadow-[0_0_8px_#34d399]';
                            } else if (p.status === 'stale') {
                                color = 'bg-amber-500 shadow-[0_0_10px_#f59e0b] animate-ping';
                            }
                        } else if (p.type === 'sync') {
                            color = 'bg-amber-400 shadow-[0_0_8px_#fbbf24]';
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

                {/* Right Side: Metrics & Logs Panel */}
                <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-6 lg:col-span-1">
                    <h2 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Metrics Dashboard</h2>

                    {/* Stale reads gauge */}
                    <div className="space-y-1">
                        <span className="text-xs text-slate-500 block">Stale Read Rate</span>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-3xl font-black tracking-tight ${staleReadRate > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {staleReadRate}%
                            </span>
                        </div>
                        <div className="pt-2">
                            {/* Stale history Sparkline */}
                            <svg className="w-full h-8 stroke-amber-500 fill-none" viewBox="0 0 100 25">
                                <path
                                    d={staleReadHistory.map((val, i) => `${i === 0 ? 'M' : 'L'} ${(i / 29) * 100} ${25 - Math.min(23, (val / 100) * 23)}`).join(' ')}
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    </div>

                    <hr className="border-slate-800/60" />

                    {/* Read vs Write Latencies */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400">Response Latency</h3>
                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-xl">
                                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Reads</span>
                                <span className="text-lg font-black text-cyan-300">{stats.avgReadLat}ms</span>
                            </div>
                            <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-xl">
                                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Writes</span>
                                <span className="text-lg font-black text-purple-300">{stats.avgWriteLat}ms</span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-800/60" />

                    {/* Console Live Logs */}
                    <div className="space-y-2 flex-1 flex flex-col min-h-[140px]">
                        <span className="text-xs text-slate-500 block font-semibold">Query Router Console Logs</span>
                        <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex-1 overflow-y-auto font-mono text-[9px] leading-relaxed flex flex-col gap-1.5 max-h-[150px]">
                            {logs.length === 0 ? (
                                <span className="text-slate-600 italic">Console listening for queries...</span>
                            ) : (
                                logs.map(l => (
                                    <div key={l.id} className="flex items-start gap-1">
                                        <span className="text-slate-600 shrink-0">[{l.time}]</span>
                                        <span className={
                                            l.type === 'warning' ? 'text-amber-400' :
                                            l.type === 'success' ? 'text-emerald-400' :
                                            l.type === 'error' ? 'text-red-400' : 'text-slate-400'
                                        }>
                                            {l.message}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom: CAP Theorem & Causal Consistency Guide */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <HelpCircle className="text-indigo-400" size={18} /> Deep-Dive: Replication Trade-Offs
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Scaling database reads by adding replicas is powerful, but introduces the fundamental challenge of consistency.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-2">
                    {/* Async consistency column */}
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 text-xs font-bold uppercase">
                            Asynchronous (Eventual Consistency)
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">
                            Under asynchronous replication, the Primary DB commits writes locally and responds immediately. Changes are propagated to replicas in the background. If replication lag is high and a client reads from a replica immediately after writing to the primary, they will get a <strong>Stale Read</strong>.
                        </p>
                        <div className="space-y-2 text-xs">
                            <div className="flex gap-2">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span className="text-slate-400"><strong>Vanish Latency:</strong> Writes are lightning-fast because they do not wait for replicas.</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-red-400 font-bold">✗</span>
                                <span className="text-slate-400"><strong>Data Stale:</strong> Temporary version inconsistency (eventual consistency).</span>
                            </div>
                        </div>
                    </div>

                    {/* Sync consistency column */}
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-bold uppercase">
                            Synchronous (Strong Consistency)
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">
                            Under synchronous replication, the Primary DB forwards the write to all replicas and waits for all of them to replicate the data successfully before sending an acknowledgment back to the client. This guarantees that all subsequent read requests to replicas will serve the latest data.
                        </p>
                        <div className="space-y-2 text-xs">
                            <div className="flex gap-2">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span className="text-slate-400"><strong>Strong Consistency:</strong> Stale reads are physically impossible. All replicas serve the identical version.</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-red-400 font-bold">✗</span>
                                <span className="text-slate-400"><strong>High Latency Penalty:</strong> Write latency spikes dramatically, bound by the slowest database sync time.</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800/80 pt-6">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        Interactive Exercises to try:
                    </h3>
                    <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                        <li>
                            <strong>Visualize Stale Reads:</strong> Switch to <span className="text-white">Asynchronous Mode</span>, increase Replication Lag to <span className="text-white">3500ms</span>, and increase query rate. Notice how version counters mismatch and orange "Stale" packets bounce off replicas!
                        </li>
                        <li>
                            <strong>Trade-off Latency Check:</strong> Switch between <span className="text-white">Asynchronous</span> and <span className="text-white">Synchronous</span>. Watch the average write latency jump from <span className="text-emerald-400">~25ms</span> to <span className="text-red-400">~1500ms+</span>, demonstrating exactly why most large systems default to async replication.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default ReplicationPage;
