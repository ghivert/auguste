import { Fragment, useState, useRef, useEffect } from 'react'
import Card from './components/card'
import Auguste from './auguste'
import styles from './Bot.module.css'

const moveCursor = (el, position) => {
  const range = document.createRange()
  const sel = window.getSelection()
  range.setStart(el.childNodes[0], position)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
}

const handleContentEditableText = (state, element, event) => {
  if (state === 'Aa') {
    event.target.innerHTML = event.target.innerHTML.slice(0, 1)
    moveCursor(element, 1)
  } else if (event.target.innerHTML === '') {
    event.target.innerHTML = 'Aa'
  }
}

const TextInput = ({ onSubmit }) => {
  const [textInput, setTextInput] = useState('Aa')
  const contentRef = useRef()
  const onClick = () => textInput === 'Aa' && moveCursor(contentRef.current, 0)
  const onInput = event => {
    handleContentEditableText(textInput, contentRef.current, event)
    setTextInput(event.target.innerHTML)
  }
  const onKeyPress = event => {
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

const toLocaleString = ({ date, nextDate }) => {
  const isDifferentDate = nextDate?.getDay() !== date.getDay()
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  const selections = isDifferentDate ? options : {}
  return date.toLocaleString('fr-fr', {
    ...selections,
    hour: 'numeric',
    minute: 'numeric',
  })
}

const renderMessage = ({ text, image, sender, date }, index, messages) => {
  const lgth = messages.length
  const previousMessage = index - 1 >= 0 ? messages[index - 1] : null
  const nextMessage = index + 1 < lgth ? messages[index + 1] : null
  const sameAsNext = nextMessage?.sender === sender
  const sameAsPrevious = previousMessage?.sender === sender
  const commonStyle = {
    borderTopLeftRadius: sameAsNext && sender === 'auguste' && '10px',
    borderTopRightRadius: sameAsNext && sender === 'user' && '10px',
    borderBottomLeftRadius: sameAsPrevious && sender === 'auguste' && '10px',
    borderBottomRightRadius: sameAsPrevious && sender === 'user' && '10px',
  }
  const style = {
    ...commonStyle,
    marginBottom: !sameAsPrevious && '6px',
    marginTop: !sameAsNext && '6px',
  }
  const diff = nextMessage?.date - date
  const delta = isNaN(diff) ? Date.now() : diff
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

const readOldMessages = () => {
  const initialMessage = {
    text: 'Bonjour, en quoi puis-je vous aider aujourd’hui ?',
    date: new Date(),
    sender: 'auguste',
  }
  const raw = localStorage.getItem('messages')
  const messages = JSON.parse(raw) || []
  if (messages.length === 0) {
    const final = [initialMessage]
    localStorage.setItem('messages', JSON.stringify(final))
    return final
  } else {
    const convertDate = ({ date, ...message }) => {
      return { ...message, date: new Date(date) }
    }
    return messages.map(convertDate)
  }
}

const RenderComposing = () => (
  <div className={styles.composingMessage}>
    <div className={styles.firstDot} />
    <div className={styles.secondDot} />
    <div className={styles.thirdDot} />
  </div>
)

const Bot = () => {
  const [composing, setComposing] = useState(false)
  const [messages, setMessages] = useState(readOldMessages)
  const scrollRef = useRef()
  const timeoutRef = useRef()
  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages))
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])
  useEffect(() => clearTimeout(timeoutRef.current), [])
  const onSubmit = async value => {
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
      if (res.success) {
        res.content.forEach(({ text, image }) => {
          const date = new Date()
          const newMessage = { text, image, sender, date, type: 'success' }
          setMessages(mess => [newMessage, ...mess])
        })
      }
    }, diff)
  }
  return (
    <Card className={styles.bot}>
      <Card.Header title="Auguste" />
      <div className={styles.messageContent} ref={scrollRef}>
        {composing && <RenderComposing />}
        {messages.map(renderMessage)}
      </div>
      <TextInput onSubmit={onSubmit} />
    </Card>
  )
}

export default Bot
