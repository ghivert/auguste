import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { App } from './App'
import { Auguste } from './auguste'
import reportWebVitals from './reportWebVitals'
import './index.css'

const extractParams = ({ search, pathname }) => {
  const bindings = search
    .slice(1)
    .split('&')
    .map(t => t.split('='))
  const [last] = pathname.split('/').reverse()
  const provider = last === 'oauth2' ? null : last
  return [Object.fromEntries(bindings), provider]
}

const OAuth2Redirect = () => {
  useEffect(() => {
    const [params, provider] = extractParams(window.location)
    Auguste.sendAccessToken(JSON.stringify({ ...params, provider }))
  }, [])
  return null
}

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/oauth2" element={<OAuth2Redirect />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
