import type { Todo } from './types';
import { DEFAULT_TODOS } from './types';

let todos: Todo[] = [];
let currentCategory = 'all';
let currentFilter: 'all' | 'active' | 'completed' = 'all';

export function getTodos(): Todo[] { return todos; }
export function getCurrentCategory(): string { return currentCategory; }
export function getCurrentFilter(): 'all' | 'active' | 'completed' { return currentFilter; }

export function loadState(): void {
  try {
    const savedTodos = localStorage.getItem('vrcafe_todos');
    const savedCategory = localStorage.getItem('vrcafe_current_category');

    todos = savedTodos ? (JSON.parse(savedTodos) as Todo[]) : [...DEFAULT_TODOS];
    if (!savedTodos) saveState();

    if (savedCategory) {
      currentCategory = savedCategory;
    }
  } catch {
    todos = [...DEFAULT_TODOS];
  }
}

export function saveState(): void {
  try {
    localStorage.setItem('vrcafe_todos', JSON.stringify(todos));
    localStorage.setItem('vrcafe_current_category', currentCategory);
  } catch {
  }
}

export function addTodo(text: string, category: string): Todo {
  const newTodo: Todo = { id: Date.now().toString(), text, completed: false, category, createdAt: Date.now() };
  todos.push(newTodo);
  saveState();
  return newTodo;
}

export function toggleTodoState(id: string): Todo | null {
  let toggled: Todo | null = null;
  todos = todos.map(t => {
    if (t.id !== id) return t;
    const next = !t.completed;
    toggled = { ...t, completed: next };
    return toggled;
  });
  saveState();
  return toggled;
}

export function deleteTodoState(id: string): Todo | null {
  const todo = todos.find(t => t.id === id) || null;
  if (todo) {
    todos = todos.filter(t => t.id !== id);
    saveState();
  }
  return todo;
}

export function clearCompletedState(): number {
  const completedCount = todos.filter(t => t.completed).length;
  if (completedCount > 0) {
    todos = todos.filter(t => !t.completed);
    saveState();
  }
  return completedCount;
}

export function setCategoryState(category: string): void {
  currentCategory = category;
  saveState();
}

export function setFilterState(filter: 'all' | 'active' | 'completed'): void {
  currentFilter = filter;
}
