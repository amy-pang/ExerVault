import { useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import ExerciseListPage from './pages/ExerciseListPage';
import HomePage from './pages/HomePage'
import Header from './components/Header';
import ExercisePage from './pages/SingleExercisePage';
import { Cart } from './types/exercise';
import PrintPage from './pages/PrintPage';

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
        <Route path="/" element={<HomePage cart={cart}/>} />
        <Route path="/exercise-list" element={<ExerciseListPage cart={cart}/>} />  {/* exercises added to print */}
        <Route path="/exercise/:id" element={<ExercisePage cart={cart} />} />
        <Route path="/print" element={<PrintPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;