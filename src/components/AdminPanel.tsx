import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string;
  image_path: string;
}

interface FormData {
  selectedExerciseId: string;
  name: string;
  description: string;
  category: string;
  imageFile: File | null;
}

export default function AdminPanel() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [formData, setFormData] = useState<FormData>({
    selectedExerciseId: '',
    name: '',
    description: '',
    category: 'Hip',
    imageFile: null
  });
  const [loading, setLoading] = useState(false);
  const [fetchingExercises, setFetchingExercises] = useState(true);
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'add' | 'edit'>('add');

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setFetchingExercises(true);
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      if (data) {
        console.log('Fetched exercises:', data);
        setExercises(data);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setMessage('❌ Error loading exercises. Check console for details.');
    } finally {
      setFetchingExercises(false);
    }
  };

  const handleExerciseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const exerciseId = e.target.value;
    setFormData({ ...formData, selectedExerciseId: exerciseId });
    setMessage(''); // Clear any previous messages

    if (exerciseId === 'new') {
      setMode('add');
      setFormData({
        selectedExerciseId: 'new',
        name: '',
        description: '',
        category: 'Hip',
        imageFile: null
      });
    } else if (exerciseId) {
      const selected = exercises.find(ex => ex.id === exerciseId);
      if (selected) {
        setMode('edit');
        setFormData({
          selectedExerciseId: exerciseId,
          name: selected.name,
          description: selected.description,
          category: selected.category,
          imageFile: null
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, imageFile: e.target.files[0] });
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      console.log('Uploading image:', fileName);

      const { error: uploadError } = await supabase.storage
        .from('exercise-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Image uploaded successfully:', fileName);
      return fileName;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');

    try {
      console.log('Starting submit with mode:', mode);
      console.log('Form data:', formData);

      let imagePath = null;

      if (formData.imageFile) {
        console.log('Uploading image...');
        imagePath = await uploadImage(formData.imageFile);
        if (!imagePath) {
          setMessage('❌ Error uploading image');
          setLoading(false);
          return;
        }
      }

      if (mode === 'add') {
        console.log('Adding new exercise...');
        const insertData = {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          image_path: imagePath || 'default.png'
        };
        
        console.log('Insert data:', insertData);

        const { data, error } = await supabase
          .from('exercises')
          .insert([insertData])
          .select();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }

        console.log('Insert successful:', data);
        setMessage('✅ Exercise added successfully!');
      } else {
        console.log('Updating exercise...');
        const updateData: any = {
          name: formData.name,
          description: formData.description,
          category: formData.category
        };

        if (imagePath) {
          updateData.image_path = imagePath;
        }

        console.log('Update data:', updateData);

        const { data, error } = await supabase
          .from('exercises')
          .update(updateData)
          .eq('id', formData.selectedExerciseId)
          .select();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }

        console.log('Update successful:', data);
        setMessage('✅ Exercise updated successfully!');
      }

      await fetchExercises();
      
      setFormData({
        selectedExerciseId: '',
        name: '',
        description: '',
        category: 'Hip',
        imageFile: null
      });
      setMode('add');

    } catch (error: any) {
      console.error('Error saving exercise:', error);
      setMessage(`❌ Error saving exercise: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.selectedExerciseId || formData.selectedExerciseId === 'new') return;
    
    if (!window.confirm('Are you sure you want to delete this exercise?')) return;

    setLoading(true);
    setMessage('');

    try {
      console.log('Deleting exercise:', formData.selectedExerciseId);

      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', formData.selectedExerciseId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Delete successful');
      setMessage('✅ Exercise deleted successfully!');
      await fetchExercises();
      
      setFormData({
        selectedExerciseId: '',
        name: '',
        description: '',
        category: 'Hip',
        imageFile: null
      });
      setMode('add');

    } catch (error: any) {
      console.error('Error deleting exercise:', error);
      setMessage(`❌ Error deleting exercise: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Hip', 'Pelvic Floor', 'Knee', 'Ankle', 'Shoulder', 'Core'];

  if (fetchingExercises) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <div className="text-xl">Loading exercises...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Exercise Admin Panel</h1>
          <p className="text-gray-600 mb-6">
            {mode === 'add' ? 'Add a new exercise' : 'Edit existing exercise'}
          </p>

          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Exercise to Edit (or Add New)
              </label>
              <select
                value={formData.selectedExerciseId}
                onChange={handleExerciseSelect}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">-- Choose an option --</option>
                <option value="new">➕ Add New Exercise</option>
                <optgroup label="Existing Exercises">
                  {exercises.map(ex => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.category})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {formData.selectedExerciseId && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Exercise Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Hip External Rotation in Prone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={4}
                    placeholder="Describe how to perform the exercise..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Exercise Image {mode === 'edit' && '(optional - leave empty to keep current)'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {formData.imageFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {formData.imageFile.name}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !formData.name || !formData.description}
                    className="flex-1 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? '⏳ Saving...' : mode === 'add' ? '➕ Add Exercise' : '💾 Update Exercise'}
                  </button>

                  {mode === 'edit' && (
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="bg-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">📝 How to Use:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Select "Add New Exercise" or choose an existing exercise to edit</li>
              <li>Fill in or modify the exercise details</li>
              <li>Upload a new image if needed</li>
              <li>Click "Add Exercise" or "Update Exercise" to save</li>
              <li>Use "Delete" button to remove an exercise (edit mode only)</li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">🔍 Debug Info:</h3>
            <p className="text-sm text-gray-700">Total exercises loaded: {exercises.length}</p>
            <p className="text-sm text-gray-700">Check browser console (F12) for detailed logs</p>
          </div>
        </div>
      </div>
    </div>
  );
}