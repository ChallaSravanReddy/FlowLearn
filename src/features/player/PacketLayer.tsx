import { useExecutionStore, type Packet } from '../../store/executionStore';
import { useReactFlow } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

export function PacketLayer() {
    const { packets } = useExecutionStore();

    if (packets.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
            <AnimatePresence>
                {packets.map((packet) => {
                    // Only show packets that are currently "moving" on an edge
                    if (packet.status !== 'moving') return null;
                    return <PacketItem key={packet.id} packet={packet} />;
                })}
            </AnimatePresence>
        </div>
    );
}

function PacketItem({ packet }: { packet: Packet }) {
    const { getNode } = useReactFlow();

    // Safety check
    if (!packet.sourceNodeId || !packet.targetNodeId) return null;

    const sourceNode = getNode(packet.sourceNodeId);
    const targetNode = getNode(packet.targetNodeId);

    if (!sourceNode || !targetNode) return null;

    // Determine Handle Positions
    // If we have an edge, we can theoretically get handle IDs, but for standard BackendNode
    // we use Position.Right for source and Position.Left for target.

    const sourceW = (sourceNode as any).measured?.width ?? sourceNode.width ?? 150;
    const sourceH = (sourceNode as any).measured?.height ?? sourceNode.height ?? 50;
    const targetH = (targetNode as any).measured?.height ?? targetNode.height ?? 50;

    // Source Point (Right Handle)
    const sourceX = sourceNode.position.x + sourceW;
    const sourceY = sourceNode.position.y + sourceH / 2;

    // Target Point (Left Handle)
    const targetX = targetNode.position.x;
    const targetY = targetNode.position.y + targetH / 2;

    // Handle curved paths (Bezier)
    const distX = targetX - sourceX;

    // Curvature helper
    const curvature = Math.max(Math.abs(distX) * 0.5, 50);

    // Control points for cubic bezier
    // Start -> CP1 -> CP2 -> End
    const cp1X = sourceX + curvature;
    const cp1Y = sourceY;
    const cp2X = targetX - curvature;
    const cp2Y = targetY;

    // Interpolation (Cubic Bezier)
    const t = packet.progress / 100;
    const mt = 1 - t;

    // P = (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)*t^2*P2 + t^3*P3
    const x = Math.pow(mt, 3) * sourceX +
        3 * Math.pow(mt, 2) * t * cp1X +
        3 * mt * Math.pow(t, 2) * cp2X +
        Math.pow(t, 3) * targetX;

    const y = Math.pow(mt, 3) * sourceY +
        3 * Math.pow(mt, 2) * t * cp1Y +
        3 * mt * Math.pow(t, 2) * cp2Y +
        Math.pow(t, 3) * targetY;

    // Rotation calculation (Angle of tangent)
    // dy/dt and dx/dt for rotation
    const dx = 3 * Math.pow(mt, 2) * (cp1X - sourceX) +
        6 * mt * t * (cp2X - cp1X) +
        3 * Math.pow(t, 2) * (targetX - cp2X);
    const dy = 3 * Math.pow(mt, 2) * (cp1Y - sourceY) +
        6 * mt * t * (cp2Y - cp1Y) +
        3 * Math.pow(t, 2) * (targetY - cp2Y);

    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

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
        default: 'bg-gray-500 border-gray-600 shadow-gray-300',
    };

    // Override based on type first, then fallback to source node color
    let colorClass = nodeColors.default;

    if (packet.type === 'error') {
        colorClass = 'bg-red-500 border-red-600 shadow-red-300';
    } else if (sourceNode && sourceNode.data && sourceNode.data.type) {
        colorClass = nodeColors[sourceNode.data.type] || nodeColors.default;
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
                scale: 1,
                rotate: angle
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.1 }}
        >
            <div className={`
                w-6 h-6 rounded-md border shadow-lg flex items-center justify-center
                ${colorClass} transition-colors duration-200
            `}>
                <div className="absolute inset-0 rounded-md bg-white/20 animate-pulse" />
                {packet.type === 'request' && <FileText size={12} className="relative z-10" />}
                {packet.type === 'response' && <CheckCircle size={12} className="relative z-10" />}
                {packet.type === 'error' && <XCircle size={12} className="relative z-10" />}
            </div>

            {/* Trail effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-[150%] -translate-y-1/2 w-4 h-[2px] bg-gradient-to-r from-transparent to-white/50 rounded-full" />
        </motion.div>
    );
}
