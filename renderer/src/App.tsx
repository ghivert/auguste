import { useState, useRef, useEffect } from 'react'
import { Bot } from './Bot'
import { Taskbar, Panel } from './taskbar'
import * as Card from './components/card'
import { Spotify } from './spotify'
import styles from './App.module.css'
import { TextEditor } from './components/editor'

const Dashboard = () => (
  <Card.Card area="panel" className={styles.dashboard}>
    <Card.Header title="Dashboard" />
    {false && <Spotify />}
  </Card.Card>
)

const Settings = () => (
  <Card.Card area="panel">
    <Card.Header title="Settings" />
  </Card.Card>
)

export const App = () => {
  const [panel, setPanel] = useState<Panel>('dashboard')
  return (
    <div className={styles.main}>
      <Taskbar activePanel={panel} onIconClick={setPanel} />
      <Bot />
      {panel === 'editor' && <TextEditor />}
      {panel === 'dashboard' && <Dashboard />}
      {panel === 'settings' && <Settings />}
    </div>
  )
}
