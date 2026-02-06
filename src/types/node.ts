import { type Node } from 'reactflow';

export interface NodeProperties {
    latency?: number; // milliseconds
    failureRate?: number; // percentage 0-100
    capacity?: number; // max concurrent requests
    sampleRate?: number; // percentage 0-100 forwarded
    label: string;
    type: string;
    state?: NodeState;
}

export interface NodeState {
    active: boolean;
    processing: number; // current processing count
    queued: number; // waiting in queue
}

export type FlowNode = Node<NodeProperties>;
