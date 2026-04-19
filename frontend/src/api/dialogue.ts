import api from '../utils/api';
import type {
  DialogueLearningSession,
  SubmitResponseResult
} from '@/types/learning';

export const dialogueAPI = {
  async startDialogueTask(taskId: string, pathId: string): Promise<DialogueLearningSession> {
    const response: any = await api.post('/learning/dialogue/start', { taskId, pathId });
    return response.data || response;
  },

  async submitResponse(sessionId: string, response: string): Promise<SubmitResponseResult> {
    const result: any = await api.post(`/learning/dialogue/${sessionId}/submit`, {
      response
    });
    return result.data || result;
  },

  async getHint(sessionId: string): Promise<string> {
    const result: any = await api.post(`/learning/dialogue/${sessionId}/hint`);
    return result.data?.hint || result.data?.data?.hint || result.data?.data || result?.hint || '';
  },

  async skipTask(sessionId: string): Promise<{ success: boolean }> {
    const result: any = await api.post(`/learning/dialogue/${sessionId}/skip`);
    return result.data || result;
  },

  async getDialogueState(sessionId: string): Promise<{
    roundNumber: number;
    totalRounds?: number;
    conversationHistory: Array<{
      role: 'user' | 'assistant';
      content: string;
      timestamp: string;
    }>;
    studentState: any;
  }> {
    const result: any = await api.get(`/learning/dialogue/${sessionId}/state`);
    return result.data || result;
  }
};

export default dialogueAPI;
