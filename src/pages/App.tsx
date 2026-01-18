import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import ExerciseListPage from '../components/ExerciseListPage';
import AdminPanel from '../components/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ExerciseListPage />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;