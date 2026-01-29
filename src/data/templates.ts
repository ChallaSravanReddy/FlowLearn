import { type Node, type Edge } from 'reactflow';
import { type NodeProperties } from '../types/node';
import { type Lesson } from '../types/lesson';

export interface Template {
    id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    nodes: Node<NodeProperties>[];
    edges: Edge[];
    lessons?: Lesson[];
}

export const templates: Template[] = [
    {
        id: 'simple-api',
        title: 'Simple API Request',
        description: 'A basic flow showing a client making a request to an API which queries a database.',
        difficulty: 'beginner',
        nodes: [
            { id: 't1-1', type: 'client', position: { x: 50, y: 150 }, data: { label: 'Mobile App', type: 'client' } },
            { id: 't1-2', type: 'api', position: { x: 300, y: 150 }, data: { label: 'REST API', type: 'api', latency: 100 } },
            { id: 't1-3', type: 'database', position: { x: 550, y: 150 }, data: { label: 'Main DB', type: 'database', latency: 500 } },
        ],
        edges: [
            { id: 'e1-1', source: 't1-1', target: 't1-2', animated: true },
            { id: 'e1-2', source: 't1-2', target: 't1-3', animated: true },
        ],
        lessons: [
            {
                id: 'l1-1',
                title: 'The Request Lifecycle',
                content: 'Welcome! This simple flow demonstrates how a user request travels through a backend system.\n\n **Click Play** to see a packet leave the **Mobile App** and head towards the API.',
                highlightNodeIds: ['t1-1']
            },
            {
                id: 'l1-2',
                title: 'API Processing',
                content: 'The **REST API** receives the request. In a real system, this might be an Express or Django server.\n\nNotice the slight delay? That represents processing time (e.g., parsing JSON, validating auth).',
                highlightNodeIds: ['t1-2']
            },
            {
                id: 'l1-3',
                title: 'Database Query',
                content: 'Finally, the API queries the **Main DB** to get data.\n\nDatabases are often the slowest part of a request. Try increasing the DB latency to see how it affects the total time!',
                highlightNodeIds: ['t1-3']
            }
        ]
    },
    {
        id: 'caching-pattern',
        title: 'Cache-Aside Pattern',
        description: 'Demonstrates a caching layer. Requests hit the cache first (fast), falling back to DB (slow) only on misses.',
        difficulty: 'intermediate',
        nodes: [
            { id: 't2-1', type: 'client', position: { x: 50, y: 200 }, data: { label: 'Client', type: 'client' } },
            { id: 't2-2', type: 'api', position: { x: 250, y: 200 }, data: { label: 'API Gateway', type: 'api' } },
            { id: 't2-3', type: 'cache', position: { x: 450, y: 100 }, data: { label: 'Redis Cache', type: 'cache', latency: 10 } },
            { id: 't2-4', type: 'database', position: { x: 450, y: 300 }, data: { label: 'SQL Database', type: 'database', latency: 800 } },
        ],
        edges: [
            { id: 'e2-1', source: 't2-1', target: 't2-2', animated: true },
            { id: 'e2-2', source: 't2-2', target: 't2-3', animated: true },
            { id: 'e2-3', source: 't2-2', target: 't2-4', animated: true },
        ],
        lessons: [
            {
                id: 'l2-1',
                title: 'Introduction to Caching',
                content: 'Caching is a technique to speed up responses by storing frequently accessed data in fast memory (like Redis).\n\nIn this flow, we have a **Redis Cache** (fast) and a **SQL Database** (slow).',
                highlightNodeIds: ['t2-3', 't2-4']
            },
            {
                id: 'l2-2',
                title: 'Cache Hit vs Miss',
                content: '**Cache Hit**: If data is in Redis, the API returns it immediately (super fast!).\n\n**Cache Miss**: If not, the API must query the slow SQL Database, then save the result to Redis for next time.',
                highlightNodeIds: ['t2-3']
            }
        ]
    },
    {
        id: 'microservices',
        title: 'Microservices Chain',
        description: 'A chain of dependent services. Shows how latency propagates through the system.',
        difficulty: 'advanced',
        nodes: [
            { id: 't3-1', type: 'client', position: { x: 50, y: 150 }, data: { label: 'Web Client', type: 'client' } },
            { id: 't3-2', type: 'api', position: { x: 250, y: 150 }, data: { label: 'API Gateway', type: 'api' } },
            { id: 't3-3', type: 'service', position: { x: 450, y: 50 }, data: { label: 'Auth Service', type: 'service', latency: 200 } },
            { id: 't3-4', type: 'service', position: { x: 450, y: 250 }, data: { label: 'Order Service', type: 'service', latency: 300 } },
            { id: 't3-5', type: 'database', position: { x: 650, y: 250 }, data: { label: 'Order DB', type: 'database', latency: 600 } },
        ],
        edges: [
            { id: 'e3-1', source: 't3-1', target: 't3-2', animated: true },
            { id: 'e3-2', source: 't3-2', target: 't3-3', animated: true },
            { id: 'e3-3', source: 't3-2', target: 't3-4', animated: true },
            { id: 'e3-4', source: 't3-4', target: 't3-5', animated: true },
        ]
    },
    {
        id: 'msg-queue',
        title: 'Async Message Queue',
        description: 'Decoupled architecture using a message queue. The API responds quickly while the worker processes in background.',
        difficulty: 'advanced',
        nodes: [
            { id: 't4-1', type: 'client', position: { x: 50, y: 150 }, data: { label: 'Client', type: 'client' } },
            { id: 't4-2', type: 'api', position: { x: 250, y: 150 }, data: { label: 'Ingest API', type: 'api', latency: 50 } },
            { id: 't4-3', type: 'queue', position: { x: 450, y: 150 }, data: { label: 'Kafka', type: 'queue' } },
            { id: 't4-4', type: 'service', position: { x: 650, y: 150 }, data: { label: 'Worker', type: 'service', latency: 1500 } },
        ],
        edges: [
            { id: 'e4-1', source: 't4-1', target: 't4-2', animated: true },
            { id: 'e4-2', source: 't4-2', target: 't4-3', animated: true },
            { id: 'e4-3', source: 't4-3', target: 't4-4', animated: true },
        ]
    }
];
