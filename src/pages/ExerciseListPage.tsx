import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ExerciseCard from '../components/ExerciseOverview/ExerciseOverview';
import Sidebar from '../components/Sidebar';
import { Cart, type Exercise } from '../types/exercise';

// Extended type to include image_url which we add after fetching
interface CartExerciseWithImage extends Exercise {
  image_url?: string;
}

interface ExerciseListPageProps {
  cart: Cart;
}

export default function ExerciseListPage({ cart }: ExerciseListPageProps) {
  const [cartExercises, setCartExercises] = useState<CartExerciseWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery] = useState('');
  const navigate = useNavigate();

  // Fetch cart exercises on mount and set up interval to check for updates
  useEffect(() => {
    fetchCartExercises();
    
    // Poll for cart changes every second
    const interval = setInterval(() => {
      fetchCartExercises();
    }, 1000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch exercises from cart and enrich with image URLs
  const fetchCartExercises = async () => {
    try {
      const exercises = cart.getExercises();
      
      if (exercises.length === 0) {
        setCartExercises([]);
        setLoading(false);
        return;
      }

      // Fetch full exercise data from Supabase to get images
      const exerciseIds = exercises.map(ex => ex.id);
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .in('id', exerciseIds);

      if (error) throw error;
      if (!data) {
        setCartExercises(exercises);
        setLoading(false);
        return;
      }

      // Map exercises with image URLs and cart-specific data
      const exercisesWithUrls: CartExerciseWithImage[] = exercises.map((cartEx) => {
        const dbExercise = data.find(ex => ex.id === cartEx.id);
        let imageUrl = '/images/default.png';
        
        if (dbExercise?.image_path) {
          const { data: urlData } = supabase.storage
            .from('exercise-images')
            .getPublicUrl(dbExercise.image_path);
          
          if (urlData?.publicUrl) {
            imageUrl = urlData.publicUrl;
          }
        }
        
        return {
          ...cartEx,
          image_url: imageUrl,
          // Preserve cart-specific data
          frequency: cartEx.frequency,
          frequencyType: cartEx.frequencyType,
          sets: cartEx.sets,
          reps: cartEx.reps,
          repType: cartEx.repType,
          comments: cartEx.comments,
          addedAt: cartEx.addedAt,
        };
      });

      setCartExercises(exercisesWithUrls);
    } catch (error) {
      console.error('Error fetching cart exercises:', error);
    } finally {
      setLoading(false);
    }
  };

//Creates option to remove from cart
const handleRemoveFromCart = (id: string) => {
    cart.removeFromCart(id);
    fetchCartExercises();
};

  //Handles clearing all selected exercises from cart
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear all exercises from the cart?')) {
      cart.clearCart();
      setCartExercises([]);
    }
  };

  const handleContinueBrowsing = () => {
    navigate('/');
    window.scrollTo(0, 0);
  };

  const filteredExercises = cartExercises.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="phythera-app">
      <div className="main-row">
        <div className="exercise-list-col">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h1 className="page-title">Exercise Cart</h1>
            {cart.getCartCount() > 0 && (
              <button 
                onClick={handleClearCart}
                style={{
                  padding: '10px 20px',
                  background: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#cc0000'}
                onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#ff4444'}
              >
                Clear Cart
              </button>
            )}
          </div>
          
          {filteredExercises.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 20px',
              background: '#f9fafb',
              borderRadius: '12px',
              border: '2px dashed #d1d5db'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>🛒</div>
              <p style={{ fontSize: '1.3em', color: '#333', marginBottom: '12px', fontWeight: '600' }}>
                Your cart is empty
              </p>
              <p style={{ fontSize: '1em', color: '#666', marginBottom: '30px' }}>
                Browse exercises and add them to create a prescription for your patient.
              </p>
              <button 
                className="browse-button" 
                onClick={handleContinueBrowsing}
                style={{
                  padding: '14px 60px',
                  fontSize: '16px'
                }}
              >
                Browse Exercises
              </button>
            </div>
          ) : (
            <>
              {filteredExercises.map((ex) => (
                <div key={ex.addedAt} style={{ position: 'relative', marginBottom: '16px' }}>
                  <ExerciseCard
                    id={ex.id}
                    name={ex.name}
                    description={ex.description}
                    category={ex.category}
                    imageUrl={ex.image_url ?? '/images/default.png'}
                    frequency={ex.frequency}
                    frequencyType={ex.frequencyType}
                    sets={ex.sets}
                    reps={ex.reps}
                    repType={ex.repType}
                    comments={ex.comments}
                  />
                  <button
                    onClick={() => handleRemoveFromCart(ex.id)}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      cursor: 'pointer',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      zIndex: 10
                    }}
                    onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.background = '#cc0000';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.background = '#ff4444';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title="Remove from cart"
                  >
                    ×
                  </button>
                </div>
              ))}

              <div className="browse-btn-row">
                <button className="browse-button" onClick={handleContinueBrowsing}>
                  Continue Browsing
                </button>
              </div>
            </>
          )}
        </div>

        <Sidebar exercises={filteredExercises} />
      </div>
    </div>
  );
}