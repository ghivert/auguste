import { useState, useEffect } from 'react'
import * as icons from '../icons'
import { Spacer } from '../components/spacer'
import styles from './Taskbar.module.css'

const prependZero = (value: number) => {
  if (value < 10) {
    return `0${value}`
  } else {
    return value.toString()
  }
}

const Clock = () => {
  const [hour, setHour] = useState(new Date())
  useEffect(() => {
    const value = setInterval(() => setHour(new Date()), 1000)
    return () => clearInterval(value)
  }, [])
  const hours = prependZero(hour.getHours())
  const minutes = prependZero(hour.getMinutes())
  return <code className={styles.clock}>{[hours, minutes].join(' : ')}</code>
}

export type Panel = 'dashboard' | 'editor' | 'settings'
export type Props = { activePanel: Panel; onIconClick: (panel: Panel) => void }
export const Taskbar = ({ activePanel, onIconClick }: Props) => {
  const dashColor = activePanel === 'dashboard' ? '' : '-disabled'
  const editorColor = activePanel === 'editor' ? '' : '-disabled'
  const settingsColor = activePanel === 'settings' ? '' : '-disabled'
  return (
    <div className={styles.taskbar}>
      <icons.Dashboard
        className={styles.icon}
        color={`var(--icon-color${dashColor})`}
        onClick={() => onIconClick('dashboard')}
      />
      <Spacer size="xl" />
      <icons.Editor
        className={styles.icon}
        color={`var(--icon-color${editorColor})`}
        onClick={() => onIconClick('editor')}
      />
      <Spacer size="xl" />
      <Clock />
      <Spacer size="xl" />
      <icons.Settings
        className={styles.icon}
        color={`var(--icon-color${settingsColor})`}
        onClick={() => onIconClick('settings')}
      />
    </div>
  )
}
