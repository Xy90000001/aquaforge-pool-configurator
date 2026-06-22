import { usePoolConfig } from '../hooks/usePoolConfig';

function OptionCard({ option, sectionId, isActive, onSelect }) {
  return (
    <div
      className={`option-card${isActive ? ' active' : ''}`}
      onClick={() => onSelect(sectionId, option.id)}
    >
      <div className="active-dot" />
      <div className="option-header">
        <div
          className="color-swatch"
          style={{ background: option.color }}
        />
        <div className="option-info">
          <div className="option-name">{option.name}</div>
          <div className="option-subtitle">{option.subtitle}</div>
          <div className="option-price">
            {option.method === 'LS'
              ? option.price === 0
                ? 'Included'
                : option.price.toLocaleString()
              : `${option.price.toFixed(2)} / SF`}
            <span className="price-label">
              {option.method === 'LS' ? ' Base' : ' per SF'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { config, selections, selectOption } = usePoolConfig();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">AquaForge</div>
        <div className="subtitle">Luxury Pool Configurator</div>
      </div>

      {config.asset.sections.map((section) => (
        <details key={section.id} className="section" open>
          <summary className="section-header">
            <span className="section-index">{section.index}</span>
            <span className="section-title">{section.name}</span>
            <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </summary>
          <div className="section-body">
            {section.options.map((opt) => (
              <OptionCard
                key={opt.id}
                option={opt}
                sectionId={section.id}
                isActive={selections[section.id] === opt.id}
                onSelect={selectOption}
              />
            ))}
          </div>
        </details>
      ))}

      <div className="sidebar-footer">
        <div className="shortcuts-hint">
          <kbd>R</kbd> Rotate <kbd>F</kbd> Reset <kbd>T</kbd> Top
        </div>
        <div className="shortcuts-hint">
          <kbd>1-6</kbd> Select options
        </div>
      </div>
    </aside>
  );
}
