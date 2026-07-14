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
  let activeRequestId = 0;

  const examplePrompts: ExamplePrompt[] = [
    {
      title: 'Todo 应用',
      prompt: '帮我做一个 todo 应用',
    },
    {
      title: '记账工具',
      prompt: '我想要一个能记账的小工具，每月自动汇总开销',
    },
    {
      title: '值日表',
      prompt: '班级值日表能自动轮换，给我搞个简单页面',
    },
    {
      title: '倒计时页',
      prompt: '给女朋友做个倒计时页，纪念我们在一起的日子',
    },
    {
      title: '作品集网站',
      prompt: '弄一个我的作品集网站，能分享链接给客户',
    },
    {
      title: '小店主页',
      prompt: '我开了家小店，想要一个主页放联系方式和产品图',
    },
    {
      title: '抽奖应用',
      prompt: '搞个抽奖应用，朋友扫码就能参与',
    },
    {
      title: '投票页',
      prompt: '想让大家投票选活动主题，要一个简单的投票页',
    },
    {
      title: '报名名单',
      prompt: '收集报名信息的表单，能自动汇总成名单的那种',
    },
    {
      title: '喝水提醒',
      prompt: '每天提醒我喝水、起来活动，弄个这样的小工具',
    },
    {
      title: '宠物打卡',
      prompt: '给我家狗子做个成长打卡页，朋友也能进来看',
    },
    {
      title: '扫码小游戏',
      prompt: '朋友聚会想玩个扫码小游戏，能搞一个吗',
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

    const requestId = ++activeRequestId;

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

    if (requestId !== activeRequestId) {
      return;
    }

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
      content: `我先生成一个可直接预览的 HTML 页面，你可以在代码块右上角预览或复制。\n\n\`\`\`html\n<!doctype html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>产品预览</title>\n  <style>\n    * { box-sizing: border-box; }\n    body {\n      margin: 0;\n      min-height: 100vh;\n      display: grid;\n      place-items: center;\n      font-family: system-ui, sans-serif;\n      color: #2b211b;\n      background: linear-gradient(135deg, #fff8f1, #f3e7d8);\n    }\n    main {\n      width: min(560px, 90%);\n      padding: 48px;\n      text-align: center;\n      background: rgba(255, 255, 255, 0.88);\n      border: 1px solid #e6d8ca;\n      border-radius: 28px;\n      box-shadow: 0 24px 70px rgba(75, 46, 26, 0.14);\n    }\n    h1 { margin: 0 0 16px; font-size: 42px; }\n    p { color: #74675d; line-height: 1.8; }\n    button {\n      margin-top: 18px;\n      padding: 12px 24px;\n      color: #fff;\n      background: #d7472c;\n      border: 0;\n      border-radius: 999px;\n    }\n  </style>\n</head>\n<body>\n  <main>\n    <h1>你的产品已就绪</h1>\n    <p>这是由 AI产品工作站生成的页面预览。</p>\n    <button>开始体验</button>\n  </main>\n</body>\n</html>\n\`\`\`\n\n下一步需要确认是否允许我模拟写入前端文件。`,
      toolCalls: [toolCall],
    });

    pendingToolCall.value = toolCall;
    isSending.value = false;
  };

  const stopGeneration = () => {
    if (!isSending.value) {
      return;
    }

    activeRequestId += 1;
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
    stopGeneration,
  };
}
