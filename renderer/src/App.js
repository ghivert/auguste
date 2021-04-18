import { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import Bot from './Bot'
import styles from './App.module.css'
import runArrow from './run-arrow.svg'
// import { parseTmTheme } from 'monaco-themes'
// import oneDark from './one-dark'

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
    <div className={styles.textEditor} onKeyPress={console.log}>
      <div className={styles.cardHeader}>
        Run your scripts
        <img
          className={styles.runArrow}
          src={runArrow}
          alt="Run"
          onClick={run}
        />
      </div>
      <Editor
        defaultLanguage="javascript"
        theme="vs-dark"
        beforeMount={beforeMount}
        onMount={onMount}
        onChange={sendToMainProcess}
        className={styles.monaco}
      />
    </div>
  )
}

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

const App = () => (
  <div className={styles.main}>
    <Bot />
    <TextEditor />
    <Clock />
  </div>
)

export default App
