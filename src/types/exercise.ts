export type Exercise = {
  id: string;
  name: string;
  category: string;
  description: string;
  image_path?: string;
  frequency?: string;
  frequencyType?: 'week' | 'day' | 'month';
  sets?: string;
  reps?: string;
  repType?: 'reps' | 'seconds';
  comments?: string;
  addedAt?: number;
};

// Shopping Cart Class
export class Cart {
  private exercises: Exercise[];

  constructor() {
    this.exercises = this.loadCart();
  }

  addToCart(newExercise: Exercise): void {
    const existingIndex = this.exercises.findIndex(ex => ex.id === newExercise.id);
    
    if (existingIndex !== -1) {
      // Update existing exercise
      this.exercises[existingIndex] = { ...newExercise, addedAt: this.exercises[existingIndex].addedAt };
    } else {
      // Add new exercise
      this.exercises = [...this.exercises, { ...newExercise, addedAt: Date.now() }];
    }
    
    this.saveCart();
  }

  removeFromCart(id: string): void {
    this.exercises = this.exercises.filter(ex => ex.id !== id);
    this.saveCart();
  }

  clearCart(): void {
    this.exercises = [];
    this.saveCart();
  }

  getCartCount(): number {
    return this.exercises.length;
  }

  getExercises(): Exercise[] {
    return this.exercises;
  }

  private saveCart(): void {
    localStorage.setItem('exerciseCart', JSON.stringify(this.exercises));
  }

  private loadCart(): Exercise[] {
    const saved = localStorage.getItem('exerciseCart');
    return saved ? JSON.parse(saved) : [];
  }
};