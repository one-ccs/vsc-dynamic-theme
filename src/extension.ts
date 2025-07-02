import * as vscode from 'vscode';

import { IConfig } from "./types/interface";
import { EXTENSION_NAME } from "./params/params";
import {
	showInfo,
	showWarning,
	getThemes,
} from "./utils/vscodeUtils";
import {
	getThemeConfig,
	updateThemeConfig,
} from './utils/configUtils';
import {
	bounds,
	getDate,
	getSunriseAndSunset,
	parseTime,
	updateTheme,
} from "./utils/themeUtils";


export let outputChannel: vscode.OutputChannel | undefined;
export let globalState: vscode.Memento | undefined;
export let config: IConfig | undefined;


export async function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('VSC Dynamic Theme');
	globalState = context.globalState;
	config = getThemeConfig();

	// 动态调整执行频率
	let updateTimer: NodeJS.Timeout | undefined;
	async function scheduleNextUpdate() {
		const next = await updateTheme();
		updateTimer = setTimeout(scheduleNextUpdate, bounds(next, 1000 * 5, 1000 * 60 * 30));
	}
	scheduleNextUpdate();

	context.subscriptions.push(
		new vscode.Disposable(() => clearTimeout(updateTimer)),
		vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
			if (event.affectsConfiguration(EXTENSION_NAME)) {
				config = getThemeConfig();
				updateTheme();
			}
		}),
		vscode.commands.registerCommand(`${EXTENSION_NAME}.showTime`, async () => {
			const sunriseAndSunset = await getSunriseAndSunset(config!, getDate());
			const sunrise = parseTime(sunriseAndSunset.sunrise, config!.lightOffset);
			const sunset = parseTime(sunriseAndSunset.sunset, config!.darkOffset);
			const lightOffset = (config!.lightOffset > 0 ? '+' : '') + config!.lightOffset + 's';
			const darkOffset = (config!.darkOffset > 0 ? '+' : '') + config!.darkOffset + 's';

			showInfo(`日出时间 "${sunrise.toLocaleTimeString()} (${lightOffset})"，日落时间 "${sunset.toLocaleTimeString()} (${darkOffset})"`);
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
