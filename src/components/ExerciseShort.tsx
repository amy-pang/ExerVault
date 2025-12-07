import React from 'react';
import './ExerciseShort.css';


interface ExerciseShortProp {
title: string;
description: string;
category: string;
imageSrc: string;
}


const ExerciseShort: React.FC<ExerciseShortProp> = ({ title, description, category, imageSrc }) => {
return (
<div className="exercise-card">
<div className="exercise-info">
<div className="exercise-header">
<span className="info-icon">ℹ️</span>
<h2>{title}</h2>
</div>
<p className="exercise-description">{description}</p>
<p className="exercise-category">⭐ {category}</p>
</div>
<img className="exercise-image" src={imageSrc} alt={title} />
</div>
);
};


export default ExerciseShort;