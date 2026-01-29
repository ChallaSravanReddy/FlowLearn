import { Link } from 'react-router-dom';
import { Network, BookOpen, Layers } from 'lucide-react';

export function Navbar() {
    return (
        <nav className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                    <Network size={24} />
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">FlowLearn</span>
            </div>

            <div className="flex items-center gap-6">
                <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium">
                    <Layers size={18} />
                    <span>Hub</span>
                </Link>
                <Link to="/student" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium">
                    <BookOpen size={18} />
                    <span>Student View</span>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <Link to="/builder" className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">
                    Instructor Mode
                </Link>
            </div>
        </nav>
    );
}
