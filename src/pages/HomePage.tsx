import React, { useEffect, useState } from "react";
import styles from "./HomePage.module.css";
import { Plus } from "lucide-react";
import { supabase } from "../supabaseClient";
import Filter from "../components/Filter";

interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string;
  image_path: string;
}

export default function HomePage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const filteredExercises =
    selectedCategories.length === 0
      ? exercises
      : exercises.filter((exercise) =>
          selectedCategories.includes(exercise.category?.trim().toLowerCase())
        );

  useEffect(() => {
    async function fetchExercises() {
      const { data, error } = await supabase
        .from("exercises")
        .select("id, name, category, description, image_path");

      if (error) {
        console.error("Error fetching exercises:", error);
      } else if (data) {
        setExercises(data);
      }
      setLoading(false);
    }

    fetchExercises();
  }, []);

  if (loading) {
    return <div className={styles.homePage}>Loading...</div>;
  }

  return (
    <div className={styles.homePage}>
      <div className={styles.pageHeaderWrapper}>
        <div className={styles.pageHeader}>
          <h1 className={styles.welcomeText}>Welcome Back!</h1>
          <Filter selectedCategories={selectedCategories} onChange={setSelectedCategories} />
        </div>
      </div>

      <div className={styles.exerciseGrid}>
        {filteredExercises.map((exercise) => (
          <div key={exercise.id} className={styles.exerciseCard}>
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

            <button className={styles.addButton} type="button" aria-label="Add exercise">
              <Plus size={24} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
