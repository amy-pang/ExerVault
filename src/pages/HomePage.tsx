import React, { useEffect, useState } from 'react';
import './HomePage.css';
import { Search, ShoppingCart, Plus } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string;
  image_path: string;
}

export default function HomePage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch exercises from Supabase when component loads
  useEffect(() => {
    async function fetchExercises() {
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name, category, description, image_path')
        .limit(6);

      if (error) {
        console.error('Error fetching exercises:', error);
      } else if (data) {
        setExercises(data);
      }
      setLoading(false);
    }

    fetchExercises();
  }, []);

  // Filter exercises based on search
  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="home-page">Loading...</div>;
  }

  return (
    <div className="home-page">
      {/* Header */}
      <div className="header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by exercise name"
            className="search-bar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="search-icon" size={24} />
        </div>
        <ShoppingCart className="cart-icon" size={40} strokeWidth={1.5} />
      </div>

      {/* Welcome */}
      <h1 className="welcome">Welcome Back!</h1>

      {/* Exercise Cards */}
      <div className="exercise-grid">
        {filteredExercises.map((exercise) => (
          <div key={exercise.id} className="exercise-card">
            <div className="card-image">
              {exercise.image_path ? (
                <img
                  src={`https://qjesptyjdarygpcunzqd.supabase.co/storage/v1/object/public/exercise-images/${exercise.image_path}`}
                  alt={exercise.name}
                />
              ) : (
                <div className="placeholder-text">No Image</div>
              )}
            </div>
            <h3>{exercise.name}</h3>
            <p className="equipment"><strong>Category:</strong> {exercise.category}</p>
            <p className="description">{exercise.description}</p>
            <button className="add-button">
              <Plus size={24} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}