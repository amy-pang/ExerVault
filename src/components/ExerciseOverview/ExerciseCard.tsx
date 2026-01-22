import "./ExerciseCard.css";

interface ExerciseCardProps {
  name: string;
  equipment: string;
  description?: string;
  imageUrl?: string;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  name,
  equipment,
  description,
  imageUrl,
}) => {
  return (
    <div className="exercise-card">
      <div className="exercise-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={name} />
        ) : (
          <div className="placeholder-icon">🖼️</div>
        )}
      </div>

      <div className="exercise-card-info">
        <h3 className="exercise-name">{name.toUpperCase()}</h3>

        <p className="exercise-equipment">
          <span>Equipment: </span>
          {equipment}
        </p>

        <p className="exercise-description">
          <span>Description: </span>
          {description || "None"}
        </p>
      </div>

      <button className="add-button" type="button" aria-label="Add to Workout Plan">
        +
      </button>
      <div className="add-button-tooltip">Add to Workout Plan?</div>
    </div>
  );
  
};

export default ExerciseCard;
