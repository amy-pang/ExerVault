import { useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import ExerciseListPage from './ExerciseListPage';
import AdminPanel from '../components/AdminPanel';
import HomePage from './HomePage'
import Header from '../components/Header';
import ExercisePage from './ExercisePage';

function App() {
  const [query, setQuery] = useState("");

  return (
<<<<<<< HEAD
    <BrowserRouter>
      <Header
        query={query}
        onQueryChange={setQuery}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/exercise-list" element={<ExerciseListPage />} />
        <Route path="/exercise/:id" element={<ExercisePage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
=======
    <>
      <div className="header-wrapper">
        <Header onSearch={handleSearch} />
      </div>
      <HomePage />
    </>
  )
>>>>>>> 0709255 (organized files)
}

export default App;