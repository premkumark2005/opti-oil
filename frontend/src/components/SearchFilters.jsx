import React from 'react';
import './SearchFilters.css';

const SearchFilters = ({ 
  searchTerm, 
  onSearchChange, 
  filters = [], 
  onFilterChange,
  savedFilters = [],
  onSaveFilter,
  onLoadFilter,
  onClearFilters
}) => {
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [filterName, setFilterName] = React.useState('');

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      const currentFilters = {};
      filters.forEach(filter => {
        currentFilters[filter.key] = filter.value;
      });
      onSaveFilter?.({ name: filterName, filters: currentFilters });
      setFilterName('');
      setShowSaveDialog(false);
    }
  };

  return (
    <div className="search-filters">
      <div className="search-filters-main">
        {/* Search Input */}
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* Filter Inputs */}
        {filters.map((filter) => (
          <div key={filter.key} className="filter-item">
            {filter.type === 'select' ? (
              <select
                value={filter.value}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className="filter-select"
              >
                <option value="">{filter.placeholder || `All ${filter.label}`}</option>
                {filter.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : filter.type === 'date' ? (
              <input
                type="date"
                value={filter.value}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className="filter-input"
                placeholder={filter.placeholder}
              />
            ) : filter.type === 'daterange' ? (
              <div className="date-range">
                <input
                  type="date"
                  value={filter.value?.startDate || ''}
                  onChange={(e) => onFilterChange(filter.key, { 
                    ...filter.value, 
                    startDate: e.target.value 
                  })}
                  className="filter-input"
                  placeholder="Start Date"
                />
                <span className="date-separator">to</span>
                <input
                  type="date"
                  value={filter.value?.endDate || ''}
                  onChange={(e) => onFilterChange(filter.key, { 
                    ...filter.value, 
                    endDate: e.target.value 
                  })}
                  className="filter-input"
                  placeholder="End Date"
                />
              </div>
            ) : filter.type === 'number' ? (
              <input
                type="number"
                value={filter.value}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className="filter-input"
                placeholder={filter.placeholder}
                min={filter.min}
                max={filter.max}
              />
            ) : (
              <input
                type="text"
                value={filter.value}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className="filter-input"
                placeholder={filter.placeholder}
              />
            )}
          </div>
        ))}

        {/* Action Buttons */}
        <div className="filter-actions">
          {onClearFilters && (
            <button onClick={onClearFilters} className="filter-btn clear-btn">
              Clear
            </button>
          )}
          {onSaveFilter && (
            <button 
              onClick={() => setShowSaveDialog(true)} 
              className="filter-btn save-btn"
            >
              💾 Save
            </button>
          )}
        </div>
      </div>

      {/* Saved Filters */}
      {savedFilters && savedFilters.length > 0 && (
        <div className="saved-filters">
          <span className="saved-filters-label">Saved Filters:</span>
          {savedFilters.map((saved, idx) => (
            <button
              key={idx}
              onClick={() => onLoadFilter?.(saved)}
              className="saved-filter-chip"
            >
              {saved.name}
            </button>
          ))}
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="save-dialog-overlay" onClick={() => setShowSaveDialog(false)}>
          <div className="save-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Save Current Filters</h3>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Enter filter name..."
              className="save-dialog-input"
              autoFocus
            />
            <div className="save-dialog-actions">
              <button onClick={() => setShowSaveDialog(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleSaveFilter} className="confirm-btn">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
