// Test formulas functionality in preview mode
// This file demonstrates how formulas should work in the form preview

const testFormulas = {
  // Test calculation formula
  calculationFormula: {
    expression: "field('quantity') * field('price')",
    type: 'calculation',
    enabled: true
  },

  // Test visibility formula
  visibilityFormula: {
    expression: "field('show_advanced') === true",
    type: 'visibility',
    enabled: true
  },

  // Test required formula
  requiredFormula: {
    expression: "field('type') === 'custom'",
    type: 'required',
    enabled: true
  },

  // Test readonly formula
  readonlyFormula: {
    expression: "field('locked') === true",
    type: 'readonly',
    enabled: true
  },

  // Test complex calculation with functions
  complexCalculation: {
    expression: "sum(field('item1'), field('item2'), field('item3')) + (field('tax_rate') / 100) * sum(field('item1'), field('item2'), field('item3'))",
    type: 'calculation',
    enabled: true
  }
};

const testFieldValues = {
  quantity: 5,
  price: 10.50,
  show_advanced: true,
  type: 'custom',
  locked: false,
  item1: 100,
  item2: 200,
  item3: 150,
  tax_rate: 8.5
};

// Test cases to validate formula functionality
const testCases = [
  {
    name: 'Basic Calculation',
    formula: testFormulas.calculationFormula,
    fieldValues: testFieldValues,
    expected: 52.5 // 5 * 10.50
  },
  {
    name: 'Visibility Check - True',
    formula: testFormulas.visibilityFormula,
    fieldValues: testFieldValues,
    expected: true
  },
  {
    name: 'Visibility Check - False',
    formula: testFormulas.visibilityFormula,
    fieldValues: { ...testFieldValues, show_advanced: false },
    expected: false
  },
  {
    name: 'Required Check - True',
    formula: testFormulas.requiredFormula,
    fieldValues: testFieldValues,
    expected: true
  },
  {
    name: 'Required Check - False',
    formula: testFormulas.requiredFormula,
    fieldValues: { ...testFieldValues, type: 'standard' },
    expected: false
  },
  {
    name: 'Readonly Check - False',
    formula: testFormulas.readonlyFormula,
    fieldValues: testFieldValues,
    expected: false
  },
  {
    name: 'Readonly Check - True',
    formula: testFormulas.readonlyFormula,
    fieldValues: { ...testFieldValues, locked: true },
    expected: true
  },
  {
    name: 'Complex Calculation with Tax',
    formula: testFormulas.complexCalculation,
    fieldValues: testFieldValues,
    expected: 488.25 // (100+200+150) + 8.5% of 450 = 450 + 38.25 = 488.25
  }
];

export { testFormulas, testFieldValues, testCases };
