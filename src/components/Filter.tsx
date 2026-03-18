import { useState } from 'react'
import { supabase } from '../supabaseClient'

interface FilterProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  showOnlyFavorites: boolean;
  onToggleFavorites: () => void;
}

export default function Filter({ selectedCategories, onChange, showOnlyFavorites, onToggleFavorites }: FilterProps) {
  const [categories, setCategories] = useState<string[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleToggleCategories = async () => {
    if (categories) {
      setCategories(null)
      setError(null)
      return
    }

    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('category')

      if (error) throw error

      if (!data) {
        setCategories([])
        return
      }

      const uniqueCategories = Array.from(
        new Set(
          data
            .map((row: any) => row.category)
            .filter(Boolean)
            .map((category: string) => category.trim().toLowerCase())
        )
      )

      setCategories(uniqueCategories)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      setCategories(null)
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>

        <button
          onClick={handleToggleCategories}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {categories ? 'Hide Filters' : 'Filter'}
        </button>

        {categories && categories.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '0.75rem',
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              padding: '1rem',
              backgroundColor: '#fff',
              color: '#000',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              borderRadius: '8px',
              zIndex: 100,
              minWidth: '240px'
            }}
          >
            {/* Starred option */}
            <label style={{ display: 'flex', alignItems: 'center', width: '100%', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem', marginBottom: '0' }}>
              <input
                type="checkbox"
                checked={showOnlyFavorites}
                onChange={onToggleFavorites}
              />
              <span style={{ marginLeft: '0.3rem' }}>Favorites</span>
            </label>

            {/* Category checkboxes */}
            {categories.map((category) => (
              <label
                key={category}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => {
                    if (selectedCategories.includes(category)) {
                      onChange(selectedCategories.filter(c => c !== category));
                    } else {
                      onChange([...selectedCategories, category]);
                    }
                  }}
                />
                <span style={{ marginLeft: '0.3rem', textTransform: 'capitalize' }}>
                  {category}
                </span>
              </label>
            ))}
          </div>
        )}

        {error && (
          <p style={{ color: 'red', marginTop: '0.5rem' }}>
            Error: {error}
          </p>
        )}
      </div>
    </div>
  )
}