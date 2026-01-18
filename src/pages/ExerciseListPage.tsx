import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Header from '../components/Header';
import ExerciseCard from '../components/ExerciseCard';
import Sidebar from '../components/Sidebar';

interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  image_path: string;
  image_url?: string;
}

export default function ExerciseListPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      if (!data) return;

      // Map exercises and get public URLs from Supabase Storage
      const exercisesWithUrls = data.map((exercise: any) => {
        let imageUrl = '/images/default.png'; // Default fallback
        
        if (exercise.image_path) {
          // Get public URL from Supabase Storage
          const { data: urlData } = supabase.storage
            .from('exercise-images')
            .getPublicUrl(exercise.image_path);
          
          if (urlData?.publicUrl) {
            imageUrl = urlData.publicUrl;
          }
        }
        
        return {
          ...exercise,
          image_url: imageUrl
        };
      });

      console.log('Fetched exercises with images:', exercisesWithUrls);
      setExercises(exercisesWithUrls);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const filteredExercises = exercises.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="phythera-app">
      {/*<Header 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />*/}

      <div className="main-row">
        <div className="exercise-list-col">
          <h1 className="page-title">Exercise List</h1>
          
          {filteredExercises.length === 0 ? (
            <p>No exercises found.</p>
          ) : (
            filteredExercises.map((ex) => (
              <ExerciseCard
                key={ex.id}
                id={ex.id}
                name={ex.name}
                description={ex.description}
                category={ex.category}
                imageUrl={ex.image_url || '/images/default.png'}
              />
            ))
          )}

          <div className="browse-btn-row">
            <button className="browse-button">Continue Browsing</button>
          </div>
        </div>

        <Sidebar exercises={filteredExercises} />
      </div>

      {/* Hidden Admin Link - for development */}
      <Link to="/admin" style={{ position: 'fixed', bottom: 20, right: 20, opacity: 0.3 }}>
        <button style={{ 
          padding: '10px 20px', 
          background: '#333', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '8px', 
          cursor: 'pointer' 
        }}>
          Admin
        </button>
      </Link>
    </div>
  );
}