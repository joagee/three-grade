# 部署到 Cloudflare Pages

## 一次性配置

1. 注册 Cloudflare 账号 → Pages → Create a project → Direct Upload
2. 项目名：egg-english-adventure
3. 上传整个 `egg-english-adventure/` 目录（不是仓库根，是子目录）
4. 框架预设：None（纯静态）
5. Build command：留空
6. Build output directory：留空（直接上传）
7. 部署 → 等待 30 秒 → 获得 `https://egg-english-adventure.pages.dev`

## 绑定自有域名

Pages → Custom domains → Set up custom domain → 按提示加 CNAME。
Cloudflare 自动签发 SSL 证书。

## 后续自动部署（可选）

设 GitHub repo，连接 Cloudflare Pages：
1. git init + push 到你的 GitHub
2. Cloudflare Pages → Create → Connect to Git
3. Build command：留空
4. Build output directory：`egg-english-adventure`
5. 每次 push 自动构建发布

## 验证 PWA

部署后用 Android Chrome / Edge 打开公网地址：
- 浏览器菜单出现"安装应用"/"添加到主屏幕"选项
- 或自动弹出底部安装横幅（Chrome 对 PWA 安装评分 >= 阈值时）
- 添加后桌面图标就是黄色蛋仔
- 离线（飞行模式）下打开 → 仍可显示页面

iOS Safari：
- Share → Add to Home Screen → 桌面图标出现
- 离线打开可启动（首屏白屏是已知限制，无离线缓存能进一步匹配）
