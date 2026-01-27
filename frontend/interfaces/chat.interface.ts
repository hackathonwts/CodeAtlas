export interface IChat {
  _id: string;
  project_id: {
    _id: string;
    title: string;
  };
  title: string;
  user_id: {
    _id: string;
    full_name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IConversation {
  _id: string;
  chat_id: string;
  user_id: {
    _id: string;
    full_name: string;
    email: string;
  };
  content: string;
  type: 'text' | 'file';
  role: 'user' | 'assistant';
  createdAt: string;
  updatedAt: string;
}

export interface SlashCommandConfig {
  command: string;
  label: string;
  description: string;
  icon?: React.ReactNode;
}
