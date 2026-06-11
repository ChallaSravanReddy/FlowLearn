import { useExecutionStore, type Packet } from '../../store/executionStore';
import { useReactFlow, useViewport } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

export function PacketLayer() {
    const { packets } = useExecutionStore();
    const { x, y, zoom } = useViewport();

    if (packets.length === 0) return null;

    return (
        <div 
            className="absolute inset-0 pointer-events-none z-20 overflow-visible"
            style={{
                transform: `translate(${x}px, ${y}px) scale(${zoom})`,
                transformOrigin: '0 0'
            }}
        >
            <AnimatePresence>
                {packets.map((packet) => {
                    // Show packets that are currently moving or processing
                    if (packet.status !== 'moving' && packet.status !== 'processing') return null;
                    return <PacketItem key={packet.id} packet={packet} />;
                })}
            </AnimatePresence>
        </div>
    );
}

function PacketItem({ packet }: { packet: Packet }) {
    const { getNode, getEdges } = useReactFlow();

    const edge = packet.edgeId ? getEdges().find(e => e.id === packet.edgeId) : null;
    const isBackward = packet.type === 'response';

    let sourceNodeId = packet.sourceNodeId;
    let targetNodeId = packet.targetNodeId;

    if (edge) {
        sourceNodeId = edge.source;
        targetNodeId = edge.target;
    } else if (isBackward) {
        sourceNodeId = packet.targetNodeId;
        targetNodeId = packet.sourceNodeId;
    }

    let x = 0;
    let y = 0;
    let angle = 0;
    let pathFound = false;

    if (packet.status === 'processing') {
        const node = packet.nodeId ? getNode(packet.nodeId) : null;
        if (node) {
            // Center of the 140px node wrapper and 80x80px circular symbol
            x = node.position.x + 70;
            y = node.position.y + 40;
            angle = 0;
            pathFound = true;
        }
    }

    // 1. Try to get the coordinate along the actual DOM SVG path of the edge
    if (!pathFound && packet.edgeId) {
        const escapedId = typeof window !== 'undefined' && window.CSS && window.CSS.escape 
            ? window.CSS.escape(packet.edgeId) 
            : packet.edgeId;
        const pathEl = document.querySelector(
            `[data-id="${escapedId}"] path.react-flow__edge-path`
        ) as SVGPathElement | null;

        if (pathEl) {
            try {
                const totalLength = pathEl.getTotalLength();
                // If backward, interpolate progress backward (100 -> 0)
                const distancePercent = isBackward ? (100 - packet.progress) : packet.progress;
                const distance = (distancePercent / 100) * totalLength;
                const point = pathEl.getPointAtLength(distance);
                
                // Get tangent direction
                const nextDistance = isBackward 
                    ? Math.max(0, distance - 0.5)
                    : Math.min(totalLength, distance + 0.5);
                const nextPoint = pathEl.getPointAtLength(nextDistance);

                x = point.x;
                y = point.y;
                
                // direction vector points from point to nextPoint
                let angleRad = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x);
                
                // Normalize angle to keep the icon upright (never upside-down or reversed)
                if (angleRad > Math.PI / 2) {
                    angleRad -= Math.PI;
                } else if (angleRad < -Math.PI / 2) {
                    angleRad += Math.PI;
                }
                
                angle = angleRad * (180 / Math.PI);
                pathFound = true;
            } catch (err) {
                // Fail silently and use analytic fallback
            }
        }
    }

    // 2. Fallback to analytical Bezier math if SVG path is not found in DOM
    if (!pathFound) {
        if (!sourceNodeId || !targetNodeId) return null;

        const sourceNode = getNode(sourceNodeId);
        const targetNode = getNode(targetNodeId);

        if (!sourceNode || !targetNode) return null;

        // The node wrapper is 140px wide. The circle is 80x80px, centered horizontally at the top.
        // Therefore, the circle is at x = 30px to 110px, and y = 0px to 80px.
        // Right handle is at x = 110px + 6px = 116px, y = 40px.
        // Left handle is at x = 30px - 6px = 24px, y = 40px.
        const sourceX = sourceNode.position.x + 116;
        const sourceY = sourceNode.position.y + 40;

        const targetX = targetNode.position.x + 24;
        const targetY = targetNode.position.y + 40;

        const distX = targetX - sourceX;
        const curvature = Math.max(Math.abs(distX) * 0.5, 50);

        const cp1X = sourceX + curvature;
        const cp1Y = sourceY;
        const cp2X = targetX - curvature;
        const cp2Y = targetY;

        // Interpolate backward if backward
        const t = isBackward ? (1 - packet.progress / 100) : (packet.progress / 100);
        const mt = 1 - t;

        x = Math.pow(mt, 3) * sourceX +
            3 * Math.pow(mt, 2) * t * cp1X +
            3 * mt * Math.pow(t, 2) * cp2X +
            Math.pow(t, 3) * targetX;

        y = Math.pow(mt, 3) * sourceY +
            3 * Math.pow(mt, 2) * t * cp1Y +
            3 * mt * Math.pow(t, 2) * cp2Y +
            Math.pow(t, 3) * targetY;

        let dx = 3 * Math.pow(mt, 2) * (cp1X - sourceX) +
            6 * mt * t * (cp2X - cp1X) +
            3 * Math.pow(t, 2) * (targetX - cp2X);
        let dy = 3 * Math.pow(mt, 2) * (cp1Y - sourceY) +
            6 * mt * t * (cp2Y - cp1Y) +
            3 * Math.pow(t, 2) * (targetY - cp2Y);

        // Normalize dx/dy to always point rightwards (upright icon)
        if (dx < 0) {
            dx = -dx;
            dy = -dy;
        }

        angle = Math.atan2(dy, dx) * (180 / Math.PI);
    }

    const sourceNode = packet.sourceNodeId ? getNode(packet.sourceNodeId) : null;

    // Color Mapping based on Source Node Type
    const nodeColors: Record<string, string> = {
        client: 'bg-blue-500 border-blue-600 shadow-blue-300',
        api: 'bg-purple-500 border-purple-600 shadow-purple-300',
        service: 'bg-indigo-500 border-indigo-600 shadow-indigo-300',
        database: 'bg-green-500 border-green-600 shadow-green-300',
        cache: 'bg-orange-500 border-orange-600 shadow-orange-300',
        queue: 'bg-pink-500 border-pink-600 shadow-pink-300',
        loadbalancer: 'bg-teal-500 border-teal-600 shadow-teal-300',
        cdn: 'bg-sky-500 border-sky-600 shadow-sky-300',
        dns: 'bg-cyan-500 border-cyan-600 shadow-cyan-300',
        waf: 'bg-red-500 border-red-600 shadow-red-300',
        auth: 'bg-emerald-500 border-emerald-600 shadow-emerald-300',
        storage: 'bg-blue-400 border-blue-500 shadow-blue-200',
        search: 'bg-violet-500 border-violet-600 shadow-violet-300',
        worker: 'bg-fuchsia-500 border-fuchsia-600 shadow-fuchsia-300',
        notification: 'bg-amber-500 border-amber-600 shadow-amber-300',
        default: 'bg-gray-500 border-gray-600 shadow-gray-300',
    };

    let colorClass = nodeColors.default;

    if (packet.type === 'error') {
        colorClass = 'bg-red-500 border-red-600 shadow-red-300';
    } else if (sourceNode && sourceNode.data && sourceNode.data.type) {
        colorClass = nodeColors[sourceNode.data.type.replace('_', '')] || nodeColors.default;
    }

    return (
        <motion.div
            className="absolute top-0 left-0"
            style={{ x, y, rotate: angle }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                x: x - 12,
                y: y - 12,
                opacity: 1,
                scale: packet.status === 'processing' ? 1.15 : 1,
                rotate: angle
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.15 }}
        >
            <div className={`
                w-6 h-6 rounded-md border shadow-lg flex items-center justify-center
                ${colorClass} transition-colors duration-200
                ${packet.status === 'processing' ? 'animate-bounce' : ''}
            `}>
                <div className="absolute inset-0 rounded-md bg-white/20 animate-pulse" />
                {packet.status === 'processing' && (
                    <div className="absolute -inset-1.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                )}
                {packet.type === 'request' && <FileText size={12} className="relative z-10 text-white" />}
                {packet.type === 'response' && <CheckCircle size={12} className="relative z-10 text-white" />}
                {packet.type === 'error' && <XCircle size={12} className="relative z-10 text-white" />}
            </div>

            {/* Trail effect - only render during transit */}
            {packet.status === 'moving' && (
                <div className={`
                    absolute top-1/2 left-1/2 -translate-y-1/2 w-4 h-[2px] rounded-full
                    ${isBackward 
                        ? 'translate-x-[50%] bg-gradient-to-l from-transparent to-white/50' 
                        : '-translate-x-[150%] bg-gradient-to-r from-transparent to-white/50'}
                `} />
            )}
        </motion.div>
    );
}
