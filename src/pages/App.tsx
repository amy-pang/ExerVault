import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import ExerciseListPage from './ExerciseListPage';
import AdminPanel from '../components/AdminPanel';
import HomePage from './HomePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/exercise-list" element={<ExerciseListPage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;