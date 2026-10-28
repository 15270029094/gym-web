---
name: fitness-ui
description: >-
  Applies the FitnessApp design system for exercise libraries, training plans,
  timed workouts, and body records, including light and dark tokens, muscle-group
  colors, and Movekit exercise cards. Use when designing or styling gym UI,
  tabs, cards, buttons, timers, tags, or when the user mentions 动作库, 训练计划,
  计时训练, 身体数据, 肌群标签, Movekit, or design tokens.
---

# Fitness UI

适配健身动作库、训练计划、计时训练、身体数据记录；支持亮色 / 暗色双模式，可对接 Movekit 动作动画素材，配套之前的肌群动作 JSON 数据。

设计调性：专业克制、低视觉疲劳、力量健康感，适合力量训练、有氧、拉伸、松解全场景。

做界面时只使用 [tokens.json](tokens.json) 里的色值、字号、间距、圆角和图标尺寸。不要另起品牌色。Web 上把 sp 当作 px。亮色阴影只用 `shadowLight`；暗色靠底色分层，不加这层阴影。

## 接到现有数据

- 动作目录：`src/views/sport/catalog.js`。`type` 决定肌群标签色：`chest`、`shoulder`、`back`、`glute_leg` 用 `powerColor`；`stretch`、`release` 以及之后的有氧用 `recoverColor`；`core`、`arm`、`upper_trap` 用 `coreColor`。
- 肌肉说明：`src/views/body/muscles.json`。详情里的名称、动作、神经和临床提示用正文与次级文字，不另配色。
- 动作卡片预览用条目的 `url`（Movekit）。比例 16:9。`url` 为空时保留浅底占位，不要用无关图片。
- 当前底部栏是运动、饮食、身体、我的。规范里的首页 / 动作库 / 计划 / 数据 / 我的只在这些入口存在时使用，不要擅自改现有栏目。
- 暗色跟随系统，并保留手动切换。暗色 token 没有 `primaryDark`，按压态沿用暗色 `primary`。

## 1. 色彩体系

### 亮色模式（Light）

表格

| 用途 | 色值 | 说明 |
| --- | --- | --- |
| 主色（品牌主色、按钮、重点 tab、训练开始） | `#2563EB` | 沉稳蓝，代表力量、自律、专业 |
| 主色浅（次要按钮、标签、进度条底色） | `#EFF6FF` | 主色淡背景 |
| 主色深（按压态、强强调） | `#1D4ED8` | 点击下沉状态 |
| 辅助色 A（力量肌群：胸 / 肩 / 背 / 臀腿） | `#F97316` | 活力橙，力量板块标识 |
| 辅助色 B（恢复类：拉伸 / 松解 / 有氧） | `#10B981` | 健康绿，恢复、有氧标识 |
| 辅助色 C（小肌群：核心 / 手臂 / 斜方肌） | `#8B5CF6` | 紫，核心、小肌群、康复 |
| 成功色 | `#22C55E` | 训练完成、打卡成功 |
| 警告色 | `#F59E0B` | 提醒、休息超时、热身提示 |
| 危险色 | `#EF4444` | 伤病提示、取消、高危提醒 |
| 文字 - 主文本 | `#111827` | 标题、动作名称、数据大数字 |
| 文字 - 次级文本 | `#4B5563` | 描述、备注、组数说明 |
| 文字 - 占位 / 辅助 | `#9CA3AF` | 提示文字、次要标签 |
| 背景 - 页面底色 | `#FFFFFF` | 页面底色 |
| 背景 - 卡片 | `#F9FAFB` | 训练卡片、动作卡片 |
| 分割线 | `#E5E7EB` | 分割、边框 |

### 暗色模式（Dark，夜间训练、户外强光适配）

表格

| 用途 | 色值 |
| --- | --- |
| 主色 | `#3B82F6` |
| 主色浅 | `#1E293B` |
| 辅助色 A | `#FB923C` |
| 辅助色 B | `#34D399` |
| 辅助色 C | `#A78BFA` |
| 成功色 | `#4ADE80` |
| 警告色 | `#FBBF24` |
| 危险色 | `#F87171` |
| 文字 - 主文本 | `#F9FAFB` |
| 文字 - 次级文本 | `#D1D5DB` |
| 文字 - 占位 / 辅助 | `#9CA3AF` |
| 背景 - 页面底色 | `#0F172A` |
| 背景 - 卡片 | `#1E293B` |
| 分割线 | `#334155` |

> 
> 配色映射规则
> 
> 
> - 胸 / 肩 / 背 / 臀腿 → 橙色标签
> - 拉伸 / 松解 / 恢复 → 绿色标签
> - 核心 / 手臂 / 斜方肌 → 紫色标签

## 2. 字体规范（移动端 iOS + Android）

- 字体家族
  - iOS：SF Pro Display / SF Pro Text
  - Android：Inter（备选：Roboto）
- 单位：sp

表格

| 层级 | 字号 | 字重 | 行高 | 用途 |
| --- | --- | --- | --- | --- |
| H1 大标题 | 28sp | 700 | 1.2 | 首页标题、训练页顶部标题 |
| H2 模块标题 | 22sp | 600 | 1.2 | 肌群分类标题（胸、肩、背…） |
| H3 卡片标题 | 18sp | 600 | 1.2 | 动作名称、训练计划名称 |
| Body 正文 | 16sp | 400 | 1.5 | 动作简介、组数次数描述 |
| 辅助文本 | 14sp | 400 | 1.5 | 消耗、时长、备注信息 |
| 小字标签 | 12sp | 400 | 1.2 | 肌群标签、难度标签、时间标签 |

> 
> 字间距：默认 0；标签文字可 +0.5

## 3. 间距规范（8px 基础栅格）

基础单位：`8px`

表格

| 名称 | 尺寸 | 场景 |
| --- | --- | --- |
| xs | 4px | 最小间距、图标与文字距离 |
| sm | 8px | 卡片内边距、组件间隙 |
| md | 16px | 模块之间间距、页面左右安全边距 |
| lg | 24px | 大模块分隔 |
| xl | 32px | 页面顶部大留白 |

> 
> 安全区：避开系统状态栏、底部手势导航区，重要按钮不放在手势热区

## 4. 圆角 & 阴影规范

表格

| 圆角名称 | 尺寸 | 适用组件 |
| --- | --- | --- |
| sm | 6px | 小标签、小按钮 |
| md | 12px | 动作卡片、计划卡片、主按钮 |
| lg | 16px | 大弹窗、底部抽屉 |

- 亮色模式阴影

```
box-shadow: 0 2px 12px rgba(0,0,0,0.06);
```

- 暗色模式：弱化阴影，依靠底色区分层级，不做强阴影

## 5. 图标规范

- 风格：线性图标为主，选中态使用填充图标
- 图标网格：24px
- 线条宽度：2px
- 拐点统一圆角，拒绝尖锐卡通风格，简约专业健身风
- 选中态：主色填充；未选中：次级文字色

## 6. 高频组件规范

1. **肌群分类标签**
   - 圆角 6px，浅底色 + 对应辅助色文字
   - 例：臀腿标签 `#FFF7ED` 文字 `#F97316`
2. **动作卡片（对接 Movekit）**
   - 布局：动作动画预览图 + 动作名称 + 肌群标签 + 难度 / 时长
   - 推荐图片比例：16:9
3. **主按钮「开始训练」**
   - 填充主色，圆角 12px，白色文字；按压色为主色深
4. **次级按钮**
   - 描边主色，文字主色，透明背景
5. **进度条 / 进度环**
   - 常规训练：主色；恢复 / 拉伸：绿色
6. **底部 Tab 栏**
   - 菜单：首页 / 动作库 / 计划 / 数据 / 我的
   - 选中：主色填充图标；未选中：次级灰色线性图标

## 7. 交互规范（运动 APP 专属）

- 训练计时页：减少多余动画，优先展示清晰数据（组数、计时、休息倒计时）
- 动作详情页：动画默认自动播放，支持暂停
- 暗色模式：跟随系统，同时支持手动切换
- 触摸热区：按钮最小尺寸 `44×44px`（移动端标准）
- 对比度：所有颜色满足 WCAG AA 无障碍标准

## 8. Design Token JSON（前端 / Figma 变量）

机器可读副本见 [tokens.json](tokens.json)。

```
{
  "name": "FitnessApp-DesignToken",
  "light": {
    "primary": "#2563EB",
    "primaryLight": "#EFF6FF",
    "primaryDark": "#1D4ED8",
    "powerColor": "#F97316",
    "recoverColor": "#10B981",
    "coreColor": "#8B5CF6",
    "success": "#22C55E",
    "warning": "#F59E0B",
    "danger": "#EF4444",
    "textPrimary": "#111827",
    "textSecondary": "#4B5563",
    "textTertiary": "#9CA3AF",
    "bgPage": "#FFFFFF",
    "bgCard": "#F9FAFB",
    "divider": "#E5E7EB"
  },
  "dark": {
    "primary": "#3B82F6",
    "primaryLight": "#1E293B",
    "powerColor": "#FB923C",
    "recoverColor": "#34D399",
    "coreColor": "#A78BFA",
    "success": "#4ADE80",
    "warning": "#FBBF24",
    "danger": "#F87171",
    "textPrimary": "#F9FAFB",
    "textSecondary": "#D1D5DB",
    "textTertiary": "#9CA3AF",
    "bgPage": "#0F172A",
    "bgCard": "#1E293B",
    "divider": "#334155"
  },
  "typography": {
    "h1": {"size": 28, "weight": 700, "lineHeight": 1.2},
    "h2": {"size": 22, "weight": 600, "lineHeight": 1.2},
    "h3": {"size": 18, "weight": 600, "lineHeight": 1.2},
    "body": {"size": 16, "weight": 400, "lineHeight": 1.5},
    "caption": {"size": 14, "weight": 400, "lineHeight": 1.5},
    "tag": {"size": 12, "weight": 400, "lineHeight": 1.2}
  },
  "spacing": {
    "base": 8,
    "xs": 4,
    "sm": 8,
    "md": 16,
    "lg": 24,
    "xl": 32
  },
  "radius": {
    "sm": 6,
    "md": 12,
    "lg": 16
  },
  "shadowLight": "0 2px 12px rgba(0,0,0,0.06)",
  "iconGrid": 24,
  "iconStroke": 2
}
```
