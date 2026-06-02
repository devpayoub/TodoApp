import {
  loadState,
  addTodo,
  toggleTodoState,
  deleteTodoState,
  clearCompletedState,
  setCategoryState,
  setFilterState,
  getTodos,
  getCurrentCategory,
  getCurrentFilter
} from './store';

import {
  elements,
  announce,
  updateCategoryUI,
  updateFilterUI,
  render,
  initCustomDropdowns
} from './ui';

let todoToDelete: { id: string, item: HTMLElement } | null = null;

function handleToggle(id: string): void {
  const toggled = toggleTodoState(id);
  if (toggled) {
    announce(`Task "${toggled.text}" marked as ${toggled.completed ? 'completed' : 'incomplete'}`);
    reRender(id);
  }
}

function handleDeleteRequest(id: string, item: HTMLElement): void {
  const todos = getTodos();
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  todoToDelete = { id, item };
  elements.deleteModal?.showModal();
}

function reRender(focusId?: string): void {
  render(handleToggle, handleDeleteRequest, focusId);
}

elements.todoForm?.addEventListener('submit', e => {
  e.preventDefault();
  const text = elements.todoInput?.value.trim() ?? '';
  const category = elements.todoCategorySelect?.value ?? 'Werk';

  elements.todoInput?.classList.remove('error-state');
  elements.todoInput?.removeAttribute('aria-invalid');
  if (elements.inputError) elements.inputError.textContent = '';

  if (!text) {
    elements.todoInput?.classList.add('error-state');
    elements.todoInput?.setAttribute('aria-invalid', 'true');
    elements.todoInput?.focus();
    if (elements.inputError) elements.inputError.textContent = 'Please enter a task description.';
    announce('Validation error: Task description cannot be empty.');
    return;
  }

  const newTodo = addTodo(text, category);
  if (elements.todoInput) elements.todoInput.value = '';
  announce(`Task "${text}" added to ${category}`);
  reRender(newTodo.id);
});

elements.categoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.getAttribute('data-category');
    if (cat) {
      setCategoryState(cat);
      updateCategoryUI(cat);
      reRender();
      announce(`Viewing ${cat === 'all' ? 'all' : cat} category tasks`);
    }
  });
});

elements.filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.getAttribute('data-filter') as 'all' | 'active' | 'completed' | null;
    if (filter) {
      setFilterState(filter);
      updateFilterUI(filter);
      reRender();
      announce(`Filtering by ${filter} tasks`);
    }
  });
});

elements.clearCompletedBtn?.addEventListener('click', () => {
  const clearedCount = clearCompletedState();
  if (clearedCount > 0) {
    reRender();
    announce(`Cleared ${clearedCount} completed tasks`);
  }
});

elements.cancelDeleteBtn?.addEventListener('click', () => {
  elements.deleteModal?.close();
  todoToDelete = null;
});

elements.confirmDeleteBtn?.addEventListener('click', () => {
  if (!todoToDelete) return;
  const { id, item } = todoToDelete;
  
  // Note: we fetch original todo for text before deletion
  const todos = getTodos();
  const todo = todos.find(t => t.id === id);
  
  const deletedTodo = deleteTodoState(id);
  if (!deletedTodo && !todo) return;

  elements.deleteModal?.close();
  announce(`Task "${(deletedTodo || todo)!.text}" deleted`);

  const next = item.nextElementSibling?.querySelector<HTMLElement>('.todo-item-content')
            ?? item.previousElementSibling?.querySelector<HTMLElement>('.todo-item-content')
            ?? elements.todoInput;

  item.classList.add('animate-fade-out-shrink');

  setTimeout(() => {
    reRender();
    next?.focus();
  }, 300);

  todoToDelete = null;
});

elements.mobileSelect?.addEventListener('change', e => {
  const category = (e.target as HTMLSelectElement).value;
  setCategoryState(category);
  updateCategoryUI(category);
  reRender();
  announce(`Viewing ${category === 'all' ? 'all' : category} category tasks`);
});

elements.todoInput?.addEventListener('input', () => {
  if (elements.todoInput?.value.trim()) {
    elements.todoInput.classList.remove('error-state');
    elements.todoInput.removeAttribute('aria-invalid');
    if (elements.inputError) elements.inputError.textContent = '';
  }
});

// Initialization
loadState();
initCustomDropdowns();
updateCategoryUI(getCurrentCategory());
updateFilterUI(getCurrentFilter());
reRender();
