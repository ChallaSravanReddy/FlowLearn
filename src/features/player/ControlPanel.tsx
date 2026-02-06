import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

export function ControlPanel() {
    const { isRunning, setIsRunning, clear, addLog } = useExecutionStore();

    const handlePlay = () => {
        setIsRunning(true);
        addLog('Execution started', 'info');
    };

    const handlePause = () => {
        setIsRunning(false);
        addLog('Execution paused', 'info');
    };

    const handleStop = () => {
        setIsRunning(false);
        clear();
        addLog('Execution stopped', 'info');
    };

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-2 z-10">
            {!isRunning ? (
                <button
                    onClick={handlePlay}
                    className="p-2 rounded-md hover:bg-blue-50 text-blue-600 transition-colors"
                    title="Play"
                >
                    <Play size={20} fill="currentColor" />
                </button>
            ) : (
                <button
                    onClick={handlePause}
                    className="p-2 rounded-md hover:bg-yellow-50 text-yellow-600 transition-colors"
                    title="Pause"
                >
                    <Pause size={20} fill="currentColor" />
                </button>
            )}

            <button
                onClick={handleStop}
                className="p-2 rounded-md hover:bg-red-50 text-red-600 transition-colors"
                title="Stop"
            >
                <Square size={20} fill="currentColor" />
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            <button
                onClick={() => addLog('Resetting simulation...', 'info')}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
                title="Reset"
            >
                <RotateCcw size={20} />
            </button>
        </div>
    );
}
