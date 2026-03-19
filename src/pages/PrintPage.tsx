import { useEffect, useMemo, useState, type CSSProperties } from "react";
import "./PrintPage.css";

import { supabase } from "../supabaseClient";
import { Cart, type Exercise } from "../types/exercise";

interface PrintPageProps {
  cart: Cart;
}

type PrintExercise = Exercise & {
  image_url?: string;
  frequencyType?: string;
  repType?: string;
  addedAt?: string | number;
};

export default function PrintPage({ cart }: PrintPageProps) {
  const [fontSize, setFontSize] = useState<number>(16);
  const [color, setColor] = useState<string>("#1a4b7a");
  const [blackAndWhite, setBlackAndWhite] = useState<boolean>(false);

  const [exercises, setExercises] = useState<PrintExercise[]>([]);
  const [loading, setLoading] = useState(true);

  const printAreaStyle = useMemo(() => {
    return {
      fontSize: `${fontSize}px`,
      color,
      filter: blackAndWhite ? "grayscale(100%)" : "none",
    } as CSSProperties;
  }, [fontSize, color, blackAndWhite]);

  useEffect(() => {
    fetchCartExercises();

    const interval = setInterval(() => {
      fetchCartExercises();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchCartExercises = async () => {
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .order("added_at", { ascending: true });
      

      console.log("cart_items data:", data);
      console.log("cart_items error:", error);

      if (error) throw error;

      if (!data || data.length === 0) {
        setExercises([]);
        setLoading(false);
        return;
      }

      const exercisesWithUrls: PrintExercise[] = data.map((item) => {
        let imageUrl = "/images/default.png";

        if (item.image_path) {
          const { data: urlData } = supabase.storage
            .from("exercise-images")
            .getPublicUrl(item.image_path);

          if (urlData?.publicUrl) imageUrl = urlData.publicUrl;
        }

        return {
          id: item.exercise_id ?? item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          image_path: item.image_path,
          image_url: imageUrl,
          frequency: item.frequency,
          frequencyType: item.frequency_type,
          sets: item.sets,
          reps: item.reps,
          repType: item.rep_type,
          comments: item.comments,
          addedAt: item.added_at,
        };
      });

      setExercises(exercisesWithUrls);
    } catch (e) {
      console.error("Error fetching cart exercises:", e);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  function handlePrint() {
    window.print();
  }

  return (
    <main id="printPageRoot">
      <section id="controls">
        <h1>Customize & Print</h1>

        <div className="controlsRow">
          <div className="controlsLeft">
            <label>
              Font size
              <select
                id="fontSize"
                value={String(fontSize)}
                onChange={(e) => setFontSize(Number(e.target.value))}
              >
                <option value="14">Small</option>
                <option value="16">Medium</option>
                <option value="18">Large</option>
              </select>
            </label>

            <label>
              Color
              <select
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={blackAndWhite}
              >
                <option value="#1a4b7a">Blue</option>
                <option value="#000">Black</option>
              </select>
            </label>

            <label>
              <input
                type="checkbox"
                checked={blackAndWhite}
                onChange={(e) => setBlackAndWhite(e.target.checked)}
              />
              Black and white
            </label>
          </div>

          <button className="printBtn" type="button" onClick={handlePrint}>
            Print Now
          </button>
        </div>
      </section>

      <section id="printArea" style={printAreaStyle}>
        <h2 className="heading">Exercise List</h2>

        {loading ? (
          <p>Loading…</p>
        ) : exercises.length === 0 ? (
          <p>No exercises found.</p>
        ) : (
          <div className="printCards">
            {exercises.map((ex) => (
              <div key={ex.addedAt ?? ex.id} className="exercise-card">
                <div className="exercise-card-image">
                  <img
                    src={ex.image_url || "/images/default.png"}
                    alt={ex.name}
                  />
                </div>

                <div className="exercise-card-content">
                  <div className="exercise-name">{ex.name}</div>

                  <p className="exercise-description">{ex.description}</p>

                  <p>
                    <strong>Category:</strong> {ex.category}
                  </p>

                  {ex.frequency !== undefined && ex.frequency !== null && (
                    <p>
                      <strong>Frequency:</strong> {ex.frequency}
                      {ex.frequencyType ? ` ${ex.frequencyType}` : ""}
                    </p>
                  )}

                  {ex.sets !== undefined && ex.sets !== null && (
                    <p>
                      <strong>Sets:</strong> {ex.sets}
                    </p>
                  )}

                  {ex.reps !== undefined && ex.reps !== null && (
                    <p>
                      <strong>Reps:</strong> {ex.reps}
                      {ex.repType ? ` ${ex.repType}` : ""}
                    </p>
                  )}

                  {ex.comments && ex.comments.trim() !== "" && (
                    <p>
                      <strong>Comments:</strong> {ex.comments}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}