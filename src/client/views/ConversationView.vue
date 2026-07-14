<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowUp, MoreFilled, Plus } from '@element-plus/icons-vue';

import HtmlCodeBlock from '@/components/HtmlCodeBlock.vue';
import PermissionDialog from '@/components/PermissionDialog.vue';
import ToolCallDetail from '@/components/ToolCallDetail.vue';
import { useChat } from '@/composables/useChat';

const route = useRoute();
const messageListRef = ref<HTMLElement | null>(null);
const thinkingSeconds = ref(0);
const previewHtml = ref('');
let thinkingTimer: number | undefined;

const {
  draft,
  isSending,
  messages,
  pendingToolCall,
  approveToolCall,
  rejectToolCall,
  sendMessage,
  stopGeneration,
} = useChat();

const sessionId = computed(() => String(route.query.session_id ?? ''));
const canSend = computed(() => Boolean(draft.value.trim()) && !isSending.value);

const pendingPromptKey = (id: string) => `pending-prompt:${id}`;

const sessionItems = Array.from({ length: 6 }, (_, index) => ({
  id: index,
  title: '未命名会话',
}));

interface MessageSegment {
  type: 'text' | 'html';
  content: string;
}

const parseMessageContent = (content: string): MessageSegment[] => {
  const segments: MessageSegment[] = [];
  const htmlBlockPattern = /```html\s*([\s\S]*?)```/gi;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = htmlBlockPattern.exec(content)) !== null) {
    const text = content.slice(cursor, match.index).trim();

    if (text) {
      segments.push({ type: 'text', content: text });
    }

    segments.push({
      type: 'html',
      content: match[1].trim(),
    });
    cursor = match.index + match[0].length;
  }

  const remainingText = content.slice(cursor).trim();

  if (remainingText) {
    segments.push({ type: 'text', content: remainingText });
  }

  return segments.length ? segments : [{ type: 'text', content }];
};

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

  if (canSend.value) {
    void sendMessage();
  }
};

const scrollToLatestMessage = async () => {
  await nextTick();

  if (!messageListRef.value) {
    return;
  }

  messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
};

watch(
  messages,
  () => {
    void scrollToLatestMessage();
  },
  {
    deep: true,
    flush: 'post',
  },
);

watch(isSending, (sending) => {
  if (thinkingTimer !== undefined) {
    window.clearInterval(thinkingTimer);
    thinkingTimer = undefined;
  }

  if (!sending) {
    thinkingSeconds.value = 0;
    return;
  }

  const startedAt = Date.now();
  thinkingSeconds.value = 0;
  void scrollToLatestMessage();

  thinkingTimer = window.setInterval(() => {
    thinkingSeconds.value = Math.floor((Date.now() - startedAt) / 1000);
  }, 1000);
});

onMounted(() => {
  void scrollToLatestMessage();

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

onBeforeUnmount(() => {
  if (thinkingTimer !== undefined) {
    window.clearInterval(thinkingTimer);
  }
});
</script>

<template>
  <main class="conversation-page">
    <aside class="sidebar">
      <RouterLink class="sidebar-brand" to="/">
        <span class="brand-mark">*</span>
        <span>
          <strong>AI产品工作站</strong>
          <em>代码24小时在线开发，无需运维</em>
        </span>
      </RouterLink>

      <nav class="sidebar-nav">
        <RouterLink to="/" class="nav-item">
          <span>⌘</span>
          案例库
        </RouterLink>
        <RouterLink to="/" class="nav-item">
          <span>✎</span>
          新会话
        </RouterLink>
      </nav>

      <div class="session-list">
        <p>今天</p>
        <button
          v-for="item in sessionItems"
          :key="item.id"
          type="button"
          class="session-item"
          :class="{ active: item.id === 0 }"
        >
          <span />
          {{ item.title }}
        </button>
      </div>

      <div class="user-card">
        <span>用</span>
        用户9855
      </div>
    </aside>

    <section class="chat-column">
      <div class="chat-card">
        <header class="chat-toolbar">
          <div class="chat-title">
            <span class="title-icon">▣</span>
            <strong>未命名会话</strong>
          </div>
          <el-button text circle>
            <el-icon><MoreFilled /></el-icon>
          </el-button>
        </header>

        <div ref="messageListRef" class="message-list">
          <article
            v-for="message in messages"
            :key="message.id"
            class="message-row"
            :class="`message-row--${message.role}`"
          >
            <template
              v-for="(segment, segmentIndex) in parseMessageContent(message.content)"
              :key="`${message.id}-${segmentIndex}`"
            >
              <div v-if="segment.type === 'text'" class="message-bubble">
                {{ segment.content }}
              </div>
              <HtmlCodeBlock
                v-else
                :code="segment.content"
                @preview="previewHtml = $event"
              />
            </template>

            <ToolCallDetail
              v-for="toolCall in message.toolCalls"
              :key="toolCall.id"
              :tool-call="toolCall"
            />
          </article>

          <div v-if="isSending" class="thinking-indicator" role="status" aria-live="polite">
            <span class="thinking-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>思考中 · {{ thinkingSeconds }}s</span>
          </div>
        </div>

        <div class="chat-composer" :class="{ 'is-generating': isSending }">
          <button type="button" class="composer-icon" aria-label="添加附件">
            <el-icon><Plus /></el-icon>
          </button>
          <el-input
            v-model="draft"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            resize="none"
            placeholder="输入你的想法..."
            @keydown.enter="submitOnEnter"
          />
          <button type="button" class="composer-icon" aria-label="工具选项">⌘</button>
          <el-button
            class="send-button"
            type="primary"
            circle
            :disabled="!canSend"
            aria-label="发送"
            @click="sendMessage()"
          >
            <el-icon><ArrowUp /></el-icon>
          </el-button>
          <button
            v-if="isSending"
            type="button"
            class="stop-button"
            aria-label="终止对话"
            @click="stopGeneration"
          >
            <span />
          </button>
        </div>
      </div>
    </section>

    <section class="preview-column">
      <div class="preview-card">
        <header class="preview-toolbar">
          <div class="address-bar">{{ previewHtml ? 'LocalHost / preview.html' : 'LocalHost' }}</div>
          <button type="button">↗</button>
          <button type="button">⌄</button>
          <button type="button" class="publish-btn">发布</button>
        </header>

        <iframe
          v-if="previewHtml"
          class="html-preview-frame"
          :srcdoc="previewHtml"
          sandbox="allow-scripts allow-forms allow-modals"
          title="HTML 页面预览"
        />
        <div v-else class="preview-empty">
          <div class="empty-icon">⌘</div>
          <p>程序完成首次部署后，这里会显示应用预览。</p>
        </div>
      </div>
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
  display: grid;
  grid-template-columns: 220px minmax(420px, 1fr) minmax(480px, 1.22fr);
  gap: 10px;
  min-width: 1180px;
  height: 100vh;
  padding: 8px;
  overflow: hidden;
  color: #171717;
  background: #f6f0e6;
}

.sidebar,
.chat-card,
.preview-card {
  height: calc(100vh - 16px);
  min-height: 0;
  background: #fffaf2;
  border: 1px solid #e7dfd4;
  box-shadow: 0 16px 48px rgba(75, 46, 26, 0.08);
}

.chat-column,
.preview-column {
  min-width: 0;
  min-height: 0;
}

.sidebar {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 14px 10px;
  border-radius: 18px;
}

.sidebar-brand {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #191613;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 28px;
  height: 28px;
  color: #fff;
  background: #171717;
  border-radius: 50%;
  place-items: center;
}

.sidebar-brand strong,
.sidebar-brand em {
  display: block;
}

.sidebar-brand strong {
  font-size: 15px;
}

.sidebar-brand em {
  margin-top: 2px;
  color: #877d72;
  font-size: 10px;
  font-style: normal;
}

.sidebar-nav {
  display: grid;
  gap: 10px;
  margin-top: 28px;
}

.nav-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px 6px;
  color: #191613;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
}

.session-list {
  margin-top: 30px;
}

.session-list p {
  margin: 0 0 8px;
  color: #938a7d;
  font-size: 12px;
}

.session-item {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
  padding: 9px 8px;
  color: #4f473e;
  background: transparent;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
}

.session-item span {
  width: 13px;
  height: 10px;
  border: 1px solid #a99f92;
  border-radius: 2px;
}

.session-item.active {
  background: #e8dfd1;
  color: #191613;
  font-weight: 800;
}

.user-card {
  display: flex;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  font-size: 13px;
  font-weight: 800;
}

.user-card span {
  display: grid;
  width: 28px;
  height: 28px;
  color: #fff;
  background: #d7472c;
  border-radius: 50%;
  place-items: center;
}

.chat-card,
.preview-card {
  overflow: hidden;
  border-radius: 18px;
}

.chat-card {
  display: flex;
  flex-direction: column;
}

.chat-toolbar,
.preview-toolbar {
  display: flex;
  align-items: center;
  height: 52px;
  padding: 0 18px;
  border-bottom: 1px solid #ede4d9;
}

.chat-toolbar {
  justify-content: space-between;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 900;
}

.title-icon {
  display: grid;
  width: 30px;
  height: 30px;
  color: #d7472c;
  background: #fff0e8;
  border-radius: 8px;
  place-items: center;
}

.message-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 44px 22px 18px;
  overscroll-behavior: contain;
  scroll-behavior: smooth;
  overflow-y: auto;
}

.message-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
}

.message-row--user {
  align-items: flex-end;
}

.message-row--assistant {
  align-items: flex-start;
}

.message-bubble {
  max-width: 78%;
  padding: 16px 18px;
  color: #3a322b;
  line-height: 1.7;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  background: #eee5d8;
  border: 1px solid #e1d7ca;
  border-radius: 16px;
}

.message-row--user .message-bubble {
  color: #fff;
  background: #d7472c;
  border-color: #d7472c;
  border-radius: 18px 18px 4px 18px;
}

.message-row--assistant .message-bubble {
  border-radius: 4px 18px 18px;
}

.thinking-indicator {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 12px;
  width: fit-content;
  margin-bottom: 8px;
  padding: 14px 18px;
  color: #3a322b;
  background: #eee5d8;
  border: 1px solid #ddd2c4;
  border-radius: 22px;
  box-shadow: 0 8px 18px rgba(75, 46, 26, 0.08);
}

.thinking-dots {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.thinking-dots i {
  width: 7px;
  height: 7px;
  background: #81776d;
  border-radius: 50%;
  animation: thinking-pulse 1.2s ease-in-out infinite;
}

.thinking-dots i:nth-child(2) {
  animation-delay: 0.15s;
}

.thinking-dots i:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes thinking-pulse {
  0%,
  60%,
  100% {
    opacity: 0.45;
    transform: translateY(0);
  }

  30% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

.chat-composer {
  display: grid;
  grid-template-columns: 34px 1fr 34px 38px;
  gap: 10px;
  align-items: end;
  margin: 0 18px 14px;
  padding: 12px;
  background: #eee5d8;
  border: 1px solid #ded3c5;
  border-radius: 18px;
  box-shadow: 0 12px 30px rgba(75, 46, 26, 0.08);
}

.chat-composer.is-generating {
  grid-template-columns: 34px 1fr 34px 38px 42px;
}

.chat-composer :deep(.el-textarea__inner) {
  min-height: 42px !important;
  background: transparent;
  box-shadow: none;
}

.composer-icon {
  display: grid;
  width: 34px;
  height: 34px;
  color: #6b6258;
  background: #f8f1e7;
  border: 1px solid #e1d6ca;
  border-radius: 50%;
  cursor: pointer;
  place-items: center;
}

.chat-composer :deep(.send-button) {
  width: 38px;
  height: 38px;
  color: #fff;
  background: #d7472c;
  border-color: #d7472c;
  box-shadow: 0 8px 18px rgba(215, 71, 44, 0.24);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.chat-composer :deep(.send-button:hover:not(.is-disabled)) {
  background: #c93c24;
  border-color: #c93c24;
}

.chat-composer :deep(.send-button.is-disabled),
.chat-composer :deep(.send-button.is-disabled:hover) {
  color: #aaa197;
  background: #ddd5ca;
  border-color: #ddd5ca;
  box-shadow: none;
}

.stop-button {
  display: grid;
  width: 42px;
  height: 42px;
  padding: 0;
  background: #211d19;
  border: 0;
  border-radius: 50%;
  box-shadow: 0 8px 18px rgba(33, 29, 25, 0.2);
  cursor: pointer;
  place-items: center;
}

.stop-button span {
  width: 11px;
  height: 11px;
  background: #fff;
  border-radius: 2px;
}

.stop-button:hover {
  background: #000;
}

.preview-card {
  display: flex;
  flex-direction: column;
  background: #f7f0e6;
}

.preview-toolbar {
  gap: 10px;
}

.address-bar {
  flex: 1;
  height: 28px;
  color: #6d6258;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 13px;
  line-height: 28px;
  text-align: center;
  background: #eee6db;
  border: 1px solid #ded5ca;
  border-radius: 9px;
}

.preview-toolbar button {
  height: 30px;
  min-width: 30px;
  color: #92877e;
  background: #eee6db;
  border: 1px solid #ded5ca;
  border-radius: 999px;
}

.preview-toolbar .publish-btn {
  min-width: 64px;
  color: #6d6258;
  font-weight: 800;
}

.preview-empty {
  flex: 1;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 14px;
  color: #81776d;
  text-align: center;
}

.empty-icon {
  color: #8f867c;
  font-size: 42px;
}

.preview-empty p {
  margin: 0;
  font-size: 14px;
}

.html-preview-frame {
  flex: 1;
  width: 100%;
  min-height: 0;
  background: #fff;
  border: 0;
}
</style>
