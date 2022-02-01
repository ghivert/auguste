import React from 'react'
import styles from './components.module.css'

const toClName = (...classes) => {
  return classes.filter(v => !!v).join(' ')
}

export const Card = ({ tag = 'div', panel, children, ...props }) => {
  const style = { gridArea: panel }
  const className = toClName(props.className, styles.card)
  return React.createElement(tag, { style, className }, children)
}

export const Header = ({ title, ...props }) => {
  const className = toClName(props.className, styles.cardHeader)
  return (
    <div className={className}>
      {title}
      {props.children}
    </div>
  )
}

export const Body = ({ children, center }) => {
  const cl = center ? styles.cardBodyCenter : styles.cardBody
  return <div className={cl}>{children}</div>
}
