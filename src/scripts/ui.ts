import { getTodos, getCurrentCategory, getCurrentFilter } from './store';

// DOM Elements
export const elements = {
  todoForm: document.getElementById('todo-form') as HTMLFormElement | null,
  todoInput: document.getElementById('todo-input') as HTMLInputElement | null,
  todoCategorySelect: document.getElementById('todo-category-select') as HTMLSelectElement | null,
  todoList: document.getElementById('todo-list') as HTMLUListElement | null,
  emptyState: document.getElementById('empty-state') as HTMLElement | null,
  inputError: document.getElementById('input-error') as HTMLElement | null,
  currentCategoryHeading: document.getElementById('current-category-heading') as HTMLElement | null,
  completionCounter: document.getElementById('completion-counter') as HTMLElement | null,
  srAnnouncer: document.getElementById('sr-announcer') as HTMLElement | null,
  categoryBtns: document.querySelectorAll<HTMLButtonElement>('.category-btn'),
  mobileSelect: document.getElementById('mobile-category-dropdown') as HTMLSelectElement | null,
  badgeAll: document.getElementById('badge-all') as HTMLElement | null,
  badgeWerk: document.getElementById('badge-werk') as HTMLElement | null,
  badgePersoonlijk: document.getElementById('badge-persoonlijk') as HTMLElement | null,
  badgeVrijeTijd: document.getElementById('badge-vrije-tijd') as HTMLElement | null,
  filterBtns: document.querySelectorAll<HTMLButtonElement>('.filter-btn'),
  clearCompletedBtn: document.getElementById('clear-completed-btn') as HTMLButtonElement | null,
  deleteModal: document.getElementById('delete-modal') as HTMLDialogElement | null,
  confirmDeleteBtn: document.getElementById('confirm-delete-btn') as HTMLButtonElement | null,
  cancelDeleteBtn: document.getElementById('cancel-delete-btn') as HTMLButtonElement | null
};

export function announce(message: string): void {
  if (elements.srAnnouncer) elements.srAnnouncer.textContent = message;
}

export function updateCategoryUI(category: string): void {
  elements.categoryBtns.forEach(btn => {
    const match = btn.getAttribute('data-category') === category;
    btn.classList.toggle('active', match);
    btn.setAttribute('aria-selected', String(match));
  });

  if (elements.mobileSelect) {
    elements.mobileSelect.value = category;
    const wrapper = elements.mobileSelect.closest('.custom-select-wrapper');
    if (wrapper) {
      const triggerSpan = wrapper.querySelector('.custom-select-trigger span');
      if (triggerSpan) {
        triggerSpan.textContent = elements.mobileSelect.options[elements.mobileSelect.selectedIndex]?.text || '';
      }
      wrapper.querySelectorAll('.custom-select-option').forEach(el => {
        const match = (el as HTMLElement).dataset.value === category;
        el.classList.toggle('selected', match);
        el.setAttribute('aria-selected', String(match));
      });
    }
  }
  if (elements.currentCategoryHeading) {
    elements.currentCategoryHeading.textContent = category === 'all' ? 'All Tasks' : category;
  }
}

export function updateFilterUI(filter: string): void {
  elements.filterBtns.forEach(btn => {
    const match = btn.getAttribute('data-filter') === filter;
    btn.classList.toggle('active', match);
  });
}

export function updateMetrics(): void {
  const todos = getTodos();
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;

  if (elements.completionCounter) elements.completionCounter.textContent = `${completed} / ${total} completed`;
  if (elements.badgeAll) elements.badgeAll.textContent = String(total);
  if (elements.badgeWerk) elements.badgeWerk.textContent = String(todos.filter(t => t.category === 'Werk').length);
  if (elements.badgePersoonlijk) elements.badgePersoonlijk.textContent = String(todos.filter(t => t.category === 'Persoonlijk').length);
  if (elements.badgeVrijeTijd) elements.badgeVrijeTijd.textContent = String(todos.filter(t => t.category === 'Vrije tijd').length);
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function render(
  onToggle: (id: string) => void,
  onDeleteRequest: (id: string, item: HTMLElement) => void,
  focusId?: string
): void {
  updateMetrics();
  
  const todos = getTodos();
  const currentCategory = getCurrentCategory();
  const currentFilter = getCurrentFilter();

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

  if (!elements.todoList) return;
  elements.todoList.innerHTML = '';

  if (filtered.length === 0) {
    elements.emptyState?.classList.remove('hidden');
    elements.todoList.classList.add('hidden');
    return;
  }

  elements.emptyState?.classList.add('hidden');
  elements.todoList.classList.remove('hidden');

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

    contentEl?.addEventListener('click', () => onToggle(todo.id));
    contentEl?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggle(todo.id); }
      else if (e.key === 'Delete') { e.preventDefault(); onDeleteRequest(todo.id, li); }
    });
    deleteBtn?.addEventListener('click', () => onDeleteRequest(todo.id, li));

    elements.todoList!.appendChild(li);

    if (focusId && todo.id === focusId) contentEl?.focus();
  });
}

export function initCustomDropdowns(): void {
  const selects = [elements.mobileSelect, elements.todoCategorySelect];
  
  selects.forEach(select => {
    if (!select) return;
    
    // Prevent double initialization
    if (select.classList.contains('hidden-select')) return;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    
    const triggerSpan = document.createElement('span');
    triggerSpan.textContent = select.options[select.selectedIndex]?.text || '';
    trigger.appendChild(triggerSpan);
    
    const optionsList = document.createElement('ul');
    optionsList.className = 'custom-select-options';
    optionsList.role = 'listbox';
    
    Array.from(select.options).forEach(opt => {
      const li = document.createElement('li');
      li.className = 'custom-select-option';
      li.role = 'option';
      li.tabIndex = -1; // Keep list elements not directly tabbable, navigate with arrow keys or click
      li.dataset.value = opt.value;
      li.textContent = opt.text;
      li.setAttribute('aria-selected', String(opt.selected));
      if (opt.selected) {
        li.classList.add('selected');
      }
      
      li.addEventListener('click', (e) => {
        e.stopPropagation();
        select.value = opt.value;
        triggerSpan.textContent = opt.text;
        
        optionsList.querySelectorAll('.custom-select-option').forEach(el => {
          el.classList.remove('selected');
          el.setAttribute('aria-selected', 'false');
        });
        li.classList.add('selected');
        li.setAttribute('aria-selected', 'true');
        
        // Dispatch event
        select.dispatchEvent(new Event('change', { bubbles: true }));
        
        wrapper.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      });
      
      optionsList.appendChild(li);
    });
    
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('open');
      // Close all custom selects
      document.querySelectorAll('.custom-select-wrapper').forEach(w => {
        w.classList.remove('open');
        w.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded', 'false');
      });
      
      if (!isOpen) {
        wrapper.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
    
    // Close on outside click
    document.addEventListener('click', () => {
      wrapper.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    });
    
    // Keyboard navigation
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        wrapper.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
    
    // Insert wrapper in DOM
    select.parentNode?.insertBefore(wrapper, select);
    wrapper.appendChild(select); // move native select inside wrapper
    wrapper.appendChild(trigger);
    wrapper.appendChild(optionsList);
    
    // Hide native select visually
    select.classList.add('hidden-select');
  });
}
