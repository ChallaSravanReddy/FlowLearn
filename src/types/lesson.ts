export interface Lesson {
    id: string;
    title: string;
    content: string; // Supports markdown
    highlightNodeIds?: string[]; // IDs of nodes to highlight
}
