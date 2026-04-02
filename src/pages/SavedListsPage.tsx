import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { getSavedExerciseLists, getExerciseListDetail, deleteExerciseList } from "../services/savedExerciseLists";
import type { ExerciseListSummary } from "../services/savedExerciseLists";
import styles from "./ExerciseListPage.module.css";

export default function SavedListsPage() {
  const [lists, setLists] = useState<ExerciseListSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedLists();
  }, []);

  const fetchSavedLists = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSavedExerciseLists();
      setLists(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch saved lists";
      setError(message);
      console.error("Error fetching saved lists:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadList = async (listId: string) => {
    try {
      setLoading(true);
      const listDetail = await getExerciseListDetail(listId);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be signed in to load a list");
        return;
      }

      // Clear current cart
      await supabase.from("cart_items").delete().eq("user_id", user.id);

      // Add all exercises from the saved list to cart
      for (const item of listDetail.items) {
        await supabase.from("cart_items").insert({
          user_id: user.id,
          exercise_id: item.exercise_id,
          name: item.exercise_name,
          category: item.category,
          description: item.list_item_description,
          image_path: item.image_path,
          frequency: "",
          frequency_type: "",
          sets: item.sets,
          reps: item.reps,
          rep_type: item.rep_type,
          comments: item.comments,
          added_at: Date.now(),
        });
      }

      window.dispatchEvent(new Event("cartUpdated"));
      navigate("/exercise-list");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load list";
      setError(message);
      console.error("Error loading list:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!window.confirm("Are you sure you want to delete this list? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteExerciseList(listId);
      setLists(lists.filter((l) => l.id !== listId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete list";
      setError(message);
      console.error("Error deleting list:", err);
    }
  };

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
            <h1 className={styles.pageTitle}>Saved Lists</h1>
          </div>

          {error && (
            <div
              style={{
                background: "#fee",
                color: "#c33",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "16px",
                border: "1px solid #fcc",
              }}
            >
              {error}
            </div>
          )}

          {lists.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                background: "#f9fafb",
                borderRadius: "12px",
                border: "2px dashed #d1d5db",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }}>📋</div>
              <p style={{ fontSize: "1.3em", color: "#333", marginBottom: "12px", fontWeight: "600" }}>
                No saved lists yet
              </p>
              <p style={{ fontSize: "1em", color: "#666", marginBottom: "30px" }}>
                Create a list from the Exercise List page to save it here.
              </p>
              <button
                className={styles.browseButton}
                onClick={() => navigate("/exercise-list")}
                style={{ padding: "14px 60px", fontSize: "16px" }}
              >
                Go to Exercise List
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {lists.map((list) => (
                <div
                  key={list.id}
                  style={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    transition: "all 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>
                      {list.name}
                    </h3>
                    {list.description && (
                      <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#6b7280" }}>
                        {list.description}
                      </p>
                    )}
                    <p style={{ margin: "0", fontSize: "13px", color: "#9ca3af" }}>
                      {list.item_count} {list.item_count === 1 ? "exercise" : "exercises"} • Created{" "}
                      {new Date(list.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginLeft: "16px",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadList(list.id);
                      }}
                      style={{
                        padding: "10px 20px",
                        background: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "background 0.2s",
                        fontSize: "14px",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#2563eb")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "#3b82f6")}
                    >
                      Load List
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteList(list.id);
                      }}
                      style={{
                        padding: "10px 20px",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "background 0.2s",
                        fontSize: "14px",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#dc2626")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "#ef4444")}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
