import React from 'react'
import styles from './components.module.css'

const toClName = (...classes) => {
  return classes.filter(v => !!v).join(' ')
}

const Card = ({ tag = 'div', panel, children, ...props }) => {
  const style = { gridArea: panel }
  const className = toClName(props.className, styles.card)
  return React.createElement(tag, { style, className }, children)
}

const Header = ({ title, ...props }) => {
  const className = toClName(props.className, styles.cardHeader)
  return (
    <div className={className}>
      {title}
      {props.children}
    </div>
  )
}

Card.Header = Header

export default Card
