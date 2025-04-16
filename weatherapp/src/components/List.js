import React from 'react';
import DOMPurify from 'dompurify';

/**
 * List component displays a scrollable list of locations
 * with improved accessibility, security and visual feedback
 */
function List({ items, selectedItem, onItemClick }) {
  // Convert item ID to safe string for DOM id attribute
  const getSafeItemId = (itemId) => {
    return `list-item-${String(itemId).replace(/[^a-z0-9]/gi, '-')}`;
  };

  // Focus the selected item when it changes
  React.useEffect(() => {
    if (selectedItem) {
      const element = document.getElementById(getSafeItemId(selectedItem.id));
      if (element) {
        element.focus();
      }
    }
  }, [selectedItem]);

  // Handle keyboard navigation
  const handleKeyDown = (e, item) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onItemClick(item);
    }
  };

  return (
    <div className="list-container" role="list" aria-label="Location list">
      {items.map(item => {
        // Sanitize item data to prevent XSS
        const safeTitle = DOMPurify.sanitize(item.title || '');
        const safeDescription = DOMPurify.sanitize(item.description || '');
        
        // Determine if this item is selected
        const isSelected = selectedItem && selectedItem.id === item.id;
        
        return (
          <div
            key={item.id}
            id={getSafeItemId(item.id)}
            className="list-item"
            role="listitem"
            tabIndex={0}
            onClick={() => onItemClick(item)}
            onKeyDown={(e) => handleKeyDown(e, item)}
            aria-label={`Location ${safeTitle}`}
            aria-selected={isSelected}
            style={{
              padding: '12px',
              margin: '8px 0',
              backgroundColor: isSelected ? '#e3f2fd' : 'white',
              borderLeft: isSelected ? '4px solid #1976d2' : '1px solid #e0e0e0',
              borderRadius: '4px',
              boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0' }}>{safeTitle}</h3>
            <p style={{ margin: 0, color: '#666' }}>{safeDescription}</p>
            {isSelected && (
              <div style={{ 
                marginTop: '8px', 
                fontSize: '12px', 
                color: '#1976d2' 
              }}>
                Selected
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default List;
