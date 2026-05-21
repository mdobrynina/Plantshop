import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categories } from '../../data/categories.js'
import './Sidebar.css'

export default function Sidebar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') ?? ''
  const [openGroups, setOpenGroups] = useState(['decorative'])

  const toggleGroup = (id) => {
    setOpenGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    )
  }

  const selectCategory = (id) => {
    if (id === activeCategory) {
      setSearchParams({})
    } else {
      setSearchParams({ category: id })
    }
  }

  return (
    <aside className="sidebar">
      <h2 className="sidebar__title">Каталог</h2>
      <nav className="sidebar__nav">
        {categories.map((group) => {
          const isOpen = openGroups.includes(group.id)
          return (
            <div key={group.id} className="sidebar__group">
              <button
                className={`sidebar__group-btn ${isOpen ? 'sidebar__group-btn--open' : ''}`}
                onClick={() => toggleGroup(group.id)}
              >
                <span>{group.name}</span>
                <span className="sidebar__chevron">{isOpen ? '∧' : '∨'}</span>
              </button>

              {isOpen && (
                <ul className="sidebar__sub">
                  {group.subcategories.map((sub) => (
                    <li key={sub.id}>
                      <button
                        className={`sidebar__sub-btn ${activeCategory === sub.id ? 'sidebar__sub-btn--active' : ''}`}
                        onClick={() => selectCategory(sub.id)}
                      >
                        {sub.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
