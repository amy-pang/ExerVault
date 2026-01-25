import { useEffect, useState } from "react";
import ExerciseCard from "./ExerciseCard";
import "./ExerciseOverview.css";
import { supabase } from "../../supabaseClient";

type ExerciseRow = {
  id: string;
  created_at: string;
  name: string | null;
  category: string | null;
  description: string | null;
  image_path: string | null;
};

const BUCKET = "exercise-images";

export default function ExerciseOverview() {
  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return undefined;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(imagePath);
    return data.publicUrl || undefined;
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("exercises")
        .select("id, created_at, name, category, description, image_path")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMsg(`Supabase error: ${error.message}`);
        setExercises([]);
      } else {
        setExercises((data as ExerciseRow[]) ?? []);
      }

      setLoading(false);
    };

    run();
  }, []);

  return (
    <div className="exercise-overview-page">
      {errorMsg && <div className="exercise-error">{errorMsg}</div>}
      {loading && <div className="exercise-loading">Loading…</div>}

      {!loading && !errorMsg && (
        <div className="exercise-overview-grid">
          {exercises.map((ex) => (
            <ExerciseCard
              key={ex.id}
              name={ex.name ?? "Unnamed Exercise"}
              equipment={ex.category ?? "Uncategorized"}
              description={ex.description ?? "No description"}
              imageUrl={getImageUrl(ex.image_path)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
