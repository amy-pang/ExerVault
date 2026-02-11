import { useEffect, useMemo, useState } from "react";
import "./PrintPage.css";

import { supabase } from "../supabaseClient";
import ExerciseCard from "../components/ExerciseCard";

type Exercise = {
  id: string;
  name: string;
  description: string;
  category: string;
  image_path: string;
  image_url?: string;
};

export default function PrintPage() {
  const [fontSize, setFontSize] = useState<number>(16);
  const [color, setColor] = useState<string>("#1a4b7a");

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Apply your style controls to the print container
  const printAreaStyle = useMemo(() => {
    return {
      fontSize: `${fontSize}px`,
      color,
    } as React.CSSProperties;
  }, [fontSize, color]);

  // Fetch the same exercise list as ExerciseListPage
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data, error } = await supabase
          .from("exercises")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        if (!data) {
          setExercises([]);
          return;
        }

        const withUrls: Exercise[] = data.map((exercise: any) => {
          let imageUrl = "/images/default.png";

          if (exercise.image_path) {
            const { data: urlData } = supabase.storage
              .from("exercise-images")
              .getPublicUrl(exercise.image_path);

            if (urlData?.publicUrl) imageUrl = urlData.publicUrl;
          }

          return { ...exercise, image_url: imageUrl };
        });

        setExercises(withUrls);
      } catch (e) {
        console.error("Error fetching exercises:", e);
        setExercises([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  function handlePrint() {
    window.print();
  }

  return (
    <main id="printPageRoot">
      {/* controls (hidden in print) */}
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
              >
                <option value="#1a4b7a">Blue</option>
                <option value="#000">Black</option>
              </select>
            </label>
          </div>

          <button className="printBtn" type="button" onClick={handlePrint}>
            Print Now
          </button>
        </div>
      </section>

      {/* print area */}
      <section id="printArea" style={printAreaStyle}>
        <h2 className="heading">Exercise List</h2>

        {loading ? (
          <p>Loading…</p>
        ) : exercises.length === 0 ? (
          <p>No exercises found.</p>
        ) : (
          <div className="printCards">
            {exercises.map((ex) => (
              <ExerciseCard
                key={ex.id}
                id={ex.id}
                name={ex.name}
                description={ex.description}
                category={ex.category}
                imageUrl={ex.image_url || "/images/default.png"}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}