interface ExerciseCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
}

export default function ExerciseCard({ name, description, category, imageUrl }: ExerciseCardProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    console.log('Image failed to load:', imageUrl);
    target.src = '/images/default.png';
  };

  const handleInfoClick = () => {
    // Show exercise details in an alert or modal
    alert(`Exercise Details:\n\nName: ${name}\nCategory: ${category}\nDescription: ${description}`);
    
    // Alternative: You could also open a modal, navigate to a detail page, etc.
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