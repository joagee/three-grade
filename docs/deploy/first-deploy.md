# 部署指南 — 第一次部署蛋仔英语冒险

## 一、推到 GitHub（让代码有云端备份）

### 步骤 1：在 GitHub 上新建空仓库

浏览器登录 https://github.com/new

- Repository name: `three-grade`
- Description: `蛋仔英语冒险 — 三年级英语预习游戏化应用`
- 选 **Public** 或 **Private** 都可以（CF Pages 两种都能连）。建议 Public 让别人看到你的项目。
- **不要勾** "Initialize this repository with a README" 等任何选项（你本地已经有 commit 了）
- 点 Create repository

GitHub 会跳到一个新仓库页面，显示一串命令。**你不需要复制它的命令**，按下面给你的步骤来。

### 步骤 2：把本地分支接上远端并推送

在 PowerShell 里跑（替换 `<your-token>` 见下方说明）：

```powershell
cd C:\Users\joage\Documents\OCspace\three-grade
git remote add origin https://github.com/joagee/three-grade.git
git branch -M main
git push -u origin main
```

如果它提示要密码：GitHub 早就不支持密码 push，要用 **Personal Access Token (PAT)**：

1. 浏览器打开 https://github.com/settings/tokens/new
2. Note: 填 `egg-english-deploy`
3. Expiration: 30 days（够今天用就行）
4. Scopes: 勾 `repo`
5. 拉 Generate token，复制那串 `ghp_xxxxxxxxxxx`
6. push 时 Username: `joagee`，Password: 粘贴 token

或者装一次 Git Credential Manager（推荐——一次登录永久用），下载 https://github.com/git/git-credential-manager/releases 装 `GCMW.x.x.x.exe`。安装后再跑 `git push -u origin main` 会自动弹浏览器登录，之后不用再管 token。

### 步骤 3：验证 push 成功

刷新 https://github.com/joagee/three-grade → 应能看到你刚 commit 的 51 个文件。

---

## 二、部署到 Cloudflare Pages（推荐 Direct Upload）

### 步骤 1：注册 Cloudflare 账号（如无）

去 https://dash.cloudflare.com/sign-up 注册（邮箱 + 密码，免费），无需绑定信用卡。

### 步骤 2：创建 Pages 项目

1. 登录 dash.cloudflare.com → 左侧菜单选 **Workers & Pages**
2. 选 **Pages** 选项卡 → **Create a project** → **Upload assets**
3. Project name: `egg-english-adventure`（这个名会出现在 URL 里：`egg-english-adventure.pages.dev`）
4. 点 **Create project**

### 步骤 3：上传部署包

页面会让你拖文件/文件夹 或 上传 zip。

两个选项任选：

**选项 A — 上传 zip（最快）**

文件路径：`C:\Users\joage\Documents\OCspace\three-grade\.deploy\egg-deploy.zip`

把 zip 拖到上传区域。

**选项 B — 拖文件夹**

把整个文件夹 `C:\Users\joage\Documents\OCspace\three-grade\.deploy\egg-deploy` 拖到上传区域（包括里面的子目录 `assets\` 和 `scripts\`）。

### 步骤 4：点 Deploy

30 秒到 1 分钟后会出现：

> `https://egg-english-adventure.pages.dev` (或带随机后缀)

点开 → 看到蛋仔角色创建页 ✓

---

## 三、验证 PWA 基础（关键步骤）

### 3.1 桌面浏览器快速验证

用 Chrome 或 Edge 打开 `https://egg-english-adventure.pages.dev`

1. 按 F12 打开 DevTools → Application 面板 → Manifest
   - 应看到 `Name: 蛋仔英语冒险` `Display: standalone`，3 个图标都已加载
2. Application → Service Workers
   - 看到"egg-en-v1"状态为"activated and is running" ✓
3. Application → Storage → Cache Storage → "egg-en-v1"
   - 应列出 13 个 app shell 资源（HTML/CSS/JS/icons）
4. 关闭 WiFi 或拔网线，刷新页面
   - 仍能完整打开角色创建页（离线生效）✓

### 3.2 手机端验证"加到主屏"

1. 取你的 Android/华为手机，用 Chrome / Edge 打开 `https://egg-english-adventure.pages.dev`
2. 浏览器菜单 → **添加到主屏幕**
3. 桌面出现一个**黄色蛋仔图标** ✓（如果图标是默认的地球，说明 manifest icon 没生效，需排查）
4. 点桌面图标 → 打开后**没有浏览器的地址栏**（standalone 模式）✓

### 3.3 iPhone / iPad 上验证

1. Safari 打开 `https://egg-english-adventure.pages.dev`
2. 底部 Share 按钮 → 添加到主屏幕 → 顶部右上角"添加"
3. 桌面出现"蛋仔英语"图标 ✓
4. 打开 → 全屏屏幕，无 Safari UI ✓

### 3.4 控制台实测 TTS + 跟读

手机上打开部署后的页面 → 蛋仔创建页（或报到页）→ 在地址栏右侧菜单里如果能看到"分享按钮/电脑打开"按钮就找到"开发者工具"或 Safari 的"开发 → 你的设备"桌面端。

或在桌面云地址按 F12 → console 跑：

```js
App.speech.detectCapabilities()            // {ttsReady: true, speechRecognitionReady: true}
App.speech.speak("Nice to meet you.")       // 听到英语朗读
App.speech.recognizeWord("hello").then(r => console.log(r))   // 对着麦克风念 hello，看 score
```

---

## 四、后续更新部署

每次 Task 完成后，需要重新部署。**两种方式**：

**方式 A — 改用 Git 自动部署（强烈推荐连一次）**

Pages → 你的项目 → Settings → Builds & deployments → Connect to Git → 选 GitHub → 选 three-grade 仓库

**关键**：
- Build command: 留空
- Build output directory: `egg-english-adventure`
- root directory: `/` (即仓库根)

连上后，每次 `git push origin main` 自动部署 30 秒到 1 分钟上线。**之后再不用手动上传。**

**方式 B — 手动重新上传 zip**

每次完成一个 Task 后，跟我说：**"重新打部署包"**，我会把 `egg-english-adventure/` 子目录重新打包到 `.deploy\egg-deploy.zip`，你再去 Cloudflare Pages 项目 → Create deployment → 上传 zip。

---

## 红线再确认

- 我不会替你执行 `git push`（即使 PAT 给我也是）— 这步必须你本人来。
- 我不会替你登录 Cloudflare。
- 我只生成 Commit + 打包，REDENTIAL + 公网部署 全是你本人操作。
