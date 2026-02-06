import type { AudioTrack, VideoSegment, TimedAnnotation } from '../types/media';

export async function uploadAudio(file: File): Promise<AudioTrack> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const audio = new Audio();

        reader.onload = (e) => {
            const url = e.target?.result as string;
            audio.src = url;

            audio.onloadedmetadata = () => {
                resolve({
                    id: `audio-${Date.now()}`,
                    name: file.name,
                    url,
                    duration: audio.duration,
                    startTime: 0,
                    volume: 1,
                });
            };

            audio.onerror = () => reject(new Error('Failed to load audio'));
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

export async function uploadVideo(file: File): Promise<VideoSegment> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const video = document.createElement('video');

        reader.onload = (e) => {
            const url = e.target?.result as string;
            video.src = url;

            video.onloadedmetadata = () => {
                resolve({
                    id: `video-${Date.now()}`,
                    name: file.name,
                    url,
                    startTime: 0,
                    endTime: video.duration,
                    position: 'pip',
                    size: { width: video.videoWidth, height: video.videoHeight },
                    opacity: 1,
                });
            };

            video.onerror = () => reject(new Error('Failed to load video'));
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

export function encodeToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to encode file'));
        reader.readAsDataURL(file);
    });
}

export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function createAnnotation(
    type: TimedAnnotation['type'],
    content: string,
    startTime: number,
    duration: number = 5,
    nodeId?: string
): TimedAnnotation {
    return {
        id: `annotation-${Date.now()}`,
        type,
        content,
        startTime,
        duration,
        nodeId,
    };
}
