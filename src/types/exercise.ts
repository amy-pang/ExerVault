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
