import { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Bot } from './Bot'
import { Taskbar } from './taskbar'
import * as Card from './components/card'
import { Auguste } from './auguste'
import { Spotify } from './spotify'
import styles from './App.module.css'
import runArrow from './run-arrow.svg'

const TextEditor = () => {
  const codeRef = useRef()
  const [script, setScript] = useState('')
  const onMount = (editor, _monaco) => (codeRef.current = editor)
  const sendToMainProcess = code => {
    setScript(code)
    Auguste.save('monaco.js', code)
  }
  const run = () => Auguste.runScript()
  useEffect(() => Auguste.read('monaco.js').then(setScript), [])
  useEffect(() => Auguste.onResult(console.log), [])
  return (
    <Card.Card area="panel" className={styles.textEditor}>
      <Card.Header className={styles.cardHeader} title="Run your scripts">
        <img
          className={styles.runArrow}
          src={runArrow}
          alt="Run"
          onClick={run}
        />
      </Card.Header>
      <Editor
        value={script}
        defaultLanguage="javascript"
        theme="vs-dark"
        onMount={onMount}
        onChange={sendToMainProcess}
        className={styles.monaco}
      />
    </Card.Card>
  )
}

const Dashboard = () => {
  return (
    <Card.Card area="panel" className={styles.dashboard}>
      <Card.Header title="Dashboard" />
      {false && <Spotify />}
    </Card.Card>
  )
}

const Settings = () => {
  return (
    <Card.Card area="panel">
      <Card.Header title="Settings" />
    </Card.Card>
  )
}

export const App = () => {
  const [panel, setPanel] = useState('dashboard')
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
