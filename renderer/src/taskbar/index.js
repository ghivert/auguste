import { useState, useEffect } from 'react'
import { EditorIcon } from './icons/editor'
import { DashboardIcon } from './icons/dashboard'
import { SettingsIcon } from './icons/settings'
import styles from './Taskbar.module.css'

const prependZero = value => {
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

const Spacer = ({ size }) => {
  const options = { xl: 36, l: 24, m: 12 }
  const s = options[size] ?? 12
  const style = { paddingTop: s, paddingLeft: s }
  return <div style={style} />
}

export const Taskbar = ({ activePanel, onIconClick }) => {
  const dashColor = activePanel === 'dashboard' ? '' : '-disabled'
  const editorColor = activePanel === 'editor' ? '' : '-disabled'
  const settingsColor = activePanel === 'settings' ? '' : '-disabled'
  return (
    <div className={styles.taskbar}>
      <DashboardIcon
        className={styles.icon}
        color={`var(--icon-color${dashColor})`}
        onClick={() => onIconClick('dashboard')}
      />
      <Spacer size="xl" />
      <EditorIcon
        className={styles.icon}
        color={`var(--icon-color${editorColor})`}
        onClick={() => onIconClick('editor')}
      />
      <Spacer size="xl" />
      <Clock />
      <Spacer size="xl" />
      <SettingsIcon
        className={styles.icon}
        color={`var(--icon-color${settingsColor})`}
        onClick={() => onIconClick('settings')}
      />
    </div>
  )
}
