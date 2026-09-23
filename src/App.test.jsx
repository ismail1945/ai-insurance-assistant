import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { STORAGE_KEYS } from './storage'

const setStoredTasks = (tasks) => {
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks))
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads existing tasks from localStorage and shows remaining count', () => {
    setStoredTasks([
      {
        id: '1',
        title: 'Saved task',
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: '',
        priority: 'medium',
      },
    ])

    render(<App />)

    expect(screen.getByText('Saved task')).toBeInTheDocument()
    expect(screen.getByText('1 task(s) remaining')).toBeInTheDocument()
  })

  it('validates blank task titles', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Task title is required.')
  })

  it('adds a task and persists it to localStorage', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.type(screen.getByLabelText('Task title'), 'Pay electricity bill')
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(screen.getByText('Pay electricity bill')).toBeInTheDocument()

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks))
      expect(stored).toHaveLength(1)
      expect(stored[0].title).toBe('Pay electricity bill')
    })
  })

  it('clears completed tasks', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.type(screen.getByLabelText('Task title'), 'One')
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Clear completed' }))

    expect(screen.getByText('No tasks yet. Add your first task above.')).toBeInTheDocument()
  })
})
