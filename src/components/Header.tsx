import { useEffect, useRef, useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { ShoppingCart } from "lucide-react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";

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

export default function Header({ query, onQueryChange }: HeaderProps) {
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
      setLoading(false);
      return;
    }

    setOpen(true);
    setLoading(true);

    const t = window.setTimeout(async () => {
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
        setResults((data ?? []) as ExerciseResult[]);
      }

      setLoading(false);
    }, 250);

    return () => window.clearTimeout(t);
  }, [query]);

  return (
    <div className={styles.headerWrapper}>
      <header className={styles.headerContainer}>
        <Link to="/" className={styles.headerHomeLink} aria-label="Home">
          <AiOutlineHome className={styles.headerIcon} />
        </Link>

        {/* This wrapper anchors the popup underneath the input */}
        <div className={styles.searchWrap} ref={wrapperRef}>
          <div className={styles.searchBar}>
            <input
              className={styles.searchInput}
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
            <div className={styles.searchPopup} role="listbox">
              {loading ? (
                <div className={`${styles.searchPopupRow} ${styles.muted}`}>
                  Searching…
                </div>
              ) : results.length === 0 ? (
                <div className={`${styles.searchPopupRow} ${styles.muted}`}>
                  No matches
                </div>
              ) : (
                results.map((ex) => (
                  <Link
                    key={ex.id}
                    to={`/exercise/${ex.id}`}
                    className={styles.searchPopupRow}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setOpen(false)}
                  >
                    <div className={styles.rowTitle}>{ex.name}</div>
                    <div className={styles.rowSub}>{ex.category}</div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        <Link
          to="/exercise-list"
          className={styles.headerHomeLink}
          aria-label="Exercise cart"
        >
          <ShoppingCart className={styles.headerIcon} />
        </Link>
      </header>
    </div>
  );
}
