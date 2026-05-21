import { useScrollReveal } from '../../hooks/useScrollReveal.js'

export default function Reveal({ children, delay = 0, className = '' }) {
  const ref = useScrollReveal()
  const delayClass = delay ? `reveal--delay-${delay}` : ''
  return (
    <div ref={ref} className={`reveal ${delayClass} ${className}`.trim()}>
      {children}
    </div>
  )
}
