export interface Report {
    id?: string;
    name: string;
    slug: string;
    trash: boolean;
    styles: string;
    content: string;
    sectionTypeKey: string;
    userId?: string;
    stateId: string;
    sectionId: string;
    folderId?: string;
    templateId?: string;
    reviewed?: boolean;
}
