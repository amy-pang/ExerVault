import { useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import ExerciseListPage from './ExerciseListPage';
import AdminPanel from '../components/AdminPanel';
import HomePage from './HomePage'
import Header from '../components/Header';

function App() {
  const [query, setQuery] = useState("");

  return (
    <BrowserRouter>
      <Header
        query={query}
        onQueryChange={setQuery}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/exercise-list" element={<ExerciseListPage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;