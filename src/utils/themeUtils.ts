import { IConfig, SunriseAndSunset } from "../types/interface";
import { getStorage, updateStorage } from "./configUtils";
import { showWarning, setTheme } from "./vscodeUtils";
import {
    outputChannel,
    config,
 } from "../extension";


/**
 * 解析时间字符串
 * @param time 时间字符串，例："08:00:00"
 * @param offset 时间偏移量，单位秒
 * @returns 时间对象
 */
export function parseTime(time: string, offset: number = 0): Date {
    const [hour = '0', minute = '0', second = '0'] = (time || '00:00:00').split(':');
    return new Date(new Date().setHours(parseInt(hour), parseInt(minute), parseInt(second) + offset));
}

/**
 * 获取当前日期字符串
 * @param dayOffset 偏移天数，正数向未来偏移，负数向过去偏移
 * @returns 日期字符串
 */
export function getDate(dayOffset: number = 0): string {
    const now = new Date();
    dayOffset && now.setDate(now.getDate() + dayOffset);
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}.${month}.${day}`;
}

// 缓存请求
const fetchCache: { [key: string]: Promise<SunriseAndSunset> | undefined } = {};

export function fetchSunriseAndSunset(config: IConfig, date: string): Promise<SunriseAndSunset> {
    const url = `https://richurimo.bmcx.com/${config.longitude}__jw__${config.latitude}__richurimo/`;

    if (fetchCache[url]) {
        return fetchCache[url];
    }

    outputChannel?.appendLine(`[${new Date().toLocaleString()}] - 获取日出日落`);
    fetchCache[url] = new Promise(resolve => {
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
    return fetchCache[url];
}

export function getSunriseAndSunset(config: IConfig, date: string): Promise<SunriseAndSunset> {
    return new Promise(resolve => {
        switch (config.mode) {
            case 'fixed':
                resolve({ sunrise: config.lightTime, sunset: config.darkTime });
                break;
            case 'auto':
                const sunMap: { [key: string]: SunriseAndSunset } = getStorage('sunMap', {});

                sunMap[date]
                    ? resolve(sunMap[date])
                    : resolve(fetchSunriseAndSunset(config, date));
                break;
        }
    });
}

// 缓存变量
let _currentTheme: string | undefined;

/**
 * 更新主题
 * @returns 下一次更新时间 ms
 */
export async function updateTheme() {
    const { dark, light, darkOffset, lightOffset } = config!;
    const sunriseAndSunset = await getSunriseAndSunset(config!, getDate());
    const sunrise = parseTime(sunriseAndSunset.sunrise, lightOffset);
    const sunset = parseTime(sunriseAndSunset.sunset, darkOffset);
    const now = new Date();
    const theme = now >= sunrise && now < sunset
        ? light
        : dark;

    outputChannel?.appendLine(`[${now.toLocaleString()}] - 检查更新`);
    if (_currentTheme !== theme) {
        const _lightOffset = (lightOffset > 0 ? '+' : '') + lightOffset + 's';
        const _darkOffset = (darkOffset > 0 ? '+' : '') + darkOffset + 's';

        outputChannel?.appendLine(`[${now.toLocaleString()}] - 设置主题 "${theme}"，日出时间 "${sunrise.toLocaleTimeString()} (${_lightOffset})"，日落时间 "${sunset.toLocaleTimeString()} (${_darkOffset})"`);
        _currentTheme = theme;
        setTheme(theme);
    }
    if (now >= sunset) {
        const sunriseAndSunsetNext = await getSunriseAndSunset(config!, getDate(1));
        const sunriseNext = parseTime(sunriseAndSunsetNext.sunrise, lightOffset + 60 * 60 * 24);

        return sunriseNext.getTime() - now.getTime();
    }
    if (now >= sunrise) {
        return sunset.getTime() - now.getTime();
    }
    return sunrise.getTime() - now.getTime();
}
