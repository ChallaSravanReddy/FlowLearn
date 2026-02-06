import { create } from 'zustand';

export type LogEntry = {
    id: string;
    timestamp: number;
    message: string;
    type: 'info' | 'success' | 'error';
};

export type Packet = {
    id: string;
    type: 'request' | 'response' | 'error';

    // Navigation
    edgeId?: string;       // If moving along an edge
    nodeId?: string;       // If processing at a node
    sourceNodeId?: string; // Current segment source
    targetNodeId?: string; // Current segment target

    progress: number;      // 0 to 100 on edge

    // History for return path
    pathStack: string[];   // Stack of Node IDs visited

    // State
    status: 'moving' | 'processing' | 'failed' | 'completed';
    timestamp: number;

    // For processing simulation
    processingTimeRemaining?: number; // ms remaining
};

export type NodeExecutionState = {
    active: boolean; // Is currently processing?
    processingCount: number; // How many packets are being processed
    packetsQueued: number; // How many waiting
    lastActive: number; // Timestamp
};

export type ExecutionState = {
    isRunning: boolean;
    currentTime: number;
    totalDuration: number;
    logs: LogEntry[];
    packets: Packet[];
    nodeStates: Record<string, NodeExecutionState>;

    setIsRunning: (isRunning: boolean) => void;
    setCurrentTime: (time: number) => void;
    setTotalDuration: (duration: number) => void;
    addLog: (message: string, type?: 'info' | 'success' | 'error') => void;
    clear: () => void; // Clears logs and packets

    // Packet Management
    addPacket: (packet: Packet) => void;
    updatePackets: (packets: Packet[]) => void;
    removePacket: (packetId: string) => void;

    // Node Management
    updateNodeState: (nodeId: string, state: Partial<NodeExecutionState>) => void;
};

export const useExecutionStore = create<ExecutionState>((set) => ({
    isRunning: false,
    currentTime: 0,
    totalDuration: 0,
    logs: [],
    packets: [],
    nodeStates: {},

    setIsRunning: (isRunning) => set({ isRunning }),
    setCurrentTime: (currentTime) => set({ currentTime }),
    setTotalDuration: (totalDuration) => set({ totalDuration }),

    addLog: (message, type = 'info') =>
        set((state) => ({
            logs: [
                ...state.logs,
                { id: Math.random().toString(36), timestamp: Date.now(), message, type },
            ].slice(-50), // Keep last 50 logs
        })),

    clear: () => set({ logs: [], packets: [], nodeStates: {} }),

    addPacket: (packet) => set((state) => ({ packets: [...state.packets, packet] })),

    updatePackets: (packets) => set({ packets }),

    removePacket: (packetId) => set((state) => ({
        packets: state.packets.filter(p => p.id !== packetId)
    })),

    updateNodeState: (nodeId, newState) => set((state) => ({
        nodeStates: {
            ...state.nodeStates,
            [nodeId]: { ...(state.nodeStates[nodeId] || { active: false, processingCount: 0, packetsQueued: 0, lastActive: 0 }), ...newState }
        }
    })),
}));
