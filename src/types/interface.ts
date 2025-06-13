export interface IConfig {
    mode: 'auto' | 'fixed';
    longitude: number;
    latitude: number;
    darkTime: string;
    lightTime: string;
    darkOffset: number;
    lightOffset: number;
    dark: string;
    light: string;
}

export interface ITheme {
    id?: string;
    label: string;
    path: string;
    uiTheme: string;
}

export interface SunriseAndSunset {
    sunrise: string;
    sunset: string;
}
