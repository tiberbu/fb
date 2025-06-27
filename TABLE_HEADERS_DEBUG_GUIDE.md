# 🔧 TABLE HEADERS DEBUGGING GUIDE

## 🎯 **CURRENT STATUS**
I've implemented table header population, but the headers are not showing up as expected. Here's what I've done to debug the issue:

## 🛠️ **DEBUGGING FEATURES ADDED**

### **1. Enhanced Logging**
Added comprehensive console logging to track:
- When `linkedFormId` changes
- When `fetchLinkedFormFields` is called
- What forms are available in the store
- What fields are extracted from linked forms
- Column computation results

### **2. Test Headers**
Added fallback test headers that should appear when no form is selected:
- "Test Column 1"
- "Test Column 2"

## 🧪 **TESTING PROCEDURE**

### **Step 1: Basic Table Headers Test**
1. **Go to Form Builder**: http://localhost:3001
2. **Create New Form** or open existing form
3. **Add Table Field**: 
   - Click "Add Field" 
   - Go to "Advanced Fields"
   - Select "Table"
4. **Check Test Headers**: You should see test headers "Test Column 1" and "Test Column 2"

### **Step 2: Form Creation Test**
1. **Create Source Form**:
   - Create a new form with some fields (e.g., "Name", "Email", "Phone")
   - **Save the form** with a name like "Customer Form"
2. **Create Target Form**:
   - Create another form
   - Add a Table field
3. **Link Forms**:
   - Select the Table field
   - In Properties Panel → Table Configuration
   - Select "Customer Form" from dropdown
4. **Check Dynamic Headers**: Headers should change to "Name", "Email", "Phone"

### **Step 3: Console Debugging**
1. **Open Browser DevTools** (F12)
2. **Go to Console Tab**
3. **Look for debug logs**:
   ```
   TableControl: computed linkedFormId {formId: null, df: {...}}
   TableControl: linkedFormId changed {newFormId: null, oldFormId: null, df: {...}}
   TableControl: computing tableColumns {...}
   ```

## 🔍 **WHAT TO LOOK FOR**

### **Expected Behavior:**
- ✅ Test headers appear when no form is selected
- ✅ Console shows "using test columns" initially
- ✅ When form is selected, console shows "fetchLinkedFormFields called"
- ✅ Headers update to show field labels from selected form

### **Possible Issues:**
- ❌ No test headers → Basic table rendering broken
- ❌ No console logs → TableControl not loading
- ❌ Console shows "formId: null" when form selected → Props not updating
- ❌ Console shows "savedForms: []" → Backend connection issue
- ❌ Console shows "linkedForm found: null" → Form not in saved forms

## 🔧 **DEBUGGING COMMANDS**

### **Check Saved Forms:**
Open browser console and run:
```javascript
// Check if forms are loaded
console.log('Saved forms:', window.vueAppInstance?.$store?.savedForms);

// Or check the store directly
import { useFormBuilderStore } from './stores/form-builder-store';
const store = useFormBuilderStore();
store.loadSavedForms().then(() => {
  console.log('Loaded forms:', store.savedForms);
});
```

### **Manual Test:**
You can manually trigger the form loading:
```javascript
// In browser console, if you can access the store
const store = useFormBuilderStore();
store.loadSavedForms();
```

## 🎯 **LIKELY ISSUES & FIXES**

### **Issue 1: No Saved Forms**
**Symptoms:** Console shows `savedForms: []`
**Solution:** Create and save at least one form first

### **Issue 2: Props Not Updating** 
**Symptoms:** `linkedFormId` stays null even after selection
**Solution:** Check TableControlProperties → PropertiesPanel → FormControl prop flow

### **Issue 3: Backend Connection**
**Symptoms:** Network errors in console
**Solution:** Ensure backend is running on port 3002

### **Issue 4: Form Structure Mismatch**
**Symptoms:** `linkedForm found: null` even with saved forms
**Solution:** Check form ID format and savedForms structure

## 📋 **NEXT STEPS BASED ON RESULTS**

### **If Test Headers Work:**
- Basic rendering ✅
- Focus on form linking issue
- Check props flow from TableControlProperties

### **If No Headers At All:**
- Basic rendering ❌
- Check TableControl component loading
- Check FormControl.vue integration

### **If Console Shows Errors:**
- Network issues → Check backend
- JS errors → Check component imports
- Prop errors → Check type definitions

## 🚀 **IMMEDIATE ACTION**

**Test this now:**
1. Open http://localhost:3001
2. Create a form and add a table field
3. Open browser console (F12)
4. Look for the debug messages
5. Report what you see in the console logs

This will help pinpoint exactly where the issue is occurring! 🕵️‍♂️

---

## 📝 **REPORT TEMPLATE**

When you test, please report:
- ✅/❌ Test headers appear
- ✅/❌ Console logs appear  
- ✅/❌ Form selection works
- ✅/❌ Dynamic headers appear
- 📋 Any error messages in console
- 📋 Relevant console log snippets

This will help me identify and fix the exact issue! 🎯
