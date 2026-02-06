import { useState, useCallback, useRef } from 'react';
import { X, Video as VideoIcon, Music, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadAudio, uploadVideo, formatDuration } from '../../utils/mediaUpload';
import type { CourseMedia } from '../../types/media';

interface MediaUploaderProps {
    isOpen: boolean;
    onClose: () => void;
    onMediaUpdate: (media: CourseMedia) => void;
    initialMedia?: CourseMedia;
}

export function MediaUploader({ isOpen, onClose, onMediaUpdate, initialMedia }: MediaUploaderProps) {
    const [media, setMedia] = useState<CourseMedia>(initialMedia || { totalDuration: 0 });
    const [uploading, setUploading] = useState<'video' | 'audio' | null>(null);
    const [dragOver, setDragOver] = useState<'video' | 'audio' | null>(null);

    const videoInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);

    const handleVideoUpload = useCallback(async (file: File) => {
        setUploading('video');
        try {
            const videoData = await uploadVideo(file);
            const newMedia: CourseMedia = {
                ...media,
                video: {
                    id: videoData.id,
                    name: videoData.name,
                    url: videoData.url,
                    duration: videoData.endTime - videoData.startTime,
                },
                totalDuration: Math.max(
                    media.totalDuration,
                    videoData.endTime - videoData.startTime
                ),
            };
            setMedia(newMedia);
        } catch (error) {
            console.error('Video upload failed:', error);
            alert('Failed to upload video file. Please try again.');
        } finally {
            setUploading(null);
        }
    }, [media]);

    const handleAudioUpload = useCallback(async (file: File) => {
        setUploading('audio');
        try {
            const audioData = await uploadAudio(file);
            const newMedia: CourseMedia = {
                ...media,
                audio: {
                    id: audioData.id,
                    name: audioData.name,
                    url: audioData.url,
                    duration: audioData.duration,
                },
                totalDuration: Math.max(media.totalDuration, audioData.duration),
            };
            setMedia(newMedia);
        } catch (error) {
            console.error('Audio upload failed:', error);
            alert('Failed to upload audio file. Please try again.');
        } finally {
            setUploading(null);
        }
    }, [media]);

    const handleDrop = useCallback((e: React.DragEvent, type: 'video' | 'audio') => {
        e.preventDefault();
        setDragOver(null);

        const file = e.dataTransfer.files[0];
        if (!file) return;

        if (type === 'video') {
            if (file.type.startsWith('video/')) {
                handleVideoUpload(file);
            } else {
                alert('Please upload a valid video file');
            }
        } else {
            if (file.type.startsWith('audio/')) {
                handleAudioUpload(file);
            } else {
                alert('Please upload a valid audio file');
            }
        }
    }, [handleVideoUpload, handleAudioUpload]);

    const handleSave = () => {
        if (!media.video && !media.audio) {
            alert('Please upload at least a video or audio file');
            return;
        }
        onMediaUpdate(media);
        onClose();
    };

    const removeVideo = () => {
        setMedia(prev => ({
            ...prev,
            video: undefined,
            totalDuration: prev.audio?.duration || 0,
        }));
    };

    const removeAudio = () => {
        setMedia(prev => ({
            ...prev,
            audio: undefined,
            totalDuration: prev.video?.duration || 0,
        }));
    };

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
                    className="bg-white rounded-lg shadow-2xl w-[700px] max-h-[85vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Upload Course Media</h2>
                            <p className="text-sm text-gray-500 mt-1">Upload video and audio files for your course</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
                        {/* Video Upload */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <VideoIcon size={20} className="text-purple-600" />
                                Video
                            </h3>

                            {media.video ? (
                                <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-purple-600 rounded-lg">
                                                <VideoIcon size={24} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{media.video.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    Duration: {formatDuration(media.video.duration)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={removeVideo}
                                            className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-red-600"
                                            title="Remove video"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOver('video'); }}
                                    onDragLeave={() => setDragOver(null)}
                                    onDrop={(e) => handleDrop(e, 'video')}
                                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                                        ${dragOver === 'video' ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'}
                                        ${uploading === 'video' ? 'opacity-50 pointer-events-none' : ''}
                                    `}
                                    onClick={() => videoInputRef.current?.click()}
                                >
                                    <VideoIcon size={48} className="mx-auto mb-3 text-gray-400" />
                                    <p className="text-gray-700 font-medium mb-1">
                                        {uploading === 'video' ? 'Uploading...' : 'Drop video file here'}
                                    </p>
                                    <p className="text-sm text-gray-500">or click to browse</p>
                                    <p className="text-xs text-gray-400 mt-2">MP4, WebM, AVI (max 500MB)</p>
                                    <input
                                        ref={videoInputRef}
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                                        className="hidden"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Audio Upload */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Music size={20} className="text-blue-600" />
                                Audio (Optional)
                            </h3>

                            {media.audio ? (
                                <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-blue-600 rounded-lg">
                                                <Music size={24} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{media.audio.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    Duration: {formatDuration(media.audio.duration)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={removeAudio}
                                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-red-600"
                                            title="Remove audio"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOver('audio'); }}
                                    onDragLeave={() => setDragOver(null)}
                                    onDrop={(e) => handleDrop(e, 'audio')}
                                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                                        ${dragOver === 'audio' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
                                        ${uploading === 'audio' ? 'opacity-50 pointer-events-none' : ''}
                                    `}
                                    onClick={() => audioInputRef.current?.click()}
                                >
                                    <Music size={48} className="mx-auto mb-3 text-gray-400" />
                                    <p className="text-gray-700 font-medium mb-1">
                                        {uploading === 'audio' ? 'Uploading...' : 'Drop audio file here'}
                                    </p>
                                    <p className="text-sm text-gray-500">or click to browse</p>
                                    <p className="text-xs text-gray-400 mt-2">MP3, WAV, OGG (max 100MB)</p>
                                    <input
                                        ref={audioInputRef}
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => e.target.files?.[0] && handleAudioUpload(e.target.files[0])}
                                        className="hidden"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {media.video || media.audio ? (
                                <span className="flex items-center gap-2 text-green-600">
                                    <Check size={16} />
                                    Total Duration: {formatDuration(media.totalDuration)}
                                </span>
                            ) : (
                                <span>No media uploaded yet</span>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!media.video && !media.audio}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Check size={18} />
                                Save Media
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
