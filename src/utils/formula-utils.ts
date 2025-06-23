// Simple utility functions for formula editing
import { Control } from '../types';

/**
 * Extracts field dependencies from a formula string
 * @param formula The formula string to analyze
 * @returns Array of field names the formula depends on
 */
export function extractFormulaDependencies(formula: string): string[] {
  if (!formula) return [];
  
  const dependencies = new Set<string>();
  const regex = /field\(['"]([^'"]+)['"]\)/g;
  let match;
  
  while ((match = regex.exec(formula)) !== null) {
    if (match[1]) {
      dependencies.add(match[1]);
    }
  }
  
  return Array.from(dependencies);
}

/**
 * Validates a formula string syntax
 * @param formula The formula to validate
 * @param availableFields Available fields for reference
 * @returns An error message or empty string if valid
 */
export function validateFormulaSyntax(
  formula: string, 
  availableFields: Control[]
): string {
  if (!formula) return '';
  
  try {
    // Check for references to non-existent fields
    const dependencies = extractFormulaDependencies(formula);
    const fieldNames = availableFields.map(field => field.name);
    
    for (const dep of dependencies) {
      if (!fieldNames.includes(dep)) {
        return `Unknown field reference: ${dep}`;
      }
    }
    
    // Test if the formula is valid JavaScript
    new Function('field', `return ${formula}`);
    return '';
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'Invalid formula syntax';
  }
}

/**
 * Gets a list of all fields in the form except the one being edited
 * @param allFields All fields in the form
 * @param currentFieldId ID of the field being edited (to exclude from results)
 * @returns Array of fields that can be referenced in a formula
 */
export function getAvailableFieldsForFormula(
  allFields: Control[], 
  currentFieldId: string
): Control[] {
  return allFields.filter(field => field.id !== currentFieldId);
}
