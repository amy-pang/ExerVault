import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ExerciseListPage from './pages/ExerciseListPage';
import HomePage from './pages/HomePage'
import Header from './components/Header';
import ExercisePage from './pages/SingleExercisePage';
import { Cart } from './types/exercise';
import PrintPage from './pages/PrintPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import UploadPage from './pages/UploadPage';

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
        <Route path="/" element={<Navigate to="/sign-in" replace />} />
        <Route path="/home" element={<HomePage cart={cart}/>} />
        <Route path="/exercise-list" element={<ExerciseListPage cart={cart}/>} />  {/* exercises added to print */}
        <Route path="/exercise/:id" element={<ExercisePage cart={cart} />} />
        <Route path="/print" element={<PrintPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/create-exercise" element={<UploadPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;