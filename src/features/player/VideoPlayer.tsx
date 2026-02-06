import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, SkipBack, SkipForward } from 'lucide-react';
import { formatDuration } from '../../utils/mediaUpload';

interface VideoPlayerProps {
    videoUrl?: string;
    audioUrl?: string;
    duration: number;
    onTimeUpdate: (time: number) => void;
    onPlayStateChange: (isPlaying: boolean) => void;
    className?: string;
}

export function VideoPlayer({
    videoUrl,
    audioUrl,
    duration,
    onTimeUpdate,
    onPlayStateChange,
    className = ''
}: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<number | undefined>(undefined);

    // Sync video and audio playback
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackRate;
        }
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    // Handle time updates
    const handleTimeUpdate = useCallback(() => {
        if (videoRef.current && !isDragging) {
            const time = videoRef.current.currentTime;
            setCurrentTime(time);
            onTimeUpdate(time);

            // Sync audio with video
            if (audioRef.current && Math.abs(audioRef.current.currentTime - time) > 0.3) {
                audioRef.current.currentTime = time;
            }
        }
    }, [onTimeUpdate, isDragging]);

    // Play/Pause
    const togglePlayPause = useCallback(() => {
        const newPlayState = !isPlaying;
        setIsPlaying(newPlayState);
        onPlayStateChange(newPlayState);

        if (newPlayState) {
            videoRef.current?.play();
            audioRef.current?.play();
        } else {
            videoRef.current?.pause();
            audioRef.current?.pause();
        }
    }, [isPlaying, onPlayStateChange]);

    // Seek
    const handleSeek = useCallback((time: number) => {
        const clampedTime = Math.max(0, Math.min(time, duration));
        setCurrentTime(clampedTime);
        onTimeUpdate(clampedTime);

        if (videoRef.current) {
            videoRef.current.currentTime = clampedTime;
        }
        if (audioRef.current) {
            audioRef.current.currentTime = clampedTime;
        }
    }, [duration, onTimeUpdate]);

    // Progress bar click/drag
    const handleProgressBarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const time = percentage * duration;
        handleSeek(time);
    }, [duration, handleSeek]);

    const handleProgressBarDrag = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !progressBarRef.current) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const time = percentage * duration;
        handleSeek(time);
    }, [isDragging, duration, handleSeek]);

    // Volume control
    const toggleMute = useCallback(() => {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        if (videoRef.current) videoRef.current.muted = newMutedState;
        if (audioRef.current) audioRef.current.muted = newMutedState;
    }, [isMuted]);

    const handleVolumeChange = useCallback((newVolume: number) => {
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
        if (videoRef.current) videoRef.current.volume = newVolume;
        if (audioRef.current) audioRef.current.volume = newVolume;
    }, []);

    // Fullscreen
    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;

        if (!isFullscreen) {
            containerRef.current.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
        setIsFullscreen(!isFullscreen);
    }, [isFullscreen]);

    // Skip forward/backward
    const skip = useCallback((seconds: number) => {
        handleSeek(currentTime + seconds);
    }, [currentTime, handleSeek]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    togglePlayPause();
                    break;
                case 'ArrowLeft':
                    skip(-5);
                    break;
                case 'ArrowRight':
                    skip(5);
                    break;
                case 'f':
                    toggleFullscreen();
                    break;
                case 'm':
                    toggleMute();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [togglePlayPause, skip, toggleFullscreen, toggleMute]);

    // Auto-hide controls
    const resetControlsTimeout = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    }, [isPlaying]);

    const progress = (currentTime / duration) * 100;

    return (
        <div
            ref={containerRef}
            className={`relative bg-black rounded-lg overflow-hidden shadow-2xl ${className}`}
            onMouseMove={resetControlsTimeout}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* Video Element */}
            {videoUrl && (
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => {
                        setIsPlaying(false);
                        onPlayStateChange(false);
                    }}
                />
            )}

            {/* Audio Element (hidden) */}
            {audioUrl && (
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    muted={isMuted}
                />
            )}

            {/* Play/Pause Overlay */}
            <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={togglePlayPause}
            >
                {!isPlaying && (
                    <div className="bg-black/50 rounded-full p-6 backdrop-blur-sm">
                        <Play size={48} className="text-white" fill="white" />
                    </div>
                )}
            </div>

            {/* Controls */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                {/* Progress Bar */}
                <div
                    ref={progressBarRef}
                    className="relative h-1 bg-white/30 cursor-pointer group hover:h-2 transition-all"
                    onClick={handleProgressBarClick}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseMove={handleProgressBarDrag}
                    onMouseLeave={() => setIsDragging(false)}
                >
                    <div
                        className="absolute top-0 left-0 h-full bg-purple-600 transition-all"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        {/* Play/Pause */}
                        <button
                            onClick={togglePlayPause}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            {isPlaying ? (
                                <Pause size={24} className="text-white" />
                            ) : (
                                <Play size={24} className="text-white" />
                            )}
                        </button>

                        {/* Skip Backward */}
                        <button
                            onClick={() => skip(-10)}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            title="Skip backward 10s"
                        >
                            <SkipBack size={20} className="text-white" />
                        </button>

                        {/* Skip Forward */}
                        <button
                            onClick={() => skip(10)}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            title="Skip forward 10s"
                        >
                            <SkipForward size={20} className="text-white" />
                        </button>

                        {/* Volume */}
                        <div className="flex items-center gap-2 group">
                            <button
                                onClick={toggleMute}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX size={20} className="text-white" />
                                ) : (
                                    <Volume2 size={20} className="text-white" />
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                className="w-0 group-hover:w-20 transition-all opacity-0 group-hover:opacity-100"
                            />
                        </div>

                        {/* Time Display */}
                        <span className="text-white text-sm font-medium">
                            {formatDuration(currentTime)} / {formatDuration(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Playback Speed */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <Settings size={20} className="text-white" />
                            </button>
                            {showSettings && (
                                <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-lg p-2 min-w-[120px]">
                                    <div className="text-white text-xs font-semibold mb-2 px-2">Speed</div>
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                        <button
                                            key={rate}
                                            onClick={() => {
                                                setPlaybackRate(rate);
                                                setShowSettings(false);
                                            }}
                                            className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${playbackRate === rate
                                                ? 'bg-purple-600 text-white'
                                                : 'text-gray-300 hover:bg-gray-800'
                                                }`}
                                        >
                                            {rate}x
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            {isFullscreen ? (
                                <Minimize size={20} className="text-white" />
                            ) : (
                                <Maximize size={20} className="text-white" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
