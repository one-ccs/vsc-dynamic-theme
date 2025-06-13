import { IConfig, SunriseAndSunset } from "../types/interface";
import { getThemeConfig, getStorage, updateStorage } from "./configUtils";
import { showWarning, setTheme } from "./vscodeUtils";
import { config } from "../extension";


/**
 * 解析时间字符串
 * @param time 时间字符串，例："08:00:00"
 * @param offset 时间偏移量，单位秒
 * @returns 时间对象
 */
export function parseTime(time: string, offset: number = 0): Date {
    const [hour = '0', minute = '0', second = '0'] = time.split(':');
    return new Date(new Date().setHours(parseInt(hour), parseInt(minute), parseInt(second) + offset));
}

export function getDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}.${month}.${day}`;
}

// 缓存请求
const fetchCache: { [key: string]: Promise<SunriseAndSunset> | undefined } = {};

export function fetchSunriseAndSunset(config: IConfig, date: string): Promise<SunriseAndSunset> {
    const url = `https://richurimo.bmcx.com/${config.longitude}__jw__${config.latitude}__richurimo/`;

    return fetchCache[url] ? fetchCache[url] : fetchCache[url] = new Promise(resolve => {
        fetch(url)
        .then(res => res.text())
        .then(html => {
            const list = html.match(/(\d{4}年\d{2}月\d{2}日)[\s\S]+?(\d{2}:\d{2}:\d{2})([\s\S]+?\d{2}:\d{2}:\d{2})[\s\S]+?(\d{2}:\d{2}:\d{2})/g)
                ?.map(t => t.match(/(\d{4}年\d{2}月\d{2}日)|(\d{2}:\d{2}:\d{2})/g))
                .filter(t => t && t.length === 4)
                .map(t => [t![0].replace(/年|月|日/g, '.').slice(0, -1), t![1], t![3]]);
            let sunMap: { [key: string]: SunriseAndSunset } = {};

            list?.forEach(t => {
                const [date, sunrise, sunset] = t;
                sunMap[date] = { sunrise, sunset };
            });

            updateStorage('sunMap', sunMap);
            if (sunMap[date]) {
                return resolve(sunMap[date]);
            }
            showWarning(`获取日出日落失败，使用配置值 ${config.lightTime} ${config.darkTime} 代替。`);
            return resolve({ sunrise: config.lightTime, sunset: config.darkTime });
        });
    });
}

export function getSunriseAndSunset(config: IConfig): Promise<SunriseAndSunset> {
    return new Promise(resolve => {
        switch (config.mode) {
            case 'fixed':
                resolve({ sunrise: config.lightTime, sunset: config.darkTime });
                break;
            case 'auto':
                const sunMap: { [key: string]: SunriseAndSunset } = getStorage('sunMap', {});
                const date = getDate();

                sunMap[date]
                    ? resolve(sunMap[date])
                    : resolve(fetchSunriseAndSunset(config, date));
                break;
        }
    });
}

// 缓存变量
let _sunriseAndSunset: SunriseAndSunset | undefined;
let _sunrise: number | undefined;
let _sunset: number | undefined;
let _currentTheme: string | undefined;

export async function updateTheme() {
    const sunriseAndSunset = _sunriseAndSunset || await getSunriseAndSunset(config!);
    const sunrise = _sunrise || parseTime(sunriseAndSunset.sunrise, config?.lightOffset);
    const sunset = _sunset || parseTime(sunriseAndSunset.sunset, config?.darkOffset);
    const { dark, light, darkOffset, lightOffset } = config!;
    const now = new Date();
    const theme = now >= sunrise && now < sunset
        ? light
        : dark;

    if (_currentTheme !== theme) {
        console.log(`[${new Date().toLocaleString()}] - 日出时间 "${sunrise.toLocaleString()}(${lightOffset}s)"，日落时间 "${sunset.toLocaleString()}(${darkOffset}s)"，设置主题 "${theme}"`);
        _currentTheme = theme;
        setTheme(theme);
        return;
    }
}
