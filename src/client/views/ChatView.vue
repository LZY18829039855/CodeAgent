<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowUp, ChatDotRound, Lightning, Monitor, Promotion, Setting } from '@element-plus/icons-vue';

import { useChat } from '@/composables/useChat';

const {
  draft,
  examplePrompts,
  isSending,
  applyExample,
} = useChat();

const router = useRouter();
const composerRef = ref<HTMLElement | null>(null);

const createSessionId = () => {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const pendingPromptKey = (sessionId: string) => `pending-prompt:${sessionId}`;

const features = [
  {
    index: '01',
    title: '用大白话写出代码',
    desc: '把想法讲清楚，AI 会拆解页面、状态和数据流，生成可落地的前端代码。',
    icon: ChatDotRound,
  },
  {
    index: '02',
    title: '在本地即时预览',
    desc: '每一次修改都可以在 Vite 开发环境中快速预览，边聊边打磨产品体验。',
    icon: Monitor,
  },
  {
    index: '03',
    title: '保留工具执行细节',
    desc: '代码写入、命令执行、权限确认都会清晰展示，关键操作由你确认。',
    icon: Lightning,
  },
];

const submitOnEnter = (event: KeyboardEvent) => {
  if (event.shiftKey) {
    return;
  }

  event.preventDefault();
  void handleSend();
};

const handleSend = async () => {
  const content = draft.value.trim();

  if (!content || isSending.value) {
    return;
  }

  const sessionId = createSessionId();
  window.sessionStorage.setItem(pendingPromptKey(sessionId), content);
  draft.value = '';

  await router.push({
    path: '/chat/code',
    query: {
      session_id: sessionId,
    },
  });
};

const fillPrompt = async (prompt: string) => {
  applyExample(prompt);
  await nextTick();

  composerRef.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
};

const startConversation = async (prompt: string) => {
  applyExample(prompt);
  await nextTick();
  await handleSend();
};
</script>

<template>
  <main class="chat-page">
    <header class="topbar">
      <a class="brand" href="#hero" aria-label="返回顶部">
        <span class="brand-mark">*</span>
        <span>AI产品工作站</span>
      </a>

      <nav class="nav-links">
        <a href="#features">能做什么</a>
        <a href="#workflow">怎么用</a>
      </nav>

      <RouterLink class="settings-link" to="/settings">
        <el-icon><Setting /></el-icon>
        设置
      </RouterLink>
    </header>

    <section id="hero" class="hero-shell">
      <aside class="chat-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">你的 AI 产品工作室</p>
            <h1>想做个产品，<br />说出来就行。</h1>
          </div>
        </div>

        <p class="hero-desc">
          参考 AI 路小飞的产品表达方式，把自然语言需求转成可运行页面、组件和交互逻辑。
        </p>

        <div ref="composerRef" class="composer">
          <el-input
            v-model="draft"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 6 }"
            resize="none"
            placeholder="给女朋友做个倒计时页，纪念我们在一起的日子..."
            @keydown.enter="submitOnEnter"
          />

          <div class="composer-footer">
            <span>Enter 发送 · Shift+Enter 换行</span>
            <el-button type="primary" circle :loading="isSending" aria-label="发送" @click="handleSend">
              <el-icon><ArrowUp /></el-icon>
            </el-button>
          </div>
        </div>

        <div class="hero-badges">
          <span>不用写一行代码</span>
          <span>几分钟看到成品</span>
          <span>一键发布上线</span>
        </div>
      </aside>

    </section>

    <section id="features" class="section-block">
      <p class="eyebrow">What it does · 能做什么</p>
      <h2>从一句话，到一个能用的产品</h2>

      <div class="feature-list">
        <article v-for="feature in features" :key="feature.index" class="feature-row">
          <span class="feature-index">{{ feature.index }}</span>
          <div class="feature-copy">
            <h3>
              <el-icon><component :is="feature.icon" /></el-icon>
              {{ feature.title }}
            </h3>
            <p>{{ feature.desc }}</p>
          </div>
        </article>
      </div>
    </section>

    <section id="workflow" class="workflow-section">
      <p class="eyebrow">How it works · 怎么用</p>
      <h2>三步，全程你都看得见</h2>

      <div class="workflow-timeline">
        <article class="timeline-item">
          <strong>1</strong>
          <div>
            <h3>说出你想要什么</h3>
            <p>敲一句话，一个工具、一个页面、一段自动化。大白话就是唯一的语法。</p>
          </div>
        </article>
        <article class="timeline-item">
          <strong>2</strong>
          <div>
            <h3>它来构建并运行</h3>
            <p>规划任务、编写代码，并在云沙箱里实时跑起来，全程你都看得见。</p>
          </div>
        </article>
        <article class="timeline-item">
          <strong>3</strong>
          <div>
            <h3>预览，然后上线</h3>
            <p>在预览里看它工作，靠对话不断打磨，满意了就发布到公网链接。</p>
          </div>
        </article>
      </div>
    </section>

    <section class="workspace-section">
      <p class="eyebrow">The workspace · 工作台</p>
      <h2>左边聊天，右边就是你的应用</h2>
      <p class="workspace-desc">用大白话跟它说，右边实时看着你的软件自己长出来。</p>

      <div class="workspace-showcase">
        <header class="showcase-topbar">
          <a class="showcase-brand" href="#hero" aria-label="返回顶部">
            <span class="brand-mark">*</span>
            <span>AI产品工作站</span>
          </a>

          <nav>
            <a href="#features">能做什么</a>
            <a href="#workflow">怎么用</a>
            <a href="#cases">案例</a>
          </nav>

          <span class="showcase-user">用</span>
        </header>

        <div class="showcase-body">
          <aside class="showcase-chat">
            <div class="assistant-status">
              <span class="status-icon">*</span>
              <div>
                <strong>AI产品工作站</strong>
                <p>正在构建你的应用...</p>
              </div>
            </div>

            <div class="chat-preview-row user">帮我做一个待办应用，能标优先级和截止日期</div>
            <div class="chat-preview-row assistant">好嘞，正在搭一个 Vue 应用，带优先级标签和清爽列表。</div>

            <div class="showcase-composer">
              <span>再加个截止提醒...</span>
              <button type="button" aria-label="发送演示消息">↑</button>
            </div>
          </aside>

          <section class="showcase-app">
            <div class="app-address">
              <span>todo.luffy.app</span>
              <strong>在线</strong>
            </div>

            <div class="todo-card">
              <div class="todo-card-head">
                <h3>今天</h3>
                <span>0</span>
              </div>
              <div class="todo-input">
                <span>添加任务...</span>
                <button type="button" aria-label="添加任务">+</button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <p class="workspace-note">左边大白话聊天，右边你的应用实时在跑，一个不断的循环。</p>
    </section>

    <section id="cases" class="section-block prompt-section">
      <p class="eyebrow">Try one · 大家都在做什么</p>
      <h2>点一张，就替你填好了</h2>

      <div class="prompt-grid">
        <button
          v-for="example in examplePrompts"
          :key="example.title"
          type="button"
          class="prompt-card"
          :aria-label="`填入示例：${example.prompt}`"
          @click="fillPrompt(example.prompt)"
        >
          <span>{{ example.prompt }}</span>
        </button>
      </div>
    </section>

    <section class="final-cta">
      <span class="cta-mark">&amp;</span>
      <h2>你的下一个产品，<br />只差一句话</h2>
      <p>现在就告诉它你想做什么。</p>
      <el-button size="large" type="primary" round @click="startConversation('帮我做一个能上线的产品首页')">
        开启对话
        <el-icon><Promotion /></el-icon>
      </el-button>
    </section>

  </main>
</template>

<style scoped>
.chat-page {
  min-width: 1180px;
  min-height: 100vh;
  color: #171717;
  background:
    radial-gradient(circle at 20% 0%, rgba(255, 122, 89, 0.16), transparent 32%),
    linear-gradient(180deg, #fff8f1 0%, #fff 44%, #f8f8f8 100%);
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1280px, calc(100% - 72px));
  height: 72px;
  margin: 0 auto;
  backdrop-filter: blur(18px);
}

.brand,
.nav-links,
.settings-link {
  display: flex;
  align-items: center;
}

.brand {
  gap: 10px;
  color: #171717;
  font-size: 18px;
  font-weight: 800;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 34px;
  height: 34px;
  color: #fff;
  background: #171717;
  border-radius: 12px;
  place-items: center;
}

.nav-links {
  gap: 32px;
}

.nav-links a,
.settings-link {
  color: #5f5f5f;
  font-weight: 600;
  text-decoration: none;
}

.settings-link {
  gap: 6px;
}

.hero-shell {
  width: min(1280px, calc(100% - 72px));
  margin: 42px auto 0;
}

.chat-panel,
.section-block,
.final-cta {
  border: 1px solid rgba(23, 23, 23, 0.08);
  box-shadow: 0 24px 80px rgba(75, 46, 26, 0.08);
}

.chat-panel {
  display: flex;
  flex-direction: column;
  max-width: 740px;
  min-height: 0;
  padding: 0;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.panel-heading {
  display: flex;
  gap: 18px;
}

.eyebrow {
  margin: 0 0 12px;
  color: #eb6a3a;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 18px;
  font-size: 56px;
  line-height: 0.98;
  letter-spacing: -0.06em;
}

h2 {
  margin-bottom: 26px;
  font-size: 38px;
  letter-spacing: -0.04em;
}

.hero-desc {
  max-width: 520px;
  margin-bottom: 36px;
  color: #646464;
  font-size: 16px;
  line-height: 1.8;
}

.composer {
  position: relative;
  min-height: 176px;
  margin-top: 0;
  padding: 22px 72px 22px 22px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid #e0d6cb;
  border-radius: 24px;
  box-shadow: 0 22px 55px rgba(75, 46, 26, 0.13);
}

.composer :deep(.el-textarea__inner) {
  min-height: 104px !important;
  padding: 0;
  color: #221c18;
  font-size: 18px;
  line-height: 1.7;
  background: transparent;
  box-shadow: none;
}

.composer :deep(.el-textarea__inner::placeholder) {
  color: #2d2620;
}

.composer-footer,
.hero-badges {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.composer-footer {
  margin-top: 18px;
  color: #888;
  font-size: 13px;
}

.composer-footer :deep(.el-button) {
  position: absolute;
  right: 22px;
  bottom: 22px;
  width: 52px;
  height: 52px;
  background: #d7472c;
  border-color: #d7472c;
  box-shadow: 0 16px 30px rgba(215, 71, 44, 0.28);
}

.composer-footer :deep(.el-button:hover) {
  background: #c93c24;
  border-color: #c93c24;
  transform: translateY(-2px);
}

.hero-badges {
  gap: 10px;
  justify-content: flex-start;
  margin-top: 18px;
}

.hero-badges span {
  padding: 8px 12px;
  color: #674329;
  font-size: 13px;
  font-weight: 700;
  background: #fff3e9;
  border-radius: 999px;
}

.section-block,
.final-cta {
  width: min(1280px, calc(100% - 72px));
  margin: 28px auto 0;
  padding: 42px;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 32px;
}

.prompt-grid,
.workflow-timeline {
  display: grid;
  gap: 18px;
}

.feature-list {
  overflow: hidden;
  margin-top: 44px;
  background: rgba(255, 253, 249, 0.88);
  border: 1px solid #e4dbd0;
  border-radius: 22px;
}

.feature-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 28px;
  align-items: center;
  min-height: 132px;
  padding: 28px 44px;
}

.feature-row + .feature-row {
  border-top: 1px solid #e7ded3;
}

.feature-index {
  color: rgba(215, 71, 44, 0.26);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 56px;
  font-style: italic;
  font-weight: 900;
  line-height: 1;
}

.feature-copy h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 22px;
}

.feature-copy h3 .el-icon {
  color: #d7472c;
  font-size: 15px;
}

.feature-copy p {
  max-width: 720px;
  margin: 0;
  color: #666059;
  line-height: 1.8;
}

.workflow-section {
  width: min(1280px, calc(100% - 72px));
  margin: 150px auto 0;
}

.workflow-section h2 {
  max-width: 760px;
  margin-bottom: 60px;
  font-size: 46px;
}

.workflow-timeline {
  position: relative;
  gap: 54px;
  max-width: 900px;
}

.workflow-timeline::before {
  position: absolute;
  top: 34px;
  bottom: 34px;
  left: 23px;
  width: 1px;
  background: repeating-linear-gradient(
    to bottom,
    rgba(215, 71, 44, 0.24) 0,
    rgba(215, 71, 44, 0.24) 6px,
    transparent 6px,
    transparent 14px
  );
  content: "";
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 34px;
  align-items: start;
}

.timeline-item strong {
  z-index: 1;
  display: grid;
  width: 48px;
  height: 48px;
  color: #d7472c;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 22px;
  font-style: italic;
  background: #fffdf9;
  border: 1px solid #eadfd3;
  border-radius: 50%;
  box-shadow: 0 10px 24px rgba(75, 46, 26, 0.08);
  place-items: center;
}

.timeline-item h3 {
  margin-bottom: 10px;
  font-size: 22px;
}

.timeline-item p {
  margin: 0;
  color: #5f5a54;
  line-height: 1.8;
}

.workspace-section {
  width: min(1280px, calc(100% - 72px));
  margin: 28px auto 0;
  padding-top: 18px;
}

.workspace-section h2 {
  max-width: 760px;
  margin-bottom: 16px;
  font-size: 54px;
  line-height: 1.05;
}

.workspace-desc {
  margin-bottom: 64px;
  color: #5f5a54;
  font-size: 18px;
}

.workspace-showcase {
  overflow: hidden;
  background: rgba(255, 250, 242, 0.88);
  border: 1px solid #e4dbd0;
  border-radius: 28px;
  box-shadow: 0 30px 80px rgba(75, 46, 26, 0.14);
}

.showcase-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  padding: 0 32px;
  border-bottom: 1px solid #e6ddd1;
}

.showcase-brand,
.showcase-topbar nav {
  display: flex;
  align-items: center;
}

.showcase-brand {
  gap: 10px;
  color: #171717;
  font-weight: 900;
  text-decoration: none;
}

.showcase-topbar nav {
  gap: 32px;
}

.showcase-topbar nav a {
  color: #4d4944;
  font-weight: 700;
  text-decoration: none;
}

.showcase-user {
  display: grid;
  width: 36px;
  height: 36px;
  color: #fff;
  font-weight: 900;
  background: #d7472c;
  border-radius: 50%;
  box-shadow: 0 10px 20px rgba(215, 71, 44, 0.22);
  place-items: center;
}

.showcase-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 450px;
}

.showcase-chat,
.showcase-app {
  position: relative;
  min-height: 450px;
}

.showcase-chat {
  padding: 28px 28px 84px;
  background: rgba(239, 229, 214, 0.42);
  border-right: 1px solid #e2d8cb;
}

.assistant-status {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(75, 46, 26, 0.08);
}

.assistant-status strong {
  display: block;
  margin-bottom: 4px;
}

.assistant-status p {
  margin: 0;
  color: #b3816a;
  font-size: 13px;
}

.status-icon {
  display: grid;
  width: 34px;
  height: 34px;
  color: #d7472c;
  background: #fff4ec;
  border-radius: 12px;
  place-items: center;
}

.chat-preview-row {
  max-width: 310px;
  margin-top: 30px;
  padding: 14px 18px;
  color: #3d3731;
  line-height: 1.7;
  border-radius: 18px;
}

.chat-preview-row.user {
  margin-left: auto;
  background: #f8f2e8;
  box-shadow: 0 12px 24px rgba(75, 46, 26, 0.06);
}

.chat-preview-row.assistant {
  background: transparent;
}

.showcase-composer {
  position: absolute;
  right: 24px;
  bottom: 24px;
  left: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px 10px 18px;
  color: #8a8177;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid #e6ddd1;
  border-radius: 999px;
}

.showcase-composer button,
.todo-input button {
  display: grid;
  width: 34px;
  height: 34px;
  color: #fff;
  font-size: 18px;
  font-weight: 900;
  background: #d7472c;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  place-items: center;
}

.showcase-app {
  padding: 30px;
  background:
    radial-gradient(circle at 70% 20%, rgba(215, 71, 44, 0.07), transparent 28%),
    #f7f0e6;
}

.app-address {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 36px;
  color: #9a9188;
  font-size: 13px;
}

.app-address span {
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid #e8ded2;
  border-radius: 999px;
}

.app-address strong {
  position: relative;
  color: #26a269;
}

.app-address strong::before {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 6px;
  background: currentColor;
  border-radius: 50%;
  content: "";
  vertical-align: middle;
}

.todo-card {
  min-height: 280px;
  padding: 26px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid #eee3d8;
  border-radius: 22px;
  box-shadow: 0 20px 50px rgba(75, 46, 26, 0.1);
}

.todo-card-head,
.todo-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.todo-card h3 {
  margin: 0;
  font-size: 28px;
}

.todo-card-head span {
  display: grid;
  width: 30px;
  height: 30px;
  color: #fff;
  font-weight: 900;
  background: #24201c;
  border-radius: 50%;
  place-items: center;
}

.todo-input {
  margin-top: 22px;
  padding: 12px 12px 12px 18px;
  color: #b2a8a0;
  background: #f2eadf;
  border: 1px solid #e5dacf;
  border-radius: 14px;
}

.workspace-note {
  margin: 22px 0 0;
  color: #a09a92;
  font-size: 14px;
  text-align: center;
}

.prompt-section {
  overflow: hidden;
  background:
    radial-gradient(circle at 15% 20%, rgba(235, 106, 58, 0.08), transparent 26%),
    rgba(255, 250, 244, 0.9);
}

.prompt-section h2 {
  font-size: 46px;
}

.prompt-grid {
  grid-template-columns: repeat(3, 1fr);
  gap: 18px 16px;
  padding-top: 6px;
}

.prompt-card {
  position: relative;
  min-height: 78px;
  padding: 18px 24px 18px 34px;
  color: #3b332c;
  text-align: left;
  background: linear-gradient(180deg, #fffdf9 0%, #fffaf3 100%);
  border: 1px solid #e8ded2;
  border-radius: 14px;
  box-shadow: 0 12px 26px rgba(75, 46, 26, 0.08);
  cursor: pointer;
  transform: rotate(var(--note-rotate, 0deg));
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.prompt-card::before {
  position: absolute;
  top: 15px;
  left: 17px;
  color: #d89478;
  font-size: 18px;
  font-weight: 900;
  content: "“";
}

.prompt-card:hover,
.prompt-card:focus-visible {
  color: #171717;
  background: #fff;
  border-color: #eb6a3a;
  outline: none;
  box-shadow: 0 18px 38px rgba(235, 106, 58, 0.2);
  transform: translateY(-6px) rotate(0deg) scale(1.02);
}

.prompt-card:hover::before,
.prompt-card:focus-visible::before {
  color: #eb6a3a;
}

.prompt-card span {
  display: block;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.55;
}

.prompt-card:nth-child(1) {
  --note-rotate: -1.6deg;
}

.prompt-card:nth-child(2) {
  --note-rotate: 0.8deg;
}

.prompt-card:nth-child(3) {
  --note-rotate: -0.8deg;
}

.prompt-card:nth-child(4) {
  --note-rotate: 1.4deg;
}

.prompt-card:nth-child(5) {
  --note-rotate: -0.5deg;
}

.prompt-card:nth-child(6) {
  --note-rotate: 1deg;
}

.prompt-card:nth-child(7) {
  --note-rotate: -1.1deg;
}

.prompt-card:nth-child(8) {
  --note-rotate: 0.6deg;
}

.prompt-card:nth-child(9) {
  --note-rotate: -0.7deg;
}

.prompt-card:nth-child(10) {
  --note-rotate: 1.2deg;
}

.prompt-card:nth-child(11) {
  --note-rotate: -0.9deg;
}

.prompt-card:nth-child(12) {
  --note-rotate: 0.7deg;
}

.final-cta {
  display: grid;
  justify-items: center;
  margin-bottom: 42px;
  padding: 86px 42px 72px;
  text-align: center;
  background:
    radial-gradient(circle at 50% 32%, rgba(235, 106, 58, 0.08), transparent 30%),
    rgba(255, 253, 249, 0.9);
  border-color: #e7ddd2;
  box-shadow: 0 24px 70px rgba(75, 46, 26, 0.08);
}

.final-cta h2 {
  max-width: 640px;
  margin: 8px 0 18px;
  color: #221c18;
  font-size: 54px;
  line-height: 1.05;
  letter-spacing: -0.07em;
}

.final-cta p {
  margin-bottom: 28px;
  color: #6d6258;
  font-size: 16px;
}

.cta-mark {
  color: #d9a28f;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 34px;
  font-style: italic;
  line-height: 1;
}

.final-cta :deep(.el-button) {
  height: 54px;
  padding: 0 30px;
  font-size: 16px;
  font-weight: 800;
  background: #d7472c;
  border-color: #d7472c;
  box-shadow: 0 18px 32px rgba(215, 71, 44, 0.28);
}

.final-cta :deep(.el-button:hover) {
  background: #c93c24;
  border-color: #c93c24;
  transform: translateY(-2px);
}

</style>
