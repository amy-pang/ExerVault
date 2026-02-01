// Remove this line if it exists:
// import Button from './Button';

interface Exercise {
  id: string;
  name: string;
}

interface SidebarProps {
  exercises: Exercise[];
}

export default function Sidebar({ exercises }: SidebarProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <aside className="sidebar-col">
      <div className="print-btn-row">
        <button className="print-button" onClick={handlePrint}>
          Print
        </button>
      </div>
      
      <div className="summary-stats-box">
        <div className="stats-title">Summary Stats</div>
        <div className="stats-list">
          {exercises.slice(0, 3).map((ex, index) => (
            <div key={ex.id} className="stats-item">
              Exercise {index + 1}: total reps = sets{index + 1} x reps{index + 1}
            </div>
          ))}
          <div className="stats-item frequency">
            Frequency:
          </div>
        </div>
      </div>
    </aside>
  );
}