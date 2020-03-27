export interface ConfigDialog {
    twoButtons: boolean;
    icon: string;
    iconColor: string;
    isAlert: boolean;
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
