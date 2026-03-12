import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

interface Exercise {
  id: string;
  name: string;
  sets?: string;
  reps?: string;
  repType?: 'reps' | 'seconds';
  frequency?: string;
  frequencyType?: 'week' | 'day' | 'month';
}

interface SidebarProps {
  exercises: Exercise[];
}

export default function Sidebar({ exercises }: SidebarProps) {
  const navigate = useNavigate();

  const grandTotalReps = exercises.reduce((sum, ex) => {
    const sets = parseFloat(ex.sets || "0");
    const reps = parseFloat(ex.reps || "0");
    return sum + sets * reps;
  }, 0);

  const frequencySummary = exercises
    .filter((ex) => ex.frequency && ex.frequencyType)
    .map((ex) => `${ex.frequency}x/${ex.frequencyType}`)
    .join(", ");

  return (
    <aside className="sidebar-col">
      <div className="print-btn-row">
        <button
          className="print-button"
          onClick={() => navigate("/print")}
        >
          Print
        </button>
      </div>

      <div className="summary-stats-box">
        <div className="stats-title">Summary Stats</div>

        <div className="stats-list">
          {exercises.length === 0 ? (
            <div className="stats-empty">No exercises added yet.</div>
          ) : (
            <>
              {exercises.map((ex, index) => {
                const sets = ex.sets || "—";
                const reps = ex.reps || "—";
                const repLabel = ex.repType === "seconds" ? "sec" : "reps";
                const hasPrescription = ex.sets || ex.reps;
                const totalReps =
                  ex.sets && ex.reps
                    ? parseFloat(ex.sets) * parseFloat(ex.reps)
                    : null;

                return (
                  <div key={ex.id} className="stats-item">
                    <div className="stats-item-name">
                      {index + 1}. {ex.name}
                    </div>
                    {hasPrescription ? (
                      <div className="stats-item-prescription">
                        {sets} sets × {reps} {repLabel}
                        {totalReps !== null && (
                          <> ={" "}
                            <span className="stats-item-total">
                              {totalReps} total {repLabel}
                            </span>
                          </>
                        )}
                        {ex.frequency && ex.frequencyType && (
                          <div className="stats-item-frequency">
                            {ex.frequency}x/{ex.frequencyType}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="stats-item-no-prescription">
                        No prescription set
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="stats-divider">
                <strong>Total Reps:</strong>{" "}
                {grandTotalReps > 0 ? grandTotalReps : "—"}
              </div>

              <div className="stats-footer">
                <strong>Frequencies:</strong>{" "}
                {frequencySummary || "—"}
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}