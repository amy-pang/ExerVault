import React, { useMemo } from "react";
import type { Exercise } from "../../types/exercise";
import { supabase } from "../../supabaseClient";
import ExerciseCard from "./ExerciseCard";
import styles from "./ExerciseListCard.module.css";

const BUCKET = "exercise-images";

type ExerciseOverviewProps = Exercise;

export default function ExerciseOverview(props: ExerciseOverviewProps) {
  const imageUrl = useMemo(() => {
    if (!props.image_path) return undefined;

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(props.image_path);

    return data.publicUrl || undefined;
  }, [props.image_path]);

  return (
    <div className={styles.exerciseOverviewCard}>
      <ExerciseCard
        name={props.name}
        equipment={props.category}
        description={props.description}
        imageUrl={imageUrl}
      />
    </div>
  );
}
