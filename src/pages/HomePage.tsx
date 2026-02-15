import React, { useEffect, useState } from 'react';
import styles from './HomePage.module.css';
import { Plus } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Cart } from '../types/exercise';
import type { Exercise } from '../types/exercise';
import Filter from "../components/Filter";

interface ExercisePageProps {
  cart: Cart;
}

export default function HomePage({ cart }: ExercisePageProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const filteredExercises =
   selectedCategories.length === 0
     ? exercises
     : exercises.filter((exercise) =>
         selectedCategories.includes(exercise.category?.trim().toLowerCase())
       );

  useEffect(() => {
    async function fetchExercises() {
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name, category, description, image_path');

      if (error) {
        console.error("Error fetching exercises:", error);
      } else if (data) {
        setExercises(data);
      }
      setLoading(false);
    }

    fetchExercises();
  }, []);

  const handleAddToCart = (exerciseData: Exercise) => {
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
  };

  if (loading) {
    return <div className={styles.homePage}>Loading...</div>;
  }

  return (
    <div className={styles.homePage}>
      {/* Welcome */}
      <div className={styles.pageHeaderWrapper}>
        <div className={styles.pageHeader}>
          <h1 className={styles.welcomeText}>Welcome Back!</h1>
          <Filter selectedCategories={selectedCategories} onChange={setSelectedCategories} />
        </div>
      </div>

      {/* Exercise Cards */}
      <div className={styles.exerciseGrid}>
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className={styles.exerciseCard}
            onClick={() => navigate(`/exercise/${exercise.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.cardImage}>
              {exercise.image_path ? (
                <img
                  src={`https://qjesptwjdarygpcunzqd.supabase.co/storage/v1/object/public/exercise-images/${exercise.image_path}`}
                  alt={exercise.name}
                />
              ) : (
                <div className={styles.placeholderText}>No Image</div>
              )}
            </div>

            <h3>{exercise.name}</h3>
            <p className={styles.equipment}>
              <strong>Category:</strong> {exercise.category}
            </p>
            <p className={styles.description}>{exercise.description}</p>
            <button
              className={styles.addButton}
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
