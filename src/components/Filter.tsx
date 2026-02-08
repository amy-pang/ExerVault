import { useState } from 'react'
import { supabase } from '../supabaseClient'


export default function Filter() {
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
    
     console.log(
      data.map((row: any) => ({
        raw: JSON.stringify(row.category),
        trimmed: JSON.stringify(row.category?.trim())
      }))
    )


    const uniqueCategories = Array.from(
      new Set(
        data
          .map((row: any) => row.category?.trim())
          .filter((category: string | undefined): category is string =>
            !!category && category !== ""
          )
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
      
      {/* Button (does NOT move) */}
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

      {/* Dropdown (appears left, button stays fixed) */}
      {categories && categories.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',        // 👈 anchor to button's right edge
            marginTop: '0.75rem',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            padding: '1rem',
            backgroundColor: '#fff',
            color: '#000',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '8px',
            zIndex: 10,
            minWidth: '240px'
          }}
        >
          {categories.map((category) => (
            <label
              key={category}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <input type="checkbox" />
              <span style={{ marginLeft: '0.3rem' }}>{category}</span>
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