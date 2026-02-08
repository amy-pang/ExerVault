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
     {/* Container to prevent button movement */}
     <div style={{ display: 'flex', flexDirection: 'column', rowGap: '1rem', minHeight: '120px' }}>
       <button onClick={handleToggleCategories} style={{ padding: '0.5rem 1rem', alignSelf: 'flex-start' }}>
         {categories ? '...' : '...'}
       </button>


       {error && <p style={{ color: 'red' }}>Error: {error}</p>}


       {categories && categories.length > 0 && (
         <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
           {categories.map((category) => (
             <label key={category} style={{ display: 'flex', alignItems: 'center' }}>
               <input type="checkbox" />
               <span style={{ marginLeft: '0.3rem' }}>{category}</span>
             </label>
           ))}
         </div>
       )}
     </div>
   </div>
 )
}



