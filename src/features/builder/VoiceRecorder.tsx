import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square, Play, Pause, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AudioTrack } from '../../types/media';

interface VoiceRecorderProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (track: AudioTrack) => void;
    startTime?: number;
}

export function VoiceRecorder({ isOpen, onClose, onSave, startTime = 0 }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const [recordingTime, setRecordingTime] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                setAudioURL(url);

                // Convert to base64 for storage
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result as string;
                    setAudioURL(base64);
                };
                reader.readAsDataURL(audioBlob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 0.1);
            }, 100);
        } catch (error) {
            console.error('Failed to start recording:', error);
            alert('Failed to access microphone. Please grant permission.');
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
            setDuration(recordingTime);

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [isRecording, recordingTime]);

    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            if (isPaused) {
                mediaRecorderRef.current.resume();
                setIsPaused(false);
                timerRef.current = window.setInterval(() => {
                    setRecordingTime(prev => prev + 0.1);
                }, 100);
            } else {
                mediaRecorderRef.current.pause();
                setIsPaused(true);
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            }
        }
    }, [isRecording, isPaused]);

    const handleSave = useCallback(() => {
        if (audioURL) {
            const track: AudioTrack = {
                id: `audio-${Date.now()}`,
                name: `Recording ${new Date().toLocaleTimeString()}`,
                url: audioURL,
                duration,
                startTime,
                volume: 1,
            };
            onSave(track);
            handleClose();
        }
    }, [audioURL, duration, startTime, onSave]);

    const handleClose = useCallback(() => {
        if (isRecording) {
            stopRecording();
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setAudioURL(null);
        setRecordingTime(0);
        setDuration(0);
        onClose();
    }, [isRecording, stopRecording, onClose]);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-lg shadow-2xl w-[500px] p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Voice Recorder</h2>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Waveform Visualization (Placeholder) */}
                    <div className="h-32 bg-gray-100 rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
                        {isRecording && (
                            <div className="flex items-center gap-1 h-full">
                                {Array.from({ length: 50 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1 bg-blue-500 rounded-full"
                                        animate={{
                                            height: [
                                                `${20 + Math.random() * 60}%`,
                                                `${20 + Math.random() * 60}%`,
                                            ],
                                        }}
                                        transition={{
                                            duration: 0.3,
                                            repeat: Infinity,
                                            repeatType: 'reverse',
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                        {!isRecording && !audioURL && (
                            <div className="text-gray-400 text-sm">Ready to record</div>
                        )}
                        {audioURL && !isRecording && (
                            <div className="text-green-600 text-sm">Recording complete</div>
                        )}
                    </div>

                    {/* Timer */}
                    <div className="text-center mb-6">
                        <div className="text-3xl font-mono font-bold text-gray-800">
                            {Math.floor(recordingTime / 60)}:{Math.floor(recordingTime % 60).toString().padStart(2, '0')}
                            <span className="text-lg">.{Math.floor((recordingTime % 1) * 10)}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            {isRecording ? (isPaused ? 'Paused' : 'Recording...') : 'Not recording'}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-4">
                        {!isRecording && !audioURL && (
                            <button
                                onClick={startRecording}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors flex items-center gap-2"
                            >
                                <Mic size={20} />
                                Start Recording
                            </button>
                        )}

                        {isRecording && (
                            <>
                                <button
                                    onClick={pauseRecording}
                                    className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full transition-colors flex items-center gap-2"
                                >
                                    {isPaused ? <Play size={20} /> : <Pause size={20} />}
                                    {isPaused ? 'Resume' : 'Pause'}
                                </button>
                                <button
                                    onClick={stopRecording}
                                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors flex items-center gap-2"
                                >
                                    <Square size={20} />
                                    Stop
                                </button>
                            </>
                        )}

                        {audioURL && !isRecording && (
                            <>
                                <button
                                    onClick={startRecording}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors flex items-center gap-2"
                                >
                                    <Mic size={20} />
                                    Re-record
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors flex items-center gap-2"
                                >
                                    <Save size={20} />
                                    Save
                                </button>
                            </>
                        )}
                    </div>

                    {/* Info */}
                    <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-800">
                            💡 <strong>Tip:</strong> This recording will be added to your timeline at {Math.floor(startTime)}s
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
