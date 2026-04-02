import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import styles from "./UploadPage.module.css";

const CATEGORIES = [
  "Hip",
  "Pelvic Floor",
  "Vision",
  "Core",
  "Back",
  "Nerve Glide",
  "Wrist/Hand",
  "Theraputty",
  "Vestibular",
  "Other",
];

export default function UploadPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saveTarget, setSaveTarget] = useState<'global' | "personal">("global");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

const handleSubmit = async () => {
    setError(null);

    if (!name.trim()) {
      setError("Exercise name is required.");
      return;
    }
    if (!category) {
      setError("Please select a category.");
      return;
    }

    setUploading(true);

    try {
      let imagePath: string | null = null;

      // Upload image (applies to both personal and global)
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("exercise-images")
          .upload(filePath, imageFile);

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        imagePath = filePath;
      }

      // Resolve creator: personal exercises get the current user's ID, global exercises get null
      let creator: string | null = null;
      if (saveTarget === "personal") {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("You must be logged in to create a personal exercise!");
        creator = user.id;
      }
      const visibility = saveTarget === "personal" ? creator : null;

      const { error: insertError } = await supabase
        .from("exercises")
        .insert([{
          creator,
          name: name.trim(),
          category,
          description: description.trim() || null,
          image_path: imagePath,
          visibility
        }]);

      if (insertError) throw new Error(`Failed to save exercise: ${insertError.message}`);

      setSuccess(true);

      setTimeout(() => {
        setName("");
        setCategory("");
        setDescription("");
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        navigate("/create-exercise");
      }, 1);

    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  //TSX part
  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Create New Exercise</h1>

      <div className={styles.content}>
        {/* Left: Image Upload */}
        <div className={styles.leftSection}>
          <div
            className={styles.imagePlaceholder}
            onClick={() => !imagePreview && fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" />
            ) : (
              <div className={styles.imagePrompt}>
                <span className={styles.imagePromptIcon}>+</span>
                <span>Click to upload image</span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.hiddenInput}
          />

          {imagePreview && (
            <div className={styles.imageActions}>
              <button
                className={styles.changeBtn}
                onClick={() => fileInputRef.current?.click()}
              >
                Change Image
              </button>
              <button className={styles.removeBtn} onClick={handleRemoveImage}>
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Right: Form Fields */}
        <div className={styles.rightSection}>
          <div className={styles.inputRow}>
            <label className={styles.label}>Name</label>
            <input
              type="text"
              className={styles.inputBoxWide}
              placeholder="Exercise name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.inputRow}>
            <label className={styles.label}>Category</label>
            <select
              className={styles.dropdown}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <textarea
            className={styles.description}
            placeholder="Describe the exercise — setup, movement, cues..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {error && <div className={styles.errorMsg}>{error}</div>}
          {success && (
            <div className={styles.successMsg}>
              Exercise added!
            </div>
          )}

          <button
            className={styles.addBtn}
            onClick={handleSubmit}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Add Exercise"}
          </button>
          <div className={styles.inputRow}>
          <label className={styles.label}>Save To</label>
          <select
            className={styles.dropdown}
            value={saveTarget}
            onChange={(e) => setSaveTarget(e.target.value as "global" | "personal")}
          >
            <option value="global">Global (all users)</option>
            <option value="personal">My Exercises (personal)</option>
          </select>
          </div>
        </div>
      </div>
    </div>
  );
}