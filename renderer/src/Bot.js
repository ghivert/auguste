import { useState, useRef } from 'react'
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
          className={styles.textInputInside}
          contentEditable
          suppressContentEditableWarning
          style={{ color: textInput === 'Aa' ? 'grey' : null }}
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
  const className = sender === 'user' ? styles.userMessage : styles.botMessage
  return (
    <div key={index} className={className} style={style}>
      {text}
    </div>
  )
}

const createArray = () => {
  return new Array(100)
    .fill({ text: 'meh meh meh', sender: 'auguste' })
    .map(({ text, sender }, index) => {
      const rand = Math.round(Math.random() * 10) + 1
      const content = new Array(rand).fill(text).join(' ')
      return {
        text: content,
        sender: Math.random() > 0.5 ? 'auguste' : 'user',
        date: new Date(),
      }
    })
}

const Bot = () => {
  const [messages, setMessages] = useState(createArray)
  const onSubmit = value => {
    const date = new Date()
    const text = value.replace(/<br>/g, '\n').trim()
    setMessages([{ text, sender: 'user', date }, ...messages])
  }
  return (
    <div className={styles.bot}>
      <div className={styles.botName}>Auguste</div>
      <div className={styles.messageContent}>{messages.map(renderMessage)}</div>
      <TextInput onSubmit={onSubmit} />
    </div>
  )
}

export default Bot
