import express from 'express';
import StoredField from '../models/StoredField.js';

const router = express.Router();

// Get all stored fields with optional search and filtering
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      type = '',
      page = 1,
      limit = 20,
      sortBy = 'usageCount',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = sortOrder === 'desc' ? -1 : 1;

    const options = {
      type: type || null,
      limit: parseInt(limit),
      skip,
      sortBy,
      sortOrder: sort
    };

    const fields = await StoredField.searchFields(search, options);
    const total = await StoredField.countDocuments(
      search ? { $text: { $search: search }, ...(type && { type }) } : (type ? { type } : {})
    );

    res.json({
      success: true,
      data: fields,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching stored fields:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stored fields',
      error: error.message
    });
  }
});

// Get a specific stored field by ID
router.get('/:id', async (req, res) => {
  try {
    const field = await StoredField.findById(req.params.id);
    
    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Stored field not found'
      });
    }

    res.json({
      success: true,
      data: field
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching stored field:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stored field',
      error: error.message
    });
  }
});

// Create a new stored field
router.post('/', async (req, res) => {
  try {
    const {
      name,
      label,
      type,
      configuration,
      fieldData,
      tags = [],
      description = '',
      createdBy = 'system'
    } = req.body;

    // Validate required fields
    if (!name || !label || !type || !fieldData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, label, type, and fieldData are required'
      });
    }

    // Check if a field with the same name already exists
    const existingField = await StoredField.findOne({ name });
    if (existingField) {
      return res.status(409).json({
        success: false,
        message: 'A stored field with this name already exists'
      });
    }

    const storedField = new StoredField({
      name,
      label,
      type,
      configuration,
      fieldData,
      tags: Array.isArray(tags) ? tags : [],
      description,
      createdBy
    });

    await storedField.save();

    res.status(201).json({
      success: true,
      message: 'Stored field created successfully',
      data: storedField
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating stored field:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create stored field',
      error: error.message
    });
  }
});

// Update a stored field
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      label,
      type,
      configuration,
      fieldData,
      tags,
      description
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (label !== undefined) updateData.label = label;
    if (type !== undefined) updateData.type = type;
    if (configuration !== undefined) updateData.configuration = configuration;
    if (fieldData !== undefined) updateData.fieldData = fieldData;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    if (description !== undefined) updateData.description = description;

    const field = await StoredField.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Stored field not found'
      });
    }

    res.json({
      success: true,
      message: 'Stored field updated successfully',
      data: field
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating stored field:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stored field',
      error: error.message
    });
  }
});

// Delete a stored field
router.delete('/:id', async (req, res) => {
  try {
    const field = await StoredField.findByIdAndDelete(req.params.id);

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Stored field not found'
      });
    }

    res.json({
      success: true,
      message: 'Stored field deleted successfully'
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting stored field:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete stored field',
      error: error.message
    });
  }
});

// Increment usage count when a stored field is used
router.post('/:id/use', async (req, res) => {
  try {
    const field = await StoredField.findById(req.params.id);

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Stored field not found'
      });
    }

    await field.incrementUsage();

    res.json({
      success: true,
      message: 'Usage count updated',
      data: field
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating usage count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update usage count',
      error: error.message
    });
  }
});

// Get field types with counts
router.get('/stats/types', async (req, res) => {
  try {
    const typeStats = await StoredField.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: typeStats
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching type statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch type statistics',
      error: error.message
    });
  }
});

export default router;
