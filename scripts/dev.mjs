import concurrently from 'concurrently'
import chalk from 'chalk'

const COLORS = ['white', 'red', 'green', 'blue']

console.log(chalk.bold.magenta('=> Will launch everything'))
const dirs = ['electron', 'renderer']
const jsProcesses = dirs.map((dir, index) => {
  const command = `yarn --cwd ${dir} dev`
  const name = dir
  const prefixColor = COLORS[index]
  return { command, name, prefixColor }
})
const others = ['nlp'].map((dir, index) => {
  const command = `cd ${dir} && source ./venv/bin/activate && rasa run`
  const name = dir
  const prefixColor = COLORS[index + jsProcesses.length]
  return { command, name, prefixColor }
})
await concurrently([...jsProcesses, ...others])
