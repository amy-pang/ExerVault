import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from '../supabaseClient';
import styles from "./SingleExercisePage.module.css";

export default function ExercisePage() {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [isInCart, setIsInCart] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleAddToList = async () => {
    if (!exercise) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: user.id,
        exercise_id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        description: description || exercise.description,
        image_path: exercise.image_path,
        frequency,
        frequency_type: frequencyType,
        sets,
        reps,
        rep_type: repType,
        comments,
        added_at: Date.now(),
      }, { onConflict: 'user_id,exercise_id' });

    if (!error) {
      window.dispatchEvent(new Event('cartUpdated'));
      setIsInCart(true);
    }
  };
  

  const handleDelete = async () => {
    if (!exercise) {
      console.error("DELETE failed: exercise is null");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${exercise.name}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    console.log("Deleting exercise:", exercise.id, exercise.name);

    try {
      // Step 1: delete image from storage (non-fatal if it fails)
      if (exercise.image_path) {
        console.log("Removing image from storage:", exercise.image_path);
        const { error: storageError } = await supabase.storage
          .from("exercise-images")
          .remove([exercise.image_path]);
        if (storageError) {
          console.warn("Storage delete warning (continuing anyway):", storageError.message);
        }
      }

      // Step 2: delete the row from the exercises table
      console.log("Deleting row from exercises table, id:", exercise.id);
      const { error: deleteError } = await supabase
        .from("exercises")
        .delete()
        .eq("id", exercise.id);

      if (deleteError) {
        console.error("Supabase delete error:", deleteError);
        throw new Error(deleteError.message);
      }

      console.log("Delete successful, navigating home");

      // Step 3: remove from cart if present
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('cart_items').delete().eq('user_id', user.id).eq('exercise_id', exercise.id);
        window.dispatchEvent(new Event('cartUpdated'));
      }

      navigate("/home");
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(`Failed to delete exercise: ${err.message || "Unknown error"}. Check the console for details.`);
    } finally {
      setDeleting(false);
    }
  };
  

  // Fetch exercise from database
  useEffect(() => {
    async function fetchExercise() {
      if (!id) return;
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching exercise:', error);
        setLoading(false);
        return;
      }

      setExercise(data);
      setDescription(data.description || "");

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: cartItem } = await supabase
          .from('cart_items')
          .select('id')
          .eq('user_id', user.id)
          .eq('exercise_id', id)
          .maybeSingle();
        setIsInCart(!!cartItem);
      }

      if (data.image_path) {
        const { data: urlData } = supabase.storage
          .from('exercise-images')
          .getPublicUrl(data.image_path);
        setImageUrl(urlData.publicUrl);
      } else {
        const { data: urlData } = supabase.storage
          .from('exercise-images')
          .getPublicUrl("no_image.png");
        setImageUrl(urlData.publicUrl);
      }

      setLoading(false);
    }

    fetchExercise();
  }, [id]);


  return (
    <div className={styles.page}>

      {/* Title row with DELETE button */}
      <div className={styles.pageHeader}>
        <h1 className={styles.exerciseTitle}>
          {loading ? "Loading..." : exercise?.name || "Exercise Name"}
          <span className={styles.category}>{exercise?.category || "Category"}</span>
        </h1>

        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
          disabled={deleting || loading}
        >
          {deleting ? "DELETING..." : "DELETE"}
        </button>
      </div>

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
              className={styles.inputBox}
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
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