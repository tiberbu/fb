import express from 'express';
import { body, validationResult } from 'express-validator';
import FormConfiguration from '../models/FormConfiguration.js';

const router = express.Router();

// GET all form configurations
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;
    const filter = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const forms = await FormConfiguration.find(filter)
      .select('-__v')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await FormConfiguration.countDocuments(filter);

    res.json({
      success: true,
      data: forms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching form configurations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching form configurations',
      error: error.message
    });
  }
});

// GET single form configuration by ID
router.get('/:id', async (req, res) => {
  try {
    const form = await FormConfiguration.findById(req.params.id).select('-__v');
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form configuration not found'
      });
    }

    res.json({
      success: true,
      data: form
    });
  } catch (error) {
    console.error('Error fetching form configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching form configuration',
      error: error.message
    });
  }
});

// POST create new form configuration
router.post('/', [
  body('name').notEmpty().trim().withMessage('Form name is required'),
  body('configuration').isObject().withMessage('Configuration must be an object'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, description, configuration, createdBy } = req.body;

    // Check if form with same name already exists
    const existingForm = await FormConfiguration.findOne({ name, isActive: true });
    if (existingForm) {
      return res.status(409).json({
        success: false,
        message: 'Form configuration with this name already exists'
      });
    }

    const formConfig = new FormConfiguration({
      name,
      description,
      configuration,
      createdBy: createdBy || 'system',
      updatedBy: createdBy || 'system'
    });

    const savedForm = await formConfig.save();

    res.status(201).json({
      success: true,
      message: 'Form configuration created successfully',
      data: savedForm
    });
  } catch (error) {
    console.error('Error creating form configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating form configuration',
      error: error.message
    });
  }
});

// PUT update form configuration
router.put('/:id', [
  body('name').optional().notEmpty().trim().withMessage('Form name cannot be empty'),
  body('configuration').optional().isObject().withMessage('Configuration must be an object'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, description, configuration, updatedBy } = req.body;
    const updateData = {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(configuration && { configuration }),
      updatedBy: updatedBy || 'system'
    };

    // Increment version
    const form = await FormConfiguration.findById(req.params.id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form configuration not found'
      });
    }

    updateData.version = form.version + 1;

    const updatedForm = await FormConfiguration.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    res.json({
      success: true,
      message: 'Form configuration updated successfully',
      data: updatedForm
    });
  } catch (error) {
    console.error('Error updating form configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating form configuration',
      error: error.message
    });
  }
});

// DELETE form configuration (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const form = await FormConfiguration.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form configuration not found'
      });
    }

    res.json({
      success: true,
      message: 'Form configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting form configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting form configuration',
      error: error.message
    });
  }
});

export default router;
