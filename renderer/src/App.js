import { Fragment, useState, useRef, useEffect, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import Bot from './Bot'
import styles from './App.module.css'
import runArrow from './run-arrow.svg'
import Taskbar from './taskbar'
import Card from './components/card'
import spotifyLogo from './spotify.png'
import Auguste from './auguste'
import { useSpotify } from './spotify'

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

const Connection = ({ spotify }) => (
  <div className={styles.cardBodyCenter}>
    <div className={styles.spotifyLogo}>
      <img src={spotifyLogo} alt="Spotify" />
    </div>
    <button className={styles.spotifyConnect} onClick={spotify.logIn}>
      Connect to Spotify
    </button>
  </div>
)

const useInitSpotify = spotify => {
  const [myself, setMyself] = useState()
  const [playingSong, setPlayingSong] = useState()
  const [devices, setDevices] = useState([])
  const id = useRef(0)
  const fetchPlayingSong = useCallback(async () => {
    const current = await spotify.me.player.currentlyPlaying()
    setPlayingSong(current)
    return current
  }, [spotify.me.player])
  const fetchDevices = useCallback(async () => {
    const { devices } = await spotify.me.player.devices()
    setDevices(devices || [])
  }, [spotify.me.player])
  const recur = useCallback(
    song => {
      if (song) {
        const exec = async () => recur(await fetchPlayingSong())
        const delta = song.item.duration_ms - song.progress_ms
        const songFinishOn = delta > 10000 ? 10000 : delta
        id.current = setTimeout(exec, songFinishOn)
      } else {
        id.current = 0
      }
    },
    [fetchPlayingSong]
  )
  const relaunch = useCallback(async () => {
    await fetchDevices()
    const song = await fetchPlayingSong()
    recur(song)
  }, [fetchPlayingSong, fetchDevices, recur])
  useEffect(() => {
    const run = async () => {
      const my = await spotify.me.profile()
      setMyself(my)
      await fetchDevices()
      const song = await fetchPlayingSong()
      recur(song)
    }
    if (spotify.logged) run()
    return () => clearTimeout(id.current)
  }, [spotify, fetchPlayingSong, fetchDevices, recur])
  return { myself, playingSong, devices, relaunch }
}

const Main = ({ spotify }) => {
  const { myself, playingSong, devices, relaunch } = useInitSpotify(spotify)
  return (
    <div className={styles.cardBody}>
      <div className={styles.profile}>
        <img
          src={myself?.images?.[0]?.url}
          alt="Profile"
          className={styles.profilePicture}
        />
        <div>{myself?.display_name}</div>
      </div>
      <div className={styles.devices}>
        {devices.map(device => {
          const onClick = async () => {
            await spotify.me.player.transfer(device.id)
            await new Promise(r => setTimeout(r, 100))
            await relaunch()
          }
          const cl = device.is_active ? styles.activeDevice : styles.devicePill
          return (
            <div className={cl} onClick={onClick}>
              {device.name}
            </div>
          )
        })}
      </div>
      {playingSong && (
        <div className={styles.playingSong}>
          <img
            src={playingSong.item.album.images[0].url}
            className={styles.albumCover}
            alt="Cover"
          />
          <div className={styles.albumInfo}>
            <div className={styles.trackName}>{playingSong.item.name}</div>
            <div className={styles.albumName}>
              {playingSong.item.album.name}
            </div>
            <div className={styles.artistName}>
              {playingSong.item.artists[0].name}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const Spotify = () => {
  const spotify = useSpotify()
  const props = { spotify }
  const logged = spotify.logged
  return (
    <Card className={styles.spotify}>
      <Card.Header title="Spotify" />
      {logged ? <Main {...props} /> : <Connection {...props} />}
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
