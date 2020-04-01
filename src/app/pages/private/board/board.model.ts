export interface Report {
    id?: string;
    name: string;
    slug: string;
    trash: boolean;
    styles: string;
    content: string;
    reportTypeId: string;
    userId?: string;
    stateId: string;
    sectionId: string;
    folderId?: string;
    companyId?: string;
    templateId?: string;
    reviewed?: boolean;
    ownerId?: string;
    state?: any;
    users?: any;
    tags?: any;
    reportType?: any;
    rTitle?: string;
    rFastContent?: string;
    rSmartContent?: string;
    rDeepContent?: string;
    blocks: any;
}
