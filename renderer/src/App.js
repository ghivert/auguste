import { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import Bot from './Bot'
import styles from './App.module.css'
import runArrow from './run-arrow.svg'
// import { parseTmTheme } from 'monaco-themes'
// import oneDark from './one-dark'
import Taskbar from './taskbar'
import Card from './components/card'

const TextEditor = () => {
  const codeRef = useRef()
  const beforeMount = monaco => {
    // const theme = parseTmTheme(oneDark)
    // monaco.editor.defineTheme('one-dark', theme)
  }
  const onMount = (editor, monaco) => (codeRef.current = editor)
  const sendToMainProcess = code => window.electron.saveScript(code)
  const run = () => window.electron.runScript()
  useEffect(() => {
    const canceler = window.electron.onResult(console.log)
    return canceler
  }, [])
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
        defaultLanguage="javascript"
        theme="vs-dark"
        beforeMount={beforeMount}
        onMount={onMount}
        onChange={sendToMainProcess}
        className={styles.monaco}
      />
    </Card>
  )
}

const Dashboard = () => {
  return (
    <Card area="panel">
      <Card.Header title="Dashboard" />
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
