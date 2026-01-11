import { useState } from 'react'
import './App.css'
import Header from '../components/Header';
import { DummyExercises } from '../dummy_exercises';
import DummyTable from '../DummyTable';

type Exercise = {
  id: number;
  name: string;
  type: string;
};

function App() {
  const [query, setQuery] = useState("");
  /*const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // You will replace this with filtering your Supabase/list data
  };*/

  const search = (data: Exercise[]): Exercise[] => {
    return data.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <>
      <div className="header-wrapper">
        <Header query={query} onQueryChange={setQuery}/>
      </div>

      {/* shows catalog of exercises */}
      <DummyTable data={search(DummyExercises)}/>
    </>
  )
}

export default App
