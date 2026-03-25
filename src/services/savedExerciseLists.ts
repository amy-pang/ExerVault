import { supabase } from "../supabaseClient";

// Types for exercise list management
export type ExerciseListSummary = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  item_count: number;
};

export type ExerciseListItem = {
  id: string;
  exercise_id: string;
  exercise_name: string;
  category: string;
  description: string;
  image_path?: string;
  sets: string;
  reps: string;
  rep_type: string;
  list_item_description: string;
  comments: string;
};

export type ExerciseListDetail = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  items: ExerciseListItem[];
};

/**
 * Get the current authenticated user ID
 */
async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  const userId = data.user?.id;

  if (!userId) {
    throw new Error("Please sign in to manage saved lists.");
  }

  return userId;
}

/**
 * Get all exercise lists for the current user
 */
export async function getSavedExerciseLists(): Promise<ExerciseListSummary[]> {
  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("exercise_lists")
    .select(
      `
      id,
      name,
      description,
      created_at,
      exercise_list_items(count)
      `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch exercise lists: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description || "",
    created_at: row.created_at,
    item_count: row.exercise_list_items?.[0]?.count || 0,
  }));
}

/**
 * Get a specific exercise list with all its items
 */
export async function getExerciseListDetail(
  listId: string
): Promise<ExerciseListDetail> {
  const userId = await requireUserId();

  const { data: listData, error: listError } = await supabase
    .from("exercise_lists")
    .select(
      `
      id,
      name,
      description,
      created_at,
      exercise_list_items(
        id,
        exercise_id,
        sets,
        reps,
        description,
        comments,
        exercises(
          id,
          name,
          category,
          description,
          image_path
        )
      )
      `
    )
    .eq("id", listId)
    .eq("user_id", userId)
    .maybeSingle();

  if (listError) {
    throw new Error(`Failed to fetch exercise list: ${listError.message}`);
  }

  if (!listData) {
    throw new Error("Exercise list not found.");
  }

  const items: ExerciseListItem[] = (listData.exercise_list_items ?? []).map(
    (item: any) => ({
      id: item.id,
      exercise_id: item.exercise_id,
      exercise_name: item.exercises?.name || "",
      category: item.exercises?.category || "",
      description: item.exercises?.description || "",
      image_path: item.exercises?.image_path,
      sets: item.sets,
      reps: item.reps,
      rep_type: "",
      list_item_description: item.description,
      comments: item.comments,
    })
  );

  return {
    id: listData.id,
    name: listData.name,
    description: listData.description || "",
    created_at: listData.created_at,
    items,
  };
}

/**
 * Create a new exercise list
 */
export async function createExerciseList(
  name: string,
  description?: string
): Promise<string> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("List name is required.");
  }

  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("exercise_lists")
    .insert({
      name: trimmedName,
      description: description?.trim() || "",
      user_id: userId,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create exercise list: ${error.message}`);
  }

  return data.id;
}

/**
 * Update exercise list metadata
 */
export async function updateExerciseList(
  listId: string,
  name?: string,
  description?: string
): Promise<void> {
  const userId = await requireUserId();

  const updateData: Record<string, string> = {};

  if (name !== undefined) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("List name is required.");
    }
    updateData.name = trimmedName;
  }

  if (description !== undefined) {
    updateData.description = description.trim();
  }

  if (Object.keys(updateData).length === 0) {
    return;
  }

  const { error } = await supabase
    .from("exercise_lists")
    .update(updateData)
    .eq("id", listId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to update exercise list: ${error.message}`);
  }
}

/**
 * Add an exercise to an exercise list
 */
export async function addExerciseToList(
  listId: string,
  exerciseId: string,
  options?: {
    sets?: string;
    reps?: string;
    description?: string;
    comments?: string;
  }
): Promise<string> {
  const userId = await requireUserId();

  // Verify list ownership
  const { data: listData, error: listError } = await supabase
    .from("exercise_lists")
    .select("id")
    .eq("id", listId)
    .eq("user_id", userId)
    .maybeSingle();

  if (listError) {
    throw new Error(`Failed to verify list ownership: ${listError.message}`);
  }

  if (!listData) {
    throw new Error("Exercise list not found or you don't have access to it.");
  }

  const { data, error } = await supabase
    .from("exercise_list_items")
    .insert({
      list_id: listId,
      exercise_id: exerciseId,
      sets: options?.sets || "",
      reps: options?.reps || "",
      description: options?.description || "",
      comments: options?.comments || "",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to add exercise to list: ${error.message}`);
  }

  return data.id;
}

/**
 * Update exercise details in a list
 */
export async function updateExerciseInList(
  itemId: string,
  options: {
    sets?: string;
    reps?: string;
    rep_type?: string;
    description?: string;
    comments?: string;
  }
): Promise<void> {
  const userId = await requireUserId();

  // Verify ownership by checking if item belongs to user's list
  const { data: itemData, error: itemError } = await supabase
    .from("exercise_list_items")
    .select("list_id")
    .eq("id", itemId)
    .maybeSingle();

  if (itemError) {
    throw new Error(`Failed to verify item ownership: ${itemError.message}`);
  }

  if (!itemData) {
    throw new Error("Exercise list item not found.");
  }

  const { data: listData, error: listError } = await supabase
    .from("exercise_lists")
    .select("id")
    .eq("id", itemData.list_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (listError) {
    throw new Error(`Failed to verify list ownership: ${listError.message}`);
  }

  if (!listData) {
    throw new Error("You don't have access to this list.");
  }

  const updateData: Record<string, string> = {};

  if (options.sets !== undefined) updateData.sets = options.sets;
  if (options.reps !== undefined) updateData.reps = options.reps;
  if (options.description !== undefined) updateData.description = options.description;
  if (options.comments !== undefined) updateData.comments = options.comments;

  if (Object.keys(updateData).length === 0) {
    return;
  }

  const { error: updateError } = await supabase
    .from("exercise_list_items")
    .update(updateData)
    .eq("id", itemId);

  if (updateError) {
    throw new Error(`Failed to update exercise in list: ${updateError.message}`);
  }
}

/**
 * Remove an exercise from a list
 */
export async function removeExerciseFromList(itemId: string): Promise<void> {
  const userId = await requireUserId();

  // Verify ownership by checking if item belongs to user's list
  const { data: itemData, error: itemError } = await supabase
    .from("exercise_list_items")
    .select("list_id")
    .eq("id", itemId)
    .maybeSingle();

  if (itemError) {
    throw new Error(`Failed to verify item ownership: ${itemError.message}`);
  }

  if (!itemData) {
    throw new Error("Exercise list item not found.");
  }

  const { data: listData, error: listError } = await supabase
    .from("exercise_lists")
    .select("id")
    .eq("id", itemData.list_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (listError) {
    throw new Error(`Failed to verify list ownership: ${listError.message}`);
  }

  if (!listData) {
    throw new Error("You don't have access to this list.");
  }

  const { error } = await supabase
    .from("exercise_list_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    throw new Error(`Failed to remove exercise from list: ${error.message}`);
  }
}

/**
 * Delete an entire exercise list
 */
export async function deleteExerciseList(listId: string): Promise<void> {
  const userId = await requireUserId();

  // Verify ownership
  const { data: listData, error: listError } = await supabase
    .from("exercise_lists")
    .select("id")
    .eq("id", listId)
    .eq("user_id", userId)
    .maybeSingle();

  if (listError) {
    throw new Error(`Failed to verify list ownership: ${listError.message}`);
  }

  if (!listData) {
    throw new Error("Exercise list not found or you don't have access to it.");
  }

  // Delete associated items first (should cascade, but being explicit)
  const { error: itemsError } = await supabase
    .from("exercise_list_items")
    .delete()
    .eq("list_id", listId);

  if (itemsError) {
    throw new Error(`Failed to delete list items: ${itemsError.message}`);
  }

  // Delete the list
  const { error } = await supabase
    .from("exercise_lists")
    .delete()
    .eq("id", listId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete exercise list: ${error.message}`);
  }
}

/**
 * Save exercises to a list (batch operation)
 * Creates a list and adds multiple exercises to it
 */
export async function saveExercisestoList(
  listName: string,
  exercises: Array<{
    exerciseId: string;
    sets?: string;
    reps?: string;
    description?: string;
    comments?: string;
  }>,
  listDescription?: string
): Promise<string> {
  if (exercises.length === 0) {
    throw new Error("Cannot save an empty list.");
  }

  // Create the list
  const listId = await createExerciseList(listName, listDescription);

  // Add all exercises
  try {
    for (const exercise of exercises) {
      await addExerciseToList(listId, exercise.exerciseId, {
        sets: exercise.sets,
        reps: exercise.reps,
        description: exercise.description,
        comments: exercise.comments,
      });
    }
  } catch (error) {
    // If adding exercises fails, delete the list
    await deleteExerciseList(listId);
    throw error;
  }

  return listId;
}
