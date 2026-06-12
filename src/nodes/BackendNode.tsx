import { Handle, Position, type NodeProps } from 'reactflow';
import { Clock, AlertTriangle, Cpu } from 'lucide-react';
import { memo } from 'react';
import { type NodeProperties } from '../types/node';
import { useExecutionStore } from '../store/executionStore';

// Custom SVG Figures for Rich Diagrams
const ClientFigure = ({ active }: { active: boolean }) => (
    <svg width="64" height="48" viewBox="0 0 64 48" fill="none" className="transition-all duration-300">
        {/* Monitor Screen Frame */}
        <rect x="2" y="2" width="60" height="38" rx="4" fill="#1e293b" stroke={active ? "#3b82f6" : "#64748b"} strokeWidth="2" />
        {/* Screen Content */}
        <rect x="6" y="6" width="52" height="22" rx="2" fill="#0f172a" />
        <rect x="10" y="10" width="20" height="4" rx="1" fill="#3b82f6" className={active ? "animate-pulse" : ""} />
        <rect x="10" y="18" width="36" height="3" rx="1" fill="#475569" />
        <circle cx="48" cy="12" r="2" fill="#ef4444" />
        <circle cx="52" cy="12" r="2" fill="#eab308" />
        {/* Monitor Stand */}
        <path d="M26 40 L38 40 L42 46 L22 46 Z" fill="#475569" stroke={active ? "#3b82f6" : "#64748b"} strokeWidth="1.5" />
    </svg>
);

const ApiFigure = ({ active }: { active: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="transition-all duration-300">
        {/* Outer Circular Portal */}
        <circle cx="30" cy="30" r="26" fill="#1e1b4b" stroke={active ? "#a855f7" : "#6366f1"} strokeWidth="2.5" strokeDasharray="4 2" className={active ? "animate-[spin_20s_linear_infinite]" : ""} />
        {/* Inner Core Shield */}
        <path d="M30 14 L44 21 V35 C44 43 36 47 30 49 C24 47 16 43 16 35 V21 L30 14 Z" fill={active ? "#6b21a8" : "#312e81"} stroke={active ? "#d8b4fe" : "#818cf8"} strokeWidth="2" />
        {/* Gateway Passageway Lines */}
        <path d="M22 30 H38" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" className={active ? "animate-pulse" : ""} />
        <path d="M30 22 V38" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" className={active ? "animate-pulse" : ""} />
    </svg>
);

const LoadBalancerFigure = ({ active }: { active: boolean }) => (
    <svg width="64" height="60" viewBox="0 0 64 60" fill="none" className="transition-all duration-300">
        {/* Router Ring */}
        <circle cx="32" cy="30" r="22" fill="#0f2a2a" stroke={active ? "#2dd4bf" : "#14b8a6"} strokeWidth="3" />
        {/* Core Hub */}
        <circle cx="32" cy="30" r="6" fill={active ? "#2dd4bf" : "#0d9488"} />
        {/* Flow Lines */}
        <path d="M12 30 H26" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" className={active ? "animate-pulse" : ""} />
        <path d="M38 28 L52 18" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" />
        <path d="M38 32 L52 42" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" />
        {/* Direction Arrowheads */}
        <path d="M24 27 L27 30 L24 33" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M49 17 L52 18 L51 21" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M49 43 L52 42 L51 39" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ServiceFigure = ({ active }: { active: boolean }) => (
    <svg width="64" height="56" viewBox="0 0 64 56" fill="none" className="transition-all duration-300">
        {/* Server Rack Box */}
        <rect x="4" y="2" width="56" height="52" rx="4" fill="#111827" stroke={active ? "#6366f1" : "#4b5563"} strokeWidth="2" />
        {/* Slot 1 */}
        <rect x="8" y="8" width="48" height="10" rx="2" fill="#1f2937" stroke={active ? "#818cf8" : "#374151"} strokeWidth="1" />
        <circle cx="14" cy="13" r="2.5" fill={active ? "#22c55e" : "#4b5563"} className={active ? "animate-ping" : ""} />
        <circle cx="14" cy="13" r="2.5" fill={active ? "#22c55e" : "#4b5563"} />
        <rect x="22" y="12" width="20" height="2" rx="1" fill="#4b5563" />
        <circle cx="48" cy="13" r="1.5" fill="#eab308" />

        {/* Slot 2 */}
        <rect x="8" y="23" width="48" height="10" rx="2" fill="#1f2937" stroke={active ? "#818cf8" : "#374151"} strokeWidth="1" />
        <circle cx="14" cy="28" r="2.5" fill={active ? "#22c55e" : "#4b5563"} />
        <rect x="22" y="27" width="24" height="2" rx="1" fill="#4b5563" />

        {/* Slot 3 */}
        <rect x="8" y="38" width="48" height="10" rx="2" fill="#1f2937" stroke={active ? "#818cf8" : "#374151"} strokeWidth="1" />
        <circle cx="14" cy="43" r="2.5" fill={active ? "#ef4444" : "#4b5563"} />
        <rect x="22" y="42" width="16" height="2" rx="1" fill="#4b5563" />
    </svg>
);

const DatabaseFigure = ({ active }: { active: boolean }) => (
    <svg width="56" height="64" viewBox="0 0 56 64" fill="none" className="transition-all duration-300">
        {/* Database Cylinders Stack */}
        {/* Tier 3 (Bottom) */}
        <path d="M6 38 C6 34 50 34 50 38 V48 C50 52 6 52 6 48 Z" fill="#064e3b" stroke={active ? "#22c55e" : "#15803d"} strokeWidth="2" />
        <ellipse cx="28" cy="38" rx="22" ry="6" fill="#14532d" stroke={active ? "#22c55e" : "#15803d"} strokeWidth="2" />

        {/* Tier 2 (Middle) */}
        <path d="M6 22 C6 18 50 18 50 22 V32 C50 36 6 36 6 32 Z" fill="#064e3b" stroke={active ? "#22c55e" : "#15803d"} strokeWidth="2" />
        <ellipse cx="28" cy="22" rx="22" ry="6" fill="#14532d" stroke={active ? "#22c55e" : "#15803d"} strokeWidth="2" />

        {/* Tier 1 (Top) */}
        <path d="M6 6 C6 2 50 2 50 6 V16 C50 20 6 20 6 16 Z" fill={active ? "#0f766e" : "#064e3b"} stroke={active ? "#22c55e" : "#15803d"} strokeWidth="2" />
        <ellipse cx="28" cy="6" rx="22" ry="6" fill={active ? "#115e59" : "#14532d"} stroke={active ? "#22c55e" : "#15803d"} strokeWidth="2" />

        {/* Active disk access lights */}
        {active && (
            <>
                <circle cx="40" cy="11" r="2.5" fill="#22c55e" className="animate-pulse" />
                <circle cx="40" cy="27" r="2.5" fill="#22c55e" className="animate-pulse" />
                <circle cx="40" cy="43" r="2.5" fill="#22c55e" className="animate-pulse" />
            </>
        )}
    </svg>
);

const CacheFigure = ({ active }: { active: boolean }) => (
    <svg width="60" height="52" viewBox="0 0 60 52" fill="none" className="transition-all duration-300">
        {/* Layer 3 (Bottom) */}
        <path d="M6 34 L30 44 L54 34 L30 24 Z" fill="#7c2d12" stroke={active ? "#f97316" : "#c2410c"} strokeWidth="2" />
        {/* Layer 2 (Middle) */}
        <path d="M6 22 L30 32 L54 22 L30 12 Z" fill="#7c2d12" stroke={active ? "#f97316" : "#c2410c"} strokeWidth="2" />
        {/* Layer 1 (Top) */}
        <path d="M6 10 L30 20 L54 10 L30 0 Z" fill={active ? "#9a3412" : "#7c2d12"} stroke={active ? "#f97316" : "#c2410c"} strokeWidth="2" />

        {/* Caching Connection Nodes */}
        {active && (
            <circle cx="30" cy="20" r="4" fill="#fb923c" className="animate-ping" />
        )}
    </svg>
);

const QueueFigure = ({ active }: { active: boolean }) => (
    <svg width="68" height="40" viewBox="0 0 68 40" fill="none" className="transition-all duration-300">
        {/* Queue Conveyor Track */}
        <rect x="2" y="8" width="64" height="24" rx="12" fill="#1f1625" stroke={active ? "#ec4899" : "#be185d"} strokeWidth="2.5" />
        {/* Queue Sliders / Messages */}
        <g className={active ? "animate-[pulse_1.5s_infinite]" : ""}>
            {/* Msg 1 */}
            <rect x="10" y="13" width="12" height="14" rx="2" fill="#db2777" />
            <path d="M10 16 L16 20 L22 16" stroke="#fbcfe8" strokeWidth="1" />
            {/* Msg 2 */}
            <rect x="28" y="13" width="12" height="14" rx="2" fill="#be185d" />
            <path d="M28 16 L34 20 L40 16" stroke="#fbcfe8" strokeWidth="1" />
            {/* Msg 3 */}
            <rect x="46" y="13" width="12" height="14" rx="2" fill={active ? "#db2777" : "#9d174d"} />
            <path d="M46 16 L52 20 L58 16" stroke="#fbcfe8" strokeWidth="1" />
        </g>
    </svg>
);

const CdnFigure = ({ active }: { active: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="transition-all duration-300">
        {/* Network Globe */}
        <circle cx="30" cy="30" r="22" fill="#0c4a6e" stroke={active ? "#38bdf8" : "#0284c7"} strokeWidth="2" />
        <ellipse cx="30" cy="30" rx="22" ry="6" stroke="#0284c7" strokeWidth="1.5" />
        <ellipse cx="30" cy="30" rx="6" ry="22" stroke="#0284c7" strokeWidth="1.5" />

        {/* Satellite cloud connections */}
        <circle cx="16" cy="18" r="3" fill={active ? "#38bdf8" : "#bae6fd"} />
        <circle cx="44" cy="18" r="3" fill={active ? "#38bdf8" : "#bae6fd"} />
        <circle cx="30" cy="48" r="3" fill={active ? "#38bdf8" : "#bae6fd"} />

        {/* Lines between clouds */}
        <line x1="16" y1="18" x2="30" y2="30" stroke="#bae6fd" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="44" y1="18" x2="30" y2="30" stroke="#bae6fd" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="30" y1="48" x2="30" y2="30" stroke="#bae6fd" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
);

const DnsFigure = ({ active }: { active: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="transition-all duration-300">
        {/* DNS Target Rings */}
        <circle cx="30" cy="30" r="26" fill="#0c2e3a" stroke={active ? "#22d4bf" : "#0d9488"} strokeWidth="2" strokeDasharray="3 3" className={active ? "animate-[spin_30s_linear_infinite]" : ""} />
        <circle cx="30" cy="30" r="16" fill="#0c3e4a" stroke={active ? "#22d4bf" : "#0d9488"} strokeWidth="1.5" />
        {/* Crosshairs */}
        <line x1="30" y1="4" x2="30" y2="56" stroke={active ? "#22d4bf" : "#0d9488"} strokeWidth="1.5" strokeDasharray="2 2" />
        <line x1="4" y1="30" x2="56" y2="30" stroke={active ? "#22d4bf" : "#0d9488"} strokeWidth="1.5" strokeDasharray="2 2" />
        {/* Core Server Node */}
        <circle cx="30" cy="30" r="6" fill={active ? "#22d4bf" : "#0d9488"} className={active ? "animate-pulse" : ""} />
    </svg>
);

const WafFigure = ({ active }: { active: boolean }) => (
    <svg width="64" height="52" viewBox="0 0 64 52" fill="none" className="transition-all duration-300">
        {/* Outer shield frame */}
        <path d="M12 4 L32 0 L52 4 V28 C52 40 32 48 32 48 C32 48 12 40 12 28 V4 Z" fill="#450a0a" stroke={active ? "#ef4444" : "#991b1b"} strokeWidth="2.5" />
        {/* Brick pattern lines inside shield */}
        <path d="M16 14 H48" stroke={active ? "#fca5a5" : "#ef4444"} strokeWidth="1.5" />
        <path d="M16 26 H48" stroke={active ? "#fca5a5" : "#ef4444"} strokeWidth="1.5" />
        <path d="M24 14 V26" stroke={active ? "#fca5a5" : "#ef4444"} strokeWidth="1.5" />
        <path d="M40 14 V26" stroke={active ? "#fca5a5" : "#ef4444"} strokeWidth="1.5" />
        <path d="M32 26 V38" stroke={active ? "#fca5a5" : "#ef4444"} strokeWidth="1.5" />
    </svg>
);

const AuthFigure = ({ active }: { active: boolean }) => (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="transition-all duration-300">
        {/* Lock Body */}
        <rect x="10" y="22" width="36" height="28" rx="6" fill="#022c22" stroke={active ? "#10b981" : "#065f46"} strokeWidth="2.5" />
        {/* Lock Shackle */}
        <path d="M18 22 V14 C18 8 22 4 28 4 C34 4 38 8 38 14 V22" stroke={active ? "#10b981" : "#065f46"} strokeWidth="2.5" strokeLinecap="round" />
        {/* Keyhole */}
        <circle cx="28" cy="32" r="3.5" fill={active ? "#34d399" : "#065f46"} />
        <path d="M28 35.5 V42" stroke={active ? "#34d399" : "#065f46"} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
);

const StorageFigure = ({ active }: { active: boolean }) => (
    <svg width="60" height="56" viewBox="0 0 60 56" fill="none" className="transition-all duration-300">
        {/* S3 Box outline */}
        <rect x="6" y="12" width="48" height="38" rx="4" fill="#0f172a" stroke={active ? "#3b82f6" : "#1d4ed8"} strokeWidth="2.5" />
        {/* Drawer slots */}
        <rect x="12" y="18" width="36" height="8" rx="1" fill="#1e293b" stroke={active ? "#60a5fa" : "#2563eb"} strokeWidth="1.5" />
        <rect x="12" y="32" width="36" height="8" rx="1" fill="#1e293b" stroke={active ? "#60a5fa" : "#2563eb"} strokeWidth="1.5" />
        {/* Handle dots */}
        <circle cx="30" cy="22" r="2" fill={active ? "#93c5fd" : "#3b82f6"} />
        <circle cx="30" cy="36" r="2" fill={active ? "#93c5fd" : "#3b82f6"} />
        {/* Status pulse */}
        {active && <circle cx="48" cy="22" r="2" fill="#22c55e" className="animate-ping" />}
    </svg>
);

const SearchFigure = ({ active }: { active: boolean }) => (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="transition-all duration-300">
        {/* Document Sheet */}
        <rect x="10" y="4" width="30" height="42" rx="4" fill="#2e1065" stroke={active ? "#8b5cf6" : "#6d28d9"} strokeWidth="2" />
        <line x1="16" y1="14" x2="34" y2="14" stroke={active ? "#c084fc" : "#6d28d9"} strokeWidth="1.5" />
        <line x1="16" y1="22" x2="34" y2="22" stroke={active ? "#c084fc" : "#6d28d9"} strokeWidth="1.5" />
        <line x1="16" y1="30" x2="26" y2="30" stroke={active ? "#c084fc" : "#6d28d9"} strokeWidth="1.5" />
        {/* Magnifying Glass */}
        <g className={active ? "animate-[pulse_1.5s_infinite]" : ""}>
            <circle cx="36" cy="36" r="10" fill="#1e1b4b" stroke={active ? "#a78bfa" : "#8b5cf6"} strokeWidth="2.5" />
            <line x1="43" y1="43" x2="52" y2="52" stroke={active ? "#a78bfa" : "#8b5cf6"} strokeWidth="3" strokeLinecap="round" />
        </g>
    </svg>
);

const WorkerFigure = ({ active }: { active: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="transition-all duration-300">
        {/* Rotating Outer Gear */}
        <path d="M30 6 L33 12 L39 10 L40 16 L46 17 L44 23 L49 26 L45 31 L49 36 L44 39 L46 45 L40 46 L39 52 L33 50 L30 56 L27 50 L21 52 L20 46 L14 45 L16 39 L11 36 L15 31 L11 26 L16 23 L14 17 L20 16 L21 10 L27 12 Z" 
              fill="#3b0764" stroke={active ? "#d946ef" : "#c084fc"} strokeWidth="2.5" className={active ? "animate-[spin_10s_linear_infinite]" : ""} />
        {/* Center Core */}
        <circle cx="30" cy="30" r="12" fill="#1e1b4b" stroke={active ? "#d946ef" : "#a21caf"} strokeWidth="2" />
        <circle cx="30" cy="30" r="4" fill={active ? "#d946ef" : "#a21caf"} />
    </svg>
);

const NotificationFigure = ({ active }: { active: boolean }) => (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="transition-all duration-300">
        {/* Notification Bell */}
        <path d="M28 6 C20 6 18 16 18 24 V34 L12 40 H44 L38 34 V24 C38 16 36 6 28 6 Z" fill="#451a03" stroke={active ? "#fbbf24" : "#d97706"} strokeWidth="2.5" className={active ? "animate-[bounce_1s_infinite]" : ""} />
        {/* Bell Clapper */}
        <path d="M24 44 C24 46 26 48 28 48 C30 48 32 46 32 44" stroke={active ? "#fbbf24" : "#d97706"} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
);

const ServerFigure = ({ active }: { active: boolean }) => (
    <svg width="60" height="56" viewBox="0 0 60 56" fill="none" className="transition-all duration-300">
        {/* Single Server Box */}
        <rect x="4" y="8" width="52" height="40" rx="3" fill="#1e293b" stroke={active ? "#3b82f6" : "#64748b"} strokeWidth="2.5" />
        <rect x="10" y="16" width="40" height="6" rx="1" fill="#0f172a" />
        <circle cx="16" cy="19" r="1.5" fill={active ? "#22c55e" : "#4b5563"} />
        <rect x="22" y="18" width="20" height="2" rx="0.5" fill="#4b5563" />
        <rect x="10" y="28" width="40" height="6" rx="1" fill="#0f172a" />
        <circle cx="16" cy="31" r="1.5" fill={active ? "#22c55e" : "#4b5563"} />
        <rect x="22" y="30" width="20" height="2" rx="0.5" fill="#4b5563" />
        {/* Connection LED lights */}
        <circle cx="48" cy="19" r="1.5" fill={active ? "#3b82f6" : "#4b5563"} className={active ? "animate-pulse" : ""} />
        <circle cx="48" cy="31" r="1.5" fill={active ? "#3b82f6" : "#4b5563"} className={active ? "animate-pulse" : ""} />
    </svg>
);

const ServerlessFigure = ({ active }: { active: boolean }) => (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="transition-all duration-300">
        {/* Lightning bolt or Cloud function lambda λ */}
        <circle cx="28" cy="28" r="22" fill="#451a03" stroke={active ? "#f59e0b" : "#d97706"} strokeWidth="2" />
        {/* Lambda character λ */}
        <path d="M20 38 L26 26 L22 18 H27 L30 24 L34 18 H38 M29 30 L35 38" stroke={active ? "#fef08a" : "#f59e0b"} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Small lightning bolt indicator */}
        {active && (
            <path d="M28 2 L32 8 H26 L28 12" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" className="animate-bounce" />
        )}
    </svg>
);

const BrokerFigure = ({ active }: { active: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="transition-all duration-300">
        {/* Event streaming pub-sub broker */}
        <circle cx="30" cy="30" r="24" fill="#0f172a" stroke={active ? "#ec4899" : "#64748b"} strokeWidth="2" />
        {/* Broker Nodes connected in circle */}
        <circle cx="30" cy="16" r="4.5" fill={active ? "#f472b6" : "#be185d"} />
        <circle cx="18" cy="36" r="4.5" fill={active ? "#f472b6" : "#be185d"} />
        <circle cx="42" cy="36" r="4.5" fill={active ? "#f472b6" : "#be185d"} />
        {/* Connecting Ring Lines */}
        <path d="M30 16 L18 36 M18 36 L42 36 M42 36 L30 16" stroke={active ? "#ec4899" : "#be185d"} strokeWidth="1.5" strokeDasharray="3 3" />
        {/* Stream packets circulating */}
        {active && (
            <>
                <circle cx="24" cy="26" r="2" fill="#ec4899" className="animate-ping" />
                <circle cx="36" cy="26" r="2" fill="#ec4899" className="animate-ping" />
                <circle cx="30" cy="36" r="2" fill="#ec4899" className="animate-ping" />
            </>
        )}
    </svg>
);

const FirewallFigure = ({ active }: { active: boolean }) => (
    <svg width="60" height="56" viewBox="0 0 60 56" fill="none" className="transition-all duration-300">
        {/* Red Brick Wall Firewall */}
        <rect x="4" y="6" width="52" height="44" rx="4" fill="#450a0a" stroke={active ? "#ef4444" : "#991b1b"} strokeWidth="2.5" />
        {/* Brick Lines */}
        <path d="M4 17 H56 M4 28 H56 M4 39 H56" stroke={active ? "#fca5a5" : "#ef4444"} strokeWidth="1.5" />
        <path d="M16 6 V17 M36 6 V17 M26 17 V28 M46 17 V28 M16 28 V39 M36 28 V39 M26 39 V50 M46 39 V50" stroke={active ? "#fca5a5" : "#ef4444"} strokeWidth="1.5" />
        {/* Fire sparks when active */}
        {active && (
            <path d="M12 48 C16 42 22 42 26 48 C30 42 36 42 40 48" stroke="#f97316" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
        )}
    </svg>
);

const componentColors = {
    client: 'border-blue-500 bg-blue-950/40 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.1)]',
    api: 'border-purple-500 bg-purple-950/40 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.1)]',
    loadbalancer: 'border-teal-500 bg-teal-950/40 text-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.1)]',
    service: 'border-indigo-500 bg-indigo-950/40 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.1)]',
    server: 'border-blue-500 bg-blue-950/40 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.1)]',
    serverless: 'border-amber-500 bg-amber-950/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.1)]',
    database: 'border-green-500 bg-green-950/40 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.1)]',
    cache: 'border-orange-500 bg-orange-950/40 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.1)]',
    queue: 'border-pink-500 bg-pink-950/40 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.1)]',
    broker: 'border-pink-500 bg-pink-950/40 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.1)]',
    cdn: 'border-sky-500 bg-sky-950/40 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.1)]',
    dns: 'border-cyan-500 bg-cyan-950/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.1)]',
    waf: 'border-red-500 bg-red-950/40 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.1)]',
    firewall: 'border-red-500 bg-red-950/40 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.1)]',
    auth: 'border-emerald-500 bg-emerald-950/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.1)]',
    storage: 'border-blue-400 bg-blue-950/40 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.1)]',
    search: 'border-violet-500 bg-violet-950/40 text-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.1)]',
    worker: 'border-fuchsia-500 bg-fuchsia-950/40 text-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.1)]',
    notification: 'border-amber-500 bg-amber-950/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.1)]',
    default: 'border-gray-500 bg-gray-900/40 text-gray-400 shadow-[0_0_12px_rgba(156,163,175,0.1)]',
};

const labels = {
    client: 'Client User',
    api: 'API Gateway',
    loadbalancer: 'Load Balancer',
    service: 'Backend Service',
    server: 'VM Server',
    serverless: 'Serverless Fn',
    database: 'Database (SQL)',
    cache: 'Cache (Redis)',
    queue: 'Message Queue',
    broker: 'Message Broker',
    cdn: 'CDN Edge',
    dns: 'DNS Server',
    waf: 'Firewall (WAF)',
    firewall: 'Firewall',
    auth: 'Auth Service',
    storage: 'Object Storage (S3)',
    search: 'Search Index',
    worker: 'Background Worker',
    notification: 'Notification Hub',
    default: 'System Component',
};

export const BackendNode = memo(({ id, data, selected }: NodeProps<NodeProperties>) => {
    // Normalise type (handle load_balancer -> loadbalancer)
    const typeKey = (data.type || '').replace('_', '') as keyof typeof componentColors;
    const colorClass = componentColors[typeKey] || componentColors.default;
    const typeLabel = labels[typeKey] || labels.default;

    // Subscribe to execution state for this specific node
    const nodeState = useExecutionStore((state) => state.nodeStates[id]);
    const isActive = nodeState?.active || false;
    const processingCount = nodeState?.processingCount || 0;

    // Render corresponding diagram figure
    const renderFigure = () => {
        switch (typeKey) {
            case 'client':
                return <ClientFigure active={isActive} />;
            case 'api':
                return <ApiFigure active={isActive} />;
            case 'loadbalancer':
                return <LoadBalancerFigure active={isActive} />;
            case 'service':
                return <ServiceFigure active={isActive} />;
            case 'server':
                return <ServerFigure active={isActive} />;
            case 'serverless':
                return <ServerlessFigure active={isActive} />;
            case 'database':
                return <DatabaseFigure active={isActive} />;
            case 'cache':
                return <CacheFigure active={isActive} />;
            case 'queue':
                return <QueueFigure active={isActive} />;
            case 'broker':
                return <BrokerFigure active={isActive} />;
            case 'cdn':
                return <CdnFigure active={isActive} />;
            case 'dns':
                return <DnsFigure active={isActive} />;
            case 'waf':
                return <WafFigure active={isActive} />;
            case 'firewall':
                return <FirewallFigure active={isActive} />;
            case 'auth':
                return <AuthFigure active={isActive} />;
            case 'storage':
                return <StorageFigure active={isActive} />;
            case 'search':
                return <SearchFigure active={isActive} />;
            case 'worker':
                return <WorkerFigure active={isActive} />;
            case 'notification':
                return <NotificationFigure active={isActive} />;
            default:
                return <ServiceFigure active={isActive} />;
        }
    };
    const loadRatio = data.capacity && data.capacity > 0 ? (processingCount / data.capacity) : 0;
    const isOverloaded = loadRatio >= 0.8;

    return (
        <div className={`
            relative flex flex-col items-center text-center group transition-all duration-300 w-[140px] select-none
            ${selected ? 'scale-[1.03]' : ''}
            ${isActive || isOverloaded ? 'scale-[1.03]' : ''}
        `}>
            {/* Symbol Base Circle */}
            <div className={`
                relative w-20 h-20 rounded-full border-2 backdrop-blur-md flex items-center justify-center transition-all duration-300
                ${isOverloaded 
                    ? 'border-red-500 bg-red-950/60 text-red-350 shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-[pulse_1.5s_infinite]' 
                    : colorClass}
                ${selected ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 border-indigo-400' : ''}
                ${isActive && !isOverloaded ? 'shadow-[0_0_20px_rgba(99,102,241,0.6)] border-indigo-400' : ''}
            `}>
                {/* Active Glow Effect */}
                {isActive && !isOverloaded && (
                    <div className="absolute inset-0 rounded-full animate-pulse bg-indigo-500/10 pointer-events-none" />
                )}

                {/* Overloaded Glow Effect */}
                {isOverloaded && (
                    <div className="absolute inset-0 rounded-full animate-pulse bg-red-500/20 pointer-events-none" />
                )}

                {/* Left handle for incoming connections */}
                {typeKey !== 'client' && (
                    <Handle
                        type="target"
                        position={Position.Left}
                        style={{ left: '-6px', top: '50%', transform: 'translateY(-50%)' }}
                        className="w-3 h-3 bg-indigo-500 border-2 border-slate-955 border-slate-950 rounded-full hover:bg-indigo-400 transition-colors"
                    />
                )}

                {/* Diagram Icon / Visual Figure */}
                <div className="h-12 w-12 flex items-center justify-center">
                    {renderFigure()}
                </div>

                {/* Processing Queue Banner */}
                {processingCount > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center">
                        <span className="flex h-5 w-5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-indigo-600 border border-indigo-400 text-[10px] text-white font-extrabold items-center justify-center shadow-lg">
                                {processingCount}
                            </span>
                        </span>
                    </div>
                )}

                {/* Overloaded Warning Badge */}
                {isOverloaded && (
                    <div className="absolute -top-1.5 -left-1.5 flex items-center justify-center animate-bounce">
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 border border-red-400 text-[10px] text-white font-extrabold items-center justify-center shadow-lg animate-pulse" title={`Overloaded: ${Math.round(loadRatio * 100)}% load`}>
                            ⚠️
                        </span>
                    </div>
                )}

                {/* Right handle for outgoing connections */}
                {!['database', 'cache', 'storage', 'search', 'notification'].includes(typeKey) && (
                    <Handle
                        type="source"
                        position={Position.Right}
                        style={{ right: '-6px', top: '50%', transform: 'translateY(-50%)' }}
                        className="w-3 h-3 bg-indigo-500 border-2 border-slate-950 rounded-full hover:bg-indigo-400 transition-colors"
                    />
                )}
            </div>

            {/* Label and parameters placed below the symbol */}
            <div className="mt-2.5 w-full flex flex-col items-center">
                <div className="text-xs font-bold text-white tracking-wide truncate max-w-full drop-shadow-md">
                    {data.label}
                </div>
                <div className="text-[9px] text-indigo-300 uppercase tracking-widest font-extrabold mt-0.5 opacity-85">
                    {typeLabel}
                </div>

                {isOverloaded && (
                    <div className="text-[8px] bg-red-500/20 border border-red-500/50 px-2 py-0.5 rounded-full text-red-300 font-bold tracking-wider mt-1 uppercase animate-pulse">
                        🔥 Overloaded ({Math.round(loadRatio * 100)}%)
                    </div>
                )}

                {/* Parameters overlay mini stats */}
                <div className="flex justify-center gap-1 mt-1.5 flex-wrap max-w-full">
                    {data.latency !== undefined && data.latency > 0 && (
                        <div className="flex items-center gap-0.5 text-[8px] bg-slate-950/80 border border-slate-800/80 px-1.5 py-0.5 rounded-full text-slate-300 font-mono">
                            <Clock size={8} className="text-teal-400" />
                            {data.latency}ms
                        </div>
                    )}
                    {data.failureRate !== undefined && data.failureRate > 0 && (
                        <div className="flex items-center gap-0.5 text-[8px] bg-red-950/70 border border-red-900/40 px-1.5 py-0.5 rounded-full text-red-350 font-mono">
                            <AlertTriangle size={8} className="text-red-400" />
                            {data.failureRate}%
                        </div>
                    )}
                    {typeKey === 'client' && data.traffic !== undefined && (
                        <div className="flex items-center gap-0.5 text-[8px] bg-blue-950/80 border border-blue-900/40 px-1.5 py-0.5 rounded-full text-blue-300 font-mono">
                            <span className="text-[10px]">🚦</span>
                            {data.traffic} rps
                        </div>
                    )}
                    {data.capacity !== undefined && typeKey !== 'client' && (
                        <div className="flex items-center gap-0.5 text-[8px] bg-slate-950/80 border border-slate-800/80 px-1.5 py-0.5 rounded-full text-slate-300 font-mono">
                            <Cpu size={8} className="text-blue-400" />
                            {data.capacity} {typeKey === 'database' ? 'conn' : 'threads'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

BackendNode.displayName = 'BackendNode';
