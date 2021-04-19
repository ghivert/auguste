import { Fragment, useState, useRef } from 'react'
import Card from './components/card'
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
  return (
    <div className={styles.textInputWrapper}>
      <div className={styles.textInput}>
        <span
          className={`${styles.textInputInside} ${
            textInput === 'Aa' && styles.greyText
          }`}
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

const renderMessage = ({ text, sender, date }, index, messages) => {
  const lgth = messages.length
  const previousMessage = index - 1 >= 0 ? messages[index - 1] : null
  const nextMessage = index + 1 < lgth ? messages[index + 1] : null
  const sameAsNext = nextMessage?.sender === sender
  const sameAsPrevious = previousMessage?.sender === sender
  const style = {
    borderTopLeftRadius: sameAsNext && sender === 'auguste' && '10px',
    borderTopRightRadius: sameAsNext && sender === 'user' && '10px',
    borderBottomLeftRadius: sameAsPrevious && sender === 'auguste' && '10px',
    borderBottomRightRadius: sameAsPrevious && sender === 'user' && '10px',
    marginBottom: !sameAsPrevious && '6px',
    marginTop: !sameAsNext && '6px',
  }
  const diff = nextMessage?.date - date
  const delta = isNaN(diff) ? Date.now() : diff
  const className = sender === 'user' ? styles.userMessage : styles.botMessage
  return (
    <Fragment key={index}>
      <div className={className} style={style}>
        {text}
      </div>

      {!sameAsNext && delta > 5000 && (
        <div className={sender === 'user' ? styles.userDate : styles.botDate}>
          {date.toLocaleString('fr-fr', {
            ...(nextMessage?.date?.getDate() !== date.getDay()
              ? { year: 'numeric', month: 'long', day: 'numeric' }
              : {}),
            hour: 'numeric',
            minute: 'numeric',
          })}
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

const Bot = () => {
  const [messages, setMessages] = useState(readOldMessages)
  const onSubmit = value => {
    const date = new Date()
    const text = value.replace(/<br>/g, '\n').trim()
    setMessages([{ text, sender: 'user', date }, ...messages])
  }
  return (
    <Card className={styles.bot}>
      <Card.Header title="Auguste" />
      <div className={styles.messageContent}>{messages.map(renderMessage)}</div>
      <TextInput onSubmit={onSubmit} />
    </Card>
  )
}

export default Bot
