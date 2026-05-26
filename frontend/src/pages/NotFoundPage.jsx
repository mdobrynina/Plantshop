import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="not-found__icon">🌿</div>
      <h1 className="not-found__code">404</h1>
      <p className="not-found__text">Такой страницы не существует</p>
      <Link to="/" className="btn btn-primary">На главную</Link>
    </div>
  )
}
