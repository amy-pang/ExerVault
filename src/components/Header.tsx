import { useEffect, useRef, useState } from "react";
import { AiOutlineHome, AiOutlineSearch } from "react-icons/ai";
import { ShoppingCart } from "lucide-react";
import "./Header.css";
import { supabase } from "../supabaseClient";
import ExercisePage from "../pages/ExercisePage";
import { Link } from "react-router-dom";

type HeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onPickExercise?: (exerciseId: string) => void;
};

type ExerciseResult = {
  id: string;
  name: string;
  category: string | null;
};

export default function Header({ query, onQueryChange, onPickExercise }: HeaderProps) {
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exerciseOpen, setExerciseOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);


  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Close popup when clicking outside
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  // Debounced database search
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setOpen(false);
      return;
    }

    setOpen(true);

    const t = window.setTimeout(async () => {
      console.log("Searching NAME for:", q);

      const { data, error } = await supabase
        .from("exercises")
        .select("id,name,category")
        .ilike("name", `%${q}%`)
        .order("name", { ascending: true })
        .limit(5);

      if (error) {
        console.error("Search error:", error);
        setResults([]);
      } else {
        console.log("Results:", data);
        setResults((data ?? []) as { id: string; name: string; category: string }[]);
      }
    }, 250);

    return () => window.clearTimeout(t);
  }, [query]);


  return (
    <div className="header-wrapper">
      <header className="header-container">
        <AiOutlineHome className="header-icon" color="black" />

        {/* This wrapper anchors the popup underneath the input */}
        <div className="search-wrap" ref={wrapperRef}>
          <div className="search-bar">
            <input
              className="search-input"
              type="text"
              placeholder="Search exercises..."
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onFocus={() => query.trim() && setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
              }}
            />
          </div>

          {/* Popup dropdown */}
          {open && (
            <div className="search-popup" role="listbox">
              {loading ? (
                <div className="search-popup-row muted">Searching…</div>
              ) : results.length === 0 ? (
                <div className="search-popup-row muted">No matches</div>
              ) : (
                results.map((ex) => (
                  <Link
                    key={ex.id}
                    to={`/exercise/${ex.id}`}
                    className="search-popup-row"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setOpen(false)}
                  >
                    <div className="row-title">{ex.name}</div>
                    <div className="row-sub">{ex.category}</div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        <ShoppingCart className="header-icon" color="black" />
      </header>
    </div>
  );
}
