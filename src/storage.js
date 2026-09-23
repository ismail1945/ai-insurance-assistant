export const STORAGE_KEYS = {
  tasks: 'todo.tasks',
  filter: 'todo.filter',
}

const isObject = (value) => value !== null && typeof value === 'object'

const normalizeTask = (task) => {
  if (!isObject(task) || typeof task.title !== 'string') {
    return null
  }

  return {
    id: String(task.id ?? ''),
    title: task.title.trim(),
    completed: Boolean(task.completed),
    createdAt: typeof task.createdAt === 'string' ? task.createdAt : new Date().toISOString(),
    dueDate: typeof task.dueDate === 'string' ? task.dueDate : '',
    priority: typeof task.priority === 'string' ? task.priority : 'medium',
  }
}

export const loadTasks = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.tasks)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map(normalizeTask)
      .filter((task) => task && task.id && task.title)
  } catch {
    return []
  }
}

export const saveTasks = (tasks) => {
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks))
}

const validFilters = new Set(['all', 'active', 'completed'])

export const loadFilter = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.filter)
    return validFilters.has(stored) ? stored : 'all'
  } catch {
    return 'all'
  }
}

export const saveFilter = (filter) => {
  localStorage.setItem(STORAGE_KEYS.filter, filter)
}
