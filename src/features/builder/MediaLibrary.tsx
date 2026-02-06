import { useState, useCallback } from 'react';
import { Upload, X, Music, Video as VideoIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadAudio, uploadVideo, formatDuration } from '../../utils/mediaUpload';
import type { AudioTrack, VideoSegment } from '../../types/media';

interface MediaLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    onAddAudio: (track: AudioTrack) => void;
    onAddVideo: (segment: VideoSegment) => void;
}

export function MediaLibrary({ isOpen, onClose, onAddAudio, onAddVideo }: MediaLibraryProps) {
    const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
    const [videoSegments, setVideoSegments] = useState<VideoSegment[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleAudioUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const track = await uploadAudio(file);
            setAudioTracks(prev => [...prev, track]);
        } catch (error) {
            console.error('Audio upload failed:', error);
            alert('Failed to upload audio file');
        } finally {
            setUploading(false);
        }
    }, []);

    const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const segment = await uploadVideo(file);
            setVideoSegments(prev => [...prev, segment]);
        } catch (error) {
            console.error('Video upload failed:', error);
            alert('Failed to upload video file');
        } finally {
            setUploading(false);
        }
    }, []);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-lg shadow-2xl w-[800px] max-h-[80vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-xl font-bold">Media Library</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
                        {/* Audio Section */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Music size={20} />
                                    Audio Tracks
                                </h3>
                                <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors flex items-center gap-2">
                                    <Upload size={16} />
                                    Upload Audio
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={handleAudioUpload}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {audioTracks.map((track) => (
                                    <div
                                        key={track.id}
                                        className="p-3 border rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
                                        onClick={() => onAddAudio(track)}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Music size={16} className="text-blue-600" />
                                            <span className="font-medium text-sm truncate">{track.name}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Duration: {formatDuration(track.duration)}
                                        </div>
                                    </div>
                                ))}
                                {audioTracks.length === 0 && (
                                    <div className="col-span-2 text-center text-gray-400 py-8">
                                        No audio tracks uploaded yet
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Video Section */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <VideoIcon size={20} />
                                    Video Segments
                                </h3>
                                <label className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors flex items-center gap-2">
                                    <Upload size={16} />
                                    Upload Video
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={handleVideoUpload}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {videoSegments.map((segment) => (
                                    <div
                                        key={segment.id}
                                        className="p-3 border rounded-lg hover:border-purple-500 cursor-pointer transition-colors"
                                        onClick={() => onAddVideo(segment)}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <VideoIcon size={16} className="text-purple-600" />
                                            <span className="font-medium text-sm truncate">{segment.name}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Duration: {formatDuration(segment.endTime - segment.startTime)}
                                        </div>
                                    </div>
                                ))}
                                {videoSegments.length === 0 && (
                                    <div className="col-span-2 text-center text-gray-400 py-8">
                                        No video segments uploaded yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    {uploading && (
                        <div className="p-4 border-t bg-gray-50">
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                                Uploading...
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
