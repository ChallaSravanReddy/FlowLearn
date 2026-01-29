import { create } from 'zustand';
import { type Node, type Edge } from 'reactflow';
import { persist } from 'zustand/middleware';
import { type Lesson } from '../types/lesson';

export type SavedFlow = {
    id: string;
    title: string;
    description: string;
    nodes: Node[];
    edges: Edge[];
    lessons?: Lesson[];
    createdAt: number;
};

type CourseState = {
    savedFlows: SavedFlow[];
    saveFlow: (flow: Omit<SavedFlow, 'createdAt'>) => void;
    getFlow: (id: string) => SavedFlow | undefined;
};

export const useCourseStore = create<CourseState>()(
    persist(
        (set, get) => ({
            savedFlows: [
                // Seed with a template
                {
                    id: 'template-1',
                    title: 'Simple API Request',
                    description: 'A basic flow demonstrating a client request to an API Gateway.',
                    nodes: [
                        { id: '1', type: 'client', position: { x: 50, y: 50 }, data: { label: 'User', type: 'client' } },
                        { id: '2', type: 'api', position: { x: 300, y: 50 }, data: { label: 'API Gateway', type: 'api' } }
                    ],
                    edges: [
                        { id: 'e1-2', source: '1', target: '2' }
                    ],
                    createdAt: Date.now(),
                }
            ],
            saveFlow: (flow) => set((state) => ({
                savedFlows: [...state.savedFlows.filter(f => f.id !== flow.id), { ...flow, createdAt: Date.now() }]
            })),
            getFlow: (id) => get().savedFlows.find((f) => f.id === id),
        }),
        {
            name: 'flowlearn-storage', // local storage key
        }
    )
);
