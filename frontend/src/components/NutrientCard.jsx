export default function NutrientCard({ label, value, unit, unavailable, hint }) {
  return (
    <div className={`nutrient-card ${unavailable ? "unavailable" : ""}`}>
      <span className="nutrient-label">{label}</span>
      {unavailable ? (
        <span className="nutrient-value unavailable-text">Model unavailable</span>
      ) : (
        <span className="nutrient-value">
          {value}
          {unit ? <span className="unit"> {unit}</span> : null}
        </span>
      )}
      {hint && <span className="nutrient-hint">{hint}</span>}
    </div>
  );
}
