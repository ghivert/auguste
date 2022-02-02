import React, { FC } from 'react'
import styles from './components.module.css'

const toClName = (...classes: (string | undefined)[]) => {
  return classes.filter(v => !!v).join(' ')
}

export type CardProps = { tag?: string; area?: string; className?: string }
export const Card: FC<CardProps> = props => {
  const { tag = 'div', area, children } = props
  const style = { gridArea: area }
  const className = toClName(props.className, styles.card)
  return React.createElement(tag, { style, className }, children)
}

export type HeaderProps = { title: string; className?: string }
export const Header: FC<HeaderProps> = ({ title, ...props }) => {
  const className = toClName(props.className, styles.cardHeader)
  return (
    <div className={className}>
      {title}
      {props.children}
    </div>
  )
}

export type BodyProps = { center?: boolean }
export const Body: FC<BodyProps> = ({ children, center }) => {
  const cl = center ? styles.cardBodyCenter : styles.cardBody
  return <div className={cl}>{children}</div>
}
