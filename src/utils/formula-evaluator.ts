import { Control } from '../types';

/**
 * Validates a formula expression
 * @param formula The formula expression to validate
 * @param availableFields List of fields that can be referenced in the formula
 * @returns Error message if invalid, empty string if valid
 */
export function validateFormula(formula: string, availableFields: Control[]): string {
  if (!formula || formula.trim() === '') {
    return '';  // Empty formula is valid (no formula)
  }

  try {
    // Check for field references that don't exist
    const fieldRegex = /field\(['"]([^'"]+)['"]\)/g;
    let match;
    const fieldNames = availableFields.map(field => field.name);
    
    while ((match = fieldRegex.exec(formula)) !== null) {
      const referencedField = match[1];
      if (!fieldNames.includes(referencedField)) {
        return `Unknown field reference: ${referencedField}`;
      }
    }
    
    // Try to create a function from the formula to check syntax
    // We're not executing it here, just checking if it's valid JavaScript
    new Function('field', 'sum', 'avg', 'min', 'max', 'count', 'len', 'upper', 'lower', 'round', 'cond', 'return ' + formula);
    
    return '';
  } catch (e) {
    if (e instanceof Error) {
      return `Formula syntax error: ${e.message}`;
    }
    return 'Invalid formula';
  }
}

/**
 * Evaluates a formula expression with field values
 * @param formula The formula expression to evaluate
 * @param fieldValues Object containing field values keyed by field name
 * @param formulaType Type of formula (calculation or visibility)
 * @returns The result of the formula evaluation
 */
export function evaluateFormula(
  formula: string, 
  fieldValues: Record<string, any>,
  formulaType: 'calculation' | 'visibility' = 'calculation'
): any {
  if (!formula || formula.trim() === '') {
    return formulaType === 'calculation' ? null : true;
  }

  try {
    // Create helper functions to be used in formula
    const field = (name: string) => {
      const value = fieldValues[name];
      // Handle undefined/null values
      if (value === undefined || value === null) {
        return formulaType === 'calculation' ? 0 : '';
      }
      // Convert string numbers to actual numbers for calculations
      if (formulaType === 'calculation' && typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
        return Number(value);
      }
      return value;
    };

    const sum = (...args: any[]) => {
      return args.reduce((total, val) => {
        const num = Number(val);
        return total + (isNaN(num) ? 0 : num);
      }, 0);
    };

    const avg = (...args: any[]) => {
      if (args.length === 0) return 0;
      const validArgs = args.filter(val => !isNaN(Number(val)) && val !== null && val !== undefined && val !== '');
      if (validArgs.length === 0) return 0;
      return sum(...validArgs) / validArgs.length;
    };

    const min = (...args: any[]) => {
      const validArgs = args.filter(val => !isNaN(Number(val)) && val !== null && val !== undefined && val !== '');
      if (validArgs.length === 0) return null;
      return Math.min(...validArgs.map(Number));
    };

    const max = (...args: any[]) => {
      const validArgs = args.filter(val => !isNaN(Number(val)) && val !== null && val !== undefined && val !== '');
      if (validArgs.length === 0) return null;
      return Math.max(...validArgs.map(Number));
    };

    // Add more helper functions
    const count = (...args: any[]) => {
      return args.filter(val => val !== null && val !== undefined && val !== '').length;
    };

    const len = (str: string) => {
      return str ? str.toString().length : 0;
    };

    const upper = (str: string) => {
      return str ? str.toString().toUpperCase() : '';
    };

    const lower = (str: string) => {
      return str ? str.toString().toLowerCase() : '';
    };

    const round = (num: number, digits: number = 0) => {
      const factor = Math.pow(10, digits);
      return Math.round(Number(num) * factor) / factor;
    };

    // Conditional function (avoiding 'if' keyword which is reserved)
    const cond = (condition: boolean, trueVal: any, falseVal: any) => {
      return condition ? trueVal : falseVal;
    };

    // This is a safe way to create a function from the formula
    const evaluator = new Function(
      'field', 'sum', 'avg', 'min', 'max', 'count', 'len', 'upper', 'lower', 'round', 'cond',
      `"use strict"; return ${formula};`
    );

    // Execute the formula with our helper functions
    const result = evaluator(
      field, sum, avg, min, max, count, len, upper, lower, round, cond
    );

    // For visibility formulas, ensure we return a boolean
    if (formulaType === 'visibility') {
      return Boolean(result);
    }

    return result;
  } catch (e) {
    // Formula evaluation error - log in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('Formula evaluation error:', e, 'Formula:', formula);
    }
    return formulaType === 'calculation' ? null : true;
  }
}

/**
 * Get list of field names that a formula depends on
 * @param formula The formula expression
 * @returns Array of field names referenced in the formula
 */
export function getFormulaDependencies(formula: string): string[] {
  if (!formula) return [];
  
  const dependencies: string[] = [];
  const fieldRegex = /field\(['"]([^'"]+)['"]\)/g;
  let match;
  
  while ((match = fieldRegex.exec(formula)) !== null) {
    if (match[1] && !dependencies.includes(match[1])) {
      dependencies.push(match[1]);
    }
  }
  
  return dependencies;
}

/**
 * Updates calculated fields based on their formulas
 * @param controls All controls in the form
 * @param fieldValues Current field values
 * @returns Updated field values with calculated fields
 */
export function updateCalculatedFields(
  controls: Control[], 
  fieldValues: Record<string, any>
): Record<string, any> {
  // Make a copy to avoid mutating the original
  const updatedValues = { ...fieldValues };
  
  // Find all fields with calculation formulas
  const calculatedFields = controls.filter(
    control => control.formula && control.formulaType === 'calculation'
  );
  
  // Sort fields by dependencies to ensure proper calculation order
  const sortedFields = sortFieldsByDependency(calculatedFields);
  
  // Process each calculated field
  for (const field of sortedFields) {
    if (field.formula) {
      try {
        updatedValues[field.name] = evaluateFormula(
          field.formula, 
          updatedValues, 
          'calculation'
        );
      } catch (e) {
        // console.error(`Error calculating field ${field.name}:`, e);
      }
    }
  }
  
  return updatedValues;
}

/**
 * Updates visibility state of fields based on their formulas
 * @param controls All controls in the form
 * @param fieldValues Current field values
 * @returns Updated controls with visibility state updated
 */
export function updateFieldVisibility(
  controls: Control[], 
  fieldValues: Record<string, any>
): Control[] {
  // Make a deep copy to avoid mutating the original
  const updatedControls = controls.map(control => ({ ...control }));
  
  // Process each field with visibility formula
  for (const control of updatedControls) {
    if (control.formula && control.formulaType === 'visibility') {
      try {
        control.isHidden = !evaluateFormula(
          control.formula, 
          fieldValues, 
          'visibility'
        );
      } catch (e) {
        // console.error(`Error evaluating visibility for field ${control.name}:`, e);
        control.isHidden = false; // Default to visible on error
      }
    }
  }
  
  return updatedControls;
}

/**
 * Sort fields by dependency to ensure proper calculation order
 * Fields that depend on other calculated fields will come later in the array
 */
function sortFieldsByDependency(fields: Control[]): Control[] {
  // Build dependency graph
  const graph: Record<string, string[]> = {};
  fields.forEach(field => {
    graph[field.name] = field.dependsOn || [];
  });
  
  // Get all field names
  const allFields = fields.map(f => f.name);
  
  // Helper function to perform topological sort
  const visited = new Set<string>();
  const temp = new Set<string>();
  const result: string[] = [];
  
  function visit(fieldName: string) {
    if (temp.has(fieldName)) {
      // Circular dependency detected
      // console.warn(`Circular dependency detected in field formulas: ${fieldName}`);
      return;
    }
    
    if (visited.has(fieldName)) return;
    
    temp.add(fieldName);
    
    // Visit dependencies
    const dependencies = graph[fieldName] || [];
    for (const dep of dependencies) {
      if (allFields.includes(dep)) {
        visit(dep);
      }
    }
    
    temp.delete(fieldName);
    visited.add(fieldName);
    result.push(fieldName);
  }
  
  // Start traversal
  allFields.forEach(fieldName => {
    if (!visited.has(fieldName)) {
      visit(fieldName);
    }
  });
  
  // Map the sorted names back to the original field objects
  const fieldMap: Record<string, Control> = {};
  fields.forEach(field => {
    fieldMap[field.name] = field;
  });
  
  return result.map(name => fieldMap[name]).filter(Boolean);
}
