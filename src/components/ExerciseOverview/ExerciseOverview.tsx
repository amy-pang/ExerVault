interface ExerciseCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  frequency?: string;
  frequencyType?: 'week' | 'day' | 'month';
  sets?: string;
  reps?: string;
  repType?: 'reps' | 'seconds';
  comments?: string;
}

export default function ExerciseCard({ 
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
}: ExerciseCardProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    console.log('Image failed to load:', imageUrl);
    target.src = '/images/default.png';
  };

  const handleInfoClick = () => {
    // Build detailed info string with prescription details if available
    let details = `Exercise Details:\n\nName: ${name}\nCategory: ${category}\nDescription: ${description}`;
    
    if (frequency || sets || reps || comments) {
      details += '\n\n--- Prescription Details ---';
      if (frequency && frequencyType) {
        details += `\nFrequency: ${frequency} times/${frequencyType}`;
      }
      if (sets) {
        details += `\nSets: ${sets}`;
      }
      if (reps && repType) {
        details += `\n${repType === 'reps' ? 'Reps' : 'Seconds'}: ${reps}`;
      }
      if (comments) {
        details += `\nComments: ${comments}`;
      }
    }
    
    alert(details);
  };

  return (
    <div className="exercise-card">
      <div className="exercise-left">
        <button 
          className="exercise-info-icon"
          onClick={handleInfoClick}
          aria-label={`More information about ${name}`}
          title="Click for more details"
        >
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>i</span>
        </button>
        <div className="exercise-content">
          <h3 className="exercise-title">{name}</h3>
          <p className="exercise-description">{description}</p>
          
          {/* Show prescription details if available */}
          {(frequency || sets || reps) && (
            <div style={{ 
              marginTop: '8px', 
              padding: '8px 12px', 
              background: '#e0f2fe', 
              borderRadius: '6px',
              fontSize: '0.85em',
              color: '#0369a1'
            }}>
              {frequency && frequencyType && (
                <div><strong>Frequency:</strong> {frequency}x/{frequencyType}</div>
              )}
              {sets && <div><strong>Sets:</strong> {sets}</div>}
              {reps && (
                <div><strong>{repType === 'reps' ? 'Reps' : 'Duration'}:</strong> {reps}{repType === 'seconds' ? 's' : ''}</div>
              )}
              {comments && (
                <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                  <strong>Notes:</strong> {comments}
                </div>
              )}
            </div>
          )}
          
          <div className="exercise-category">
            <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="9" strokeWidth="2"/>
            </svg>
            <span>{category}</span>
          </div>
        </div>
      </div>
      <div className="exercise-image-container">
        <img 
          src={imageUrl} 
          alt={name}
          className="exercise-image"
          onError={handleImageError}
        />
      </div>
    </div>
  );
}