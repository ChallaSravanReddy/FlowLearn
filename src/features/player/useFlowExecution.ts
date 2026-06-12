import { useEffect, useCallback, useRef } from 'react';
import { useReactFlow, type Node } from 'reactflow';
import { useExecutionStore, type Packet } from '../../store/executionStore';
import { type NodeProperties } from '../../types/node';

const TICK_RATE = 50; // ms

export function useFlowExecution() {
    const isRunning = useExecutionStore((state) => state.isRunning);
    const { getNodes, getEdges } = useReactFlow();

    // Spawn ref to prevent spam spawning
    const lastSpawnTime = useRef<number>(0);
    const triggeredEvents = useRef<Set<string>>(new Set());

    const spawnRequest = useCallback((sourceId?: string, targetId?: string) => {
        const { addPacket, updateNodeState } = useExecutionStore.getState();
        const nodes = getNodes();
        const edges = getEdges();

        let sourceNode: Node | undefined;
        let edge: any;

        if (sourceId && targetId) {
            sourceNode = nodes.find(n => n.id === sourceId);
            edge = edges.find(e => e.source === sourceId && e.target === targetId);
        } else {
            const clientNodes = nodes.filter(n => n.type === 'client');
            if (clientNodes.length === 0) return;
            const chosenNode = clientNodes[Math.floor(Math.random() * clientNodes.length)];
            if (!chosenNode) return;
            sourceNode = chosenNode;
            const outgoingEdges = edges.filter(e => e.source === chosenNode.id);
            if (outgoingEdges.length === 0) return;
            edge = outgoingEdges[Math.floor(Math.random() * outgoingEdges.length)];
        }

        if (!sourceNode || !edge) return;

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
        const sid = sourceNode.id;
        setTimeout(() => updateNodeState(sid, { active: false }), 500);

    }, [getNodes, getEdges]);

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            const { packets, addLog, updatePackets, updateNodeState } = useExecutionStore.getState();
            const now = Date.now();
            const nodes = getNodes() as Node<NodeProperties>[];
            const edges = getEdges();

            // 1. Spawning Logic
            const clientNodes = nodes.filter(n => n.type === 'client');
            const targetClient = clientNodes[0]; // pick first client for main stream
            const rps = targetClient?.data.traffic ?? 2; // requests per second (default 2)
            const spawnInterval = 1000 / rps;
            const elapsed = now - lastSpawnTime.current;

            if (elapsed >= spawnInterval) {
                // Determine how many requests we should spawn to meet the RPS
                const spawnCount = Math.min(5, Math.ceil(elapsed / spawnInterval));
                for (let i = 0; i < spawnCount; i++) {
                    spawnRequest();
                }
                lastSpawnTime.current = now;
            }

            // Clean up triggered events if it gets too large
            if (triggeredEvents.current.size > 1000) triggeredEvents.current.clear();

            // 2. Process Packets
            if (packets.length > 0) {
                const updatedPackets = packets.map(packet => {
                    // ---- CASE: MOVING ----
                    if (packet.status === 'moving') {
                        const sourceNode = nodes.find(n => n.id === packet.sourceNodeId);
                        const targetNode = nodes.find(n => n.id === packet.targetNodeId);

                        // Transit time: if from client, use client network latency. Otherwise, default to 400ms.
                        let duration = 400;
                        if (sourceNode && sourceNode.data.type === 'client') {
                            duration = sourceNode.data.latency || 500;
                        }

                        const totalTicks = Math.max(1, duration / TICK_RATE);
                        const moveIncrement = 100 / totalTicks;

                        const newProgress = packet.progress + moveIncrement;

                        // Arrived at target node
                        if (newProgress >= 100) {
                            if (!targetNode) return { ...packet, status: 'failed' };

                            // Determine properties
                            const baseFailureRate = targetNode.data.failureRate || 0;
                            const capacity = targetNode.data.capacity || 10;

                            // Calculate current load on this node
                            const currentLoad = packets.filter(p => p.nodeId === targetNode.id && p.status === 'processing').length;
                            const loadRatio = currentLoad / capacity;

                            // Check Capacity Overload
                            if (loadRatio >= 1.0) {
                                addLog(`Capacity limit exceeded at ${targetNode.data.label} (${currentLoad}/${capacity}) - Request Dropped!`, 'error');
                                // Briefly flash the node as active/error
                                updateNodeState(targetNode.id, { active: true, processingCount: currentLoad });
                                setTimeout(() => updateNodeState(targetNode.id, { active: false }), 200);
                                return { ...packet, status: 'failed', progress: 100 };
                            }

                            // Dynamic performance degradation under heavy traffic
                            let latencyMultiplier = 1;
                            let extraFailureRate = 0;
                            if (loadRatio >= 0.8) {
                                latencyMultiplier = 1 + (loadRatio - 0.7) * 4; // e.g. 1.8x latency at 90% load
                                extraFailureRate = (loadRatio - 0.7) * 50; // e.g. +10% failure chance at 90% load
                                addLog(`WARNING: Heavy traffic at ${targetNode.data.label} (${Math.round(loadRatio * 100)}% load) - Performance degraded.`, 'error');
                            }

                            // Check Failure Rate (including extra overload failure chance)
                            const totalFailureRate = baseFailureRate + extraFailureRate;
                            if (Math.random() * 100 < totalFailureRate) {
                                addLog(`Request failed at ${targetNode.data.label}`, 'error');
                                updateNodeState(targetNode.id, { active: true, processingCount: currentLoad });
                                setTimeout(() => updateNodeState(targetNode.id, { active: false }), 200);
                                return { ...packet, status: 'failed', progress: 100 };
                            }

                            // Update Node State (Active)
                            updateNodeState(targetNode.id, { active: true, processingCount: currentLoad + 1 });

                            // Calculate degraded latency
                            const targetLatency = targetNode.data.latency || 500;
                            const processingDuration = Math.round(targetLatency * latencyMultiplier);

                            return {
                                ...packet,
                                status: 'processing',
                                nodeId: targetNode.id,
                                progress: 0,
                                processingTimeRemaining: processingDuration,
                                edgeId: undefined,
                                pathStack: [...packet.pathStack, targetNode.id]
                            } as Packet;
                        }

                        return { ...packet, progress: Math.min(newProgress, 100) };
                    }

                    // ---- CASE: PROCESSING ----
                    if (packet.status === 'processing') {
                        const currentNodeId = packet.nodeId!;
                        const currentNode = nodes.find(n => n.id === currentNodeId);

                        // Decrement processing time remaining based on tick rate
                        const remaining = (packet.processingTimeRemaining ?? 500) - TICK_RATE;

                        if (remaining > 0) {
                            return {
                                ...packet,
                                processingTimeRemaining: remaining
                            };
                        }

                        // Processing completed! Trigger next routing/action
                        updateNodeState(currentNodeId, { active: true, processingCount: Math.max(0, (packets.filter(p => p.nodeId === currentNodeId).length) - 1) });

                        if (packet.type === 'response') {
                            const currentStackIndex = packet.pathStack.indexOf(currentNodeId);
                            if (currentStackIndex <= 0) {
                                addLog('Response received at Client', 'success');
                                return { ...packet, status: 'completed' };
                            }

                            const nextTargetId = packet.pathStack[currentStackIndex - 1];
                            const edge = edges.find(e =>
                                (e.source === currentNodeId && e.target === nextTargetId) ||
                                (e.target === currentNodeId && e.source === nextTargetId)
                            );

                            if (!edge) return { ...packet, status: 'failed' };

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
                            const outgoingEdges = edges.filter(e => e.source === currentNodeId);
                            // Check Sample Rate (Forwarding Probability)
                            const sampleRate = currentNode?.data.sampleRate ?? 100;
                            const shouldForward = Math.random() * 100 < sampleRate;

                            if (outgoingEdges.length > 0 && shouldForward) {
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
                                if (outgoingEdges.length > 0 && !shouldForward) {
                                    addLog(`Request sampled/cached at ${currentNode?.data.label}. returning early.`, 'info');
                                } else {
                                    addLog(`Request processed at ${currentNode?.data.label}. Sending Response.`, 'info');
                                }

                                return {
                                    ...packet,
                                    type: 'response',
                                    processingTimeRemaining: 0
                                };
                            }
                        }
                    }

                    return packet;
                }).filter(p => p.status !== 'completed' && p.status !== 'failed');

                updatePackets(updatedPackets as Packet[]);
            }

        }, TICK_RATE);

        return () => clearInterval(interval);
    }, [isRunning, getNodes, getEdges, spawnRequest]);
}
