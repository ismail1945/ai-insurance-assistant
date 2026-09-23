import { useMemo, useState } from 'react'
import './App.css'
import { loadFilter, loadTasks, saveFilter, saveTasks } from './storage'

const FILTERS = ['all', 'active', 'completed']
const PRIORITIES = ['low', 'medium', 'high']

const createTaskId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function App() {
  const [tasks, setTasks] = useState(() => loadTasks())
  const [filter, setFilter] = useState(() => loadFilter())
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [error, setError] = useState('')

  const filteredTasks = useMemo(() => {
    if (filter === 'active') {
      return tasks.filter((task) => !task.completed)
    }

    if (filter === 'completed') {
      return tasks.filter((task) => task.completed)
    }

    return tasks
  }, [filter, tasks])

  const remainingCount = tasks.filter((task) => !task.completed).length
  const completedCount = tasks.length - remainingCount

  const updateTasks = (nextTasks) => {
    setTasks(nextTasks)
    saveTasks(nextTasks)
  }

  const updateFilter = (nextFilter) => {
    setFilter(nextFilter)
    saveFilter(nextFilter)
  }

  const resetForm = () => {
    setTitle('')
    setDueDate('')
    setPriority('medium')
  }

  const handleAddTask = (event) => {
    event.preventDefault()
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setError('Task title is required.')
      return
    }

    const nextTasks = [
      {
        id: createTaskId(),
        title: trimmedTitle,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate,
        priority,
      },
      ...tasks,
    ]

    updateTasks(nextTasks)
    setError('')
    resetForm()
  }

  const toggleTask = (id) => {
    const nextTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task,
    )
    updateTasks(nextTasks)
  }

  const deleteTask = (id) => {
    const nextTasks = tasks.filter((task) => task.id !== id)
    updateTasks(nextTasks)
  }

  const beginEdit = (task) => {
    setEditingId(task.id)
    setEditTitle(task.title)
    setError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  const saveEdit = (id) => {
    const trimmedTitle = editTitle.trim()

    if (!trimmedTitle) {
      setError('Task title cannot be blank.')
      return
    }

    const nextTasks = tasks.map((task) =>
      task.id === id ? { ...task, title: trimmedTitle } : task,
    )

    updateTasks(nextTasks)
    setError('')
    cancelEdit()
  }

  const clearCompleted = () => {
    const nextTasks = tasks.filter((task) => !task.completed)
    updateTasks(nextTasks)
  }

  return (
    <main className="app">
      <section className="todo-card" aria-labelledby="todo-heading">
        <header className="header">
          <h1 id="todo-heading">To-Do List</h1>
          <p className="subtext">Track what matters, one task at a time.</p>
        </header>

        <form className="task-form" onSubmit={handleAddTask}>
          <label htmlFor="task-title">Task title</label>
          <input
            id="task-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What do you need to do?"
            aria-describedby={error ? 'form-error' : undefined}
          />

          <div className="field-row">
            <div>
              <label htmlFor="task-due-date">Due date (optional)</label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                {PRIORITIES.map((option) => (
                  <option key={option} value={option}>
                    {option[0].toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="primary-btn">
            Add task
          </button>
        </form>

        {error && (
          <p id="form-error" className="error" role="alert">
            {error}
          </p>
        )}

        <section className="controls" aria-label="Task controls">
          <p>{remainingCount} task(s) remaining</p>
          <div className="filters" role="tablist" aria-label="Filter tasks">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                className={filter === item ? 'filter active' : 'filter'}
                onClick={() => updateFilter(item)}
                role="tab"
                aria-selected={filter === item}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="ghost-btn"
            onClick={clearCompleted}
            disabled={completedCount === 0}
          >
            Clear completed
          </button>
        </section>

        {tasks.length === 0 ? (
          <p className="empty">No tasks yet. Add your first task above.</p>
        ) : filteredTasks.length === 0 ? (
          <p className="empty">No tasks in this view.</p>
        ) : (
          <ul className="task-list" aria-label="Task list">
            {filteredTasks.map((task) => (
              <li key={task.id} className={task.completed ? 'task completed' : 'task'}>
                <label className="check-wrap">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.title} as ${task.completed ? 'active' : 'completed'}`}
                  />
                  <span className="task-title-wrap">
                    {editingId === task.id ? (
                      <input
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            saveEdit(task.id)
                          }
                          if (event.key === 'Escape') {
                            cancelEdit()
                          }
                        }}
                        aria-label="Edit task title"
                        autoFocus
                      />
                    ) : (
                      <span className="task-title">{task.title}</span>
                    )}
                    <span className="task-meta">
                      Created {new Date(task.createdAt).toLocaleString()}
                      {task.dueDate ? ` • Due ${task.dueDate}` : ''}
                      {task.priority ? ` • ${task.priority} priority` : ''}
                    </span>
                  </span>
                </label>

                <div className="task-actions">
                  {editingId === task.id ? (
                    <>
                      <button type="button" onClick={() => saveEdit(task.id)}>
                        Save
                      </button>
                      <button type="button" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => beginEdit(task)}>
                      Edit
                    </button>
                  )}
                  <button type="button" onClick={() => deleteTask(task.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
