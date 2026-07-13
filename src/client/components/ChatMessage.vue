<script setup lang="ts">
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

import ToolCallDetail from './ToolCallDetail.vue';
import type { ChatMessage } from '@/composables/useChat';

const props = defineProps<{
  message: ChatMessage;
}>();

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  highlight(code, language) {
    const canHighlight = language && hljs.getLanguage(language);

    if (canHighlight) {
      return hljs.highlight(code, { language }).value;
    }

    return hljs.highlightAuto(code).value;
  },
});
</script>

<template>
  <article class="chat-message" :class="`chat-message--${props.message.role}`">
    <div class="message-avatar">
      {{ props.message.role === 'assistant' ? 'AI' : '你' }}
    </div>

    <div class="message-main">
      <div class="message-meta">
        <span>{{ props.message.role === 'assistant' ? 'AI路小飞' : '我' }}</span>
        <time>{{ props.message.createdAt }}</time>
      </div>

      <div class="message-bubble">
        <div class="markdown-body" v-html="markdown.render(props.message.content)" />
      </div>

      <ToolCallDetail
        v-for="toolCall in props.message.toolCalls"
        :key="toolCall.id"
        :tool-call="toolCall"
      />
    </div>
  </article>
</template>

<style scoped>
.chat-message {
  display: flex;
  gap: 12px;
}

.chat-message--user {
  flex-direction: row-reverse;
}

.message-avatar {
  display: grid;
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  background: #171717;
  border-radius: 14px;
  place-items: center;
}

.chat-message--user .message-avatar {
  background: #eb6a3a;
}

.message-main {
  max-width: min(100%, 520px);
}

.chat-message--user .message-main {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  color: #8a8a8a;
  font-size: 12px;
}

.message-meta span {
  color: #3a3a3a;
  font-weight: 800;
}

.message-bubble {
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #eee3da;
  border-radius: 18px;
}

.chat-message--user .message-bubble {
  color: #fff;
  background: #171717;
  border-color: #171717;
}

.markdown-body {
  color: inherit;
  font-size: 14px;
  line-height: 1.7;
}

.markdown-body :deep(p) {
  margin: 0 0 10px;
}

.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(pre) {
  margin: 12px 0 0;
  padding: 14px;
  overflow: auto;
  color: #f8f8f2;
  background: #111;
  border-radius: 14px;
}

.markdown-body :deep(code) {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 13px;
}

.markdown-body :deep(:not(pre) > code) {
  padding: 2px 6px;
  color: #c4491d;
  background: #fff0e6;
  border-radius: 8px;
}
</style>
