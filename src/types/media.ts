// Simplified media types for upload-based system
export interface CourseMedia {
    video?: {
        id: string;
        name: string;
        url: string;
        duration: number;
        thumbnailUrl?: string;
    };
    audio?: {
        id: string;
        name: string;
        url: string;
        duration: number;
    };
    totalDuration: number;
}

// Time-based simulation events synchronized with video playback
export interface SimulationEvent {
    id: string;
    time: number; // timestamp in seconds when this event should trigger
    nodeId: string; // which node to trigger
    action: 'highlight' | 'packet' | 'annotation' | 'pulse';
    data?: {
        targetNodeId?: string; // for packet animations
        content?: string; // for annotations
        duration?: number; // how long the effect lasts
        color?: string;
    };
}

// Legacy types - kept for backward compatibility during migration
export interface AudioTrack {
    id: string;
    name: string;
    url: string;
    duration: number;
    startTime: number;
    volume?: number;
}

export interface VideoSegment {
    id: string;
    name: string;
    url: string;
    startTime: number;
    endTime: number;
    position: 'overlay' | 'pip' | 'fullscreen';
    size?: { width: number; height: number };
    opacity?: number;
}

export interface TimedAnnotation {
    id: string;
    nodeId?: string;
    content: string;
    startTime: number;
    duration: number;
    type: 'callout' | 'highlight' | 'tooltip' | 'code';
    position?: { x: number; y: number };
}

export interface CourseTimeline {
    audioTracks: AudioTrack[];
    videoSegments: VideoSegment[];
    annotations: TimedAnnotation[];
    totalDuration: number;
}
