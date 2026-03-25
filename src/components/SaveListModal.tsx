import { useState } from "react";
import { saveExercisestoList } from "../services/savedExerciseLists";
import type { Exercise } from "../types/exercise";

interface SaveListModalProps {
  isOpen: boolean;
  exercises: Exercise[];
  onClose: () => void;
  onSaveSuccess: () => void;
}

export default function SaveListModal({ isOpen, exercises, onClose, onSaveSuccess }: SaveListModalProps) {
  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!listName.trim()) {
      setError("List name is required");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const exercisesData = exercises.map((ex) => ({
        exerciseId: ex.id,
        sets: ex.sets || "",
        reps: ex.reps || "",
        description: "",
        comments: ex.comments || "",
      }));

      await saveExercisestoList(listName.trim(), exercisesData, listDescription.trim());

      setListName("");
      setListDescription("");
      setError(null);
      onSaveSuccess();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save list";
      setError(message);
      console.error("Error saving list:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={() => !loading && onClose()}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "32px",
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: "0 0 24px 0", fontSize: "24px", fontWeight: "700", color: "#1f2937" }}>
          Save Exercise List
        </h2>

        {error && (
          <div
            style={{
              background: "#fee",
              color: "#c33",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "16px",
              border: "1px solid #fcc",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
            List Name *
          </label>
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="e.g., Shoulder Recovery Program"
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
            Description (Optional)
          </label>
          <textarea
            value={listDescription}
            onChange={(e) => setListDescription(e.target.value)}
            placeholder="Add any notes about this exercise list..."
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "inherit",
              boxSizing: "border-box",
              minHeight: "80px",
              resize: "vertical",
            }}
            disabled={loading}
          />
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "#6b7280",
            marginBottom: "24px",
            background: "#f3f4f6",
            padding: "12px",
            borderRadius: "8px",
          }}
        >
          Saving {exercises.length} {exercises.length === 1 ? "exercise" : "exercises"}
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: "#f3f4f6",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "all 0.2s",
              opacity: loading ? 0.6 : 1,
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.background = "#e5e7eb";
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.background = "#f3f4f6";
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !listName.trim()}
            style={{
              padding: "10px 20px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "all 0.2s",
              opacity: loading || !listName.trim() ? 0.6 : 1,
            }}
            onMouseOver={(e) => {
              if (!loading && listName.trim()) e.currentTarget.style.background = "#2563eb";
            }}
            onMouseOut={(e) => {
              if (!loading && listName.trim()) e.currentTarget.style.background = "#3b82f6";
            }}
          >
            {loading ? "Saving..." : "Save List"}
          </button>
        </div>
      </div>
    </div>
  );
}
