export type Params = { [key: string]: any }

export const encodeQueryParams = (params: Params) => {
  return Object.entries(params)
    .map(([key, val]) => encodeURI(`${key}=${val}`))
    .join('&')
}

export const encodeFormURL = (values: Params) => {
  return Object.entries(values)
    .map(vals => vals.map(encodeURIComponent).join('='))
    .join('&')
}
