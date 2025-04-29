import { ref } from 'vue';

export function useFormBuilder() {
    const formFields = ref([]);
    const selectedField = ref(null);

    const addField = (field) => {
        formFields.value.push(field);
    };

    const removeField = (fieldIndex) => {
        formFields.value.splice(fieldIndex, 1);
    };

    const selectField = (field) => {
        selectedField.value = field;
    };

    const clearSelection = () => {
        selectedField.value = null;
    };

    const updateField = (fieldIndex, updatedField) => {
        formFields.value[fieldIndex] = updatedField;
    };

    return {
        formFields,
        selectedField,
        addField,
        removeField,
        selectField,
        clearSelection,
        updateField,
    };
}