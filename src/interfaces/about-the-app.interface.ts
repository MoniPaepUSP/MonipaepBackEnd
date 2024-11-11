export interface IAboutTheApp {
    id: string,
    main: string;
    secondary: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreateAboutTheApp {
    main: string;
    secondary: string;
}