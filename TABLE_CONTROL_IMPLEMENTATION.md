# Table Control Feature Implementation

## Overview
The table control feature has been successfully implemented in the Frappe Form Builder. This feature allows users to create tables where the columns are dynamically sourced from fields of another form.

## What's Been Implemented

### 1. Type System Updates
- **File**: `src/types/index.ts`
- Added 'table' to the ControlType union
- Extended Control interface with table-specific properties:
  - `linkedFormId`: ID of the form to source columns from
  - `linkedFormName`: Name of the linked form (for display)
  - `tableColumns`: Array of fields from the linked form that become table columns
  - `allowAdd`: Whether users can add new rows
  - `allowEdit`: Whether users can edit existing rows
  - `allowDelete`: Whether users can delete rows
  - `minRows`: Minimum number of rows required
  - `maxRows`: Maximum number of rows allowed

### 2. Table Control Component
- **File**: `src/components/controls/TableControl.vue`
- Full-featured table component with:
  - Dynamic column rendering based on linked form fields
  - Add/Edit/Delete functionality with modal dialogs
  - Support for all field types (text, number, select, date, etc.)
  - Row validation and error handling
  - Responsive design with proper styling

### 3. Field Control Integration
- **File**: `src/components/FieldControl.vue`
- Added mapping for 'table' type to render TableControl component

### 4. Form Builder Configuration
- **File**: `src/views/FormBuilder/composables/useFormBuilderComposable.ts`
- Added 'table' to available field types
- Added icon and description for table controls
- Icon: `fa-table` (table grid icon)
- Description: "Table with columns from another form"

### 5. Table Properties Panel
- **File**: `src/components/ui/TableControlProperties.vue`
- Dedicated properties panel for configuring table controls:
  - Form selection dropdown (loads all available forms)
  - Column preview showing fields from selected form
  - Table behavior settings (add/edit/delete permissions)
  - Row limits configuration
  - Real-time updates when linked form changes

### 6. Properties Panel Integration
- **File**: `src/components/ui/PropertiesPanel.vue`
- Integrated TableControlProperties into the main properties panel
- Shows when a table control is selected
- Proper import and event handling

## How to Use the Table Control

### 1. Adding a Table Control
1. Open the Form Builder
2. From the field type selector on the left, drag or click the "Table" field type
3. The table control will be added to your form

### 2. Configuring the Table
1. Select the table control in the form
2. In the properties panel on the right, you'll see "Table Configuration" section
3. **Select Linked Form**: Choose from the dropdown of available forms
4. **Column Preview**: Once a form is selected, you'll see all the fields that will become table columns
5. **Table Behavior**: Configure permissions:
   - Allow Add: Users can add new rows
   - Allow Edit: Users can edit existing rows  
   - Allow Delete: Users can delete rows
6. **Row Limits**: Set minimum and maximum number of rows

### 3. Using the Table in Preview/Runtime
1. **Adding Rows**: Click the "Add New Item" button to open a modal with form fields
2. **Editing Rows**: Click the edit icon (pencil) in any row to modify the data
3. **Deleting Rows**: Click the delete icon (trash) to remove a row
4. **Validation**: The table validates data based on the linked form's field requirements

## Technical Details

### Data Structure
Table data is stored as an array of objects, where each object represents a row:
```javascript
{
  value: [
    { field1: 'value1', field2: 'value2', field3: 'value3' },
    { field1: 'value4', field2: 'value5', field3: 'value6' }
  ]
}
```

### Column Mapping
The table automatically maps field types from the linked form:
- Text fields → Text columns
- Number fields → Number columns
- Select fields → Dropdown columns
- Date fields → Date picker columns
- And so on...

### Modal Behavior
- Each row add/edit operation opens a modal dialog
- The modal contains the actual form fields for data entry
- Validation is performed before saving
- Modal closes automatically on successful save

## Error Handling
- Graceful handling when linked form is not found
- Validation errors displayed in the modal
- Network errors handled with appropriate user feedback
- Fallback displays when no columns are available

## Styling
- Consistent with the existing Frappe Form Builder theme
- Responsive design that works on different screen sizes
- Clean table layout with proper spacing and borders
- Modal dialogs with professional styling

## Future Enhancements
- Column-level permissions (show/hide specific columns)
- Custom column widths
- Column sorting and filtering
- Export table data functionality
- Bulk edit operations
- Custom validation rules per column

The table control is now fully functional and ready for use in both the form builder interface and form preview/runtime modes.
