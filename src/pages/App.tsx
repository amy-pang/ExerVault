import { useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import ExerciseListPage from './ExerciseListPage';
import AdminPanel from '../components/AdminPanel';
import HomePage from './HomePage'
import Header from '../components/Header';
import ExercisePage from './ExercisePage';
import ExerciseOverview from '../components/ExerciseOverview/ExerciseOverview'

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
        <Route path="/exercise/:id" element={<ExercisePage />} />
        <Route path="/exercise-overview" element={<ExerciseOverview />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;