// Mock data for development when Supabase is not available
export const mockChats = [
  {
    id: 1,
    created_at: '2024-01-15T10:30:00Z',
    title: 'Tax Planning for Small Business',
    email: 'john.doe@example.com',
    processTime: 2.5,
    model: 'gpt-4',
    archive: false,
    feedback: 4,
    scenario: 'Small business owner looking to optimize tax deductions',
    user_id: 'user1',
    research: 'Research on small business tax deductions...',
    draft: 'Draft response about tax planning...',
    citations: '',
    citationsURL: '',
    citationsList: '',
    citationsArray: null,
    usedcitationsA: '',
    questions: '',
    comment_sel0: '',
    comment_add0: '',
    updated_on: '2024-01-15T10:35:00Z',
    comment_sele: 'Great explanation of tax deductions',
    comment_add: 'Very helpful for my business planning',
  },
  {
    id: 2,
    created_at: '2024-01-14T14:20:00Z',
    title: 'Investment Tax Strategies',
    email: 'jane.smith@example.com',
    processTime: 3.2,
    model: 'gpt-4',
    archive: false,
    feedback: 5,
    scenario: 'Investment portfolio tax optimization',
    user_id: 'user2',
    research: 'Research on investment tax strategies...',
    draft: 'Draft response about investment taxes...',
    citations: '',
    citationsURL: '',
    citationsList: '',
    citationsArray: null,
    usedcitationsA: '',
    questions: '',
    comment_sel0: '',
    comment_add0: '',
    updated_on: '2024-01-14T14:25:00Z',
    comment_sele: 'Comprehensive investment advice',
    comment_add: 'Exactly what I needed for my portfolio',
  },
  {
    id: 3,
    created_at: '2024-01-13T09:15:00Z',
    title: 'Retirement Planning',
    email: 'bob.wilson@example.com',
    processTime: 1.8,
    model: 'gpt-3.5-turbo',
    archive: true,
    feedback: 3,
    scenario: 'Retirement tax planning consultation',
    user_id: 'user3',
    research: 'Research on retirement tax planning...',
    draft: 'Draft response about retirement planning...',
    citations: '',
    citationsURL: '',
    citationsList: '',
    citationsArray: null,
    usedcitationsA: '',
    questions: '',
    comment_sel0: '',
    comment_add0: '',
    updated_on: '2024-01-13T09:20:00Z',
    comment_sele: 'Good basic information',
    comment_add: 'Could use more specific examples',
  },
];

export const mockConversations = [
  {
    id: 1,
    created_at: '2024-01-15T10:30:00Z',
    type: 'user' as const,
    content: 'I need help with tax planning for my small business.',
    chat_id: 1,
  },
  {
    id: 2,
    created_at: '2024-01-15T10:31:00Z',
    type: 'assistant' as const,
    content: 'I can help you with small business tax planning. Let me analyze your situation...',
    chat_id: 1,
  },
];

export function getMockEmails() {
  return [...new Set(mockChats.map(chat => chat.email))].sort();
}

export function getMockMetrics(filters: { email?: string; from?: string; to?: string }) {
  let filteredChats = mockChats;

  if (filters.email) {
    filteredChats = filteredChats.filter(chat => chat.email === filters.email);
  }

  if (filters.from) {
    filteredChats = filteredChats.filter(chat => 
      new Date(chat.created_at) >= new Date(filters.from!)
    );
  }

  if (filters.to) {
    filteredChats = filteredChats.filter(chat => 
      new Date(chat.created_at) <= new Date(filters.to! + 'T23:59:59.999Z')
    );
  }

  const scenariosCount = filteredChats.length;
  const latestFive = filteredChats
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(chat => ({
      id: chat.id,
      created_at: chat.created_at,
      title: chat.title,
      email: chat.email,
    }));

  const totalProcessTime = filteredChats.reduce((sum, chat) => sum + chat.processTime, 0);
  const avgProcessTime = scenariosCount > 0 ? totalProcessTime / scenariosCount : 0;
  const engagement = scenariosCount > 0 ? 2.5 : 0; // Mock engagement rate

  // Calculate feedback metrics
  const feedbackChats = filteredChats.filter(chat => chat.feedback !== null && chat.feedback !== undefined);
  const totalFeedback = feedbackChats.length;
  const avgFeedback = totalFeedback > 0 
    ? feedbackChats.reduce((sum, chat) => sum + chat.feedback, 0) / totalFeedback 
    : 0;
  return {
    scenariosCount,
    latestFive,
    totalProcessTime,
    avgProcessTime,
    engagement,
    totalFeedback,
    avgFeedback,
  };
}

export function getMockScenarios(filters: { 
  email?: string; 
  from?: string; 
  to?: string; 
  page: number; 
  pageSize: number; 
}) {
  let filteredChats = mockChats;

  if (filters.email) {
    filteredChats = filteredChats.filter(chat => chat.email === filters.email);
  }

  if (filters.from) {
    filteredChats = filteredChats.filter(chat => 
      new Date(chat.created_at) >= new Date(filters.from!)
    );
  }

  if (filters.to) {
    filteredChats = filteredChats.filter(chat => 
      new Date(chat.created_at) <= new Date(filters.to! + 'T23:59:59.999Z')
    );
  }

  const totalCount = filteredChats.length;
  const startIndex = (filters.page - 1) * filters.pageSize;
  const endIndex = startIndex + filters.pageSize;
  const paginatedChats = filteredChats
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(startIndex, endIndex);

  return {
    data: paginatedChats,
    count: totalCount,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.ceil(totalCount / filters.pageSize),
  };
}

export function getMockScenario(id: number) {
  const chat = mockChats.find(c => c.id === id);
  if (!chat) return null;

  const conversations = mockConversations.filter(c => c.chat_id === id);
  
  return { chat, conversations };
}

export function getMockFeedback(filters: { 
  email?: string; 
  from?: string; 
  to?: string; 
}) {
  let filteredChats = mockChats.filter(chat => 
    chat.feedback !== null && chat.feedback !== undefined
  );

  if (filters.email) {
    filteredChats = filteredChats.filter(chat => chat.email === filters.email);
  }

  if (filters.from) {
    filteredChats = filteredChats.filter(chat => 
      new Date(chat.created_at) >= new Date(filters.from!)
    );
  }

  if (filters.to) {
    filteredChats = filteredChats.filter(chat => 
      new Date(chat.created_at) <= new Date(filters.to! + 'T23:59:59.999Z')
    );
  }

  return filteredChats
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map(chat => ({
      id: chat.id,
      created_at: chat.created_at,
      title: chat.title,
      email: chat.email,
      feedback: chat.feedback,
      comment_sele: chat.comment_sele || '',
      comment_add: chat.comment_add || '',
    }));
}