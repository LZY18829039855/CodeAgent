<script setup lang="ts">
import type { ToolCall } from '@/composables/useChat';

defineProps<{
  modelValue: boolean;
  toolCall: ToolCall | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  approve: [];
  reject: [];
}>();

const close = () => {
  emit('update:modelValue', false);
};

const approve = () => {
  emit('approve');
  close();
};

const reject = () => {
  emit('reject');
  close();
};
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="需要你的权限确认"
    width="520px"
    align-center
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="toolCall" class="permission-content">
      <p class="permission-desc">
        AI 准备执行一个会影响项目文件的工具调用。请确认后继续。
      </p>

      <div class="permission-card">
        <span>工具</span>
        <strong>{{ toolCall.name }}</strong>
      </div>

      <div class="permission-card">
        <span>说明</span>
        <strong>{{ toolCall.summary }}</strong>
      </div>

      <pre>{{ toolCall.input }}</pre>
    </div>

    <template #footer>
      <el-button @click="reject">取消</el-button>
      <el-button type="primary" @click="approve">确认执行</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.permission-content {
  display: grid;
  gap: 14px;
}

.permission-desc {
  margin: 0;
  color: #666;
  line-height: 1.7;
}

.permission-card {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 14px;
  background: #fff8f1;
  border: 1px solid #f0dfd0;
  border-radius: 14px;
}

.permission-card span {
  color: #8b735d;
}

.permission-card strong {
  color: #171717;
  text-align: right;
}

pre {
  max-height: 220px;
  margin: 0;
  padding: 14px;
  overflow: auto;
  color: #f8f8f2;
  background: #151515;
  border-radius: 14px;
}
</style>
