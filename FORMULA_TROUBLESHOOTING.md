# Formula Calculation Troubleshooting Guide

## Testing Calculation Formulas in Preview Mode

### 1. Basic Test Setup

Create a form with the following fields:
- `quantity` (Number field)
- `price` (Number field) 
- `total` (Number field with calculation formula)

Set the calculation formula for the `total` field:
```javascript
field('quantity') * field('price')
```

### 2. Expected Behavior

When you:
1. Enter a value in `quantity` (e.g., 5)
2. Enter a value in `price` (e.g., 10.50)

The `total` field should automatically update to show `52.5`

### 3. Debugging Steps

If calculations are not working:

1. **Check Browser Console**
   - Open browser DevTools (F12)
   - Look for any JavaScript errors
   - Check for formula evaluation warnings

2. **Use Debug Helper** (Development mode only)
   ```javascript
   // Open browser console and run:
   window.formPreviewDebug.formValues
   // Should show current field values
   
   window.formPreviewDebug.getAllFormFields()
   // Should show all fields with their formulas
   
   window.formPreviewDebug.evaluateAllFormulas()
   // Manually trigger formula evaluation
   
   window.formPreviewDebug.checkFieldReadOnly('fieldId')
   // Check readonly state for specific field
   
   // Check all readonly states
   window.formPreviewDebug.fieldReadOnly.value
   ```

3. **Verify Formula Structure**
   Check that the field with calculation formula has this structure:
   ```javascript
   {
     name: "total",
     type: "number",
     formulas: [
       {
         type: "calculation",
         enabled: true,
         expression: "field('quantity') * field('price')"
       }
     ]
   }
   ```
   
   For readonly formulas:
   ```javascript
   {
     name: "fieldName",
     type: "text",
     formulas: [
       {
         type: "readonly",  // Note: lowercase 'readonly'
         enabled: true,
         expression: "field('status') === 'locked'"
       }
     ]
   }
   ```

4. **Check Field Names**
   - Ensure field names in the formula exactly match the field `name` properties
   - Field names are case-sensitive

### 4. Common Issues

1. **Formula Not Triggering**
   - Verify `enabled: true` on the formula
   - Check that the formula type is `'calculation'`
   - Ensure dependent fields have values

2. **Syntax Errors**
   - Use `field('fieldName')` not `fieldName`
   - Check for typos in field names
   - Ensure proper JavaScript syntax
   - Use `cond()` instead of `if` for conditional logic
   - Avoid JavaScript reserved keywords

3. **Type Conversion Issues**
   - Number fields should contain numeric values
   - Empty fields default to 0 for calculations

4. **Common Syntax Errors**
   - `SyntaxError: Unexpected token 'if'` - Use `cond()` function instead
   - Field names must be quoted: `field('name')` not `field(name)`
   - Use proper operators: `+`, `-`, `*`, `/`, `===`, `!==`

5. **Readonly Formula Issues**
   - Readonly formulas should return `true` or `false`
   - Use comparison operators: `field('status') === 'locked'`
   - Debug with: `window.formPreviewDebug.checkFieldReadOnly('fieldId')`
   - Check that the formula type is `'readonly'`, not `'readOnly'`

### 5. Formula Examples

```javascript
// Basic calculation
"field('quantity') * field('price')"

// With tax calculation
"field('subtotal') * (1 + field('taxRate') / 100)"

// Using helper functions
"sum(field('item1'), field('item2'), field('item3'))"

// Conditional calculation (use cond function, not if)
"cond(field('hasDiscount'), field('price') * 0.9, field('price'))"

// String functions
"upper(field('firstName')) + ' ' + lower(field('lastName'))"

// Math functions
"round(field('amount') * 1.15, 2)"

// Readonly formulas (return true/false)
"field('status') === 'locked'"

// Complex readonly condition
"field('userRole') !== 'admin' && field('approved') === true"

// Visibility formulas (return true/false)  
"field('showAdvanced') === true"

// Required formulas (return true/false)
"field('type') === 'custom'"
```

### 6. Available Helper Functions

- `sum(...)` - Sum multiple values
- `avg(...)` - Average of multiple values  
- `min(...)` - Minimum value
- `max(...)` - Maximum value
- `count(...)` - Count non-empty values
- `len(str)` - Length of string
- `upper(str)` - Convert to uppercase
- `lower(str)` - Convert to lowercase
- `round(num, digits)` - Round to decimal places
- `cond(condition, trueValue, falseValue)` - Conditional logic

### 6. Performance Notes

- Formulas are evaluated in dependency order
- Circular dependencies are prevented
- Only fields with actual value changes trigger re-evaluation
