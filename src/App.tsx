import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import ExerciseListPage from './pages/ExerciseListPage';
import SavedListsPage from './pages/SavedListsPage';
import HomePage from './pages/HomePage'
import Header from './components/Header';
import ExercisePage from './pages/SingleExercisePage';
import PrintPage from './pages/PrintPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import UploadPage from './pages/UploadPage';

const AUTH_ROUTES = ["/sign-in", "/sign-up"];

function AppContent() {
  const [query, setQuery] = useState("");
  const location = useLocation();
  const showHeader = !AUTH_ROUTES.includes(location.pathname);

  return (
    <>
      {showHeader && <Header query={query} onQueryChange={setQuery} />}
      <Routes>
        <Route path="/" element={<Navigate to="/sign-in" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/exercise-list" element={<ExerciseListPage />} />
        <Route path="/saved-lists" element={<SavedListsPage />} />
        <Route path="/exercise/:id" element={<ExercisePage />} />
        <Route path="/print" element={<PrintPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/create-exercise" element={<UploadPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;