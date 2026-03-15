import { useEffect, useMemo, useState } from "react";
import styles from "./HomePage.module.css";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import type { Exercise } from "../types/exercise";
import Filter from "../components/Filter";

type FrequencyType = "day" | "week" | "month";
type RepType = "reps" | "seconds";

export default function HomePage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupExercise, setPopupExercise] = useState<Exercise | null>(null);
  const [popupDirection, setPopupDirection] = useState<"above" | "below">("above");

  const [frequency, setFrequency] = useState("");
  const [frequencyType, setFrequencyType] = useState<FrequencyType>("week");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [repType, setRepType] = useState<RepType>("reps");
  const [description, setDescription] = useState("");
  const [comments, setComments] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const filteredExercises = useMemo(() => {
    return selectedCategories.length === 0
      ? exercises
      : exercises.filter((exercise) =>
          selectedCategories.includes(exercise.category?.trim().toLowerCase())
        );
  }, [exercises, selectedCategories]);

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
  }, [location.key]);

  const openPopup = (exerciseData: Exercise, button: HTMLButtonElement) => {
    const rect = button.getBoundingClientRect();
    const estimatedPopupHeight = 360;
    const gap = 10;

    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    if (spaceAbove >= estimatedPopupHeight + gap || spaceAbove > spaceBelow) {
      setPopupDirection("above");
    } else {
      setPopupDirection("below");
    }

    setPopupExercise(exerciseData);
    setIsPopupOpen(true);
    setAttemptedSubmit(false);
    setFrequency("");
    setFrequencyType("week");
    setSets("");
    setReps("");
    setRepType("reps");
    setDescription(exerciseData.description || "");
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

    if (!popupExercise) return;
    if (!canAdd) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: user.id,
        exercise_id: popupExercise.id,
        name: popupExercise.name,
        category: popupExercise.category || "",
        description: description || popupExercise.description || "",
        image_path: popupExercise.image_path,
        frequency,
        frequency_type: frequencyType,
        sets,
        reps,
        rep_type: repType,
        comments,
        added_at: Date.now(),
      }, { onConflict: 'user_id,exercise_id' });

    if (error) { console.error('Error adding to cart:', error); return; }

    window.dispatchEvent(new Event('cartUpdated'));
    closePopup();
  };

  if (loading) {
    return <div className={styles.homePage}>Loading...</div>;
  }

  return (
    <div className={styles.homePage}>
      <div className={styles.pageHeaderWrapper}>
        <div className={styles.pageHeader}>
          <h1 className={styles.welcomeText}>Welcome Back!</h1>
          <Filter
            selectedCategories={selectedCategories}
            onChange={setSelectedCategories}
          />
        </div>
      </div>

      <div className={styles.exerciseGrid}>
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className={styles.exerciseCard}
            onClick={() => navigate(`/exercise/${exercise.id}`)}
            style={{ cursor: "pointer" }}
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
                e.stopPropagation();

                if (isPopupOpen && popupExercise?.id === exercise.id) {
                  closePopup();
                } else {
                  openPopup(exercise, e.currentTarget);
                }
              }}
              aria-label="Add to list"
            >
              +
            </button>
            {isPopupOpen && popupExercise?.id === exercise.id && (
              <>
                <div className={styles.popupBackdrop} onClick={closePopup} />

                <div
                  className={`${styles.popupBox} ${
                    popupDirection === "above"
                      ? styles.popupAbove
                      : styles.popupBelow
                  }`}
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                >
                  <div className={styles.popupHeader}>
                    <h2 className={styles.popupTitle}>{popupExercise.name}</h2>

                    <button
                      className={styles.popupClose}
                      onClick={closePopup}
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>

                  <div className={styles.popupForm}>
                    <div className={styles.popupRow}>
                      <label className={styles.popupLabel}>Frequency</label>
                      <input
                        type="number"
                        min="1"
                        className={`${styles.popupInput} ${
                          attemptedSubmit && !isFrequencyValid
                            ? styles.invalidInput
                            : ""
                        }`}
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                      />
                      <select
                        className={styles.popupSelect}
                        value={frequencyType}
                        onChange={(e) =>
                          setFrequencyType(e.target.value as FrequencyType)
                        }
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
                        className={`${styles.popupInput} ${
                          attemptedSubmit && !isSetsValid
                            ? styles.invalidInput
                            : ""
                        }`}
                        value={sets}
                        onChange={(e) => setSets(e.target.value)}
                      />
                    </div>

                    <div className={styles.popupRow}>
                      <label className={styles.popupLabel}>
                        {repType === "reps" ? "Reps" : "Seconds"}
                      </label>
                      <input
                        type="number"
                        min="1"
                        className={`${styles.popupInput} ${
                          attemptedSubmit && !isRepsValid
                            ? styles.invalidInput
                            : ""
                        }`}
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                      />
                      <select
                        className={styles.popupSelect}
                        value={repType}
                        onChange={(e) =>
                          setRepType(e.target.value as RepType)
                        }
                      >
                        <option value="reps">Reps</option>
                        <option value="seconds">Seconds</option>
                      </select>
                    </div>

                    <textarea
                      className={styles.popupTextarea}
                      placeholder="Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />

                    <textarea
                      className={styles.popupTextarea}
                      placeholder="Additional comments..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                    />

                    {attemptedSubmit && !canAdd && (
                      <div className={styles.popupError}>
                        Frequency, Sets, and Reps are required.
                      </div>
                    )}

                    <div className={styles.popupActions}>
                      <button
                        className={styles.popupCancelBtn}
                        onClick={closePopup}
                      >
                        Cancel
                      </button>
                      <button
                        className={styles.popupAddBtn}
                        onClick={handleAddToCartFromPopup}
                      >
                        Add to list
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
