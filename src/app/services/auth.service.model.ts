export interface LoginContext {
    username: string;
    password: string;
    remember?: boolean;
}

export interface AccessTokenInterface {
    id?: string;
    ttl?: number;
    scopes?: ['string'];
    created?: Date;
    userId?: string;
    user?: any;
}

export interface UserInterface {
    id?: string,
    email?: string,
    name?: string,
    nickname?: string,
    photo?: string,
    curriculum?: string,
    charge?: string
}
