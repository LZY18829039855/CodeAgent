<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowUp, Cpu, House, MoreFilled } from '@element-plus/icons-vue';

import ChatMessage from '@/components/ChatMessage.vue';
import PermissionDialog from '@/components/PermissionDialog.vue';
import { useChat } from '@/composables/useChat';

const route = useRoute();

const {
  draft,
  isSending,
  messages,
  pendingToolCall,
  approveToolCall,
  rejectToolCall,
  sendMessage,
} = useChat();

const sessionId = computed(() => String(route.query.session_id ?? ''));
const sessionLabel = computed(() => sessionId.value.slice(0, 8) || 'local');

const pendingPromptKey = (id: string) => `pending-prompt:${id}`;

const permissionVisible = computed({
  get: () => Boolean(pendingToolCall.value),
  set: (visible: boolean) => {
    if (!visible) {
      rejectToolCall();
    }
  },
});

const submitOnEnter = (event: KeyboardEvent) => {
  if (event.shiftKey) {
    return;
  }

  event.preventDefault();
  void sendMessage();
};

onMounted(() => {
  if (!sessionId.value) {
    return;
  }

  const pendingPrompt = window.sessionStorage.getItem(pendingPromptKey(sessionId.value));

  if (!pendingPrompt) {
    return;
  }

  window.sessionStorage.removeItem(pendingPromptKey(sessionId.value));
  void sendMessage(pendingPrompt);
});
</script>

<template>
  <main class="conversation-page">
    <header class="conversation-topbar">
      <RouterLink class="conversation-brand" to="/">
        <span class="brand-mark">*</span>
        <span>AI产品工作站</span>
      </RouterLink>

      <nav>
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/settings">设置</RouterLink>
      </nav>

      <div class="session-pill">
        <el-icon><Cpu /></el-icon>
        会话 {{ sessionLabel }}
      </div>
    </header>

    <section class="conversation-shell">
      <aside class="conversation-chat">
        <div class="chat-head">
          <div>
            <p class="eyebrow">AI workspace · 对话工作台</p>
            <h1>左边对话，右边预览你的应用</h1>
          </div>
          <el-button circle>
            <el-icon><MoreFilled /></el-icon>
          </el-button>
        </div>

        <div class="conversation-messages">
          <ChatMessage v-for="message in messages" :key="message.id" :message="message" />
        </div>

        <div class="conversation-composer">
          <el-input
            v-model="draft"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            resize="none"
            placeholder="继续描述你想改什么..."
            @keydown.enter="submitOnEnter"
          />
          <el-button type="primary" circle :loading="isSending" @click="sendMessage">
            <el-icon><ArrowUp /></el-icon>
          </el-button>
        </div>
      </aside>

      <section class="app-preview">
        <div class="preview-address">
          <span>
            <el-icon><House /></el-icon>
            todo.luffy.app
          </span>
          <strong>在线</strong>
        </div>

        <div class="preview-card">
          <div class="preview-card-head">
            <h2>今天</h2>
            <span>3</span>
          </div>

          <div class="preview-input">
            <span>添加任务...</span>
            <button type="button">+</button>
          </div>

          <ul class="task-list">
            <li>
              <span>上线落地页</span>
              <em>低</em>
            </li>
            <li>
              <span>看一下 PR</span>
              <em>中</em>
            </li>
            <li>
              <span>准备投资人演示</span>
              <em>高</em>
            </li>
          </ul>
        </div>
      </section>
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
.conversation-page {
  min-width: 1180px;
  min-height: 100vh;
  padding: 28px;
  color: #171717;
  background:
    radial-gradient(circle at 12% 0%, rgba(215, 71, 44, 0.12), transparent 30%),
    linear-gradient(180deg, #fff8f1 0%, #f5eee5 100%);
}

.conversation-topbar,
.conversation-shell {
  width: min(1380px, 100%);
  margin: 0 auto;
}

.conversation-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.conversation-brand,
.conversation-topbar nav,
.session-pill {
  display: flex;
  align-items: center;
}

.conversation-brand {
  gap: 10px;
  color: #171717;
  font-weight: 900;
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

.conversation-topbar nav {
  gap: 26px;
}

.conversation-topbar nav a {
  color: #5f5a54;
  font-weight: 700;
  text-decoration: none;
}

.session-pill {
  gap: 8px;
  padding: 9px 14px;
  color: #6d6258;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid #e7ddd2;
  border-radius: 999px;
}

.conversation-shell {
  display: grid;
  grid-template-columns: 0.96fr 1.04fr;
  min-height: calc(100vh - 120px);
  margin-top: 24px;
  overflow: hidden;
  background: rgba(255, 250, 242, 0.9);
  border: 1px solid #e1d6ca;
  border-radius: 30px;
  box-shadow: 0 28px 80px rgba(75, 46, 26, 0.14);
}

.conversation-chat {
  display: flex;
  flex-direction: column;
  min-height: 720px;
  padding: 30px 30px 24px;
  background: rgba(239, 229, 214, 0.42);
  border-right: 1px solid #e1d6ca;
}

.chat-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding-bottom: 22px;
  border-bottom: 1px solid rgba(75, 46, 26, 0.08);
}

.eyebrow {
  margin: 0 0 10px;
  color: #d7472c;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.chat-head h1 {
  max-width: 520px;
  margin: 0;
  font-size: 34px;
  line-height: 1.08;
  letter-spacing: -0.05em;
}

.conversation-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px 6px 24px 0;
  overflow-y: auto;
}

.conversation-composer {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid #e6ddd1;
  border-radius: 22px;
}

.conversation-composer :deep(.el-textarea__inner) {
  box-shadow: none;
}

.app-preview {
  padding: 34px;
  background:
    radial-gradient(circle at 74% 18%, rgba(215, 71, 44, 0.08), transparent 28%),
    #f7f0e6;
}

.preview-address {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 34px;
  color: #92877e;
}

.preview-address span {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid #e7ddd2;
  border-radius: 999px;
}

.preview-address strong {
  color: #22a06b;
}

.preview-card {
  min-height: 460px;
  padding: 28px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid #eee3d8;
  border-radius: 24px;
  box-shadow: 0 24px 58px rgba(75, 46, 26, 0.1);
}

.preview-card-head,
.preview-input,
.task-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.preview-card h2 {
  margin: 0;
  font-size: 32px;
}

.preview-card-head span {
  display: grid;
  width: 32px;
  height: 32px;
  color: #fff;
  font-weight: 900;
  background: #24201c;
  border-radius: 50%;
  place-items: center;
}

.preview-input {
  margin-top: 24px;
  padding: 13px 13px 13px 18px;
  color: #afa49a;
  background: #f2eadf;
  border: 1px solid #e5dacf;
  border-radius: 15px;
}

.preview-input button {
  width: 34px;
  height: 34px;
  color: #fff;
  font-size: 20px;
  font-weight: 900;
  background: #d7472c;
  border: 0;
  border-radius: 50%;
}

.task-list {
  display: grid;
  gap: 12px;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}

.task-list li {
  padding: 14px 16px;
  background: #fffaf5;
  border: 1px solid #eee1d7;
  border-radius: 14px;
}

.task-list em {
  padding: 4px 10px;
  color: #d7472c;
  font-style: normal;
  font-weight: 900;
  background: #fff0e8;
  border-radius: 999px;
}
</style>
