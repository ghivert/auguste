export type ToLocaleString = { date: Date; nextDate?: Date }
export const toLocaleString = ({ date, nextDate }: ToLocaleString) => {
  const isDifferentDate = nextDate?.getDay() !== date.getDay()
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  const selections = isDifferentDate ? options : {}
  return date.toLocaleString('en-gb', {
    ...selections,
    hour: 'numeric',
    minute: 'numeric',
  })
}
