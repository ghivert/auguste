import { useState, useRef, useCallback, useEffect } from 'react'
import { useSpotify, API } from './api'
import * as Card from '../components/card'
import { ComputerIcon } from './computer'
import { SmartphoneIcon } from './smartphone'
import styles from './Spotify.module.css'
import spotifyLogo from './spotify.png'

const useFetchPlayingSong = (spotify: API) => {
  const [playingSong, setPlayingSong] = useState<string>()
  const fetchPlayingSong = useCallback(async () => {
    const current: string = await spotify.me.player.currentlyPlaying()
    setPlayingSong(current)
    return current
  }, [spotify.me.player])
  return { playingSong, fetchPlayingSong }
}

const useFetchDevices = (spotify: API) => {
  const [devices, setDevices] = useState<string[]>([])
  const fetchDevices = useCallback(async (): Promise<string[]> => {
    const { devices } = await spotify.me.player.devices()
    setDevices(devices || [])
    return devices || []
  }, [spotify.me.player])
  return { devices, fetchDevices }
}

const useRefreshPlayingSong = (fetchPlayingSong: () => Promise<string>) => {
  const id = useRef<any>()
  // prettier-ignore
  const refresh = useCallback(song => {
    if (song) {
      const exec = async () => refresh(await fetchPlayingSong())
      const delta = song.item.duration_ms - song.progress_ms
      const songFinishOn = delta > 10000 ? 10000 : delta
      id.current = setTimeout(exec, songFinishOn)
    } else {
      id.current = undefined
    }
  }, [fetchPlayingSong])
  const clear = useCallback(() => clearTimeout(id.current), [])
  return { refresh, clear }
}

const useRelaunch = ({ fetchDevices, fetchPlayingSong, refresh }: any) => {
  const relaunch = useCallback(async () => {
    await fetchDevices()
    const song = await fetchPlayingSong()
    refresh(song)
  }, [fetchPlayingSong, fetchDevices, refresh])
  return relaunch
}

const useFirstSpotifyConnect = (params: any) => {
  const [myself, setMyself] = useState()
  const { spotify, fetchDevices, fetchPlayingSong, refresh, clear } = params
  useEffect(() => {
    const run = async () => {
      await spotify.me.profile().then(setMyself)
      await fetchDevices()
      await fetchPlayingSong().then(refresh)
    }
    if (spotify.logged) run()
    return clear
  }, [spotify, fetchPlayingSong, fetchDevices, refresh, clear])
  return myself
}

const useInitSpotify = (spotify: API) => {
  const { playingSong, fetchPlayingSong } = useFetchPlayingSong(spotify)
  const { devices, fetchDevices } = useFetchDevices(spotify)
  const { refresh, clear } = useRefreshPlayingSong(fetchPlayingSong)
  const relaunch = useRelaunch({ fetchDevices, fetchPlayingSong, refresh })
  const params = { spotify, fetchDevices, fetchPlayingSong, refresh, clear }
  const myself = useFirstSpotifyConnect(params)
  return { myself, playingSong, devices, relaunch }
}

type ConnectionProps = { spotify: API }
const Connection = ({ spotify }: ConnectionProps) => (
  <Card.Body center>
    <div className={styles.spotifyLogo}>
      <img src={spotifyLogo} alt="Spotify" />
    </div>
    <button className={styles.spotifyConnect} onClick={spotify.logIn}>
      Connect to Spotify
    </button>
  </Card.Body>
)

const onDeviceClick = ({ device, spotify, relaunch }: any) => {
  return async () => {
    await spotify.me.player.transfer(device.id)
    await new Promise(r => setTimeout(r, 100))
    await relaunch()
  }
}

const renderDevice = ({ spotify, relaunch }: any) => {
  return (device: any) => {
    const { is_active, type, name, id } = device
    const cl = is_active ? styles.activeDevice : styles.devicePill
    const onClick = onDeviceClick({ device, spotify, relaunch })
    return (
      <div key={id} className={cl} onClick={onClick}>
        {type === 'Computer' && <ComputerIcon className={styles.icon} />}
        {type === 'Smartphone' && <SmartphoneIcon className={styles.icon} />}
        {type !== 'Smartphone' && type !== 'Computer' && (
          <ComputerIcon className={styles.icon} />
        )}
        {name}
      </div>
    )
  }
}

const RenderProfile = ({ myself }: any) => {
  const src = myself?.images?.[0]?.url
  const name = myself?.display_name
  return (
    <div className={styles.profile}>
      <img src={src} alt="Profile" className={styles.profilePicture} />
      <div>{name}</div>
    </div>
  )
}

const RenderPlayingSong = ({ song }: any) => {
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

type MainProps = { spotify: API }
const Main = ({ spotify }: MainProps) => {
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

export const Spotify = () => {
  const spotify = useSpotify()
  const props = { spotify }
  const logged = spotify.logged
  return (
    <Card.Card className={styles.spotify}>
      <Card.Header title="Spotify" />
      {logged ? <Main {...props} /> : <Connection {...props} />}
    </Card.Card>
  )
}
