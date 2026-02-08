import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

import "./ExercisePage.css";

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
    <div className="page">
      <h1 className="exerciseTitle">
        {loading ? "Loading..." : exercise?.name}
        <span className="category">{exercise?.category}</span>
      </h1>

      <div className="content">
        <div className="leftSection">
          <div
            className="imagePlaceholder"
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

                  let width = max;
                  let height = max;

                  if (ratio > 1) height = max / ratio;
                  else width = max * ratio;

                  setImageDimensions({ width, height });
                }}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            )}
          </div>

          <div className="inputRow">
            <label className="label">Frequency</label>
            <input
              type="number"
              className="inputBox"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            />
            <select
              className="dropdown"
              value={frequencyType}
              onChange={(e) => setFrequencyType(e.target.value)}
            >
              <option value="day">Times / Day</option>
              <option value="week">Times / Week</option>
              <option value="month">Times / Month</option>
            </select>
          </div>

          <div className="inputRow">
            <label className="label">Sets</label>
            <input
              type="number"
              className="inputBox"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
            />
          </div>

          <div className="inputRow">
            <label className="label">{repType === "reps" ? "Reps" : "Seconds"}</label>
            <input
              type="number"
              className="inputBox"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
            <select
              className="dropdown"
              value={repType}
              onChange={(e) => setRepType(e.target.value)}
            >
              <option value="reps">Reps</option>
              <option value="seconds">Seconds</option>
            </select>
          </div>
        </div>

        <div className="rightSection">
          <textarea
            className="description"
            placeholder="Description of exercise"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <textarea
            className="comments"
            placeholder="Additional comments..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />

          <button
            className="addBtn"
            onClick={() => console.log("Saved (no cart)")}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
