<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChatDotRound, Lightning, Monitor, Promotion, Setting } from '@element-plus/icons-vue';

import ChatMessage from '@/components/ChatMessage.vue';
import PermissionDialog from '@/components/PermissionDialog.vue';
import { useChat } from '@/composables/useChat';

const {
  draft,
  examplePrompts,
  isSending,
  messages,
  pendingToolCall,
  applyExample,
  approveToolCall,
  rejectToolCall,
  sendMessage,
} = useChat();

const route = useRoute();
const router = useRouter();

const permissionVisible = computed({
  get: () => Boolean(pendingToolCall.value),
  set: (visible: boolean) => {
    if (!visible) {
      rejectToolCall();
    }
  },
});

const isHomeRoute = computed(() => route.path === '/');

const createSessionId = () => {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const pendingPromptKey = (sessionId: string) => `pending-prompt:${sessionId}`;

const consumePendingPrompt = () => {
  const sessionId = String(route.query.session_id ?? '');

  if (!sessionId || route.path !== '/chat/code') {
    return;
  }

  const pendingPrompt = window.sessionStorage.getItem(pendingPromptKey(sessionId));

  if (!pendingPrompt) {
    return;
  }

  window.sessionStorage.removeItem(pendingPromptKey(sessionId));
  void sendMessage(pendingPrompt);
};

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

  if (!isHomeRoute.value) {
    await sendMessage();
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

onMounted(consumePendingPrompt);

watch(() => route.fullPath, consumePendingPrompt);
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
          <el-tag effect="dark" round>在线</el-tag>
        </div>

        <p class="hero-desc">
          参考 AI 路小飞的产品表达方式，把自然语言需求转成可运行页面、组件和交互逻辑。
        </p>

        <div class="messages">
          <ChatMessage v-for="message in messages" :key="message.id" :message="message" />
        </div>

        <div class="composer">
          <el-input
            v-model="draft"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 5 }"
            resize="none"
            placeholder="帮我做一个 todo 应用..."
            @keydown.enter="submitOnEnter"
          />

          <div class="composer-footer">
            <span>Enter 发送 · Shift+Enter 换行</span>
            <el-button type="primary" :loading="isSending" @click="handleSend">
              发送
            </el-button>
          </div>
        </div>

        <div class="hero-badges">
          <span>不用写一行代码</span>
          <span>几分钟看到成品</span>
          <span>一键发布上线</span>
        </div>
      </aside>

      <section class="preview-panel">
        <div class="browser-bar">
          <span />
          <span />
          <span />
          <strong>luffy.academy/build</strong>
        </div>

        <div class="workspace-demo">
          <div class="demo-chat">
            <p class="demo-title">AI产品工作站</p>
            <div class="demo-line user">帮我做一个待办应用，能标优先级和截止日期</div>
            <div class="demo-line ai">好嘞，正在搭一个 Vue 应用，带优先级标签和清爽列表。</div>
            <div class="demo-tool">
              <span>write_file · ChatView.vue</span>
              <strong>+ 128 行</strong>
            </div>
          </div>

          <div class="demo-app">
            <div class="app-status">
              <span>todo.luffy.app</span>
              <el-tag size="small" type="success">在线</el-tag>
            </div>
            <h3>今天 3</h3>
            <div class="task-input">添加任务...</div>
            <div class="task-row">
              <span>上线落地页</span>
              <el-tag size="small">低</el-tag>
            </div>
            <div class="task-row">
              <span>看一下 PR</span>
              <el-tag size="small" type="warning">中</el-tag>
            </div>
            <div class="task-row">
              <span>准备投资人演示</span>
              <el-tag size="small" type="danger">高</el-tag>
            </div>
          </div>
        </div>
      </section>
    </section>

    <section id="features" class="section-block">
      <p class="eyebrow">What it does · 能做什么</p>
      <h2>从一句话，到一个能用的产品</h2>

      <div class="feature-grid">
        <article v-for="feature in features" :key="feature.index" class="feature-card">
          <div class="feature-icon">
            <el-icon><component :is="feature.icon" /></el-icon>
          </div>
          <span>{{ feature.index }}</span>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.desc }}</p>
        </article>
      </div>
    </section>

    <section id="workflow" class="section-block workflow">
      <div>
        <p class="eyebrow">How it works · 怎么用</p>
        <h2>三步，全程你都看得见</h2>
      </div>

      <div class="workflow-steps">
        <article>
          <strong>1</strong>
          <h3>说出你想要什么</h3>
          <p>敲一句话，一个页面、工具或自动化都可以。</p>
        </article>
        <article>
          <strong>2</strong>
          <h3>AI 构建并展示过程</h3>
          <p>规划任务、生成代码、展示工具调用细节。</p>
        </article>
        <article>
          <strong>3</strong>
          <h3>确认权限并预览</h3>
          <p>高风险操作先确认，再持续迭代到满意。</p>
        </article>
      </div>
    </section>

    <section class="section-block prompt-section">
      <p class="eyebrow">Try one · 大家都在做什么</p>
      <h2>点一张，就替你填好了</h2>

      <div class="prompt-grid">
        <button
          v-for="example in examplePrompts"
          :key="example.title"
          type="button"
          class="prompt-card"
          @click="applyExample(example.prompt)"
        >
          <strong>{{ example.title }}</strong>
          <span>“{{ example.prompt }}”</span>
        </button>
      </div>
    </section>

    <section class="final-cta">
      <h2>你的下一个产品，<br />只差一句话</h2>
      <el-button size="large" type="primary" @click="draft = '帮我做一个能上线的产品首页'">
        免费创建
        <el-icon><Promotion /></el-icon>
      </el-button>
    </section>

    <PermissionDialog
      v-model="permissionVisible"
      :tool-call="pendingToolCall"
      @approve="approveToolCall"
      @reject="rejectToolCall"
    />
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
  display: grid;
  grid-template-columns: 0.92fr 1.08fr;
  gap: 28px;
  width: min(1280px, calc(100% - 72px));
  margin: 42px auto 0;
}

.chat-panel,
.preview-panel,
.section-block,
.final-cta {
  border: 1px solid rgba(23, 23, 23, 0.08);
  box-shadow: 0 24px 80px rgba(75, 46, 26, 0.08);
}

.chat-panel {
  display: flex;
  flex-direction: column;
  min-height: 690px;
  padding: 28px;
  background: rgba(255, 255, 255, 0.86);
  border-radius: 32px;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
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
  margin-bottom: 24px;
  color: #646464;
  font-size: 16px;
  line-height: 1.8;
}

.messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 260px;
  max-height: 360px;
  padding-right: 6px;
  overflow-y: auto;
}

.composer {
  margin-top: 20px;
  padding: 14px;
  background: #f7f1ea;
  border: 1px solid rgba(23, 23, 23, 0.06);
  border-radius: 22px;
}

.composer-footer,
.hero-badges {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.composer-footer {
  margin-top: 12px;
  color: #888;
  font-size: 13px;
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

.preview-panel {
  padding: 20px;
  background: #171717;
  border-radius: 32px;
}

.browser-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  color: #a7a7a7;
}

.browser-bar span {
  width: 10px;
  height: 10px;
  background: #f05d4f;
  border-radius: 999px;
}

.browser-bar span:nth-child(2) {
  background: #f6c85f;
}

.browser-bar span:nth-child(3) {
  background: #65c96b;
}

.browser-bar strong {
  margin-left: 12px;
  font-size: 13px;
}

.workspace-demo {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 18px;
  min-height: 600px;
}

.demo-chat,
.demo-app {
  padding: 22px;
  background: #232323;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
}

.demo-title,
.app-status {
  color: #fff;
  font-weight: 800;
}

.demo-line {
  margin-top: 16px;
  padding: 14px;
  color: #e8e8e8;
  line-height: 1.6;
  border-radius: 16px;
}

.demo-line.user {
  background: #333;
}

.demo-line.ai {
  background: #2e261f;
}

.demo-tool {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
  padding: 14px;
  color: #ffd1bc;
  background: #151515;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.demo-app {
  color: #171717;
  background: linear-gradient(180deg, #fff 0%, #fff8f0 100%);
}

.app-status,
.task-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-status {
  color: #171717;
}

.demo-app h3 {
  margin: 46px 0 18px;
  font-size: 36px;
}

.task-input,
.task-row {
  margin-top: 12px;
  padding: 16px;
  background: #fff;
  border: 1px solid #eee1d7;
  border-radius: 16px;
}

.task-input {
  color: #a0a0a0;
}

.section-block,
.final-cta {
  width: min(1280px, calc(100% - 72px));
  margin: 28px auto 0;
  padding: 42px;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 32px;
}

.feature-grid,
.prompt-grid,
.workflow-steps {
  display: grid;
  gap: 18px;
}

.feature-grid,
.workflow-steps {
  grid-template-columns: repeat(3, 1fr);
}

.feature-card,
.workflow-steps article,
.prompt-card {
  padding: 24px;
  background: #fff;
  border: 1px solid #eee7df;
  border-radius: 24px;
}

.feature-icon {
  display: grid;
  width: 44px;
  height: 44px;
  margin-bottom: 18px;
  color: #fff;
  background: #171717;
  border-radius: 16px;
  place-items: center;
}

.feature-card span {
  color: #eb6a3a;
  font-weight: 900;
}

.feature-card p,
.workflow-steps p {
  color: #666;
  line-height: 1.7;
}

.workflow {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 32px;
}

.workflow-steps article strong {
  display: grid;
  width: 34px;
  height: 34px;
  color: #fff;
  background: #eb6a3a;
  border-radius: 50%;
  place-items: center;
}

.prompt-grid {
  grid-template-columns: repeat(4, 1fr);
}

.prompt-card {
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.prompt-card:hover {
  border-color: #eb6a3a;
  transform: translateY(-2px);
}

.prompt-card strong,
.prompt-card span {
  display: block;
}

.prompt-card span {
  margin-top: 10px;
  color: #666;
  line-height: 1.6;
}

.final-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  background: #171717;
}

.final-cta h2 {
  margin: 0;
  color: #fff;
}

</style>
