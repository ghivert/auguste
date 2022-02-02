import { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Bot } from './Bot'
import { Taskbar, Panel } from './taskbar'
import * as Card from './components/card'
import { Auguste } from './auguste'
import { Spotify } from './spotify'
import { toLocaleString } from './helpers/date'
import styles from './App.module.css'
import runArrow from './run-arrow.svg'

const Console = ({ lines, hide }: any) => {
  useEffect(() => {
    const fun = (event: KeyboardEvent) => {
      const isHider = event.code === 'Space' || event.code === 'Enter'
      if (isHider) hide()
    }
    document.addEventListener('keypress', fun)
    return () => document.removeEventListener('keypress', fun)
  }, [])
  return (
    <div className={styles.console}>
      {lines.map((line: any) => {
        const { value, date, path } = line
        if (value.stdout) {
          const id = value.stderr.length > 0 ? 'stderr' : 'stdout'
          const cl = styles[id]
          return (
            <>
              <code className={styles.dateConsole}>
                [{toLocaleString({ date })}]: node {path}
              </code>
              <code className={cl}>{value[id]}</code>
            </>
          )
        }
        return <code className={styles.stderr}>{JSON.stringify(value)}</code>
      })}
    </div>
  )
}

const Editor_ = ({ run, ...props }: any) => {
  useEffect(() => {
    const fun = (event: KeyboardEvent) => {
      if (event.code === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        run()
      }
    }
    document.addEventListener('keypress', fun)
    return () => document.removeEventListener('keypress', fun)
  }, [])
  return <Editor {...props} />
}

const TextEditor = () => {
  const codeRef = useRef<any>()
  const lineRef = useRef<any>()
  const [script, setScript] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [displayed, setDisplayed] = useState('editor')
  const sendToMainProcess = (code?: string) => {
    setScript(code ?? '')
    if (code) Auguste.save('monaco.js', code)
  }
  const saveLineNumber = () =>
    codeRef.current && (lineRef.current = codeRef.current?.getPosition())
  const run = async () => {
    saveLineNumber()
    const { path, value } = await Auguste.runScript('monaco.js')
    const date = new Date()
    setResults(res => [...res, { date, path, value }])
    setDisplayed('console')
  }
  useEffect(() => {
    Auguste.read('monaco.js').then(setScript)
  }, [])
  const isEditor = displayed === 'editor'
  const cl = isEditor ? styles.textEditor : styles.consoleWrapper
  const hideConsole = () => setDisplayed('editor')
  return (
    <Card.Card area="panel" className={cl}>
      <Card.Header className={styles.cardHeader} title="Run your scripts">
        <div className={styles.cardHeadersButtons}>
          <img
            className={styles.runArrow}
            src={runArrow}
            alt="Run"
            onClick={() => {
              setDisplayed(d => {
                const isEditor = d === 'editor'
                if (isEditor) saveLineNumber()
                return isEditor ? 'console' : 'editor'
              })
            }}
          />
          <img
            className={styles.runArrow}
            src={runArrow}
            alt="Run"
            onClick={run}
          />
        </div>
      </Card.Header>
      {isEditor && (
        <Editor_
          value={script}
          defaultLanguage="javascript"
          theme="vs-dark"
          onMount={(editor: any, _monaco: any) => {
            codeRef.current = editor
            console.log('maintenant', lineRef.current)
            if (lineRef.current) editor.setPosition(lineRef.current)
            editor.focus()
          }}
          onChange={sendToMainProcess}
          className={styles.monaco}
          run={run}
        />
      )}
      {!isEditor && <Console lines={results} hide={hideConsole} />}
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
