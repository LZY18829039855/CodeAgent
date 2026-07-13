import { computed, ref } from 'vue';

export type MessageRole = 'user' | 'assistant';
export type ToolCallStatus = 'pending' | 'running' | 'success' | 'blocked';

export interface ToolCall {
  id: string;
  name: string;
  status: ToolCallStatus;
  summary: string;
  input: string;
  output?: string;
  requiresPermission?: boolean;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  toolCalls?: ToolCall[];
}

export interface ExamplePrompt {
  title: string;
  prompt: string;
}

const now = () =>
  new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function useChat() {
  const draft = ref('');
  const isSending = ref(false);
  const pendingToolCall = ref<ToolCall | null>(null);

  const examplePrompts: ExamplePrompt[] = [
    {
      title: 'Todo 应用',
      prompt: '帮我做一个 todo 应用，支持优先级、截止日期和完成状态筛选。',
    },
    {
      title: '记账工具',
      prompt: '我想要一个能记账的小工具，每月自动汇总开销并生成分类图表。',
    },
    {
      title: '作品集网站',
      prompt: '弄一个我的作品集网站，能展示项目、联系方式，并生成可分享链接。',
    },
    {
      title: '报名表单',
      prompt: '做一个活动报名页面，收集姓名、手机号、人数，并能导出报名名单。',
    },
  ];

  const messages = ref<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      createdAt: now(),
      content:
        '你好，我是你的 AI产品工作站。直接描述你想做的页面、工具或自动化，我会拆解需求、生成代码，并展示每一步工具调用。',
    },
  ]);

  const hasMessages = computed(() => messages.value.length > 1);

  const applyExample = (prompt: string) => {
    draft.value = prompt;
  };

  const approveToolCall = () => {
    if (!pendingToolCall.value) {
      return;
    }

    pendingToolCall.value.status = 'success';
    pendingToolCall.value.output = '权限已确认，模拟写入 src/client/views/ChatView.vue。';
    pendingToolCall.value.requiresPermission = false;
    pendingToolCall.value = null;
  };

  const rejectToolCall = () => {
    if (!pendingToolCall.value) {
      return;
    }

    pendingToolCall.value.status = 'blocked';
    pendingToolCall.value.output = '用户取消了本次高风险操作。';
    pendingToolCall.value = null;
  };

  const sendMessage = async (message?: string) => {
    const content = (message ?? draft.value).trim();

    if (!content || isSending.value) {
      return;
    }

    messages.value.push({
      id: createId('user'),
      role: 'user',
      createdAt: now(),
      content,
    });

    if (!message) {
      draft.value = '';
    }
    isSending.value = true;

    await new Promise((resolve) => window.setTimeout(resolve, 500));

    const toolCall: ToolCall = {
      id: createId('tool'),
      name: 'write_file',
      status: 'pending',
      summary: '准备写入 Vue 页面组件，需要确认权限',
      input: JSON.stringify(
        {
          path: 'src/client/views/ChatView.vue',
          reason: '根据你的描述更新聊天首页原型',
        },
        null,
        2,
      ),
      requiresPermission: true,
    };

    messages.value.push({
      id: createId('assistant'),
      role: 'assistant',
      createdAt: now(),
      content: `我会先把需求拆成页面结构、状态逻辑和组件实现。\n\n\`\`\`ts\ninterface ProductRequest {\n  goal: string\n  layout: 'chat-workspace'\n  framework: 'vue3'\n}\n\`\`\`\n\n下一步需要确认是否允许我模拟写入前端文件。`,
      toolCalls: [toolCall],
    });

    pendingToolCall.value = toolCall;
    isSending.value = false;
  };

  return {
    draft,
    examplePrompts,
    hasMessages,
    isSending,
    messages,
    pendingToolCall,
    applyExample,
    approveToolCall,
    rejectToolCall,
    sendMessage,
  };
}
