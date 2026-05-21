import { useScrollReveal } from '../../hooks/useScrollReveal.js'

export default function Reveal({ children, delay = 0, className = '', stretch = false }) {
  const ref = useScrollReveal()
  const classes = [
    'reveal',
    delay ? `reveal--delay-${delay}` : '',
    stretch ? 'reveal--stretch' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  )
}
