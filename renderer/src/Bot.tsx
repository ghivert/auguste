import { Fragment, useState, useRef, useEffect } from 'react'
import * as Card from './components/card'
import { Auguste } from './auguste'
import { toLocaleString } from './helpers/date'
import styles from './Bot.module.css'
import * as types from './types'

const moveCursor = (el: Node, position: number) => {
  const range = document.createRange()
  const sel = window.getSelection()
  if (!sel) return
  range.setStart(el.childNodes[0], position)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
}

const handleContentEditableText = (state: string, el: Node, event: any) => {
  if (state === 'Aa') {
    event.target.innerHTML = event.target.innerHTML.slice(0, 1)
    moveCursor(el, 1)
  } else if (event.target.innerHTML === '') {
    event.target.innerHTML = 'Aa'
  }
}

type TextInputProps = { onSubmit?: (value: string) => void }
const TextInput = ({ onSubmit }: TextInputProps) => {
  const [textInput, setTextInput] = useState('Aa')
  const contentRef = useRef<any>()
  const onClick = () => textInput === 'Aa' && moveCursor(contentRef.current, 0)
  const onInput = (event: any) => {
    handleContentEditableText(textInput, contentRef.current, event)
    setTextInput(event.target.innerHTML)
  }
  const onKeyPress = (event: any) => {
    const { charCode, shiftKey, ctrlKey, metaKey } = event
    const isEnter = charCode === 13
    const isSpecialKey = shiftKey || ctrlKey || metaKey
    if (isEnter && !isSpecialKey) {
      event.preventDefault()
      onSubmit && onSubmit(textInput)
      contentRef.current.innerHTML = 'Aa'
      setTextInput('Aa')
    }
  }
  const greyText = textInput === 'Aa' && styles.greyText
  return (
    <div className={styles.textInputWrapper}>
      <div className={styles.textInput}>
        <span
          className={`${styles.textInputInside} ${greyText}`}
          contentEditable
          suppressContentEditableWarning
          ref={contentRef}
          onInput={onInput}
          onClick={onClick}
          onKeyPress={onKeyPress}
        >
          Aa
        </span>
      </div>
    </div>
  )
}

const renderMessage = (
  { text, image, sender, date }: types.Message,
  index: number,
  messages: types.Message[]
) => {
  const lgth = messages.length
  const previousMessage = index - 1 >= 0 ? messages[index - 1] : null
  const nextMessage = index + 1 < lgth ? messages[index + 1] : null
  const sameAsNext = nextMessage?.sender === sender
  const sameAsPrevious = previousMessage?.sender === sender
  const commonStyle: any = {
    borderTopLeftRadius: sameAsNext && sender === 'auguste' && '10px',
    borderTopRightRadius: sameAsNext && sender === 'user' && '10px',
    borderBottomLeftRadius: sameAsPrevious && sender === 'auguste' && '10px',
    borderBottomRightRadius: sameAsPrevious && sender === 'user' && '10px',
  }
  const style: any = {
    ...commonStyle,
    marginBottom: !sameAsPrevious && '6px',
    marginTop: !sameAsNext && '6px',
  }
  const nextDate = nextMessage?.date ?? new Date(0)
  const diff = nextDate.getTime() ?? 0 - date.getTime()
  const delta = nextMessage?.date ? diff : Date.now()
  const sideClass = sender === 'user' ? styles.userMessage : styles.botMessage
  const clName = `${sideClass} ${Boolean(image) && styles.imageWrapperMessage}`
  return (
    <Fragment key={index}>
      <div className={clName} style={style}>
        {text || (
          <img
            src={image}
            className={styles.imageMessage}
            alt={image}
            style={commonStyle}
          />
        )}
      </div>
      {!sameAsNext && delta > 5000 && (
        <div className={sender === 'user' ? styles.userDate : styles.botDate}>
          {toLocaleString({ date, nextDate: nextMessage?.date })}
        </div>
      )}
    </Fragment>
  )
}

const readOldMessages = (): types.Message[] => {
  const initialMessage = {
    text: 'Bonjour, en quoi puis-je vous aider aujourd’hui ?',
    date: new Date(),
    sender: 'auguste',
  }
  const raw = localStorage.getItem('messages') || ''
  const messages: types.Message[] = JSON.parse(raw) || []
  if (messages.length === 0) {
    const final = [initialMessage]
    localStorage.setItem('messages', JSON.stringify(final))
    return final
  } else {
    return messages.map(({ date, ...message }) => {
      return { ...message, date: new Date(date) }
    })
  }
}

const RenderComposing = () => (
  <div className={styles.composingMessage}>
    <div className={styles.firstDot} />
    <div className={styles.secondDot} />
    <div className={styles.thirdDot} />
  </div>
)

export const Bot = () => {
  const [composing, setComposing] = useState(false)
  const [messages, setMessages] = useState(readOldMessages)
  const scrollRef = useRef<any>()
  const timeoutRef = useRef<any>()
  useEffect(() => clearTimeout(timeoutRef.current), [])
  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages))
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])
  const onSubmit = async (value: string) => {
    const date = new Date()
    const text = value.replace(/<br>/g, '\n').trim()
    setMessages(mess => [{ text, sender: 'user', date }, ...mess])
    setComposing(true)
    const ts = Date.now()
    const res = await Auguste.tell(text)
    const sender = 'auguste'
    const delta = Date.now() - ts
    const diff = 500 - delta < 0 ? 0 : 500 - delta
    timeoutRef.current = setTimeout(() => {
      setComposing(false)
      if (res.type === 'success') {
        res.content.forEach(({ text, image }) => {
          const date = new Date()
          const newMessage = { text, image, sender, date }
          console.log(newMessage)
          setMessages(mess => [newMessage, ...mess])
        })
      }
    }, diff)
  }
  console.log(messages)
  return (
    <Card.Card className={styles.bot}>
      <Card.Header title="Auguste" />
      <div className={styles.messageContent} ref={scrollRef}>
        {composing && <RenderComposing />}
        {messages.map(renderMessage)}
      </div>
      <TextInput onSubmit={onSubmit} />
    </Card.Card>
  )
}
