// Utility function to check if a string is a valid MongoDB ObjectId
export function isValidObjectId(id: string): boolean {
  // MongoDB ObjectIds are 24-character hexadecimal strings
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// Utility function to check if an ID is a local/temporary ID
export function isLocalId(id: string): boolean {
  return !isValidObjectId(id) || id.startsWith('form-') || id.startsWith('temp-');
}

// Generate a temporary ID for local forms
export function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
