import { useEffect, useCallback, useRef } from 'react';
import { useReactFlow, type Node } from 'reactflow';
import { useExecutionStore, type Packet } from '../../store/executionStore';
import { type NodeProperties } from '../../types/node';

const TICK_RATE = 50; // ms
const MOVE_SPEED = 2; // progress per tick

export function useFlowExecution() {
    const {
        isRunning,
        addLog,
        packets,
        updatePackets,
        addPacket,
        updateNodeState
    } = useExecutionStore();

    const { getNodes, getEdges } = useReactFlow();

    // Spawn ref to prevent spam spawning
    const lastSpawnTime = useRef<number>(0);

    const spawnRequest = useCallback(() => {
        const nodes = getNodes();
        const clientNodes = nodes.filter(n => n.type === 'client');

        if (clientNodes.length === 0) return;

        // Random client
        const sourceNode = clientNodes[Math.floor(Math.random() * clientNodes.length)];

        // Find outgoing edges
        const edges = getEdges();
        const outgoingEdges = edges.filter(e => e.source === sourceNode.id);

        if (outgoingEdges.length === 0) return;

        // Pick one edge
        const edge = outgoingEdges[Math.floor(Math.random() * outgoingEdges.length)];

        const newPacket: Packet = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'request',
            edgeId: edge.id,
            sourceNodeId: sourceNode.id,
            targetNodeId: edge.target,
            progress: 0,
            pathStack: [sourceNode.id],
            status: 'moving',
            timestamp: Date.now()
        };

        addPacket(newPacket);
        updateNodeState(sourceNode.id, { active: true, lastActive: Date.now() });

        // Reset active state after brief moment
        setTimeout(() => updateNodeState(sourceNode.id, { active: false }), 500);

    }, [getNodes, getEdges, addPacket, updateNodeState]);

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            const now = Date.now();

            // 1. Spawn Logic (Every 2 seconds if no packets, or just periodic)
            // Simplified: if empty, spawn one. If not empty, 10% chance to spawn another (parallelism)
            if (packets.length === 0 || (Math.random() < 0.05 && packets.length < 5)) {
                if (now - lastSpawnTime.current > 1000) {
                    spawnRequest();
                    lastSpawnTime.current = now;
                }
            }

            // 2. Process Packets
            if (packets.length > 0) {
                const nodes = getNodes() as Node<NodeProperties>[];
                const edges = getEdges();

                const updatedPackets = packets.map(packet => {
                    // ---- CASE: MOVING ----
                    if (packet.status === 'moving') {
                        const newProgress = packet.progress + MOVE_SPEED;

                        // Arrived at target node
                        if (newProgress >= 100) {
                            const targetNode = nodes.find(n => n.id === packet.targetNodeId);

                            if (!targetNode) return { ...packet, status: 'failed' }; // Should not happen

                            // Start Processing
                            // Calculate latency
                            const latency = targetNode.data.latency || 500; // Default 500ms
                            const failureRate = targetNode.data.failureRate || 0;

                            // Check Failure
                            if (Math.random() * 100 < failureRate) {
                                addLog(`Request failed at ${targetNode.data.label}`, 'error');
                                updateNodeState(targetNode.id, { active: true, processingCount: 1 });
                                // Return error packet? Or just die? Let's die for now, maybe add 'error' type later
                                return { ...packet, status: 'failed', progress: 100 };
                            }

                            // Update Node State
                            updateNodeState(targetNode.id, { active: true, processingCount: 1 });

                            return {
                                ...packet,
                                status: 'processing',
                                nodeId: targetNode.id,
                                progress: 0, // Reset for next move
                                processingTimeRemaining: latency,
                                edgeId: undefined, // Not on edge
                                pathStack: [...packet.pathStack, targetNode.id]
                            } as Packet;
                        }

                        return { ...packet, progress: newProgress };
                    }

                    // ---- CASE: PROCESSING ----
                    if (packet.status === 'processing') {
                        const remaining = (packet.processingTimeRemaining || 0) - TICK_RATE;

                        // Still processing
                        if (remaining > 0) {
                            return { ...packet, processingTimeRemaining: remaining };
                        }

                        // Finished processing
                        const currentNodeId = packet.nodeId!;
                        const currentNode = nodes.find(n => n.id === currentNodeId);

                        // Update Node State (Idle)
                        updateNodeState(currentNodeId, { active: false, processingCount: 0 });

                        // Determine Next Step
                        // If Response -> Go back up stack
                        // If Request -> Find next edge OR Turn into Response if endpoint

                        if (packet.type === 'response') {
                            // Backtracking
                            const currentStackIndex = packet.pathStack.indexOf(currentNodeId);
                            if (currentStackIndex <= 0) {
                                // Returned to start!
                                addLog('Response received at Client', 'success');
                                return { ...packet, status: 'completed' };
                            }

                            const nextTargetId = packet.pathStack[currentStackIndex - 1];
                            const edge = edges.find(e =>
                                (e.source === currentNodeId && e.target === nextTargetId) ||
                                (e.target === currentNodeId && e.source === nextTargetId)
                            );

                            if (!edge) return { ...packet, status: 'failed' }; // Logic error

                            return {
                                ...packet,
                                status: 'moving',
                                edgeId: edge.id,
                                sourceNodeId: currentNodeId,
                                targetNodeId: nextTargetId,
                                nodeId: undefined,
                                progress: 0
                            };
                        } else {
                            // Forward Request
                            const outgoingEdges = edges.filter(e => e.source === currentNodeId);

                            if (outgoingEdges.length > 0) {
                                // Continue forward
                                const edge = outgoingEdges[Math.floor(Math.random() * outgoingEdges.length)];
                                return {
                                    ...packet,
                                    status: 'moving',
                                    edgeId: edge.id,
                                    sourceNodeId: currentNodeId,
                                    targetNodeId: edge.target,
                                    nodeId: undefined,
                                    progress: 0
                                };
                            } else {
                                // Dead end = Endpoint. Turn around!
                                addLog(`Request processed at ${currentNode?.data.label}. Sending Response.`, 'info');

                                // Reuse logic to find return path immediately? 
                                // Or just switch type and let next tick handle it? 
                                // Let's switch type and keep in processing state for 0ms to let next tick handle movement logic
                                return {
                                    ...packet,
                                    type: 'response',
                                    processingTimeRemaining: 0 // trigger move next tick
                                };
                            }
                        }
                    }

                    return packet;
                }).filter(p => p.status !== 'completed' && p.status !== 'failed'); // Cleanup

                updatePackets(updatedPackets as Packet[]);
            }

        }, TICK_RATE);

        return () => clearInterval(interval);
    }, [isRunning, packets, getNodes, getEdges, updatePackets, addPacket, addLog, updateNodeState, spawnRequest]);
}
