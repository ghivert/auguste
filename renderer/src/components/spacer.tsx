export const Spacer = ({ size }: { size: 'xl' | 'l' | 'm' | 's' }) => {
  const options = { xl: 36, l: 24, m: 12, s: 6 }
  const s = options[size] ?? 12
  const style = { paddingTop: s, paddingLeft: s }
  return <div style={style} />
}
