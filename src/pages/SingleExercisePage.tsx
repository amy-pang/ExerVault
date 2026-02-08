import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from '../supabaseClient';
import { Cart } from '../types/exercise';
import type { Exercise } from '../types/exercise';
import styles from "./SingleExercisePage.module.css";

export default function ExercisePage() {
  const { id } = useParams();

  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [imageUrl, setImageUrl] = useState("");
  const [imageDimensions, setImageDimensions] = useState({ width: 260, height: 260 });

  const [frequency, setFrequency] = useState("");
  const [frequencyType, setFrequencyType] = useState("week");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [repType, setRepType] = useState("reps");
  const [description, setDescription] = useState("");
  const [comments, setComments] = useState("");

  // Fetch exercise
  useEffect(() => {
    async function fetchExercise() {
      if (!id) return;

      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching exercise:", error);
        setLoading(false);
        return;
      }

      setExercise(data);
      setDescription(data.description || "");

      // Load image
      const imagePath = data.image_path || "no_image.png";
      const { data: urlData } = supabase.storage
        .from("exercise-images")
        .getPublicUrl(imagePath);

      setImageUrl(urlData.publicUrl);
      setLoading(false);
    }

    fetchExercise();
  }, [id]);

  return (
    <div className={styles.page}>
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
                  const max = 260;
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
              className={styles.inputBox}
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            />
            <select
              className={styles.dropdown}
              value={frequencyType}
              onChange={(e) => setFrequencyType(e.target.value)}
            >
              <option value="day">Times / Day</option>
              <option value="week">Times / Week</option>
              <option value="month">Times / Month</option>
            </select>
          </div>

          <div className={styles.inputRow}>
            <label className={styles.label}>Sets</label>
            <input
              type="number"
              className={styles.inputBox}
              value={sets}
              onChange={(e) => setSets(e.target.value)}
            />
            <span className={styles.inputDesc}># of Sets</span>
          </div>

          <div className={styles.inputRow}>
            <label className={styles.label}>{repType === "reps" ? "Reps" : "Seconds"}</label>
            <input
              type="number"
              className={styles.inputBox}
              value={reps}
              onChange={(e) => setReps(e.target.value)}
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