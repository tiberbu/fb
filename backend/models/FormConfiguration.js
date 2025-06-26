import mongoose from 'mongoose';

const formConfigurationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  configuration: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  },
  createdBy: {
    type: String,
    default: 'system'
  },
  updatedBy: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true
});

// Add index for better performance
formConfigurationSchema.index({ name: 1, isActive: 1 });

export default mongoose.model('FormConfiguration', formConfigurationSchema);
