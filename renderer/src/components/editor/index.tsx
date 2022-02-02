import {
  Fragment,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import Monaco, { EditorProps } from '@monaco-editor/react'
import * as Card from '../card'
import { Auguste } from '../../auguste'
import { toLocaleString } from '../../helpers/date'
import styles from './editor.module.css'
import runArrow from './run-arrow.svg'
import console from './console.svg'

type Options = { prevent?: boolean; cmd?: boolean }
const useKeypress = (
  keys: string | string[],
  cb: () => void,
  options?: Options
) => {
  useEffect(() => {
    const fun = (event: KeyboardEvent) => {
      const keys_ = [keys].flat()
      const isCmd = event.ctrlKey || event.metaKey
      if (!keys_.includes(event.code)) return
      if (options?.cmd && !isCmd) return
      if (options?.prevent) event.preventDefault()
      cb()
    }
    document.addEventListener('keypress', fun)
    return () => document.removeEventListener('keypress', fun)
  }, [keys, options?.prevent, options?.cmd, cb])
}

const renderLine = (line: any) => {
  const { value, date, path } = line
  if (value.stdout) {
    const id = value.stderr.length > 0 ? 'stderr' : 'stdout'
    const cl = styles[id]
    const cmd = `[${toLocaleString({ date })}]: node ${path}`
    return (
      <Fragment>
        <code className={styles.dateConsole}>{cmd}</code>
        <code className={cl}>{value[id]}</code>
      </Fragment>
    )
  }
  return <code className={styles.stderr}>{JSON.stringify(value)}</code>
}

const Console = ({ lines, hide }: any) => {
  const keys = useMemo(() => ['Space', 'Enter'], [])
  useKeypress(keys, hide)
  return <div className={styles.console}>{lines.map(renderLine)}</div>
}

const Editor = ({ run, ...props }: EditorProps & { run: () => void }) => {
  useKeypress('Enter', run, { prevent: true, cmd: true })
  return <Monaco {...props} />
}

const useScript = () => {
  const [script, setScript] = useState('')
  useEffect(() => {
    Auguste.read('monaco.js').then(setScript)
  }, [])
  return { script, setScript }
}

export const TextEditor = () => {
  const codeRef = useRef<any>()
  const lineRef = useRef<any>()
  const { script, setScript } = useScript()
  const [results, setResults] = useState<any[]>([])
  const [displayed, setDisplayed] = useState('editor')
  const sendToMainProcess = (code?: string) => {
    if (code) {
      setScript(code)
      Auguste.save('monaco.js', code)
    }
  }
  const saveLineNumber = () => {
    if (codeRef.current) {
      const position = codeRef.current?.getPosition()
      lineRef.current = position
    }
  }
  const run = async () => {
    saveLineNumber()
    const { path, value } = await Auguste.runScript('monaco.js')
    const date = new Date()
    setResults(res => [...res, { date, path, value }])
    setDisplayed('console')
  }
  const onMount = (editor: any, _monaco: any) => {
    codeRef.current = editor
    if (lineRef.current) editor.setPosition(lineRef.current)
    editor.focus()
  }
  const isEditor = displayed === 'editor'
  const switchDisplay = () => {
    setDisplayed(d => {
      const isEditor = d === 'editor'
      if (isEditor) saveLineNumber()
      return isEditor ? 'console' : 'editor'
    })
  }
  const hideConsole = useCallback(() => setDisplayed('editor'), [])
  const cl = isEditor ? styles.textEditor : styles.consoleWrapper
  return (
    <Card.Card area="panel" className={cl}>
      <Card.Header className={styles.cardHeader} title="Run your scripts">
        <div className={styles.cardHeadersButtons}>
          <img
            className={styles.consoleSvg}
            src={console}
            alt="Console"
            onClick={switchDisplay}
            style={{ opacity: isEditor ? undefined : 0.2 }}
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
        <Editor
          value={script}
          defaultLanguage="javascript"
          theme="vs-dark"
          onMount={onMount}
          onChange={sendToMainProcess}
          className={styles.monaco}
          run={run}
        />
      )}
      {!isEditor && <Console lines={results} hide={hideConsole} />}
    </Card.Card>
  )
}
