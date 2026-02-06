import { useState, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, Film, Music, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import type { AudioTrack, VideoSegment, TimedAnnotation, CourseTimeline } from '../../types/media';
import { formatDuration } from '../../utils/mediaUpload';

interface TimelinePanelProps {
    timeline: CourseTimeline;
    onTimelineChange: (timeline: CourseTimeline) => void;
    currentTime: number;
    onSeek: (time: number) => void;
    isPlaying: boolean;
    onPlayPause: () => void;
}

export function TimelinePanel({
    timeline,
    onTimelineChange: _onTimelineChange,
    currentTime,
    onSeek,
    isPlaying,
    onPlayPause
}: TimelinePanelProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [zoom, setZoom] = useState(1); // pixels per second
    const timelineRef = useRef<HTMLDivElement>(null);

    const pixelsPerSecond = 50 * zoom;
    const totalWidth = timeline.totalDuration * pixelsPerSecond;

    const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = x / pixelsPerSecond;
        onSeek(Math.max(0, Math.min(time, timeline.totalDuration)));
    }, [pixelsPerSecond, timeline.totalDuration, onSeek]);

    const renderTimeRuler = () => {
        const markers = [];
        const interval = zoom > 0.5 ? 1 : 5; // Show markers every 1s or 5s depending on zoom

        for (let i = 0; i <= timeline.totalDuration; i += interval) {
            markers.push(
                <div
                    key={i}
                    className="absolute top-0 bottom-0 border-l border-gray-300"
                    style={{ left: `${i * pixelsPerSecond}px` }}
                >
                    <span className="absolute -top-5 -left-3 text-xs text-gray-500">
                        {formatDuration(i)}
                    </span>
                </div>
            );
        }
        return markers;
    };

    const renderAudioTrack = (track: AudioTrack) => {
        const left = track.startTime * pixelsPerSecond;
        const width = track.duration * pixelsPerSecond;

        return (
            <div
                key={track.id}
                className="absolute h-8 bg-blue-500 rounded border-2 border-blue-600 cursor-move hover:bg-blue-600 transition-colors"
                style={{ left: `${left}px`, width: `${width}px` }}
                title={track.name}
            >
                <div className="px-2 py-1 text-xs text-white truncate flex items-center gap-1">
                    <Music size={12} />
                    {track.name}
                </div>
            </div>
        );
    };

    const renderVideoSegment = (segment: VideoSegment) => {
        const left = segment.startTime * pixelsPerSecond;
        const width = (segment.endTime - segment.startTime) * pixelsPerSecond;

        return (
            <div
                key={segment.id}
                className="absolute h-8 bg-purple-500 rounded border-2 border-purple-600 cursor-move hover:bg-purple-600 transition-colors"
                style={{ left: `${left}px`, width: `${width}px` }}
                title={segment.name}
            >
                <div className="px-2 py-1 text-xs text-white truncate flex items-center gap-1">
                    <Film size={12} />
                    {segment.name}
                </div>
            </div>
        );
    };

    const renderAnnotation = (annotation: TimedAnnotation) => {
        const left = annotation.startTime * pixelsPerSecond;
        const width = annotation.duration * pixelsPerSecond;

        return (
            <div
                key={annotation.id}
                className="absolute h-8 bg-green-500 rounded border-2 border-green-600 cursor-move hover:bg-green-600 transition-colors"
                style={{ left: `${left}px`, width: `${width}px` }}
                title={annotation.content.substring(0, 50)}
            >
                <div className="px-2 py-1 text-xs text-white truncate flex items-center gap-1">
                    <MessageSquare size={12} />
                    {annotation.type}
                </div>
            </div>
        );
    };

    if (isCollapsed) {
        return (
            <div className="h-12 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onPlayPause}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        {isPlaying ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white" />}
                    </button>
                    <span className="text-white text-sm">
                        {formatDuration(currentTime)} / {formatDuration(timeline.totalDuration)}
                    </span>
                </div>
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <ChevronUp size={20} className="text-white" />
                </button>
            </div>
        );
    }

    return (
        <div className="h-64 bg-gray-800 border-t border-gray-700 flex flex-col">
            {/* Header */}
            <div className="h-12 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onPlayPause}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        {isPlaying ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white" />}
                    </button>
                    <button
                        onClick={() => onSeek(0)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <SkipBack size={16} className="text-white" />
                    </button>
                    <span className="text-white text-sm">
                        {formatDuration(currentTime)} / {formatDuration(timeline.totalDuration)}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-white text-xs">Zoom:</span>
                        <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="w-24"
                        />
                    </div>
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ChevronDown size={20} className="text-white" />
                    </button>
                </div>
            </div>

            {/* Timeline Content */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex h-full">
                    {/* Track Labels */}
                    <div className="w-32 bg-gray-900 border-r border-gray-700 flex-shrink-0">
                        <div className="h-12 flex items-center px-3 border-b border-gray-700">
                            <span className="text-white text-xs font-semibold">Time</span>
                        </div>
                        <div className="h-12 flex items-center px-3 border-b border-gray-700">
                            <Music size={14} className="text-blue-400 mr-2" />
                            <span className="text-white text-xs">Audio</span>
                        </div>
                        <div className="h-12 flex items-center px-3 border-b border-gray-700">
                            <Film size={14} className="text-purple-400 mr-2" />
                            <span className="text-white text-xs">Video</span>
                        </div>
                        <div className="h-12 flex items-center px-3">
                            <MessageSquare size={14} className="text-green-400 mr-2" />
                            <span className="text-white text-xs">Annotations</span>
                        </div>
                    </div>

                    {/* Timeline Tracks */}
                    <div
                        ref={timelineRef}
                        className="flex-1 relative cursor-pointer"
                        onClick={handleTimelineClick}
                        style={{ minWidth: `${totalWidth}px` }}
                    >
                        {/* Time Ruler */}
                        <div className="h-12 relative border-b border-gray-700">
                            {renderTimeRuler()}
                        </div>

                        {/* Audio Track */}
                        <div className="h-12 relative border-b border-gray-700">
                            {timeline.audioTracks.map(renderAudioTrack)}
                        </div>

                        {/* Video Track */}
                        <div className="h-12 relative border-b border-gray-700">
                            {timeline.videoSegments.map(renderVideoSegment)}
                        </div>

                        {/* Annotations Track */}
                        <div className="h-12 relative">
                            {timeline.annotations.map(renderAnnotation)}
                        </div>

                        {/* Playhead */}
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
                            style={{ left: `${currentTime * pixelsPerSecond}px` }}
                        >
                            <div className="absolute -top-1 -left-2 w-4 h-4 bg-red-500 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
