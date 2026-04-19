import api from '@/utils/api';

export interface GoalConversationResult {
  success: boolean;
  userVisible?: string;
  internal?: any;
  data?: any;
  error?: string;
}

export const goalConversationAPI = {
  async start(goal: string): Promise<GoalConversationResult> {
    return api.post('/goal-conversation/start', { goal });
  },

  async reply(conversationId: string, reply: string): Promise<GoalConversationResult> {
    return api.post(`/goal-conversation/${conversationId}/reply`, { reply });
  },

  async regenerate(conversationId: string, adjustments?: string): Promise<GoalConversationResult> {
    return api.post(`/goal-conversation/${conversationId}/regenerate`, { adjustments });
  },

  async reset(conversationId: string) {
    return api.delete(`/goal-conversation/${conversationId}`);
  },

  async getConversation(conversationId: string): Promise<GoalConversationResult> {
    return api.get(`/goal-conversation/${conversationId}`);
  },

  async quickGenerate(payload: {
    goal: string;
    level?: string;
    timePerDay?: string;
    learningStyle?: string;
  }): Promise<GoalConversationResult> {
    return api.post('/goal-conversation/quick-generate', payload);
  }
};
