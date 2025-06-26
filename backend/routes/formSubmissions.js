import express from 'express';
import { body, validationResult } from 'express-validator';
import FormSubmission from '../models/FormSubmission.js';
import FormConfiguration from '../models/FormConfiguration.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET all form submissions
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      formConfigurationId, 
      status,
      startDate,
      endDate 
    } = req.query;
    
    const filter = {};
    
    if (formConfigurationId) {
      filter.formConfigurationId = formConfigurationId;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const submissions = await FormSubmission.find(filter)
      .populate('formConfigurationId', 'name description')
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await FormSubmission.countDocuments(filter);

    res.json({
      success: true,
      data: submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching form submissions',
      error: error.message
    });
  }
});

// GET single form submission by ID
router.get('/:id', async (req, res) => {
  try {
    const submission = await FormSubmission.findById(req.params.id)
      .populate('formConfigurationId', 'name description configuration')
      .select('-__v');
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Form submission not found'
      });
    }

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error fetching form submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching form submission',
      error: error.message
    });
  }
});

// GET submissions by form configuration ID
router.get('/form/:formConfigurationId', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { formConfigurationId: req.params.formConfigurationId };
    
    if (status) {
      filter.status = status;
    }

    const submissions = await FormSubmission.find(filter)
      .populate('formConfigurationId', 'name description')
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await FormSubmission.countDocuments(filter);

    res.json({
      success: true,
      data: submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching form submissions',
      error: error.message
    });
  }
});

// POST submit form data
router.post('/', [
  body('formConfigurationId').isMongoId().withMessage('Valid form configuration ID is required'),
  body('submissionData').isObject().withMessage('Submission data must be an object'),
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

    const { 
      formConfigurationId, 
      submissionData, 
      submittedBy,
      metadata = {} 
    } = req.body;

    // Verify form configuration exists and is active
    const formConfig = await FormConfiguration.findOne({
      _id: formConfigurationId,
      isActive: true
    });

    if (!formConfig) {
      return res.status(404).json({
        success: false,
        message: 'Form configuration not found or inactive'
      });
    }

    // Generate unique submission ID
    const submissionId = uuidv4();

    // Enhance metadata with request information
    const enhancedMetadata = {
      ...metadata,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress,
      submissionTime: new Date()
    };

    const submission = new FormSubmission({
      formConfigurationId,
      formName: formConfig.name,
      submissionData,
      submittedBy: submittedBy || 'anonymous',
      submissionId,
      metadata: enhancedMetadata
    });

    const savedSubmission = await submission.save();

    // Populate the form configuration data for the response
    await savedSubmission.populate('formConfigurationId', 'name description');

    res.status(201).json({
      success: true,
      message: 'Form submitted successfully',
      data: savedSubmission
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting form',
      error: error.message
    });
  }
});

// PUT update submission status
router.put('/:id/status', [
  body('status').isIn(['submitted', 'processed', 'archived']).withMessage('Invalid status'),
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

    const { status } = req.body;

    const submission = await FormSubmission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('formConfigurationId', 'name description');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Form submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Submission status updated successfully',
      data: submission
    });
  } catch (error) {
    console.error('Error updating submission status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating submission status',
      error: error.message
    });
  }
});

// DELETE form submission
router.delete('/:id', async (req, res) => {
  try {
    const submission = await FormSubmission.findByIdAndDelete(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Form submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Form submission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting form submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting form submission',
      error: error.message
    });
  }
});

export default router;
