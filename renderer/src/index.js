import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import Auguste from './auguste'

const SpotifyRedirect = () => {
  useEffect(() => {
    const { search } = window.location
    const params = Object.fromEntries(
      search
        .slice(1)
        .split('&')
        .map(t => t.split('='))
    )
    Auguste.sendAccessToken(JSON.stringify(params))
  }, [])
  return null
}

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Switch>
        <Route path="/spotify">
          <SpotifyRedirect />
        </Route>
        <Route path="/">
          <App />
        </Route>
      </Switch>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
