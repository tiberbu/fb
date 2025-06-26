import mongoose from 'mongoose';

const formSubmissionSchema = new mongoose.Schema({
  formConfigurationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FormConfiguration',
    required: true
  },
  formName: {
    type: String,
    required: true
  },
  submissionData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  submittedBy: {
    type: String,
    default: 'anonymous'
  },
  submissionId: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['submitted', 'processed', 'archived'],
    default: 'submitted'
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    submissionTime: Date
  }
}, {
  timestamps: true
});

// Add indexes for better performance
formSubmissionSchema.index({ formConfigurationId: 1, createdAt: -1 });
formSubmissionSchema.index({ submissionId: 1 });
formSubmissionSchema.index({ status: 1 });

export default mongoose.model('FormSubmission', formSubmissionSchema);
