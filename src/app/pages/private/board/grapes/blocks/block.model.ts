export interface Block {
    id: string;
    label: string;
    attributes: any;
    content: any;
    category: string;
    select?: boolean;
    activate?: boolean;
}
