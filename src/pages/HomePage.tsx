import { useEffect, useState } from "react";
import styles from "./HomePage.module.css";
import { supabase } from "../supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import type { Exercise } from "../types/exercise";
import Filter from "../components/Filter";

type FrequencyType = "day" | "week" | "month";
type RepType = "reps" | "seconds";

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

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupExercise, setPopupExercise] = useState<Exercise | null>(null);
  const [popupDirection, setPopupDirection] = useState<"above" | "below">("above");

  const [frequency, setFrequency] = useState("");
  const [frequencyType, setFrequencyType] = useState<FrequencyType>("week");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [repType, setRepType] = useState<RepType>("reps");
  const [comments, setComments] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

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

  // Fetch Exercises (global + current user's personal only)
  useEffect(() => {
    async function fetchExercises() {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id ?? null;

      const query = supabase
        .from("exercises")
        .select("id, name, category, description, image_path, creator");

      const { data } = currentUserId
        ? await query.or(`visibility.is.null,visibility.eq.${currentUserId}`)
        : await query.is("visibility", null);

      const tagged = (data || []).map((ex) => ({
        ...ex,
        source: ex.creator ? "personal" : "global",
      }));
      setExercises(tagged);
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

  const openPopup = (exerciseData: Exercise, button: HTMLButtonElement) => {
    const rect = button.getBoundingClientRect();
    const estimatedPopupHeight = 360;
    const gap = 10;
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    setPopupDirection(
      spaceAbove >= estimatedPopupHeight + gap || spaceAbove > spaceBelow
        ? "above"
        : "below"
    );

    setPopupExercise(exerciseData);
    setIsPopupOpen(true);
    setAttemptedSubmit(false);
    setFrequency("");
    setFrequencyType("week");
    setSets("");
    setReps("");
    setRepType("reps");
    setComments("");
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setPopupExercise(null);
    setAttemptedSubmit(false);
  };

  const isFrequencyValid = Number(frequency) > 0;
  const isSetsValid = Number(sets) > 0;
  const isRepsValid = Number(reps) > 0;
  const canAdd = isFrequencyValid && isSetsValid && isRepsValid;

  const handleAddToCartFromPopup = async () => {
    setAttemptedSubmit(true);
    if (!popupExercise || !canAdd) return;
    if (!userId) { navigate('/sign-in'); return; }

    const { error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: userId,
        exercise_id: popupExercise.id,
        name: popupExercise.name,
        category: popupExercise.category || '',
        description: popupExercise.description,
        image_path: popupExercise.image_path,
        frequency,
        frequency_type: frequencyType,
        sets,
        reps,
        rep_type: repType,
        comments,
        added_at: Date.now(),
      }, { onConflict: 'user_id,exercise_id' });

    if (error) {
      console.error("Error saving to cart:", error);
    } else {
      setAddedIds((prev) => new Set([...prev, popupExercise.id]));
      window.dispatchEvent(new Event('cartUpdated'));
      closePopup();
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, exerciseId: string) => {
    e.stopPropagation();
    if (!userId) { navigate('/sign-in'); return; }

    const isFavorited = favorites.has(exerciseId);

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

      {isPopupOpen && <div className={styles.popupBackdrop} onClick={closePopup} />}

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
              className={`${styles.addButton} ${addedIds.has(exercise.id) ? styles.addButtonAdded : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (isPopupOpen && popupExercise?.id === exercise.id) {
                  closePopup();
                } else {
                  openPopup(exercise, e.currentTarget);
                }
              }}
              title={addedIds.has(exercise.id) ? "Already in list" : "Add to list"}
              aria-label="Add to list"
            >
              {addedIds.has(exercise.id) ? '✓' : '+'}
            </button>

            {/* Popup */}
            {isPopupOpen && popupExercise?.id === exercise.id && (
              <div
                className={`${styles.popupBox} ${popupDirection === "above" ? styles.popupAbove : styles.popupBelow}`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
              >
                <div className={styles.popupHeader}>
                  <h2 className={styles.popupTitle}>{popupExercise.name}</h2>
                  <button className={styles.popupClose} onClick={closePopup} aria-label="Close">×</button>
                </div>

                <div className={styles.popupForm}>
                  <div className={styles.popupRow}>
                    <label className={styles.popupLabel}>Frequency</label>
                    <input
                      type="number"
                      min="1"
                      className={`${styles.popupInput} ${attemptedSubmit && !isFrequencyValid ? styles.invalidInput : ''}`}
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                    />
                    <select
                      className={styles.popupSelect}
                      value={frequencyType}
                      onChange={(e) => setFrequencyType(e.target.value as FrequencyType)}
                    >
                      <option value="day">/Day</option>
                      <option value="week">/Week</option>
                      <option value="month">/Month</option>
                    </select>
                  </div>

                  <div className={styles.popupRow}>
                    <label className={styles.popupLabel}>Sets</label>
                    <input
                      type="number"
                      min="1"
                      className={`${styles.popupInput} ${attemptedSubmit && !isSetsValid ? styles.invalidInput : ''}`}
                      value={sets}
                      onChange={(e) => setSets(e.target.value)}
                    />
                  </div>

                  <div className={styles.popupRow}>
                    <label className={styles.popupLabel}>{repType === "reps" ? "Reps" : "Seconds"}</label>
                    <input
                      type="number"
                      min="1"
                      className={`${styles.popupInput} ${attemptedSubmit && !isRepsValid ? styles.invalidInput : ''}`}
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                    />
                    <select
                      className={styles.popupSelect}
                      value={repType}
                      onChange={(e) => setRepType(e.target.value as RepType)}
                    >
                      <option value="reps">Reps</option>
                      <option value="seconds">Seconds</option>
                    </select>
                  </div>

                  <textarea
                    className={styles.popupTextarea}
                    placeholder="Additional comments..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />

                  {attemptedSubmit && !canAdd && (
                    <div className={styles.popupError}>
                      Please fill in all required fields (Frequency, Sets, {repType === "reps" ? "Reps" : "Seconds"}).
                    </div>
                  )}

                  <div className={styles.popupActions}>
                    <button className={styles.popupCancelBtn} onClick={closePopup}>Cancel</button>
                    <button className={styles.popupAddBtn} onClick={handleAddToCartFromPopup}>Add to list</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
