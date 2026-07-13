<script setup lang="ts">
import { computed } from 'vue';
import { ArrowDown, CircleCheck, CircleClose, Loading, Warning } from '@element-plus/icons-vue';

import type { ToolCall } from '@/composables/useChat';

const props = defineProps<{
  toolCall: ToolCall;
}>();

const statusMeta = computed(() => {
  const map = {
    pending: {
      label: '等待确认',
      type: 'warning',
      icon: Warning,
    },
    running: {
      label: '执行中',
      type: 'primary',
      icon: Loading,
    },
    success: {
      label: '已完成',
      type: 'success',
      icon: CircleCheck,
    },
    blocked: {
      label: '已取消',
      type: 'danger',
      icon: CircleClose,
    },
  } as const;

  return map[props.toolCall.status];
});
</script>

<template>
  <el-collapse class="tool-call">
    <el-collapse-item>
      <template #title>
        <div class="tool-title">
          <el-icon :class="{ 'is-loading': props.toolCall.status === 'running' }">
            <component :is="statusMeta.icon" />
          </el-icon>
          <span class="tool-name">{{ props.toolCall.name }}</span>
          <el-tag :type="statusMeta.type" effect="light" round>
            {{ statusMeta.label }}
          </el-tag>
          <span class="tool-summary">{{ props.toolCall.summary }}</span>
          <el-icon class="tool-arrow">
            <ArrowDown />
          </el-icon>
        </div>
      </template>

      <div class="tool-section">
        <p>输入参数</p>
        <pre>{{ props.toolCall.input }}</pre>
      </div>

      <div v-if="props.toolCall.output" class="tool-section">
        <p>执行结果</p>
        <pre>{{ props.toolCall.output }}</pre>
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<style scoped>
.tool-call {
  width: 100%;
  margin-top: 10px;
  overflow: hidden;
  background: #fffaf5;
  border: 1px solid #f1ddcd;
  border-radius: 16px;
}

.tool-call :deep(.el-collapse-item__header) {
  height: auto;
  padding: 0 12px;
  background: transparent;
  border-bottom: 0;
}

.tool-call :deep(.el-collapse-item__wrap) {
  background: transparent;
  border-bottom: 0;
}

.tool-call :deep(.el-collapse-item__arrow) {
  display: none;
}

.tool-title {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 46px;
  gap: 8px;
}

.tool-name {
  color: #171717;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-weight: 800;
}

.tool-summary {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #7a624f;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-arrow {
  color: #ad8b74;
}

.tool-section {
  padding: 0 14px 14px;
}

.tool-section p {
  margin: 0 0 8px;
  color: #7a624f;
  font-size: 12px;
  font-weight: 800;
}

.tool-section pre {
  margin: 0;
  padding: 12px;
  overflow: auto;
  color: #f8f8f2;
  background: #151515;
  border-radius: 12px;
}

.is-loading {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>
