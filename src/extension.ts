import * as vscode from 'vscode';

import { IConfig } from "./types/interface";
import { EXTENSION_NAME } from "./params/params";
import {
	showWarning,
	getThemes,
} from "./utils/vscodeUtils";
import { getThemeConfig, updateThemeConfig } from './utils/configUtils';
import { updateTheme } from "./utils/themeUtils";


export let globalState: vscode.Memento | undefined;
export let config: IConfig | undefined;


export async function activate(context: vscode.ExtensionContext) {
	globalState = context.globalState;
	config = getThemeConfig();

	// 动态调整执行频率
	let next = await updateTheme();
	const task = setInterval(async () => {
		next = await updateTheme();
	}, Math.max(5000, Math.min(1000 * 60 * 30, next / 2)));

	context.subscriptions.push(
		new vscode.Disposable(() => clearInterval(task)),
		vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
			if (event.affectsConfiguration(EXTENSION_NAME)) {
				config = getThemeConfig();
				updateTheme();
			}
		}),
		vscode.commands.registerCommand(`${EXTENSION_NAME}.dark`, async () => {
			const themes = getThemes('vs-dark');

			if (themes.length === 0) return showWarning('没有找到深色主题。');

			const theme = await vscode.window.showQuickPick(themes.map(t => ({
				label: t.label,
				value: t.id,
				description: t.id,
			})), {
				title: 'VSC Dynamic Theme',
				placeHolder: '选择深色模式使用的主题',
			});
			if (theme) {
				updateThemeConfig('dark', theme.value || theme.label);
			}
		}),
		vscode.commands.registerCommand(`${EXTENSION_NAME}.light`, async () => {
			const themes = getThemes('vs');

			if (themes.length === 0) return showWarning('没有找到浅色主题。');

			const theme = await vscode.window.showQuickPick(themes.map(t => ({
				label: t.label,
				value: t.id,
				description: t.id,
			})), {
				title: 'VSC Dynamic Theme',
				placeHolder: '选择浅色模式使用的主题',
			});
			if (theme) {
				updateThemeConfig('light', theme.value || theme.label);
			}
		}),
	)
}

export function deactivate() {}
