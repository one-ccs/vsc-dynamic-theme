# vsc-dynamic-theme

根据日出日落时间自动切换深色浅色模式。

支持：

- 根据日出日落时间自动切换深色/浅色模式
- 根据固定时间自动切换深色/浅色模式
- 自定义经纬度
- 自定义切换时间
- 自定义时间偏移量
- 自定义切换的主题

## 命令

- `vsc-dynamic-theme.dark` 指定深色模式使用的主题
- `vsc-dynamic-theme.light` 指定浅色模式使用的主题


## 设置

- `vsc-dynamic-theme.mode` 切换主题的模式
- `vsc-dynamic-theme.longitude` 经度，用于计算日出日落时间
- `vsc-dynamic-theme.latitude` 纬度，用于计算日出日落时间
- `vsc-dynamic-theme.darkTime` 深色模式切换时间，24小时制，格式为 `hh:mm`
- `vsc-dynamic-theme.lightTime` 浅色模式切换时间，24小时制，格式为 `hh:mm`
- `vsc-dynamic-theme.darkOffset` 深色模式切换时间的偏移量，单位秒，正数表示晚，负数表示早
- `vsc-dynamic-theme.lightOffset` 浅色模式切换时间的偏移量，单位秒，正数表示晚，负数表示早
- `vsc-dynamic-theme.dark` 深色模式使用的主题（推荐使用命令 `vsc-dynamic-theme.dark` 设置）
- `vsc-dynamic-theme.light` 浅色模式使用的主题（推荐使用命令 `vsc-dynamic-theme.light` 设置）
