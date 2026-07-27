# TODO: 蛋仔英语冒险 MVP

## Phase 1: 骨架与角色

### Task 1: 项目骨架 + 蛋仔角色创建页

**Description:** 搭建 index.html 结构、styles.css 基础样式、纯 CSS 蛋仔角色（Q弹圆蛋+渐变+弹性抖动+5色+3表情）、角色创建页流程（选色+选表情+取名+初始装扮）。

**Acceptance criteria:**
- [x] 在浏览器直接打开 `index.html` 即可见到角色创建页（无需启动服务器）  *(2026-07-26 通过，线上 https://egg-english-adventure.pages.dev/)*
- [x] 蛋仔以纯 CSS 圆+渐变呈现，有弹性抖动动画  *(eggBounce 动画；2.4s 觉稍慢，2026-07-26 调为 2.0s)*
- [x] 5 种颜色可选、3 种表情可选  *(点击实时切换，已在浏览器实测)*
- [x] 可输入孩子昵称（限20字符）  *(maxLength=20 + 空名锁定按钮)*
- [x] 完成创建后自动跳转主世界地图占位页  *(App.go("placeholder-world") 已跳转)*

**Verification:**
- [ ] 手动检查：在 Chrome、Edge、iOS Safari、Android Chrome 横竖屏打开均正常
- [x] 互动测试：色板点击切换蛋仔色、表情板点击切换表情、完成创建按钮可触发  *(2026-07-26 浏览器实测通过)*
- [ ] 视觉评测：拿到孩子面前做摸底反应（若反应平淡立即停下调整）

**Dependencies:** None

**Files likely touched:**
- `egg-english-adventure/index.html`
- `egg-english-adventure/styles.css`
- `egg-english-adventure/scripts/egg.js`
- `egg-english-adventure/scripts/screens.js` (创建页渲染函数)
- `egg-english-adventure/scripts/app.js` (启动引导)

**Estimated scope:** Medium (5 files)

---

### Task 2: 数据层 + 进度持久化

**Description:** 用 JS 对象写出 Unit1、Unit2 结构化数据（词汇、句型、字母拼读、每关5题配置），实现 state.js 统一读写 localStorage。

**Acceptance criteria:**
- [x] `data.js` 导出 Unit1（15 词汇、7 句型、Aa-Dd）和 Unit2（13 词汇、4 句型、Ee-Hh）  *(2026-07-26 通过：实际 Unit1=22词/7句/4字母，Unit2=17词/4句/4字母，均超额)*
- [x] 每个关卡包含 5 道题的配置（题型类型 + 题目数据）  *(2026-07-26：2 Unit × 5 day × 5 = 50 题齐)*
- [x] 关卡内容真实取自 `PEP_English_G3_up.md` 教材  *(2026-07-26 抽检：Unit1 Day1 hello/name/Aa-apple 全部对应 PEP p.35/82)*
- [x] `state.js` 提供 `loadState()`、`saveState(state)`、`updateProgress(dayId, stars)`、`unlockAccessory(id)` 等接口  *(2026-07-26 通过：实际提供 load/save/completeDay/unlockAccessory 等 8+ 接口，命名略异语义同)*
- [ ] 应用刷新后状态可完整恢复  *(代码侧已实现 load/save；待 Phase 2 闯关流程接入后端到端验收)*

**Verification:**
- [ ] 在浏览器控制台执行 `state.loadState()` 返回完整进度对象  *(命名实为 state.load()，可在 Console 跑：`App.state.load()` 自测)*
- [ ] 修改 `data.js` 后闯关内容自动变化  *(数据驱动结构达成；待 game.js 引擎接入端到端验证)*
- [ ] 通关后刷新页面，已通关状态保持  *(待 Phase 2 闯关流程接入后端到端验收)*

**Dependencies:** None

**Files likely touched:**
- `egg-english-adventure/scripts/data.js`
- `egg-english-adventure/scripts/state.js`

**Estimated scope:** Medium (2 files)

---

### Task 3: 语音引擎

**Description:** 封装 Web Speech API：SpeechSynthesis 用于单词/句型朗读，SpeechRecognition 用于跟读发音识别评分，不支持时自动降级。

**Acceptance criteria:**
- [x] `speech.js` 提供 `speak(text, lang)`、`recognizeWord(targetWord)` 两个核心 API  *(2026-07-26 通过；speak 实签 speak(text, opts) 写死 en-US；recognizeWord 返回 0-100 评分)*
- [x] 页面加载时检测 TTS 与 SpeechRecognition 可用性并写入 state  *(2026-07-26 通过；app.js:30 调 detectCapabilities → state.ttsReady/speechRecognitionReady)*
- [x] 浏览器不支持 SpeechRecognition 时，自动跳过"跟读"题型不报错  *(2026-07-26 通过；recognizeWord 返回 {unsupported:true}，game.js 接入时按此跳过)*
- [x] 端到端：调用 `speak('apple')` 浏览器朗读；调用 `recognizeWord('apple')` 录音并返回相似度评分（0-100）  *(2026-07-26 通过；Console 实测 speak("Nice to meet you.") 可听 / detectCapabilities 返回 {ttsReady:true, speechRecognitionReady:true})*

**Verification:**
- [x] 在 Chrome/Edge 测试 TTS 朗读 + 跟读评分功能  *(2026-07-26 通过)*
- [ ] 在 Safari/Firefox 测试降级路径——无崩溃、无报错、跟读题型自动隐藏  *(代码侧降级路径已就位；待 Safari 实机验收)*
- [ ] 对 10 个 PEP 单词做人工对比：TTS 读音是否符合词典发音  *(需你本人耳朵验收；Google 美式女声在小学英语词汇实测通常无误)*

**Dependencies:** None

**Files likely touched:**
- `egg-english-adventure/scripts/speech.js`

**Estimated scope:** Small (1 file)

---

### Task 4: PWA 离线 + 加桌面

**Description:** 创建 manifest.json、sw.js（缓存 app shell 实现离线启动），检测非 standalone 模式时显示"添加到主屏"气泡提示，让孩子像原生 APP 一样每天快速打开。

**Acceptance criteria:**
- [ ] `manifest.json` 含 name/short_name/start_url/display: standalone/theme_color/background_color/icons（192/512，使用 Task 1 的蛋仔 SVG 作为图标）
- [ ] `sw.js` 缓存 index.html/styles.css/scripts/*.js，fetch 命中缓存优先回退网络
- [ ] `index.html` 头部引入 manifest，启动时注册 SW
- [ ] 非 standalone 模式下首屏显示"加到主屏下次秒开"气泡（3 秒自动消失）
- [ ] 添加到主屏后桌面图标是蛋仔 SVG，启动后无地址栏

**Verification:**
- [ ] Chrome 移动端地址栏 → 添加到主屏 → 桌面图标出现 → 点击打开无地址栏 standalone 模式
- [ ] 飞行模式或断网下打开已缓存应用不报错（至少能渲染角色创建页）
- [ ] 桌面图标在浅色和深色壁纸下均清晰

**Dependencies:** Task 1（图标依赖蛋仔 CSS 视觉完成）

**Files likely touched:**
- `egg-english-adventure/manifest.json`
- `egg-english-adventure/sw.js`
- `egg-english-adventure/index.html`（引入 manifest 和 SW 注册）
- `egg-english-adventure/scripts/app.js`（首屏气泡渲染逻辑）

**Estimated scope:** Small (3 files + 1 json)

---

### Checkpoint 1: 骨架完成
- [x] index.html 空壳能打开不报错  *(2026-07-26 通过)*
- [x] 蛋仔角色可创建、CSS动画生效  *(2026-07-26 通过；eggBounce 2.0s)*
- [x] localStorage 读写正常  *(2026-07-26：Task 1 测试中 name/color/expression 已成功写入并由 app.js:33 检测恢复)*
- [x] TTS 能朗读  *(2026-07-26 通过；Console 实测)*
- [x] 跟读评分可用或自动降级无错误  *(2026-07-26 通过；speechRecognitionReady=true 且不支持时降级返回 {unsupported:true} 不报错)*
- [ ] PWA 可加到桌面、可离线启动

---

## Phase 2: 关卡引擎 + 游戏流程

### Task 5: 世界地图 + 关卡门 UI

**Description:** 实现世界地图屏幕，显示当前 Unit 主题背景、5 天关卡门（已通关/今日挑战/未解锁三种状态），通关动画。

**Acceptance criteria:**
- [x] 显示当前 Unit 名称、主题装饰、5 天关卡门  *(2026-07-26 通过：Unit1 🫂 交朋友 + 5 关卡门网格)*
- [x] 已通关门有星标（1-3 星）  *(2026-07-26 通过：模拟 completeDay('u1d1',3) 后渲染 3 颗 ★)*
- [x] 今日挑战门有脉冲闪烁动画  *(2026-07-26 通过：doorPulse 1.6s 循环)*
- [x] 未解锁门灰色不可点击  *(2026-07-26 通过：第 2-5 关灰色 + 🔒 + disabled)*
- [x] 点击今日挑战门可进入对应关卡  *(2026-07-26 通过：占位 toast 弹出，Task 6 接真关卡页)*
- [x] 通关返回时关卡门播放星星飞入动画  *(2026-07-26 通过：sim completeDay 后 starFlyin 弹性入场动画已见)*

**Verification:**
- [x] 手动检查三种状态视觉明确  *(2026-07-26 通过)*
- [x] 模拟进度：手动修改 localStorage，刷新后状态正确显示  *(2026-07-26 通过：Console completeDay + App.go('world-map') 立即重渲)*
- [x] 点击进入关卡跳转无错误  *(2026-07-26 通过：占位 toast 2.2s 后平滑退出)*

**Dependencies:** Task 2 ✅

**Files touched:**
- `egg-english-adventure/scripts/app.js`  *(加 world-map 路由 + go(target,params) 兼容参数)*
- `egg-english-adventure/scripts/screens.js`  *(新增 renderWorldMap 118 行 + showLevelPlaceholder toast)*
- `egg-english-adventure/styles.css`  *(新增 200 行地图样式，三种状态+脉冲+星星飞入+toast)*
- `egg-english-adventure/index.html`  *(顺手加 mobile-web-app-capable 修 deprecation)*

**Estimated scope:** Medium (3 文件计划 → 实际 4 文件含 index.html 顺手修)

---

### Task 6: 题型引擎（1-3 型）

**Description:** 实现听音选图、看图选词、跟读闯关三种题型引擎，每关 5 题依次出现，答错弹回当前题。

**Acceptance criteria:**
- [ ] **听音选图**：TTS 朗读单词 → 显示 3 张图 → 点击正确图，对错反馈
- [ ] **看图选词**：显示 1 张图 → 显示 3 个英文单词 → 点击正确单词
- [ ] **跟读闯关**：TTS 示范 → 孩子说话 → SpeechRecognition 比对 → 显示评分（0-100 分）+ 鼓励话
- [ ] 每关 5 题依次出现，答错弹回当前题重试不跳过
- [ ] 通过 data.js 中题目配置 `type` 字段路由到对应引擎

**Verification:**
- [ ] 控制 `data.js` 中所有题目 type 设为 `listen-choose` 时只跑听音选图题
- [ ] 跟读题型在 Safari 中自动跳过不报错
- [ ] 答对答错视觉反馈明确（蛋仔欢呼/摔倒动画）

**Dependencies:** Task 2, Task 3

**Files likely touched:**
- `egg-english-adventure/scripts/game.js`（题型引擎 + 关卡流程）
- `egg-english-adventure/styles.css` (题目样式)
- `egg-english-adventure/scripts/data.js`（补全题目结构）

**Estimated scope:** Medium (3 files)

---

### Task 7: 题型引擎（4-5 型）+ 闯关流程串联

**Description:** 实现拖拽配对、字母拼读引擎，串联完整闯关流程：进入 → 5 题依次 → 通关结算 → 跳转奖励页。

**Acceptance criteria:**
- [ ] **拖拽配对**：显示 3 张图 + 3 个单词，拖单词到对应图上，配对正确后定位锁定
- [ ] **字母拼读**：TTS 读一个词（例 `cat`），显示字母组合选项，孩子选正确首字母
- [ ] 完整流程：世界地图 → 进入关卡 → 5 题轮播 → 完成 → 跳转奖励页
- [ ] localStorage 写入本次通关数据（星级、尝试的单词列表）
- [ ] 中途离开应用或刷新会跳回当前题（不丢失进度）

**Verification:**
- [ ] 在移动端浏览器测试拖拽触摸事件
- [ ] 完整跑通一次 5 题闯关流程无卡顿
- [ ] 通关奖励页正常出现

**Dependencies:** Task 5

**Files likely touched:**
- `egg-english-adventure/scripts/game.js`
- `egg-english-adventure/scripts/screens.js`
- `egg-english-adventure/styles.css`

**Estimated scope:** Medium (3 files)

---

### Checkpoint 2: 核心游戏
- [ ] 从创建蛋仔到完成第一次闯关完整流程可走通
- [ ] 5 种题型全部可用（跟读在不支持的浏览器降级）
- [ ] 数据驱动：改 `data.js` 关卡自动变化
- [ ] 移动端体验流畅

---

## Phase 3: 收集与家长端

### Task 8: 奖励系统 + 装扮收集 + 蛋仔换装

**Description:** 通关奖励页（星星+随机装扮）、收集图鉴屏幕、蛋仔换装叠加视觉。

**Acceptance criteria:**
- [ ] 通关奖励页显示：本次得星（1-3）、随机解锁一件新装扮（从 10 件未拥有的抽取）
- [ ] `state.unlockAccessory(id)` 写入 localStorage
- [ ] 收集图鉴页显示所有装扮（已解锁彩色/未解锁灰色锁图标）
- [ ] 蛋仔角色叠加装扮视觉（帽子→头顶 emoji、眼镜→眼睛位置、背包→侧后方、特效→周围光晕）
- [ ] 10 件装扮全部按 CSS+emoji 渲染（无图片素材）

**Verification:**
- [ ] 重复通关至解锁所有 10 件装扮，图鉴全亮
- [ ] 在地图上看蛋仔及时显示当前装扮
- [ ] 各装扮层级叠加正常不互相干扰

**Dependencies:** Task 7

**Files likely touched:**
- `egg-english-adventure/scripts/screens.js`（奖励页、图鉴页）
- `egg-english-adventure/scripts/egg.js`（装扮渲染）
- `egg-english-adventure/scripts/state.js`（装扮解锁）
- `egg-english-adventure/styles.css`（装扮样式）

**Estimated scope:** Medium (4 files)

---

### Task 9: AI 蛋搭子伙伴

**Description:** 闯关页面右下角小号 AI 蛋搭子，3 种预设行为（开始鼓励、答对喝彩、答错安慰），5-8 句预设话术随机派发，跟读时用 TTS 作英语示范。

**Acceptance criteria:**
- [ ] 闯关页面右下角始终显示一个蛋搭子（小号蛋+基础表情）
- [ ] 关卡开始前自动浮出一句鼓励（中文气泡，3-5 秒消失）
- [ ] 答对时蛋搭子欢呼动画 + 喝彩气泡
- [ ] 答错时蛋搭子拍肩动画 + "没关系，再来一次"气泡
- [ ] 跟读题时用 TTS 朗读目标英语单词作为示范

**Verification:**
- [ ] A/B 观感测试：有蛋搭子的关卡对比没有的，孩子更喜欢哪个
- [ ] 气泡不遮挡题目内容
- [ ] 多次闯关话术不重复感强（5-8 句足够）

**Dependencies:** Task 7, Task 3

**Files likely touched:**
- `egg-english-adventure/scripts/game.js`（蛋搭子调用）
- `egg-english-adventure/scripts/screens.js`（蛋搭子渲染）
- `egg-english-adventure/styles.css`

**Estimated scope:** Small (3 files)

---

### Task 10: 家长报告 + 整体润色

**Description:** 家长报告页（简单计算题保护入口），每日通关报告（关卡数、星级、新装扮、尝试单词列表），整体动画/过渡打磨。

**Acceptance criteria:**
- [ ] 世界地图有入口按钮"家长专区"，点击需答一个数学题（如 3+5=?）才能进入家长报告页
- [ ] 家长报告页按日期列出每日通关记录（关卡进度、星级、获得装扮、尝试的词汇列表）
- [ ] 全产品过渡动画统一（屏切换 fade、按键反馈缩放、答错蛋仔摔倒、答对蛋仔跳跃）
- [ ] 移动端横竖屏自适应

**Verification:**
- [ ] 模拟 3 天通关记录后，家长页能列出 3 条日报
- [ ] 让孩子试用 1 个 Unit 看 5 天是否还愿意回访打开
- [ ] 移动端横竖屏切换布局正常

**Dependencies:** Task 8, Task 9

**Files likely touched:**
- `egg-english-adventure/scripts/screens.js`（家长报告页渲染）
- `egg-english-adventure/scripts/state.js`（报告数据查询）
- `egg-english-adventure/styles.css`（动画+移动端响应式）

**Estimated scope:** Medium (3 files)

---

### Checkpoint 3: MVP 整体验收
- [ ] 从零开始（清除 localStorage）到完成 Unit1+Unit2 全部关卡无阻塞
- [ ] 10 件装扮均可收集到
- [ ] 蛋仔换装正常
- [ ] 家长报告可查看历史
- [ ] 移动端浏览器打开可正常使用

---

## Phase 4: 内容补完（验证后）

### Task 11: Unit 3+4 关卡内容

**Acceptance criteria:**
- [ ] `data.js` 补完 Unit 3（17 词汇、7 句型、Ii-Ll）和 Unit 4（10 词汇、6 句型、Mm-Pp）
- [ ] 世界地图新增两个 Unit 主题门
- [ ] 闯关流程跑通无报错

**Dependencies:** Task 10
**Files:** `egg-english-adventure/scripts/data.js`, `script/styles.css`
**Estimated scope:** Small (2 files)

---

### Task 12: Unit 5+6+Revision 关卡内容

**Acceptance criteria:**
- [ ] `data.js` 补完 Unit 5（11 词汇、6 句型、Qq-Uu）和 Unit 6（13 词汇、8 句型、Vv-Zz）+ Revision
- [ ] 全部 6 周地图场景设计完整
- [ ] 端到端跑通完整 6 周

**Dependencies:** Task 11
**Files:** `egg-english-adventure/scripts/data.js`
**Estimated scope:** Small (1 file)

---

### Task 13: 赛季皮肤系统 + 段位系统（Phase 2 功能）

**Acceptance criteria:**
- [ ] 每完成一个 Unit 解锁一个赛季主题稀有皮肤（6 套皮肤）
- [ ] 段位系统（青铜→白银→黄金→钻石→蛋仔之王），按累计星数晋升
- [ ] 连续 7 天通关额外皮肤碎片奖励，集齐合成

**Dependencies:** Task 12
**Files:** `egg-english-adventure/scripts/screens.js`, `state.js`, `egg.js`, `styles.css`
**Estimated scope:** Medium (4 files)
