import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import ExerciseListCard from "../components/ExerciseListCard";
import Sidebar from "../components/Sidebar";
import type { Exercise } from "../types/exercise";
import styles from "./ExerciseListPage.module.css";

interface CartExerciseWithImage extends Exercise {
  image_url?: string;
}

export default function ExerciseListPage() {
  const [cartExercises, setCartExercises] = useState<CartExerciseWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartExercises();
    window.addEventListener('cartUpdated', fetchCartExercises);
    return () => window.removeEventListener('cartUpdated', fetchCartExercises);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCartExercises = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setCartExercises([]); setLoading(false); return; }

      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) { setCartExercises([]); setLoading(false); return; }

      const exerciseIds = data.map((item) => item.exercise_id);
      const { data: exerciseData } = await supabase
        .from('exercises')
        .select('id, image_path')
        .in('id', exerciseIds);

      const exercisesWithUrls: CartExerciseWithImage[] = data.map((item) => {
        const dbExercise = exerciseData?.find((ex) => ex.id === item.exercise_id);

        let imageUrl = "/images/default.png";
        if (dbExercise?.image_path) {
          const { data: urlData } = supabase.storage
            .from("exercise-images")
            .getPublicUrl(dbExercise.image_path);
          if (urlData?.publicUrl) imageUrl = urlData.publicUrl;
        }

        return {
          id: item.exercise_id,
          name: item.name,
          category: item.category || '',
          description: item.description || '',
          image_path: item.image_path,
          image_url: imageUrl,
          frequency: item.frequency,
          frequencyType: item.frequency_type as 'week' | 'day' | 'month',
          sets: item.sets,
          reps: item.reps,
          repType: item.rep_type as 'reps' | 'seconds',
          comments: item.comments,
          addedAt: item.added_at,
        };
      });

      setCartExercises(exercisesWithUrls);
    } catch (error) {
      console.error("Error fetching cart exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id).eq('exercise_id', id);
    window.dispatchEvent(new Event('cartUpdated'));
    fetchCartExercises();
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear all exercises from the cart?")) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    window.dispatchEvent(new Event('cartUpdated'));
    setCartExercises([]);
  };



  const handleContinueBrowsing = () => {
    navigate("/");
    window.scrollTo(0, 0);
  };

  const filteredExercises = cartExercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className={styles.loadingScreen}>Loading...</div>;
  }

  return (
    <div className={styles.phytheraApp}>
      <div className={styles.mainRow}>
        <div className={styles.exerciseListCol}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <h1 className={styles.pageTitle}>Exercise List</h1>

            {cartExercises.length > 0 && (
              <button
                onClick={handleClearCart}
                style={{
                  padding: "10px 20px",
                  background: "#ff4444",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#cc0000")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#ff4444")}
              >
                Clear List
              </button>
            )}
          </div>

          {filteredExercises.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                background: "#f9fafb",
                borderRadius: "12px",
                border: "2px dashed #d1d5db",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }}>🛒</div>
              <p style={{ fontSize: "1.3em", color: "#333", marginBottom: "12px", fontWeight: "600" }}>
                Your list is empty
              </p>
              <p style={{ fontSize: "1em", color: "#666", marginBottom: "30px" }}>
                Browse exercises and add them to create a prescription for your patient.
              </p>
              <button
                className={styles.browseButton}
                onClick={handleContinueBrowsing}
                style={{ padding: "14px 60px", fontSize: "16px" }}
              >
                Browse Exercises
              </button>
            </div>
          ) : (
            <>
              {filteredExercises.map((ex) => (
                <div key={ex.addedAt ?? ex.id} style={{ position: "relative", marginBottom: "16px" }}>
                  <ExerciseListCard
                    id={ex.id}
                    name={ex.name}
                    category={ex.category}
                    description={ex.description}
                    imageUrl={ex.image_url || "/images/default.png"}
                    frequency={ex.frequency}
                    frequencyType={ex.frequencyType}
                    sets={ex.sets}
                    reps={ex.reps}
                    repType={ex.repType}
                    comments={ex.comments}
                  />

                  <button
                    onClick={() => handleRemoveFromCart(ex.id)}
                    title="Remove from list"
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: "16px",
                      background: "#ff4444",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      cursor: "pointer",
                      fontSize: "20px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      zIndex: 10,
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "#cc0000";
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "#ff4444";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}

              <div className={styles.browseBtnRow}>
                <button className={styles.browseButton} onClick={handleContinueBrowsing}>
                  Continue Browsing
                </button>
              </div>
            </>
          )}
        </div>

        <Sidebar exercises={filteredExercises} />
      </div>
    </div>
  );
}