import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from '../supabaseClient';
import { Cart } from '../types/exercise';
import type { Exercise } from '../types/exercise';
import "./ExercisePage.css";

export default function ExercisePage() {
  const { id } = useParams();
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [imageDimensions, setImageDimensions] = useState({ width: 260, height: 260 });
  const [cart] = useState(() => new Cart());
  
  const [frequency, setFrequency] = useState("");
  const [frequencyType, setFrequencyType] = useState("week"); // "week", "day", or "month"
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [repType, setRepType] = useState("reps"); // "reps" or "seconds"
  const [description, setDescription] = useState("");
  const [comments, setComments] = useState("");
  const [isInCart, setIsInCart] = useState(false);

  const handleAddToList = () => {
    if (!exercise) return;

    const exerciseToAdd: Exercise = {
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      description: description || exercise.description,
      image_path: exercise.image_path,
      frequency,
      frequencyType: frequencyType as 'week' | 'day' | 'month',
      sets,
      reps,
      repType: repType as 'reps' | 'seconds',
      comments,
    };

    cart.addToCart(exerciseToAdd);
    setIsInCart(true);
    console.log(`${exercise.name} added to list!`);
    console.log(cart.getExercises());
  };

  // Fetch exercise from database
  useEffect(() => {
    async function fetchExercise() {
      if (!id) return;
      console.log(import.meta.env.VITE_SUPABASE_URL);
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching exercise:', error);
        console.log('Looking for ID:', id);
        setLoading(false);
        return;
      }
      
      setExercise(data);
      setDescription(data.description || "");
      
      // Check if exercise is already in cart
      const cartExercises = cart.getExercises();
      const existsInCart = cartExercises.some(ex => ex.id === id);
      setIsInCart(existsInCart);
      
      // Debug: log the image path
      console.log('Image path from DB:', data.image_path);
      
      // Get image URL from storage
      if (data.image_path) {
        const { data: urlData } = supabase.storage
          .from('exercise-images')
          .getPublicUrl(data.image_path);
        console.log('Generated public URL:', urlData.publicUrl);
        setImageUrl(urlData.publicUrl);
      }
      else {
        console.log("No image available");
        const { data: urlData } = supabase.storage
          .from('exercise-images')
          .getPublicUrl("no_image.png");
        setImageUrl(urlData.publicUrl);
      }
      
      setLoading(false);
    }
    
    fetchExercise();
  }, [id]);

  // Load saved values on mount
  useEffect(() => {
    setFrequency(localStorage.getItem("frequency") || "");
    setFrequencyType(localStorage.getItem("frequencyType") || "week");
    setSets(localStorage.getItem("sets") || "");
    setReps(localStorage.getItem("reps") || "");
    setRepType(localStorage.getItem("repType") || "reps");
    setComments(localStorage.getItem("comments") || "");
  }, []);

  // Persist values
  useEffect(() => localStorage.setItem("frequency", frequency), [frequency]);
  useEffect(() => localStorage.setItem("frequencyType", frequencyType), [frequencyType]);
  useEffect(() => localStorage.setItem("sets", sets), [sets]);
  useEffect(() => localStorage.setItem("reps", reps), [reps]);
  useEffect(() => localStorage.setItem("repType", repType), [repType]);
  useEffect(() => localStorage.setItem("description", description), [description]);
  useEffect(() => localStorage.setItem("comments", comments), [comments]);

  return (
    <div className="page">
      
      <h1 className="exerciseTitle">
        {loading ? "Loading..." : exercise?.name || "Exercise Name"} 
        <span className="category">{exercise?.category || "Category"}</span>
      </h1>

      <div className="content">

        <div className="leftSection">

          <div className="imagePlaceholder" style={{ width: imageDimensions.width, height: imageDimensions.height }}>
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
                  
                  if (ratio > 1) {
                    height = maxSize / ratio;
                  } else {
                    width = maxSize * ratio;
                  }
                  
                  setImageDimensions({ width, height });
                }}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
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
              <option value="day">Times/Day</option>
              <option value="week">Times/Week</option>
              <option value="month">Times/Month</option>
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
            <span className="inputDesc"># of Sets</span>
          </div>

          {/* UPDATED REPS ROW WITH DROPDOWN */}
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
            placeholder="Description of Exercise"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <textarea
            className="comments"
            placeholder="Additional Comments..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />

          <button className="addBtn" onClick={handleAddToList}>{isInCart ? "Update in list" : "Add to list"}</button>
        </div>

      </div>
    </div>
  );
}
