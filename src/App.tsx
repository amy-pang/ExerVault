import { useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [categories, setCategories] = useState<string[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleToggleCategories = async () => {
    // If categories are already shown, hide them
    if (categories) {
      setCategories(null)
      setError(null)
      return
    }

    // Otherwise, fetch categories
    try {
      const { data, error } = await supabase
        .from('exercises')         // Replace with your table name
        .select('category')

      if (error) throw error

      if (!data) {
        setCategories([])
        return
      }

      const uniqueCategories = Array.from(new Set(data.map((row: any) => row.category)))
      setCategories(uniqueCategories)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      setCategories(null)
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <button onClick={handleToggleCategories} style={{ padding: '0.5rem 1rem' }}>
        {categories ? '...' : '...'}
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {categories && categories.length > 0 && (
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          {categories.map((category) => (
            <label key={category} style={{ display: 'flex', alignItems: 'center' }}>
              <input type="checkbox" />
              <span style={{ marginLeft: '0.3rem' }}>{category}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
