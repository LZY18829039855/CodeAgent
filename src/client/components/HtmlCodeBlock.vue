<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { ArrowDown, ArrowUp, CopyDocument, VideoPlay } from '@element-plus/icons-vue';
import hljs from 'highlight.js';

const props = defineProps<{
  code: string;
}>();

const emit = defineEmits<{
  preview: [code: string];
}>();

const collapsed = ref(false);
const copied = ref(false);
let copiedTimer: number | undefined;

const highlightedCode = hljs.highlight(props.code, { language: 'html' }).value;

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = props.code;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }

  copied.value = true;

  if (copiedTimer !== undefined) {
    window.clearTimeout(copiedTimer);
  }

  copiedTimer = window.setTimeout(() => {
    copied.value = false;
  }, 1600);
};

onBeforeUnmount(() => {
  if (copiedTimer !== undefined) {
    window.clearTimeout(copiedTimer);
  }
});
</script>

<template>
  <section class="html-code-block" :class="{ 'is-collapsed': collapsed }">
    <header>
      <button
        type="button"
        class="language-toggle"
        :aria-expanded="!collapsed"
        @click="collapsed = !collapsed"
      >
        <strong>html</strong>
        <el-icon>
          <ArrowDown v-if="collapsed" />
          <ArrowUp v-else />
        </el-icon>
      </button>

      <div v-if="!collapsed" class="code-actions">
        <button type="button" @click="emit('preview', props.code)">
          <el-icon><VideoPlay /></el-icon>
          预览
        </button>
        <button type="button" @click="copyCode">
          <el-icon><CopyDocument /></el-icon>
          {{ copied ? '已复制' : '复制' }}
        </button>
      </div>

    </header>

    <pre v-if="!collapsed"><code v-html="highlightedCode" /></pre>
  </section>
</template>

<style scoped>
.html-code-block {
  width: min(100%, 680px);
  margin: 12px 0;
  overflow: hidden;
  background: #f7f8fa;
  border: 1px solid #dde1e7;
  border-radius: 12px;
}

.html-code-block.is-collapsed {
  width: fit-content;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 42px;
  padding: 0 14px;
  color: #4f5660;
  background: #eef0f3;
  border-bottom: 1px solid #dde1e7;
}

.is-collapsed header {
  gap: 12px;
  border-bottom: 0;
}

.language-toggle {
  display: inline-flex;
  align-items: center;
  padding: 0;
  color: #4f5660;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.language-toggle {
  gap: 5px;
}

.language-toggle strong {
  font-size: 14px;
  text-transform: lowercase;
}

.code-actions {
  display: flex;
  gap: 6px;
}

.code-actions button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  color: #69717c;
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.code-actions button:hover {
  color: #d7472c;
  background: #fff;
}

pre {
  max-height: 420px;
  margin: 0;
  padding: 18px;
  overflow: auto;
  color: #303846;
  background: #f8f9fb;
}

code {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre;
}
</style>
