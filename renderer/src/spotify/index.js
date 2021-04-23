import { useState, useRef, useCallback, useEffect } from 'react'
import { useSpotify } from './api'
import Card from '../components/card'
import styles from './Spotify.module.css'
import spotifyLogo from './spotify.png'

const useFetchPlayingSong = ({ spotify }) => {
  const [playingSong, setPlayingSong] = useState()
  const fetchPlayingSong = useCallback(async () => {
    const current = await spotify.me.player.currentlyPlaying()
    setPlayingSong(current)
    return current
  }, [spotify.me.player])
  return { playingSong, fetchPlayingSong }
}

const useFetchDevices = ({ spotify }) => {
  const [devices, setDevices] = useState([])
  const fetchDevices = useCallback(async () => {
    const { devices } = await spotify.me.player.devices()
    setDevices(devices || [])
    return devices || []
  }, [spotify.me.player])
  return { devices, fetchDevices }
}

const useRefreshPlayingSong = ({ fetchPlayingSong }) => {
  const id = useRef(0)
  // prettier-ignore
  const refresh = useCallback(song => {
    if (song) {
      const exec = async () => refresh(await fetchPlayingSong())
      const delta = song.item.duration_ms - song.progress_ms
      const songFinishOn = delta > 10000 ? 10000 : delta
      id.current = setTimeout(exec, songFinishOn)
    } else {
      id.current = 0
    }
  }, [fetchPlayingSong])
  const clear = useCallback(() => clearTimeout(id.current), [])
  return { refresh, clear }
}

const useRelaunch = ({ fetchDevices, fetchPlayingSong, refresh }) => {
  const relaunch = useCallback(async () => {
    await fetchDevices()
    const song = await fetchPlayingSong()
    refresh(song)
  }, [fetchPlayingSong, fetchDevices, refresh])
  return relaunch
}

const useFirstSpotifyConnect = params => {
  const [myself, setMyself] = useState()
  const { spotify, fetchDevices, fetchPlayingSong, refresh, clear } = params
  useEffect(() => {
    const run = async () => {
      const fst = spotify.me.profile().then(setMyself)
      const snd = fetchDevices()
      const trd = fetchPlayingSong().then(refresh)
      await Promise.all([fst, snd, trd])
    }
    if (spotify.logged) run()
    return clear
  }, [spotify, fetchPlayingSong, fetchDevices, refresh, clear])
  return myself
}

const useInitSpotify = spotify => {
  const { playingSong, fetchPlayingSong } = useFetchPlayingSong({ spotify })
  const { devices, fetchDevices } = useFetchDevices({ spotify })
  const { refresh, clear } = useRefreshPlayingSong({ fetchPlayingSong })
  const relaunch = useRelaunch({ fetchDevices, fetchPlayingSong, refresh })
  const params = { spotify, fetchDevices, fetchPlayingSong, refresh, clear }
  const myself = useFirstSpotifyConnect(params)
  return { myself, playingSong, devices, relaunch }
}

const Connection = ({ spotify }) => (
  <Card.Body center>
    <div className={styles.spotifyLogo}>
      <img src={spotifyLogo} alt="Spotify" />
    </div>
    <button className={styles.spotifyConnect} onClick={spotify.logIn}>
      Connect to Spotify
    </button>
  </Card.Body>
)

const onDeviceClick = ({ device, spotify, relaunch }) => async () => {
  await spotify.me.player.transfer(device.id)
  await new Promise(r => setTimeout(r, 100))
  await relaunch()
}

const renderDevice = ({ spotify, relaunch }) => device => {
  const cl = device.is_active ? styles.activeDevice : styles.devicePill
  const onClick = onDeviceClick({ device, spotify, relaunch })
  return (
    <div key={device.id} className={cl} onClick={onClick}>
      {device.name}
    </div>
  )
}

const RenderProfile = ({ myself }) => {
  const src = myself?.images?.[0]?.url
  const name = myself?.display_name
  return (
    <div className={styles.profile}>
      <img src={src} alt="Profile" className={styles.profilePicture} />
      <div>{name}</div>
    </div>
  )
}

const RenderPlayingSong = ({ song }) => {
  const src = song.item.album.images[0].url
  const trackName = song.item.name
  const albumName = song.item.album.name
  const artistName = song.item.artists[0].name
  return (
    <div className={styles.playingSong}>
      <img src={src} className={styles.albumCover} alt="Cover" />
      <div className={styles.albumInfo}>
        <div className={styles.trackName}>{trackName}</div>
        <div className={styles.albumName}>{albumName}</div>
        <div className={styles.artistName}>{artistName}</div>
      </div>
    </div>
  )
}

const Main = ({ spotify }) => {
  const { myself, playingSong, devices, relaunch } = useInitSpotify(spotify)
  const render = renderDevice({ spotify, relaunch })
  return (
    <Card.Body>
      <RenderProfile myself={myself} />
      <div className={styles.devices}>{devices.map(render)}</div>
      {playingSong && <RenderPlayingSong song={playingSong} />}
    </Card.Body>
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

export default Spotify