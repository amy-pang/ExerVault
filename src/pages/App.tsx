import { useState } from 'react'
import './App.css'
import Header from '../components/Header';

function App() {
  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    // You will replace this with filtering your Supabase/list data
  };

  return (
    <>
      <div className="header-wrapper">
        <Header onSearch={handleSearch} />
      </div>

    </>
  )
}

export default App
