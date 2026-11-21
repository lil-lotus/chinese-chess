# ♟️ 中国象棋 - 3D AI 超难版 (Xiangqi 3D AI)

<p align="center">
  <i>纯前端打造的极致视觉体验，搭载专业级国际象棋引擎算法的超难对手！ \^o^/</i>
</p>

<p align="center">
  <a href="https://github.com/[你的GitHub用户名]/[你的仓库名]/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white" alt="HTML5">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white" alt="CSS3">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Web_Worker-3D4B5F?logo=webassembly&logoColor=white" alt="Web Worker">
  </a>
</p>

<p align="center">
  🔗 <b>在线体验：</b> <a href="https://lil-lotus.github.io/chinese-chess/">👉 点击这里挑战 AI！</a>
</p>

---

## ✨ 关于项目 (About)

**中国象棋-3D AI 超难版** 是一个完全基于原生 Web 技术开发的单页面象棋游戏。它不仅在视觉上采用了现代感十足的 **3D 拟物化设计**（纯 CSS 实现的光影、木纹和立体棋子），更在底层搭载了一个**专业级的象棋 AI 引擎**。

无论你是想欣赏精美的 UI 设计，还是想挑战一个真正懂得“马后炮”和“铁门栓”的硬核对手，这个项目都能满足你！

## 🌟 核心特性 (Features)

### 🎨 极致视觉体验
- **纯 CSS 3D 棋子**：利用 `radial-gradient` 和多重 `box-shadow` 打造逼真的立体木质棋子，无需任何图片资源。
- **动态交互反馈**：选中高亮、最后一步标记、将军红色脉冲警告、吃子/绝杀全屏特效动画。
- **完全响应式**：自适应桌面端与移动端屏幕，随时随地都能开局。

### 🧠 专业级 AI 引擎 (Web Worker 多线程)
AI 计算运行在独立的 Web Worker 线程中，**绝不阻塞主线程 UI 渲染**，即使在高难度下也能保持界面流畅。引擎包含以下专业算法：
- **Minimax 算法** 配合 **Alpha-Beta 剪枝**：大幅减少搜索节点，提升计算效率。
- **迭代加深 (Iterative Deepening)**：动态控制搜索深度，确保在限定时间内给出最优解。
- **置换表 (Transposition Table, TT)**：缓存已计算过的棋盘局面，避免重复计算。
- **启发式搜索优化**：
  - **MVV-LVV** (最有价值受害者-最有价值攻击者)：优先搜索吃子走法。
  - **历史启发 (History Heuristic)**：记录历史优秀走法，提升排序效率。
  - **杀手启发 (Killer Heuristic)**：优先测试在同一深度曾引起 Beta 剪枝的走法。
- **内置开局库**：前几步直接调用经典开局，提升开局质量与响应速度。

### 🎯 智能杀法识别系统
当一方被将死时，AI 不仅能判断胜负，还能**精准识别并播报专业杀法名称**：
> 🏆 支持识别：`双车错` · `重炮` · `马后炮` · `闷宫` · `铁门栓` · `白脸将(飞将)` · `单车/单马/单炮/单兵绝杀`

## 🛠️ 技术栈 (Tech Stack)

| 技术 | 说明 |
| :---: | :--- |
| **HTML5 / CSS3** | 语义化结构，Tailwind CSS 辅助布局，纯 CSS 实现 3D 视觉效果与 Keyframe 动画 |
| **JavaScript (ES6+)** | 面向对象编程 (OOP)，完整的象棋规则逻辑与状态管理 |
| **Web Worker** | 将繁重的 Minimax 递归计算移至后台线程，保证 60fps 流畅 UI |

## 🚀 本地运行 (Getting Started)

由于项目使用了 `Web Worker`，出于浏览器的安全策略 (CORS)，**不能直接双击 `index.html` 打开**（`file://` 协议会拦截 Worker）。请使用以下任一方式运行：

### 方式一：使用 VS Code (推荐)
1. 克隆或下载本仓库到本地。
2. 在 VS Code 中打开该文件夹。
3. 安装 **Live Server** 插件。
4. 右键点击 `index.html`，选择 **"Open with Live Server"**。

### 方式二：使用 Python 快速启动
在项目根目录下打开终端，运行：
```bash
# Python 3
python -m http.server 8000
然后在浏览器中访问 http://localhost:8000
