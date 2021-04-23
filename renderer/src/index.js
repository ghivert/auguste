import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import Auguste from './auguste'

const extractParams = ({ search, location }) => {
  const bindings = search
    .slice(1)
    .split('&')
    .map(t => t.split('='))
  const [last] = location.split('/').reverse()
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
      <Switch>
        <Route path="/oauth2" component={OAuth2Redirect} />
        <Route path="/" component={App} />
      </Switch>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
