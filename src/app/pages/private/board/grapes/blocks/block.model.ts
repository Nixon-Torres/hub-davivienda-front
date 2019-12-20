export interface Block {
    id: string;
    label: string;
    attributes: any;
    content: string;
    category: string;
    select?: boolean;
    activate?: boolean;
}
