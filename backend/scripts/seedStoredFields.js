#!/usr/bin/env node

import mongoose from 'mongoose';
import StoredField from '../models/StoredField.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/form-builder';

const sampleFields = [
  {
    name: 'full_name',
    label: 'Full Name',
    type: 'text',
    configuration: {
      placeholder: 'Enter your full name',
      required: true
    },
    fieldData: {
      id: 'field_full_name',
      type: 'text',
      name: 'full_name',
      label: 'Full Name',
      required: true,
      placeholder: 'Enter your full name',
      order: 1
    },
    tags: ['text', 'personal', 'required'],
    description: 'Standard full name input with validation',
    usageCount: 25,
    createdBy: 'system'
  },
  {
    name: 'email_address',
    label: 'Email Address',
    type: 'email',
    configuration: {
      placeholder: 'user@example.com',
      required: true
    },
    fieldData: {
      id: 'field_email',
      type: 'email',
      name: 'email_address',
      label: 'Email Address',
      required: true,
      placeholder: 'user@example.com',
      order: 2
    },
    tags: ['email', 'contact', 'required'],
    description: 'Email input with validation',
    usageCount: 30,
    createdBy: 'system'
  },
  {
    name: 'phone_number',
    label: 'Phone Number',
    type: 'phone',
    configuration: {
      placeholder: '+1 (555) 123-4567',
      required: false
    },
    fieldData: {
      id: 'field_phone',
      type: 'phone',
      name: 'phone_number',
      label: 'Phone Number',
      required: false,
      placeholder: '+1 (555) 123-4567',
      order: 3
    },
    tags: ['phone', 'contact', 'optional'],
    description: 'Phone number input with formatting',
    usageCount: 18,
    createdBy: 'system'
  },
  {
    name: 'country_select',
    label: 'Country',
    type: 'select',
    configuration: {
      required: true,
      options: [
        { label: 'United States', value: 'US' },
        { label: 'Canada', value: 'CA' },
        { label: 'United Kingdom', value: 'UK' },
        { label: 'Australia', value: 'AU' },
        { label: 'Germany', value: 'DE' },
        { label: 'France', value: 'FR' }
      ]
    },
    fieldData: {
      id: 'field_country',
      type: 'select',
      name: 'country_select',
      label: 'Country',
      required: true,
      order: 4,
      options: [
        { label: 'United States', value: 'US' },
        { label: 'Canada', value: 'CA' },
        { label: 'United Kingdom', value: 'UK' },
        { label: 'Australia', value: 'AU' },
        { label: 'Germany', value: 'DE' },
        { label: 'France', value: 'FR' }
      ]
    },
    tags: ['select', 'geography', 'required'],
    description: 'Country selection dropdown',
    usageCount: 22,
    createdBy: 'system'
  },
  {
    name: 'birth_date',
    label: 'Date of Birth',
    type: 'date',
    configuration: {
      required: true,
      max: new Date().toISOString().split('T')[0] // Today's date
    },
    fieldData: {
      id: 'field_birth_date',
      type: 'date',
      name: 'birth_date',
      label: 'Date of Birth',
      required: true,
      max: new Date().toISOString().split('T')[0],
      order: 5
    },
    tags: ['date', 'personal', 'required'],
    description: 'Date picker for birth date',
    usageCount: 15,
    createdBy: 'system'
  },
  {
    name: 'comments',
    label: 'Additional Comments',
    type: 'textarea',
    configuration: {
      placeholder: 'Please provide any additional information...',
      rows: 4,
      required: false
    },
    fieldData: {
      id: 'field_comments',
      type: 'textarea',
      name: 'comments',
      label: 'Additional Comments',
      required: false,
      placeholder: 'Please provide any additional information...',
      rows: 4,
      order: 6
    },
    tags: ['textarea', 'optional', 'feedback'],
    description: 'Multi-line text area for comments',
    usageCount: 12,
    createdBy: 'system'
  }
];

async function seedStoredFields() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing stored fields
    await StoredField.deleteMany({});
    console.log('Cleared existing stored fields');

    // Insert sample fields
    await StoredField.insertMany(sampleFields);
    console.log(`Inserted ${sampleFields.length} sample stored fields`);

    console.log('Seed data inserted successfully!');
  } catch (error) {
    console.error('Error seeding stored fields:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedStoredFields();
