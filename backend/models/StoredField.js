import mongoose from 'mongoose';

const storedFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  label: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'text', 'textarea', 'number', 'email', 'phone', 'url', 'password',
      'select', 'radio', 'checkbox', 'check', 'date', 'datetime', 'time',
      'file', 'image', 'range', 'color', 'hidden', 'readonly', 'divider',
      'html', 'link', 'table'
    ]
  },
  configuration: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Store the complete field configuration including all properties
  fieldData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  // Tags for categorization and searching
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // Description for the field
  description: {
    type: String,
    trim: true
  },
  // Usage count to track popularity
  usageCount: {
    type: Number,
    default: 0
  },
  // Creator information (optional for future user management)
  createdBy: {
    type: String,
    default: 'system'
  },
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient searching
storedFieldSchema.index({ name: 'text', label: 'text', description: 'text', tags: 'text' });
storedFieldSchema.index({ type: 1, usageCount: -1 });
storedFieldSchema.index({ createdAt: -1 });

// Update the updatedAt field before saving
storedFieldSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to increment usage count
storedFieldSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Static method to search fields
storedFieldSchema.statics.searchFields = function(query, options = {}) {
  const {
    type = null,
    limit = 20,
    skip = 0,
    sortBy = 'usageCount',
    sortOrder = -1
  } = options;

  let searchQuery = {};
  
  if (query && query.trim()) {
    searchQuery.$text = { $search: query };
  }
  
  if (type) {
    searchQuery.type = type;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder;

  return this.find(searchQuery)
    .sort(sortOptions)
    .limit(limit)
    .skip(skip);
};

export default mongoose.model('StoredField', storedFieldSchema);
