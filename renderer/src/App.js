import { Fragment, useState, useRef, useEffect, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import Bot from './Bot'
import styles from './App.module.css'
import runArrow from './run-arrow.svg'
import Taskbar from './taskbar'
import Card from './components/card'
import Auguste from './auguste'
import Spotify from './spotify'

const TextEditor = () => {
  const codeRef = useRef()
  const [script, setScript] = useState('')
  const onMount = (editor, monaco) => (codeRef.current = editor)
  const sendToMainProcess = code => {
    setScript(code)
    Auguste.save('monaco.js', code)
  }
  const run = () => Auguste.runScript()
  useEffect(() => Auguste.read('monaco.js').then(setScript), [])
  useEffect(() => Auguste.onResult(console.log), [])
  return (
    <Card area="panel" className={styles.textEditor}>
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
    </Card>
  )
}

const Dashboard = () => {
  return (
    <Card area="panel" className={styles.dashboard}>
      <Card.Header title="Dashboard" />
      <Spotify />
    </Card>
  )
}

const Settings = () => {
  return (
    <Card area="panel">
      <Card.Header title="Settings" />
    </Card>
  )
}

const App = () => {
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

export default App
