export interface ConfigDialog {
    twoButtons: boolean;
    icon: string;
    iconColor: string;
    isWarning?: boolean;
    warningText?: string;
    title?: string;
    titleStyle?: object;
    subtitle?: string;
    subtitleStyle?: object;
    mainButton: string;
    mainButtonStyle?: object;
    secondButton?: string;
    secondButtonStyle?: object;
}
