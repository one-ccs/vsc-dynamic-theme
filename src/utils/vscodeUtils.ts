import * as vscode from 'vscode';

import { ITheme } from "../types/interface";


export function showInfo(msg: string): void {
    vscode.window.showInformationMessage(msg);
}

export function showWarning(msg: string): void {
    vscode.window.showWarningMessage(msg);
}

/**
 * 获取所有可用的主题
 * @param uiTheme 主题类型
 * @returns {Array}
 */
export function getThemes(uiTheme: 'vs-dark' | 'vs' | null = null): ITheme[] {
    const themes = vscode.extensions.all
       .filter(ext => ext.packageJSON.contributes && ext.packageJSON.contributes.themes)
       .map(ext => ext.packageJSON.contributes.themes)
       .flat();

    return uiTheme? themes.filter(theme => theme.uiTheme === uiTheme) : themes;
}

/**
 * 设置主题
 * @param id 主题 id
 */
export function setTheme(id: string): void {
    vscode.workspace.getConfiguration().update('workbench.colorTheme', id, true);
}
