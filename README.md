# Frappe Form Builder

This project is an independent version of the Frappe Form Builder, built using Vue 3. It allows users to create and manage forms through a user-friendly interface.

## Features

- Drag-and-drop functionality for form elements
- Various input controls including text, number, select, checkbox, and date
- Real-time preview of the form being built
- Customizable properties for each form control

## Project Structure

```
frappe-form-builder
├── public
│   ├── index.html         # Main HTML file
│   └── favicon.ico        # Favicon for the application
├── src
│   ├── assets
│   │   └── styles
│   │       └── main.css   # Main CSS styles
│   ├── components
│   │   ├── FormBuilder.vue # Component for the form builder interface
│   │   ├── FormPreview.vue  # Component for form preview
│   │   ├── controls
│   │   │   ├── TextControl.vue     # Text input control
│   │   │   ├── NumberControl.vue    # Number input control
│   │   │   ├── SelectControl.vue    # Dropdown select control
│   │   │   ├── CheckboxControl.vue   # Checkbox control
│   │   │   └── DateControl.vue       # Date input control
│   │   └── ui
│   │       ├── DraggableItem.vue     # Draggable item component
│   │       ├── ToolboxPanel.vue       # Toolbox for selecting controls
│   │       └── PropertiesPanel.vue    # Properties panel for control configuration
│   ├── composables
│   │   └── useFormBuilder.ts          # Composable for form logic
│   ├── types
│   │   └── index.ts                   # TypeScript types and interfaces
│   ├── App.vue                        # Root component
│   └── main.ts                       # Entry point for the Vue application
├── .eslintrc.js                      # ESLint configuration
├── .gitignore                        # Git ignore file
├── package.json                      # NPM configuration
├── tsconfig.json                     # TypeScript configuration
├── vite.config.ts                    # Vite configuration
└── README.md                         # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/frappe-form-builder.git
   ```
2. Navigate to the project directory:
   ```
   cd frappe-form-builder
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the development server, run:
```
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to view the application.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.# fb
# fb
