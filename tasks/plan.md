# Implementation Plan: 蛋仔英语冒险 (Egg English Adventure)

## Overview

纯 HTML+CSS+Vanilla JS 单页应用，零构建工具，浏览器直接打开。孩子通过 CSS 圆蛋角色在每日闯关挑战中完成 PEP 三年级上册英语预习，获得装扮收集奖励。

## Architecture Decisions

1. **零依赖单页应用**：无框架、无构建工具、无 npm。浏览器从文件系统直接打开 `index.html` 即可运行。所有 JS 通过 `<script>` 标签顺序加载。
2. **全 CSS 蛋仔视觉**：蛋仔角色用 CSS 圆+渐变+transform 实现 Q 弹动画，不依赖图片资源。装扮用 emoji/unicode 符号和纯 CSS 绘制。
3. **localStorage 持久化**：无后端，所有进度、装扮收集、报告写入 localStorage。`state.js` 提供统一读写接口。
4. **Web Speech API + Google TTS 双引擎语音**：优先使用 Google Cloud TTS（en-US-Wavenet-C，通过 Cloudflare Pages Function `/api/tts` 代理），降级到 SpeechSynthesis 原生语音。iOS 端自动提高 volumeGainDb（12 vs 6），共用 AudioContext + GainNode 维持音量稳定。SpeechRecognition 负责跟读评判，不支持时自动跳过。
5. **数据驱动关卡**：教材内容（Unit1+Unit2词汇、句型、字母）以 JS 对象形式写在 `data.js`，每种题型读取相同数据格式，引擎通用。
6. **屏幕即函数**：每个"页面"是一个渲染函数 `renderScreenX(container)`，`app.js` 管理状态切换，清空容器后调用新渲染函数。无路由库。
7. **PWA 离线 + 加桌面**：`manifest.json` 让孩子一键添加到主屏如同原生 APP 图标；`sw.js` Service Worker 缓存应用让离线可启动、启动加速；非 standalone 模式下首屏气泡提示"加到桌面"。

## 项目结构

```
egg-english-adventure/
├── index.html              # 入口，app shell，屏幕容器 <div id="app">
├── styles.css              # 全部样式
├── scripts/
│   ├── data.js             # Unit1+Unit2 结构化内容（词汇、句型、关卡配置）
│   ├── state.js            # 应用状态管理 + localStorage 读写
│   ├── speech.js           # Web Speech API 封装（TTS + 跟读评分）
│   ├── egg.js              # 蛋仔角色创建、渲染、装扮系统
│   ├── game.js             # 5种题型引擎 + 闯关流程 + 通关奖励
│   ├── screens.js          # 所有屏幕渲染器（地图、关卡、图鉴、报告）
│   └── app.js              # 启动引导 + 屏幕路由 + 按钮呼吸动效delegation
├── functions/
│   └── api/
│       └── tts.js           # Cloudflare Pages Function: Google TTS 代理
├── sw.js                   # Service Worker：缓存 app shell，离线可启动
└── manifest.json           # PWA 清单（添加到主屏幕）
```

## 任务列表

### Phase 1: 骨架与角色（Task 1-4）

**Task 1: 项目骨架 + 蛋仔角色创建页**

- 搭建 index.html 结构和 styles.css 基础样式（游戏化视觉风格、Q弹动画、响应式移动端适配）
- 用纯 CSS 实现蛋仔角色（圆形 Q 弹蛋 + 渐变色 + 弹性抖动动画 + 5 种颜色选择 + 3 种表情）
- 实现角色创建页：选颜色、选表情、取名字、获得初始装扮
- 验收：打开 index.html 即见创建页，可完成蛋仔创建，角色以 CSS 圆蛋呈现且有蛋仔风格

**Task 2: 数据层 + 进度持久化**

- 用 JS 对象写出 Unit1 和 Unit2 的结构化数据（核心词汇、句型、字母、每关5道题的配置）
- 实现 state.js：localStorage 读写接口（进度、装扮收集、每日记录）
- 验收：关卡数据可读、通关后进度写入 localStorage 并恢复

**Task 3: 语音引擎**

- 封装 SpeechSynthesis（TTS朗读单词/句型）
- 封装 SpeechRecognition（跟读关卡的孩子发音转写+与目标词比对评分）
- 实现降级逻辑：不支持 SpeechRecognition 时自动隐藏跟读题型
- 验收：页面加载时自动测试TTS可用性；跟读关能识别简单单词发音

**Task 4 (NEW): PWA 离线 + 加桌面**

- `manifest.json`：name/short_name/start_url/display: standalone/theme_color/background_color/icons（用 Task 1 CSS 蛋仔转 SVG 作为图标 192/512）
- `sw.js`：缓存 app shell（index.html/styles.css/scripts/*.js），fetch 事件命中缓存优先、回退网络
- 在 index.html 注册 SW + 检测 `window.matchMedia('(display-mode: standalone)')` 非独立模式时显示3秒"加到主屏"气泡提示
- 验收：Chrome/Edge 移动端 → 添加到主屏 → 桌面图标出现（即蛋仔 SVG 图标） → 离线打开仍可见首页骨架

### Checkpoint 1: 骨架完成
- [ ] index.html 空壳能打开不报错
- [ ] 蛋仔角色可创建、CSS动画生效
- [ ] localStorage 读写正常
- [ ] TTS 能说话
- [ ] PWA 可加到桌面、可离线启动

### Phase 2: 关卡引擎 + 游戏流程（Task 5-7）

**Task 5: 世界地图 + 关卡门 UI**

- 实现世界地图屏幕：显示当前世界(World)背景、5 天关卡门（大门/已通关/未解锁状态）
- 每天一个关卡图标，已通关的有星标，今日可挑战的高亮闪烁
- 通关动画：关卡从小变大 + 星星飞入
- 验收：地图上可看到当前 Unit 的 5 天关卡门，点击可进入对应关卡

**Task 6: 题型引擎（1-3 型）**

- **听音选图**：TTS 朗读单词，3 张图上选正确的一张
- **看图选词**：显示图片，3 个单词中选正确的
- **跟读闯关**：TTS 示范后，孩子说话，SpeechRecognition 比对，显示评分+鼓励
- 每关 5 题，每题答对继续，答错弹回当前题重试
- 验收：3 种题型都能正常工作，喂 data.js 数据后自动生成关卡

**Task 7: 题型引擎（4-5 型）+ 闯关流程串联**

- **拖拽配对**：拖拽单词到对应图片上匹配
- **字母拼读**：显示字母组合，TTS 读音，孩子选择对应字母
- 实现完整的闯关流程：进入关卡 → 5 题依次出现 → 通关结算 → 跳转到奖励页
- 验收：5 种题型全部可用，一次完整的 5 题闯关流程跑通

### Checkpoint 2: 核心游戏
- [ ] 从创建蛋仔到完成第一次闯关的完整流程可走通
- [ ] 5 种题型全部可用
- [ ] 数据驱动的关卡：改变 data.js 内容，关卡自动变化

### Phase 3: 收集与家长端（Task 8-10）

**Task 8: 奖励系统 + 装扮收集 + 蛋仔换装**

- 通关后跳转到奖励页：显示获得几颗星 + 随机一件新装扮（帽子×3、眼镜×3、背包×2、特效×2 = 10件）
- 装扮数据写入 localStorage，收集图鉴屏幕展示所有已解锁装扮
- 蛋仔换装：在蛋仔身上叠加对应的装扮视觉（CSS + emoji）
- 连续通关 3 天的额外奖励提示
- 验收：通关获得装扮 → 可在图鉴查看 → 蛋仔换上新装扮

**Task 9: AI 蛋搭子伙伴**

- 在闯关页面右下角显示蛋搭子（小号蛋仔角色）
- 三种预设行为：关卡开始前鼓励（中文），答对后喝彩，答错后安慰提示
- 跟读时蛋搭子用 TTS 作英语示范朗读
- 预设话术 5-8 句随机派发，不调外部 AI API
- 验收：闯关时蛋搭子始终可见，会在恰当时候说话

**Task 10: 家长报告 + 整体润色**

- 家长报告页（通过一个简单计算题保护，不让小孩随便进）
- 每日报告内容：今天通关数、获得装扮、尝试的单词列表、星级总结
- 整体样式打磨：过渡动画、按键反馈、失败不挫败的视觉反馈（蛋仔摔倒→弹起来继续）
- 验收：家长页可查看历史每日报告；整体交互流畅无卡顿

### Checkpoint 3: MVP 验收
- [ ] 从零开始（清除 localStorage）到完成 Unit1+Unit2 所有关卡，全流程无阻塞
- [ ] 10 件装扮均可收集到、蛋仔换装正常
- [ ] 家长报告可查看历史记录
- [ ] 在移动端浏览器打开可正常使用（横竖屏、触摸事件）

## Phase 4: 内容补完（Task 11-13，验证后）

**Task 11: Unit 3+4 关卡内容**（数据+关卡配置）

**Task 12: Unit 5+6+Revision 关卡内容**

**Task 13: 赛季皮肤系统 + 段位系统**（Phase 2 功能）

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Web Speech API 在移动端浏览器不支持 | High | 降级友好——跟读题型自动隐藏，仍有4种题型；TTS在多数浏览器支持 |
| CSS 蛋仔无吸引力 | High | Task 1 要先给孩子看——如果反应是"哦"而非"哇"，立即换方案 |
| 纯JS SPA在复杂状态流转中有bug | Medium | 全局状态对象 + localStorage 双保险；状态变更日志可在控制台查看调试 |
| 触摸拖拽在移动端体验差 | Medium | 用 `touchstart/touchmove/touchend` 实现而非 mouse 事件；早期测试 |

## Open Questions

（无新问题。所有已记录在 `docs/ideas/egg-english-adventure.md` 的 Open Questions 部分）

---

## Sound & Animation Design (音效/动效规范)

所有后续 Task 新增交互必须遵循以下已建立的音效动效体系，使产品反馈风格统一。

### A. 音效体系 (Web Audio API 合成，零外部资源)

| 事件 | 方法 | 波形 | 音高 | 时长 | 增益 |
|------|------|------|------|------|------|
| ✅ 答对 | `playCorrect()` | sine | C5→G5 上行 | 0.3s | 0.25 |
| ❌ 答错 | `playWrong()` | sawtooth | 180→100Hz 下行 | 0.35s | 0.2 |
| 🏆 闯关成功 | `playVictory()` | sine | C5→E5→G5→C6 | 0.48s | 0.25 |

代码位置：`speech.js:268-309`。所有音效用共享 `AudioContext`（`getAudioContext()`），确保 iOS 下音量一致。

| 新增事件 | 应使用方法 | 备注 |
|----------|-----------|------|
| 获得新装扮 | 新方法 `playReward()` | 建议：上行琶音 + 短铃铛感 |
| 图鉴翻页 | 新方法 `playFlip()` | 短促木质感 click |
| 蛋搭子说话前 | `playCorrect()` 变体 | 轻快 "叮" 提示音 |
| 关卡解锁 | `playVictory()` 变体 | 简短版 2 音 |

### B. TTS 语音体系

| 引擎 | 触发条件 | 参数 | 文件 |
|------|----------|------|------|
| Google Cloud TTS | 默认（所有平台） | Wavenet-C, en-US, rate=0.9, gain=6(Android/Desktop)/12(iOS) | `functions/api/tts.js` |
| Native SpeechSynthesis | Google 失败时降级 | lang=en-US, rate=0.9, preferred en-US female | `speech.js speakNative()` |

### C. 动效体系 (纯 CSS @keyframes + class toggle)

| 动效 | CSS 类/动画 | 触发事件 | 文件·行 |
|------|------------|----------|---------|
| 蛋仔 Q 弹待机 | `eggBounce 2.0s` | 持续 | `styles.css:174` |
| 蛋仔答对欢呼 | `.egg-cheer → eggCheer 0.5s×2` | `pass()` | `game.js:331/styles.css:865` |
| 蛋仔答错摔倒 | `.egg-fall → eggFall 0.9s` | `judge()` wrong | `game.js:339/styles.css:873` |
| 答题区正确闪 | `.quiz-area--correct → quizRight 0.4s` | `pass()` | `game.js:325/styles.css:680` |
| 答题区错误摇 | `.quiz-area--wrong → quizWrong 0.4s` | `judge()` wrong | `game.js:298/styles.css:685` |
| 关卡门脉冲 | `.level-door--current → doorPulse 1.6s` | 持续 | `styles.css:530` |
| 星星飞入 | `.star-flyin → starFlyin 0.55s` | 通关返回 | `styles.css:517` |
| 按钮呼吸 | `.btn-breathe → breathe 0.5s` | 任意按钮点击 | `app.js:47/styles.css:884` |
| 屏幕切换淡入 | `fadeIn 0.35s` | 所有 `.screen` | `styles.css:99` |
| 拖拽匹配锁定 | `.drag-emoji-matched` 绿框+辉光 | 配对正确 | `styles.css:976` |
| 拖拽匹配摇动 | `.drag-word-shake` → **复用** `quizWrong` | 配对错误 | `styles.css:1010` |
| 拖拽选中高亮 | `.drag-word-selected / .drag-target-selected` | 点选 | `styles.css:1000/979` |
| 关卡门「继续」 | `.level-door--resume` 粉色徽标 | 有保存会话 | `styles.css:1020` |
| 跟读监听中 | `.quiz-listening → pulse 1s` | 麦克风等待 | `styles.css:813` |

### D. 动效复用规则

1. **答错统一用 `quizWrong` keyframe**：新组件答错动画直接引用已有 `@keyframes quizWrong`，不加新的 shake keyframe。
2. **新答对动效用 `quizRight`**：同样复用已有 keyframe。
3. **按钮点击用 `btn-breathe`**：`app.js` 已有全局 delegation，所有 `<button>` 自动呼吸。
4. **答对/答错/通关音效用 `playCorrect/Wrong/Victory`**：新评分场景直接调用对应方法。
5. **所有 CSS 动画时长控制在 0.3-0.9s** 内——儿童注意力短，反馈必须即时。
6. **所有音量增益 ≤ 0.3**：避免少儿使用场景吓到或刺耳。

### E. Task 8-10 预期音效动效

| 任务 | 场景 | 音效 | 动效 |
|------|------|------|------|
| Task 8 | 获得新装扮 | `playReward()` (待新增) | 宝箱打开 → 装扮卡片飞入 |
| Task 8 | 图鉴页翻页/点击 | `playFlip()` (待新增) | 卡牌翻转 3D |
| Task 8 | 换装确认 | `playCorrect()` | 蛋仔原地转圈 360° + 装扮叠加 |
| Task 9 | 蛋搭子出现 | 轻快 "叮" | 从右下角弹入 + 呼吸待机 |
| Task 9 | 蛋搭子鼓励/喝彩 | `playCorrect()` | 气泡弹出 + 蛋搭子小跳 |
| Task 9 | 蛋搭子安慰 | `playWrong()` | 气泡 + 蛋搭子低头 |
| Task 10 | 家长计算题正确 | `playCorrect()` | 解锁过渡 |
| Task 10 | 家长计算题错误 | `playWrong()` | 输入框抖动 |
| Task 10 | 报告页进入 | 无 | 淡入 + 数字递增滚动 |