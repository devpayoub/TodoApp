export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category: string;
  createdAt: number;
}

export const DEFAULT_TODOS: Todo[] = [];
