import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Database, Server } from 'lucide-react';
import { motion } from 'framer-motion';

export function HomePage() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center mb-16">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight"
                >
                    Visual backend learning <br />
                    <span className="text-blue-600">reimagined.</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-xl text-gray-600 max-w-2xl mx-auto mb-8"
                >
                    Stop memorizing diagrams. Watch backend systems execute in real-time.
                    Interact with databases, caches, and queues to build a true mental model.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex justify-center gap-4"
                >
                    <Link to="/builder" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        Start Building <ArrowRight size={20} />
                    </Link>
                    <button className="px-6 py-3 bg-white text-gray-700 border border-gray-300 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                        Explore Courses
                    </button>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="grid md:grid-cols-3 gap-8 mt-12"
            >
                <FeatureCard
                    icon={<Server className="text-purple-600" size={32} />}
                    title="Server Logic"
                    description="Visualize request handling, concurrency, and load balancing in real-time."
                />
                <FeatureCard
                    icon={<Database className="text-green-600" size={32} />}
                    title="Database Transactions"
                    description="See ACID properties in action with interactive visual transaction flows."
                />
                <FeatureCard
                    icon={<Activity className="text-orange-600" size={32} />}
                    title="System Health"
                    description="Simulate failures, latency spikes, and recovery mechanisms interactively."
                />
            </motion.div>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 bg-gray-50 w-12 h-12 flex items-center justify-center rounded-lg">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
}
