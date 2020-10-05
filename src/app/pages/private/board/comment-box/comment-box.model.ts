export interface Comment {
    id: string;
    userId?: string;
    reportId: string;
    text: string;
    resolved: boolean;
    type: string;
    threadId: string;
}
