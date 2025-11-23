import React, { useEffect, useState } from "react";
import "./ExercisePage.css";

export default function ExercisePage() {
  const [frequency, setFrequency] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [repType, setRepType] = useState("reps"); // "reps" or "seconds"
  const [description, setDescription] = useState("");
  const [comments, setComments] = useState("");

  // Load saved values on mount
  useEffect(() => {
    setFrequency(localStorage.getItem("frequency") || "");
    setSets(localStorage.getItem("sets") || "");
    setReps(localStorage.getItem("reps") || "");
    setRepType(localStorage.getItem("repType") || "reps");
    setDescription(localStorage.getItem("description") || "");
    setComments(localStorage.getItem("comments") || "");
  }, []);

  // Persist values
  useEffect(() => localStorage.setItem("frequency", frequency), [frequency]);
  useEffect(() => localStorage.setItem("sets", sets), [sets]);
  useEffect(() => localStorage.setItem("reps", reps), [reps]);
  useEffect(() => localStorage.setItem("repType", repType), [repType]);
  useEffect(() => localStorage.setItem("description", description), [description]);
  useEffect(() => localStorage.setItem("comments", comments), [comments]);

  return (
    <div className="page">

      <header className="topBar">
        <div className="icon">🏠</div>

        <div className="searchWrapper">
          <input className="searchBar" type="text" placeholder="Search by exercise name" />
          <div className="searchIcon">🔍</div>
        </div>

        <div className="icon">🛒</div>
      </header>

      <h1 className="exerciseTitle">
        Exercise Name <span className="category">Category</span>
      </h1>

      <div className="content">

        <div className="leftSection">

          <div className="imagePlaceholder">
            <div className="circle"></div>
            <div className="triangle"></div>
          </div>

          <div className="inputRow">
            <label className="label">Frequency</label>
            <input
              type="number"
              className="inputBox"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            />
            <span className="inputDesc">Times/Week</span>
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
            <label className="label">Reps</label>

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

            <span className="inputDesc">
              {repType === "reps" ? "# of reps" : "Seconds"}
            </span>
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

          <button className="addBtn">Add to list</button>
        </div>

      </div>
    </div>
  );
}
