import { useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import ExerciseListPage from './pages/ExerciseListPage';
import AdminPanel from './components/AdminPanel';
import HomePage from './pages/HomePage'
import Header from './components/Header';
import ExercisePage from './pages/ExercisePage';
import ExerciseOverview from './components/ExerciseOverview/ExerciseOverview'
import { Cart } from './types/exercise';

function App() {
  const [query, setQuery] = useState("");
  const cart = new Cart();  // PLEASE USE THIS FOR THE SHOPPING CART 🙏

  return (
    <BrowserRouter>
      <Header
        query={query}
        onQueryChange={setQuery}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<ExerciseListPage />} />
        <Route path="/exercise/:id" element={<ExercisePage />} />
        <Route path="/exercise-overview" element={<ExerciseOverview />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;