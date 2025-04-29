/**
 * Utility functions for the form builder
 */

/**
 * Creates a boilerplate section with one column
 */
export function sectionBoilerplate() {
  return {
    df: {
      name: Math.random().toString(36).substring(2, 10),
      fieldtype: 'Section Break',
      fieldname: '',
      label: '',
      collapsible: 0
    },
    columns: [
      {
        df: {
          name: Math.random().toString(36).substring(2, 10),
          fieldtype: 'Column Break',
          fieldname: '',
          label: ''
        },
        fields: [],
        isFirst: true
      }
    ]
  };
}

/**
 * Creates an initial layout structure with one tab and one section
 */
export function createLayout() {
  const layout = {
    tabs: [
      {
        df: {
          name: Math.random().toString(36).substring(2, 10),
          fieldtype: 'Tab Break',
          fieldname: '',
          label: 'Details'
        },
        sections: [sectionBoilerplate()],
        isFirst: true
      }
    ]
  };
  return layout;
}

/**
 * Scrubs field names to ensure they are valid
 */
export function scrubFieldNames(fields) {
  fields.forEach(field => {
    if (field.fieldname) {
      field.fieldname = field.fieldname
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_');
    }
  });
  return fields;
}

/**
 * Moves children (sections/columns/fields) to a parent
 * @param {Object} props - Component props
 * @param {String} parentType - Type of parent ('tab', 'section', 'column')
 * @param {String} childType - Type of child ('section', 'column', 'field')
 * @param {Object} layout - Form layout
 * @returns {Object} - The new parent
 */
export function moveChildrenToParent(props, parentType, childType, layout) {
  // Implementation depends on the specific use case
  // A simplified implementation for demonstration
  const currentParent = props[parentType];
  const children = currentParent[`${childType}s`];
  const currentChild = props[childType];
  const index = children.indexOf(currentChild);
  const childrenToMove = children.slice(index);
  
  // Create a new parent
  const newParentDf = {
    name: Math.random().toString(36).substring(2, 10),
    fieldtype: parentType === 'tab' ? 'Tab Break' : 'Section Break',
    fieldname: '',
    label: `New ${parentType === 'tab' ? 'Tab' : 'Section'}`
  };
  
  const newParent = {
    df: newParentDf,
    [`${childType}s`]: childrenToMove
  };
  
  // Update the original parent
  currentParent[`${childType}s`] = children.slice(0, index);
  
  // Add the new parent to the appropriate container
  if (parentType === 'tab') {
    const tabIndex = layout.tabs.indexOf(currentParent);
    layout.tabs.splice(tabIndex + 1, 0, newParent);
  }
  
  return newParent;
}

/**
 * Shows a confirmation dialog
 * @param {String} title - Dialog title
 * @param {String} message - Dialog message
 * @param {Function} onConfirm - Callback when confirmed
 * @param {String} confirmText - Text for confirm button
 * @param {Function} onAlternate - Alternate callback
 * @param {String} alternateText - Text for alternate button
 */
export function confirmDialog(
  title, 
  message, 
  onConfirm, 
  confirmText = 'Confirm', 
  onAlternate = null, 
  alternateText = 'Alternative'
) {
  // In a real implementation, this would show a dialog UI
  // For now, we'll use the browser's confirm dialog
  if (confirm(`${title}\n\n${message}`)) {
    onConfirm();
  } else if (onAlternate) {
    // This is a simplification; in a real UI you'd have two distinct buttons
    if (confirm(`Would you like to use the alternative option: ${alternateText}?`)) {
      onAlternate();
    }
  }
}

/**
 * Detects touch screen devices
 * @returns {Boolean} - True if touch screen device
 */
export function isTouchScreenDevice() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}
