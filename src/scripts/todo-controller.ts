interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category: string;
  createdAt: number;
}

const DEFAULT_TODOS: Todo[] = [];

let todos: Todo[] = [];
let currentCategory = 'all';
let currentFilter: 'all' | 'active' | 'completed' = 'all';

const todoForm = document.getElementById('todo-form') as HTMLFormElement | null;
const todoInput = document.getElementById('todo-input') as HTMLInputElement | null;
const todoCategorySelect = document.getElementById('todo-category-select') as HTMLSelectElement | null;
const todoList = document.getElementById('todo-list') as HTMLUListElement | null;
const emptyState = document.getElementById('empty-state') as HTMLElement | null;
const inputError = document.getElementById('input-error') as HTMLElement | null;
const currentCategoryHeading = document.getElementById('current-category-heading') as HTMLElement | null;
const completionCounter = document.getElementById('completion-counter') as HTMLElement | null;
const srAnnouncer = document.getElementById('sr-announcer') as HTMLElement | null;
const categoryBtns = document.querySelectorAll<HTMLButtonElement>('.category-btn');
const mobileSelect = document.getElementById('mobile-category-dropdown') as HTMLSelectElement | null;
const badgeAll = document.getElementById('badge-all') as HTMLElement | null;
const badgeWerk = document.getElementById('badge-werk') as HTMLElement | null;
const badgePersoonlijk = document.getElementById('badge-persoonlijk') as HTMLElement | null;
const badgeVrijeTijd = document.getElementById('badge-vrije-tijd') as HTMLElement | null;
const filterBtns = document.querySelectorAll<HTMLButtonElement>('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed-btn') as HTMLButtonElement | null;

function loadState(): void {
  try {
    const savedTodos = localStorage.getItem('vrcafe_todos');
    const savedCategory = localStorage.getItem('vrcafe_current_category');

    todos = savedTodos ? (JSON.parse(savedTodos) as Todo[]) : [...DEFAULT_TODOS];
    if (!savedTodos) saveState();

    if (savedCategory) {
      currentCategory = savedCategory;
      updateCategoryUI(currentCategory);
    }
  } catch {
    todos = [...DEFAULT_TODOS];
  }
}

function saveState(): void {
  try {
    localStorage.setItem('vrcafe_todos', JSON.stringify(todos));
    localStorage.setItem('vrcafe_current_category', currentCategory);
  } catch {
  }
}

function announce(message: string): void {
  if (srAnnouncer) srAnnouncer.textContent = message;
}

function updateCategoryUI(category: string): void {
  categoryBtns.forEach(btn => {
    const match = btn.getAttribute('data-category') === category;
    btn.classList.toggle('active', match);
    btn.setAttribute('aria-selected', String(match));
  });

  if (mobileSelect) mobileSelect.value = category;
  if (currentCategoryHeading) {
    currentCategoryHeading.textContent = category === 'all' ? 'All Tasks' : category;
  }
}

function updateMetrics(): void {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;

  if (completionCounter) completionCounter.textContent = `${completed} / ${total} completed`;
  if (badgeAll) badgeAll.textContent = String(total);
  if (badgeWerk) badgeWerk.textContent = String(todos.filter(t => t.category === 'Werk').length);
  if (badgePersoonlijk) badgePersoonlijk.textContent = String(todos.filter(t => t.category === 'Persoonlijk').length);
  if (badgeVrijeTijd) badgeVrijeTijd.textContent = String(todos.filter(t => t.category === 'Vrije tijd').length);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function render(focusId?: string): void {
  updateMetrics();

  const filtered = todos
    .filter(t => currentCategory === 'all' || t.category === currentCategory)
    .filter(t => {
      if (currentFilter === 'active') return !t.completed;
      if (currentFilter === 'completed') return t.completed;
      return true;
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return b.createdAt - a.createdAt;
    });

  if (!todoList) return;
  todoList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState?.classList.remove('hidden');
    todoList.classList.add('hidden');
    return;
  }

  emptyState?.classList.add('hidden');
  todoList.classList.remove('hidden');

  filtered.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item animate-slide-in${todo.completed ? ' completed' : ''}`;
    li.id = `todo-${todo.id}`;
    li.dataset.id = todo.id;

    const categorySlug = todo.category.replace(/\s+/g, '.');

    li.innerHTML = `
      <div class="todo-item-content" role="checkbox" aria-checked="${todo.completed}"
           tabindex="0" aria-label="Task: ${escapeHtml(todo.text)} (${todo.category})">
        <div class="custom-checkbox">
          <svg class="check-icon" viewBox="0 0 24 24">
            <path d="M20 6L9 17L4 12" />
          </svg>
        </div>
        <span class="todo-text">${escapeHtml(todo.text)}</span>
      </div>
      <div class="todo-meta">
        <span class="todo-item-category-badge ${categorySlug}">${todo.category}</span>
        <button class="delete-btn" aria-label="Delete task: ${escapeHtml(todo.text)}" title="Delete task">🗑️</button>
      </div>
    `;

    const contentEl = li.querySelector<HTMLElement>('.todo-item-content');
    const deleteBtn = li.querySelector<HTMLButtonElement>('.delete-btn');

    contentEl?.addEventListener('click', () => toggleTodo(todo.id));
    contentEl?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleTodo(todo.id); }
      else if (e.key === 'Delete') { e.preventDefault(); deleteTodo(todo.id, li); }
    });
    deleteBtn?.addEventListener('click', () => deleteTodo(todo.id, li));

    todoList.appendChild(li);

    if (focusId && todo.id === focusId) contentEl?.focus();
  });
}

function toggleTodo(id: string): void {
  todos = todos.map(t => {
    if (t.id !== id) return t;
    const next = !t.completed;
    announce(`Task "${t.text}" marked as ${next ? 'completed' : 'incomplete'}`);
    return { ...t, completed: next };
  });
  saveState();
  render(id);
}

function deleteTodo(id: string, item: HTMLElement): void {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  announce(`Task "${todo.text}" deleted`);

  const next = item.nextElementSibling?.querySelector<HTMLElement>('.todo-item-content')
            ?? item.previousElementSibling?.querySelector<HTMLElement>('.todo-item-content')
            ?? todoInput;

  item.classList.add('animate-fade-out-shrink');

  setTimeout(() => {
    todos = todos.filter(t => t.id !== id);
    saveState();
    render();
    next?.focus();
  }, 300);
}

function setCategory(category: string): void {
  currentCategory = category;
  saveState();
  updateCategoryUI(category);
  render();
  announce(`Viewing ${category === 'all' ? 'all' : category} category tasks`);
}

function setFilter(filter: 'all' | 'active' | 'completed'): void {
  currentFilter = filter;
  filterBtns.forEach(btn => {
    const match = btn.getAttribute('data-filter') === filter;
    btn.classList.toggle('active', match);
  });
  render();
  announce(`Filtering by ${filter} tasks`);
}

todoForm?.addEventListener('submit', e => {
  e.preventDefault();
  const text = todoInput?.value.trim() ?? '';
  const category = todoCategorySelect?.value ?? 'Werk';

  todoInput?.classList.remove('error-state');
  todoInput?.removeAttribute('aria-invalid');
  if (inputError) inputError.textContent = '';

  if (!text) {
    todoInput?.classList.add('error-state');
    todoInput?.setAttribute('aria-invalid', 'true');
    todoInput?.focus();
    if (inputError) inputError.textContent = 'Please enter a task description.';
    announce('Validation error: Task description cannot be empty.');
    return;
  }

  const newTodo: Todo = { id: Date.now().toString(), text, completed: false, category, createdAt: Date.now() };
  todos.push(newTodo);
  saveState();
  if (todoInput) todoInput.value = '';
  announce(`Task "${text}" added to ${category}`);
  render(newTodo.id);
});

categoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.getAttribute('data-category');
    if (cat) setCategory(cat);
  });
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.getAttribute('data-filter') as 'all' | 'active' | 'completed' | null;
    if (filter) setFilter(filter);
  });
});

clearCompletedBtn?.addEventListener('click', () => {
  const completedCount = todos.filter(t => t.completed).length;
  if (completedCount === 0) return;
  
  todos = todos.filter(t => !t.completed);
  saveState();
  render();
  announce(`Cleared ${completedCount} completed tasks`);
});

mobileSelect?.addEventListener('change', e => {
  setCategory((e.target as HTMLSelectElement).value);
});

todoInput?.addEventListener('input', () => {
  if (todoInput.value.trim()) {
    todoInput.classList.remove('error-state');
    todoInput.removeAttribute('aria-invalid');
    if (inputError) inputError.textContent = '';
  }
});

loadState();
render();
