import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from '../supabaseClient';
import { Cart } from '../types/exercise';
import type { Exercise } from '../types/exercise';
import styles from "./SingleExercisePage.module.css";

interface ExercisePageProps {
  cart: Cart;
}

export default function ExercisePage({ cart }: ExercisePageProps) {
  const { id } = useParams();
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [imageDimensions, setImageDimensions] = useState({ width: 260, height: 260 });
  const [frequency, setFrequency] = useState("");
  const [frequencyType, setFrequencyType] = useState("week"); // "week", "day", or "month"
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [repType, setRepType] = useState("reps"); // "reps" or "seconds"
  const [description, setDescription] = useState("");
  const [comments, setComments] = useState("");
  const [isInCart, setIsInCart] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const ensureNonNegativeValue = (value: string) => {
    if (!value.trim()) return "";
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return "";
    return Math.max(0, numericValue).toString();
  };

  useEffect(() => {
    if (!notification) return;

    const timer = window.setTimeout(() => {
      setNotification(null);
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [notification]);

  const handleAddToList = () => {
    if (!exercise) return;

    if (!frequency.trim() || !sets.trim() || !reps.trim()) {
      setNotification({
        message: "Error: Please fill Frequency, Sets, and Reps.",
        type: "error",
      });
      return;
    }

    if (Number(frequency) < 0 || Number(sets) < 0 || Number(reps) < 0) {
      setNotification({
        message: "Error: Frequency, Sets, and Reps cannot be negative.",
        type: "error",
      });
      return;
    }

    const wasInCart = isInCart;

    const exerciseToAdd: Exercise = {
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      description: description || exercise.description,
      image_path: exercise.image_path,
      frequency,
      frequencyType: frequencyType as 'week' | 'day' | 'month',
      sets,
      reps,
      repType: repType as 'reps' | 'seconds',
      comments,
    };

    cart.addToCart(exerciseToAdd);
    setIsInCart(true);
    setNotification({
      message: wasInCart ? "Exercise updated in list." : "Exercise added to list.",
      type: "success",
    });
    console.log(`${exercise.name} added to list!`);
    console.log(cart.getExercises());
  };

  // Fetch exercise from database
  useEffect(() => {
    async function fetchExercise() {
      if (!id) return;
      console.log(import.meta.env.VITE_SUPABASE_URL);
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching exercise:', error);
        console.log('Looking for ID:', id);
        setLoading(false);
        return;
      }
      
      setExercise(data);
      setDescription(data.description || "");
      
      // Check if exercise is already in cart
      const cartExercises = cart.getExercises();
      const existsInCart = cartExercises.some(ex => ex.id === id);
      setIsInCart(existsInCart);
      
      // Debug: log the image path
      console.log('Image path from DB:', data.image_path);
      
      // Get image URL from storage
      if (data.image_path) {
        const { data: urlData } = supabase.storage
          .from('exercise-images')
          .getPublicUrl(data.image_path);
        console.log('Generated public URL:', urlData.publicUrl);
        setImageUrl(urlData.publicUrl);
      }
      else {
        console.log("No image available");
        const { data: urlData } = supabase.storage
          .from('exercise-images')
          .getPublicUrl("no_image.png");
        setImageUrl(urlData.publicUrl);
      }
      
      setLoading(false);
    }
    
    fetchExercise();
  }, [id]);

  // Load saved values on mount
  useEffect(() => {
    setFrequency(ensureNonNegativeValue(localStorage.getItem("frequency") || ""));
    setFrequencyType(localStorage.getItem("frequencyType") || "week");
    setSets(ensureNonNegativeValue(localStorage.getItem("sets") || ""));
    setReps(ensureNonNegativeValue(localStorage.getItem("reps") || ""));
    setRepType(localStorage.getItem("repType") || "reps");
    setComments(localStorage.getItem("comments") || "");
  }, []);

  // Persist values
  useEffect(() => localStorage.setItem("frequency", frequency), [frequency]);
  useEffect(() => localStorage.setItem("frequencyType", frequencyType), [frequencyType]);
  useEffect(() => localStorage.setItem("sets", sets), [sets]);
  useEffect(() => localStorage.setItem("reps", reps), [reps]);
  useEffect(() => localStorage.setItem("repType", repType), [repType]);
  useEffect(() => localStorage.setItem("description", description), [description]);
  useEffect(() => localStorage.setItem("comments", comments), [comments]);

  return (
    <div className={styles.page}>
      {notification && (
        <div
          className={`${styles.notification} ${
            notification.type === "error"
              ? styles.notificationError
              : styles.notificationSuccess
          }`}
          role="status"
          aria-live="polite"
        >
          {notification.message}
        </div>
      )}

      <h1 className={styles.exerciseTitle}>
        {loading ? "Loading..." : exercise?.name || "Exercise Name"}
        <span className={styles.category}>{exercise?.category || "Category"}</span>
      </h1>

      <div className={styles.content}>
        <div className={styles.leftSection}>
          <div
            className={styles.imagePlaceholder}
            style={{ width: imageDimensions.width, height: imageDimensions.height }}
          >
            {imageUrl && (
              <img
                src={imageUrl}
                alt={exercise?.name}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  const maxSize = 260;
                  const ratio = img.naturalWidth / img.naturalHeight;
                  let width = maxSize;
                  let height = maxSize;

                  if (ratio > 1) height = maxSize / ratio;
                  else width = maxSize * ratio;

                  setImageDimensions({ width, height });
                }}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            )}
          </div>

          <div className={styles.inputRow}>
            <label className={styles.label}>Frequency</label>
            <input
              type="number"
              min={0}
              className={styles.inputBox}
              value={frequency}
              onChange={(e) => setFrequency(ensureNonNegativeValue(e.target.value))}
            />
            <select
              className={styles.dropdown}
              value={frequencyType}
              onChange={(e) => setFrequencyType(e.target.value)}
            >
              <option value="day">Times/Day</option>
              <option value="week">Times/Week</option>
              <option value="month">Times/Month</option>
            </select>
          </div>

          <div className={styles.inputRow}>
            <label className={styles.label}>Sets</label>
            <input
              type="number"
              min={0}
              className={styles.inputBox}
              value={sets}
              onChange={(e) => setSets(ensureNonNegativeValue(e.target.value))}
            />
            <span className={styles.inputDesc}># of Sets</span>
          </div>

          <div className={styles.inputRow}>
            <label className={styles.label}>{repType === "reps" ? "Reps" : "Seconds"}</label>
            <input
              type="number"
              min={0}
              className={styles.inputBox}
              value={reps}
              onChange={(e) => setReps(ensureNonNegativeValue(e.target.value))}
            />
            <select
              className={styles.dropdown}
              value={repType}
              onChange={(e) => setRepType(e.target.value)}
            >
              <option value="reps">Reps</option>
              <option value="seconds">Seconds</option>
            </select>
          </div>
        </div>

        <div className={styles.rightSection}>
          <textarea
            className={styles.description}
            placeholder="Description of Exercise"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <textarea
            className={styles.comments}
            placeholder="Additional Comments..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />

          <button className={styles.addBtn} onClick={handleAddToList}>
            {isInCart ? "Update in list" : "Add to list"}
          </button>
        </div>
      </div>
    </div>
  );
}