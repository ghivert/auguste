import { useState, useRef, useEffect } from 'react'
import { Bot } from './Bot'
import { Taskbar, Panel } from './taskbar'
import * as Card from './components/card'
import { Spotify } from './spotify'
import styles from './App.module.css'
import { TextEditor } from './components/editor'
import { Settings } from './components/settings'

const Dashboard = () => (
  <Card.Card area="panel" className={styles.dashboard}>
    <Card.Header title="Dashboard" />
    {false && <Spotify />}
  </Card.Card>
)

export const App = () => {
  const [panel, setPanel] = useState<Panel>('settings')
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
