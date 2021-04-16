const { NODE_ENV } = process.env

const IS_DEV = NODE_ENV === 'development'
const IS_PROD = !IS_DEV

module.exports = {
  IS_DEV,
  IS_PROD,
}
