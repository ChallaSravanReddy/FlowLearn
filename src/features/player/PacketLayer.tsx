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

    // Calculate positions
    const sourceX = sourceNode.position.x + (sourceNode.width || 150) / 2;
    const sourceY = sourceNode.position.y + (sourceNode.height || 50) / 2;
    const targetX = targetNode.position.x + (targetNode.width || 150) / 2;
    const targetY = targetNode.position.y + (targetNode.height || 50) / 2;

    // Interpolate
    const t = packet.progress / 100;
    const currentX = sourceX + (targetX - sourceX) * t;
    const currentY = sourceY + (targetY - sourceY) * t;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
                x: currentX - 12, // Center the 24px icon
                y: currentY - 12,
                opacity: 1,
                scale: 1
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
