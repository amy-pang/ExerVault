import React, { useEffect, useState } from 'react';
import './HomePage.css';
import { Plus } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Cart } from '../types/exercise';
import type { Exercise } from '../types/exercise';

interface ExerciseData {
  id: string;
  name: string;
  category: string;
  description: string;
  image_path: string;
}

export default function HomePage() {
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart] = useState(() => new Cart());
  const navigate = useNavigate();

  // Fetch exercises from Supabase when component loads
  useEffect(() => {
    async function fetchExercises() {
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name, category, description, image_path');

      if (error) {
        console.error('Error fetching exercises:', error);
      } else if (data) {
        setExercises(data);
      }
      setLoading(false);
    }

    fetchExercises();
  }, []);

  // Function to add exercise to cart and navigate
  const handleAddToCart = (exerciseData: ExerciseData) => {
    const exerciseToAdd: Exercise = {
      id: exerciseData.id,
      name: exerciseData.name,
      category: exerciseData.category || '',
      description: exerciseData.description,
      image_path: exerciseData.image_path,
      addedAt: Date.now(),
    };

    cart.addToCart(exerciseToAdd);
    console.log('Added to cart:', exerciseToAdd.name);
    console.log('Cart now has:', cart.getExercises().length, 'items');

    // Navigate to cart page
    navigate('/cart');
  };

  if (loading) {
    return <div className="home-page">Loading...</div>;
  }

  return (
    <div className="home-page">
      {/* Welcome */}
      <h1 className="welcome">Welcome Back!</h1>

      {/* Exercise Cards */}
      <div className="exercise-grid">
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className="exercise-card"
            onClick={() => navigate(`/exercise/${exercise.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-image">
              {exercise.image_path ? (
                <img
                  src={`https://qjesptwjdarygpcunzqd.supabase.co/storage/v1/object/public/exercise-images/${exercise.image_path}`}
                  alt={exercise.name}
                />
              ) : (
                <div className="placeholder-text">No Image</div>
              )}
            </div>
            <h3>{exercise.name}</h3>
            <p className="equipment"><strong>Category:</strong> {exercise.category}</p>
            <p className="description">{exercise.description}</p>
            <button
              className="add-button"
              onClick={(e) => {
                console.log('Button clicked!');
                e.stopPropagation();
                console.log('Adding exercise:', exercise.name);
                handleAddToCart(exercise);
              }}
            >
              +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}