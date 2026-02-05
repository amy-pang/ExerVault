import './sidebar.css'

interface Exercise {
  id: string;
  name: string;
}

interface SidebarProps {
  exercises: Exercise[];
}

export default function Sidebar({ exercises }: SidebarProps) {
  return (
    <aside className="sidebar-col">
      <div className="print-btn-row">
        <button className="print-button">
          Print
        </button>
      </div>
      
      <div className="summary-stats-box">
        <div className="stats-title">
          <span className="stats-icon">✚</span>
          Summary Stats
        </div>
        <div className="stats-list">
          {exercises.length === 0 ? (
            <div className="stats-empty">
              No current stats, add workouts to start building stats
            </div>
          ) : (
            <>
              {exercises.slice(0, 3).map((ex, index) => (
                <div key={ex.id} className="stats-item">
                  Exercise {index + 1}: total reps = sets{index + 1} x reps{index + 1}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </aside>
  );
}