import { AppData, ChatMessage, Transaction, Category, UserPreferences, TransactionProposal } from '../types';

export interface ChatResponse {
  replyText: string;
  intent: 'record' | 'clarify' | 'query' | 'modify' | 'general';
  proposals: TransactionProposal[];
  clarificationPrompt?: string;
  modifyAction?: {
    action: 'delete' | 'update' | 'none';
    targetDescription?: string;
    targetTransactionId?: string;
    updatedAmount?: number;
    updatedCategory?: string;
  };
  quickStats?: { label: string; value: string }[];
}

export async function sendMessageToAI(payload: {
  message: string;
  history: ChatMessage[];
  transactions: Transaction[];
  categories: Category[];
  userPreferences: UserPreferences;
  currentDate: string;
  initialBalance: number;
}): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Gagal menghubungi asisten AI.');
  }

  return response.json();
}

export async function fetchAppData(): Promise<Partial<AppData>> {
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Could not fetch server data, falling back to local storage:', err);
  }
  return {};
}

export async function saveAppData(data: Partial<AppData>): Promise<void> {
  try {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.warn('Failed to sync to server storage:', err);
  }
}

export async function resetAppData(): Promise<AppData> {
  const res = await fetch('/api/reset-data', { method: 'POST' });
  if (!res.ok) throw new Error('Gagal mereset data');
  const json = await res.json();
  return json.data;
}
