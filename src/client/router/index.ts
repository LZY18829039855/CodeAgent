import { createRouter, createWebHistory } from 'vue-router';

import ChatView from '@/views/ChatView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ChatView,
    },
    {
      path: '/chat/code',
      name: 'chat-code',
      component: ChatView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: {
        template: '<main class="settings-placeholder">设置页预留中</main>',
      },
    },
  ],
});

export default router;
