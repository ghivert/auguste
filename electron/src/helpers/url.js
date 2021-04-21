const encodeQueryParams = params => {
  return Object.entries(params)
    .map(([key, val]) => encodeURI(`${key}=${val}`))
    .join('&')
}

const encodeFormURL = values => {
  return Object.entries(values)
    .map(vals => vals.map(encodeURIComponent).join('='))
    .join('&')
}

module.exports = {
  encodeQueryParams,
  encodeFormURL,
}
