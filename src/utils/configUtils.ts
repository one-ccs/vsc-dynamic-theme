import * as vscode from 'vscode';

import { EXTENSION_NAME } from '../params/params';
import { IConfig } from "../types/interface";
import { globalState } from "../extension";


/**
 * 获取插件配置
 * @param key 配置项
 * @param defaultValue 默认值
 * @returns 配置值
 */
export function getConfig(key: string, defaultValue: any = null) {
    return vscode.workspace.getConfiguration(EXTENSION_NAME).get(key, defaultValue);
}

/**
 * 获取扩展配置
 * @returns 扩展配置
 */
export function getThemeConfig(): IConfig {
    const config = vscode.workspace.getConfiguration(EXTENSION_NAME);
    return {
        mode: config.get('mode', 'auto'),
        longitude: config.get('longitude', 116.39770677587353),
        latitude: config.get('latitude', 39.907576244604115),
        darkTime: config.get('darkTime', '19:00'),
        lightTime: config.get('lightTime', '8:00'),
        darkOffset: config.get('darkOffset', 0),
        lightOffset: config.get('lightOffset', 0),
        dark: config.get('dark', 'Default Dark+'),
        light: config.get('light', 'Default Light+'),
    }
}

/**
 * 获取持久化数据
 * @param key 名称
 * @param defaultValue 默认值
 * @returns 数据
 */
export function getStorage<T>(key: string): T | undefined;
export function getStorage<T>(key: string, defaultValue: T): T;
export function getStorage<T>(key: string, defaultValue?: T): T | undefined {
    return globalState?.get(key, defaultValue);
}

/**
 * 设置持久化数据
 * @param key 名称
 * @param value 值
 */
export function setStorage(key: string, value: any) {
    globalState?.update(key, value);
}

/**
 * 更新持久化数据（仅限对象）
 * @param key 名称
 * @param value 值
 */
export function updateStorage(key: string, value: {}) {
    const storage = getStorage(key, {});
    setStorage(key, { ...storage, ...value });
}
