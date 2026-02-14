import { useState } from 'react';
import './ExerciseListCard.css'

interface ExerciseListCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
  frequency?: string;
  frequencyType?: 'week' | 'day' | 'month';
  sets?: string;    
  reps?: string;
  repType?: 'reps' | 'seconds';
  comments?: string;
}

export default function ExerciseListCard({ 
  name, 
  description, 
  category, 
  imageUrl,
  frequency,
  frequencyType,
  sets,
  reps,
  repType,
  comments
}: ExerciseListCardProps) {
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    setImgError(true);
  };

  return (
    <div className="exercise-list-card">
      <div className="exercise-list-info">
        <div className="exercise-list-name-row">
          <span className="exercise-list-info-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </span>
          <h3 className="exercise-list-name">{name}</h3>
        </div>
        
        <p className="exercise-list-description">
          {description}
        </p>

        <div className="exercise-list-category-row">
          <span className="exercise-list-category-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </span>
          <span className="exercise-list-category-text">{category}</span>
        </div>
        
        {(frequency || sets || reps || comments) && (
          <div className="exercise-list-prescription">
            {frequency && frequencyType && (
              <p className="exercise-list-prescription-item">
                <span>Frequency:</span> {frequency}x/{frequencyType}
              </p>
            )}
            {sets && (
              <p className="exercise-list-prescription-item">
                <span>Sets:</span> {sets}
              </p>
            )}
            {reps && (
              <p className="exercise-list-prescription-item">
                <span>{repType === 'reps' ? 'Reps' : 'Duration'}:</span> {reps}{repType === 'seconds' ? 's' : ''}
              </p>
            )}
            {comments && (
              <p className="exercise-list-prescription-item">
                <span>Notes:</span> {comments}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="exercise-list-image">
        {!imgError && imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name}
            onError={handleImageError}
          />
        ) : (
          <div className="exercise-list-no-image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>No image</span>
          </div>
        )}
      </div>
    </div>
  );
}