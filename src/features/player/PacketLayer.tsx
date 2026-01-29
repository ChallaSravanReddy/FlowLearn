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
                    if (packet.status === 'processing') return null; // Hide when inside node? Or show sticky? Let's hide for now or show on node
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

    // Calculate Handle Positions
    // Source: Right Handle, Target: Left Handle
    const sourceW = (sourceNode as any).measured?.width ?? sourceNode.width ?? sourceNode.data?.width ?? 150;
    const sourceH = (sourceNode as any).measured?.height ?? sourceNode.height ?? sourceNode.data?.height ?? 50;
    const targetW = (targetNode as any).measured?.width ?? targetNode.width ?? targetNode.data?.width ?? 150;
    const targetH = (targetNode as any).measured?.height ?? targetNode.height ?? targetNode.data?.height ?? 50;

    const sourceHandleX = sourceNode.position.x + sourceW;
    const sourceHandleY = sourceNode.position.y + sourceH / 2;
    const targetHandleX = targetNode.position.x;
    const targetHandleY = targetNode.position.y + targetH / 2;

    // Calculate Control Points for Cubic Bezier (Standard React Flow Logic)
    // Curvature logic: typically 0.5 * distance for automatic horizontal edges
    const centerX = (sourceHandleX + targetHandleX) / 2;
    // For strictly horizontal flow (Right -> Left), we usually maintain same Y for control points relative to handles? No.
    // React Flow default:
    // cp1 = source + curvature
    // cp2 = target - curvature
    // Where curvature is roughly abs(targetX - sourceX) / 2?
    // Let's use a standard nice curve.

    // Fallback logic for calculating control points
    const dist = Math.sqrt((targetHandleX - sourceHandleX) ** 2 + (targetHandleY - sourceHandleY) ** 2);
    const minCurvature = 50;
    const maxCurvature = 150;
    // Simple logic:
    const curvature = Math.min(Math.max(Math.abs(targetHandleX - sourceHandleX) * 0.5, minCurvature), maxCurvature);

    const cp1X = sourceHandleX + curvature;
    const cp1Y = sourceHandleY;
    const cp2X = targetHandleX - curvature;
    const cp2Y = targetHandleY;

    // Cubic Bezier Interpolation
    // B(t) = (1-t)^3 P0 + 3(1-t)^2 t P1 + 3(1-t) t^2 P2 + t^3 P3
    const t = packet.progress / 100;

    // Reverse logic if this is a Response (packet coming back)? 
    // Actually the packet logic itself implies source->target. 
    // If packet.type === 'response', the 'sourceNodeId' is effectively the API and 'target' is Client in the store?
    // Let's rely on the store's source/target. If store swaps them for response, this logic works.

    const oneMinusT = 1 - t;
    const currentX =
        Math.pow(oneMinusT, 3) * sourceHandleX +
        3 * Math.pow(oneMinusT, 2) * t * cp1X +
        3 * oneMinusT * Math.pow(t, 2) * cp2X +
        Math.pow(t, 3) * targetHandleX;

    const currentY =
        Math.pow(oneMinusT, 3) * sourceHandleY +
        3 * Math.pow(oneMinusT, 2) * t * cp1Y +
        3 * oneMinusT * Math.pow(t, 2) * cp2Y +
        Math.pow(t, 3) * targetHandleY;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
                x: currentX - 12, // Center the 24px icon
                y: currentY - 12,
                opacity: 1,
                scale: 1,
                // Optional: Rotate along path? Maybe too much for now
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0 }} // Controlled by state updates
            className="absolute top-0 left-0"
        >
            <div className={`
                p-1.5 rounded-full shadow-lg border-2
                ${packet.type === 'request' ? 'bg-blue-100 border-blue-500 text-blue-600' : ''}
                ${packet.type === 'response' ? 'bg-green-100 border-green-500 text-green-600' : ''}
                ${packet.type === 'error' ? 'bg-red-100 border-red-500 text-red-600' : ''}
            `}>
                {packet.type === 'request' && <FileText size={14} />}
                {packet.type === 'response' && <CheckCircle size={14} />}
                {packet.type === 'error' && <XCircle size={14} />}
            </div>
        </motion.div>
    );
}
