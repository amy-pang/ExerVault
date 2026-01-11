import { useState } from 'react'
import './App.css'
import Header from '../components/Header';
import { DummyExercises } from '../dummy_exercises';

function App() {
  const [query, setQuery] = useState("");
  /*const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // You will replace this with filtering your Supabase/list data
  };*/

  return (
    <>
      <div className="header-wrapper">
        <Header query={query} onQueryChange={setQuery}/>
      </div>

      {/* shows catalog of exercises */}
      <ul className="list" color="black">
        {DummyExercises.filter(exercise=>exercise.name.toLowerCase().includes(query)
        ).map((exercise) => (
          <li key={exercise.id} className="listItem" color="black">
            {exercise.name}
          </li>
        ))}
        
      </ul>
    </>
  )
}

export default App
