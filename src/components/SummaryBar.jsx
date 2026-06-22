import { usePoolConfig } from '../hooks/usePoolConfig';

export default function SummaryBar() {
  const { cost, dims } = usePoolConfig();

  return (
    <div className="summary-bar">
      <div className="summary-total">
        <span className="total-label">Estimated Total</span>
        <span className="total-amount">
          ${cost.total.toLocaleString()}
        </span>
      </div>
      <div className="summary-breakdown">
        {cost.lines.map((line, i) => (
          <div key={i} className="summary-line">
            <span className="line-label">{line.label}</span>
            <span className="line-cost">
              ${line.cost.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      <div className="summary-dims">
        {dims.pool_length}′ × {dims.pool_width}′ × {dims.pool_depth}′
      </div>
    </div>
  );
}
