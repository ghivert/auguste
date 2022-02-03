import { Fragment, useState, useEffect, useRef } from 'react'
import { Auguste, Wallet } from '../../auguste'
import * as Card from '../card'
import { Spacer } from '../spacer'
import { Loader } from '../loader'
import { Button } from '../button'
import * as icons from '../../icons'
import styles from './settings.module.css'

const renderItem = ({ page, setPage }: any) => {
  return ({ item, icon }: any) => {
    const cl = page === item ? styles.activeMenuItem : styles.menuItem
    const onClick = () => setPage(item)
    // @ts-ignore
    const Icon = icons[icon]
    return (
      <button key={item} onClick={onClick} className={cl}>
        <div className={styles.menuItemIcon}>
          <Icon />
        </div>
        {item}
      </button>
    )
  }
}

const cItem = (item: string, icon: string) => ({ item, icon })
const Menu = ({ page, setPage }: any) => {
  const items = [
    cItem('account', 'Identity'),
    // cItem('packages', 'Identity'),
    // cItem('about', 'Identity'),
  ]
  return (
    <Card.Card area="menu" className={styles.menu}>
      <Spacer size="m" />
      {items.map(renderItem({ page, setPage }))}
    </Card.Card>
  )
}

const OR = () => (
  <div className={styles.orWrapper}>
    <div className={styles.orLine} />
    OR
    <div className={styles.orLine} />
  </div>
)

const GenerateAccount = (props: any) => {
  const {
    privateKey,
    setPrivateKey,
    mnemonic,
    setMnemonic,
    generateWallet,
    error,
  } = props
  return (
    <div className={styles.accountWrapper}>
      <div className={styles.titleAccount}>
        You don't have any account configured
      </div>
      <div className={styles.callout}>
        <div className={styles.calloutInfo} />
        <div className={styles.calloutContent}>
          In order to configure your account, Auguste is using the same system
          as Ethereum: any valid Ethereum wallet is a valid Auguste account. You
          can provide your own private key or mnemonic, or generate a new wallet
          from scratch. If you're not used with Ethereum wallet, you just have
          to remember that your account will be unique with a long sequence of
          alphanumeric characters, and that you'll be the only one able to
          access it. If you lose the key, you'll lose access to your wallet.
        </div>
      </div>
      {!error && <Spacer size="m" />}
      {error && (
        <Fragment>
          <div className={styles.callout}>
            <div className={styles.calloutWarning} />
            <div className={styles.calloutContent}>{error}</div>
          </div>
        </Fragment>
      )}
      <div className={styles.cardWallet}>
        <div className={styles.cardWalletTitle}>Enter your private key</div>
        <form
          onSubmit={event => {
            event.preventDefault()
            if (privateKey.length !== 64) generateWallet('privateKey')
          }}
          className={styles.inputWrapper}
        >
          <input
            value={privateKey}
            onChange={event => {
              const { value } = event.target
              const idx = value.startsWith('0x') ? 2 : 0
              setPrivateKey(event.target.value.trim().slice(idx, 64 + idx))
            }}
            className={styles.cardWalletInput}
            type="text"
            placeholder="43872d8a9bf64c11b687cab4ee4d8f0b15cce35ed8e7f43fa8df06c8825df1c7"
          />
          <Button
            disabled={privateKey.length !== 64}
            onClick={generateWallet('privateKey')}
          >
            Submit
          </Button>
        </form>
      </div>
      <OR />
      <div className={styles.cardWallet}>
        <div className={styles.cardWalletTitle}>Enter your mnemonic</div>
        <form
          onSubmit={event => {
            event.preventDefault()
            if (mnemonic.split(' ').length !== 12) generateWallet('mnemonic')
          }}
          className={styles.inputWrapper}
        >
          <input
            value={mnemonic}
            onChange={event => setMnemonic(event.target.value.trim())}
            className={styles.cardWalletInput}
            type="text"
            placeholder="slush employ net gun silver fat crisp antique health orphan gaze drill"
          />
          <Button
            disabled={mnemonic.split(' ').length !== 12}
            onClick={generateWallet('mnemonic')}
          >
            Submit
          </Button>
        </form>
      </div>
      <OR />
      <div className={styles.cardWallet}>
        <div className={styles.cardWalletWithSubtitle}>
          <div className={styles.cardWalletTitle}>Generate your wallet</div>
          <div className={styles.cardWalletSubtitle}>
            This will generate a wallet for you, with a mnemonic and a private
            key.
          </div>
        </div>
        <Button onClick={generateWallet()}>Generate</Button>
      </div>
    </div>
  )
}

const Account = () => {
  const [loading, setLoading] = useState(true)
  const [address, setAddress] = useState<Wallet | null>(null)
  const [privateKey, setPrivateKey] = useState('')
  const [mnemonic, setMnemonic] = useState('')
  const [error, setError] = useState('')
  const timeoutRef = useRef<any>()
  useEffect(() => {
    const run = async () => {
      const ad = await Auguste.address.get()
      setAddress(null)
      setLoading(false)
    }
    run()
  }, [])
  const generateParams = (option?: string) => {
    if (option === 'mnemonic') {
      return { mnemonic }
    } else if (option === 'privateKey') {
      return { privateKey }
    } else {
      return undefined
    }
  }
  const generateWallet = (option?: 'mnemonic' | 'privateKey') => async () => {
    const params = generateParams(option)
    const result = await Auguste.address.generate(params)
    if (result.type === 'success') setAddress(result.value)
    else {
      setError(result.value)
      timeoutRef.current = setTimeout(() => setError(''), 5000)
    }
  }
  const closeError = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
    setError('')
  }
  return (
    <Fragment>
      {loading && (
        <div className={styles.centerLoader}>
          <Loader />
        </div>
      )}
      {!loading && !address && (
        <GenerateAccount
          error={error}
          privateKey={privateKey}
          setPrivateKey={setPrivateKey}
          mnemonic={mnemonic}
          setMnemonic={setMnemonic}
          generateWallet={generateWallet}
          closeError={closeError}
        />
      )}
      {!loading && address && (
        <div>
          <div>{address.address}</div>
          <div>{address.publicKey}</div>
          <div>{JSON.stringify(address.mnemonic)}</div>
        </div>
      )}
    </Fragment>
  )
}

const RenderSettings = ({ page }: any) => {
  return <Fragment>{page === 'account' && <Account />}</Fragment>
}

export const Settings = () => {
  const [page, setPage] = useState('account')
  return (
    <Card.Card area="panel" className={styles.settings}>
      <Card.Header title="Settings" />
      <Menu page={page} setPage={setPage} />
      <Card.Card area="main" opaque>
        <Card.Header title={page} className={styles.pageHeader} />
        <Card.Body>
          <RenderSettings page={page} />
        </Card.Body>
      </Card.Card>
    </Card.Card>
  )
}
