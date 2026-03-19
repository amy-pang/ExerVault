import React, { useEffect, useState } from 'react';
import styles from './HomePage.module.css';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Exercise } from '../types/exercise';
import Filter from "../components/Filter";

export default function HomePage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const location = useLocation();

  const filteredExercises = exercises
    .filter((exercise) =>
      selectedCategories.length === 0 ||
      selectedCategories.includes(exercise.category?.trim().toLowerCase())
    )
    .filter((exercise) =>
      !showOnlyFavorites || favorites.has(exercise.id)
    );

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // Fetch exercises
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
  }, [location.key]);

  // Fetch favorites
  useEffect(() => {
    if (!userId) return;
    async function fetchFavorites() {
      const { data, error } = await supabase
        .from('favorites')
        .select('exercise_id')
        .eq('user_id', userId);

      if (error) { console.error("Error fetching favorites:", error); return; }
      setFavorites(new Set(data?.map((f: any) => f.exercise_id) ?? []));
    }
    fetchFavorites();
  }, [userId]);

  // Fetch which exercises are already in cart
  useEffect(() => {
    if (!userId) return;
    async function fetchCartIds() {
      const { data, error } = await supabase
        .from('cart_items')
        .select('exercise_id')
        .eq('user_id', userId);

      if (error) { console.error("Error fetching cart:", error); return; }
      setAddedIds(new Set(data?.map((item: any) => item.exercise_id) ?? []));
    }
    fetchCartIds();
  }, [userId]);

  const handleAddToCart = async (exerciseData: Exercise) => {
    if (!userId) {
      navigate('/sign-in');
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: userId,
        exercise_id: exerciseData.id,
        name: exerciseData.name,
        category: exerciseData.category || '',
        description: exerciseData.description,
        image_path: exerciseData.image_path,
        added_at: Date.now(),
      }, { onConflict: 'user_id,exercise_id' });

    if (error) {
      console.error("Error saving to cart:", error);
    } else {
      setAddedIds((prev) => new Set([...prev, exerciseData.id]));
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, exerciseId: string) => {
    e.stopPropagation();
    if (!userId) { navigate('/sign-in'); return; }

    const isFavorited = favorites.has(exerciseId);

    // Optimistic update
    setFavorites((prev) => {
      const next = new Set(prev);
      if (isFavorited) next.delete(exerciseId);
      else next.add(exerciseId);
      return next;
    });

    if (isFavorited) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId);

      if (error) {
        console.error("Error removing favorite:", error);
        setFavorites((prev) => new Set([...prev, exerciseId]));
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, exercise_id: exerciseId });

      if (error) {
        console.error("Error adding favorite:", error);
        setFavorites((prev) => { const next = new Set(prev); next.delete(exerciseId); return next; });
      }
    }
  };

  if (loading) return <div className={styles.homePage}>Loading...</div>;

  return (
    <div className={styles.homePage}>
      <div className={styles.pageHeaderWrapper}>
        <div className={styles.pageHeader}>
          <h1 className={styles.welcomeText}>Welcome Back!</h1>
          <Filter
            selectedCategories={selectedCategories}
            onChange={setSelectedCategories}
            showOnlyFavorites={showOnlyFavorites}
            onToggleFavorites={() => setShowOnlyFavorites((prev) => !prev)}
          />
        </div>
      </div>

      {showOnlyFavorites && filteredExercises.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6b7280', fontSize: '16px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>☆</div>
          <p style={{ fontWeight: 600, color: '#374151', marginBottom: '8px' }}>No favorited exercises yet</p>
          <p>Click the ☆ on any exercise card to save it here.</p>
        </div>
      )}

      <div className={styles.exerciseGrid}>
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className={styles.exerciseCard}
            onClick={() => navigate(`/exercise/${exercise.id}`)}
            style={{ cursor: 'pointer' }}
          >
            {/* Star button */}
            <button
              className={`${styles.starButton} ${favorites.has(exercise.id) ? styles.starActive : ''}`}
              onClick={(e) => handleToggleFavorite(e, exercise.id)}
              title={favorites.has(exercise.id) ? "Remove from favorites" : "Add to favorites"}
              aria-label={favorites.has(exercise.id) ? "Unfavorite" : "Favorite"}
            >
              {favorites.has(exercise.id) ? '★' : '☆'}
            </button>

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
            <p className={styles.equipment}><strong>Category:</strong> {exercise.category}</p>
            <p className={styles.description}>{exercise.description}</p>

            {/* Add button */}
            <button
              className={styles.addButton}
              onClick={(e) => { e.stopPropagation(); handleAddToCart(exercise); }}
              title={addedIds.has(exercise.id) ? "Already in list" : "Add to list"}
            >
              {addedIds.has(exercise.id) ? '✓' : '+'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}