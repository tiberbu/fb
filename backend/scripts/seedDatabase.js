import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FormConfiguration from '../models/FormConfiguration.js';

dotenv.config();

const sampleFormConfigurations = [
  {
    name: "Contact Form",
    description: "A simple contact form for customer inquiries",
    configuration: {
      tabs: [
        {
          id: "contact_tab",
          title: "Contact Information",
          sections: [
            {
              id: "personal_section",
              title: "Personal Details",
              subtitle: "Please provide your contact information",
              hideTitle: false,
              hideSubtitle: false,
              collapsible: false,
              rows: [
                {
                  id: "row_1",
                  columns: [
                    {
                      fields: [
                        {
                          id: "first_name",
                          type: "text",
                          label: "First Name",
                          placeholder: "Enter your first name",
                          required: true,
                          validation: {
                            minLength: 2,
                            maxLength: 50
                          }
                        }
                      ]
                    },
                    {
                      fields: [
                        {
                          id: "last_name",
                          type: "text",
                          label: "Last Name",
                          placeholder: "Enter your last name",
                          required: true,
                          validation: {
                            minLength: 2,
                            maxLength: 50
                          }
                        }
                      ]
                    }
                  ]
                },
                {
                  id: "row_2",
                  columns: [
                    {
                      fields: [
                        {
                          id: "email",
                          type: "email",
                          label: "Email Address",
                          placeholder: "Enter your email",
                          required: true,
                          validation: {
                            pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"
                          }
                        }
                      ]
                    }
                  ]
                },
                {
                  id: "row_3",
                  columns: [
                    {
                      fields: [
                        {
                          id: "message",
                          type: "textarea",
                          label: "Message",
                          placeholder: "Enter your message",
                          required: true,
                          validation: {
                            minLength: 10,
                            maxLength: 500
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    createdBy: "admin"
  },
  {
    name: "Employee Registration",
    description: "Employee registration form with multiple sections",
    configuration: {
      tabs: [
        {
          id: "employee_tab",
          title: "Employee Information",
          sections: [
            {
              id: "basic_info",
              title: "Basic Information",
              subtitle: "Personal and contact details",
              hideTitle: false,
              hideSubtitle: false,
              collapsible: false,
              rows: [
                {
                  id: "row_1",
                  columns: [
                    {
                      fields: [
                        {
                          id: "employee_id",
                          type: "text",
                          label: "Employee ID",
                          placeholder: "EMP001",
                          required: true
                        }
                      ]
                    },
                    {
                      fields: [
                        {
                          id: "full_name",
                          type: "text",
                          label: "Full Name",
                          placeholder: "Enter full name",
                          required: true
                        }
                      ]
                    }
                  ]
                },
                {
                  id: "row_2",
                  columns: [
                    {
                      fields: [
                        {
                          id: "department",
                          type: "select",
                          label: "Department",
                          required: true,
                          options: [
                            { value: "hr", label: "Human Resources" },
                            { value: "it", label: "Information Technology" },
                            { value: "finance", label: "Finance" },
                            { value: "marketing", label: "Marketing" }
                          ]
                        }
                      ]
                    },
                    {
                      fields: [
                        {
                          id: "position",
                          type: "text",
                          label: "Position",
                          placeholder: "Enter position",
                          required: true
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              id: "contact_info",
              title: "Contact Information",
              subtitle: "How can we reach you?",
              hideTitle: false,
              hideSubtitle: false,
              collapsible: true,
              rows: [
                {
                  id: "row_3",
                  columns: [
                    {
                      fields: [
                        {
                          id: "work_email",
                          type: "email",
                          label: "Work Email",
                          placeholder: "name@company.com",
                          required: true
                        }
                      ]
                    },
                    {
                      fields: [
                        {
                          id: "phone",
                          type: "tel",
                          label: "Phone Number",
                          placeholder: "+1 (555) 123-4567",
                          required: false
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    createdBy: "hr_admin"
  },
  {
    name: "Survey Form",
    description: "Customer satisfaction survey",
    configuration: {
      tabs: [
        {
          id: "survey_tab",
          title: "Customer Survey",
          sections: [
            {
              id: "satisfaction",
              title: "Satisfaction Rating",
              subtitle: "Please rate your experience",
              hideTitle: false,
              hideSubtitle: false,
              collapsible: false,
              rows: [
                {
                  id: "row_1",
                  columns: [
                    {
                      fields: [
                        {
                          id: "overall_rating",
                          type: "radio",
                          label: "Overall Satisfaction",
                          required: true,
                          options: [
                            { value: "1", label: "Very Dissatisfied" },
                            { value: "2", label: "Dissatisfied" },
                            { value: "3", label: "Neutral" },
                            { value: "4", label: "Satisfied" },
                            { value: "5", label: "Very Satisfied" }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  id: "row_2",
                  columns: [
                    {
                      fields: [
                        {
                          id: "recommendations",
                          type: "checkbox",
                          label: "What would you recommend?",
                          required: false,
                          options: [
                            { value: "product_improvement", label: "Product Improvement" },
                            { value: "better_support", label: "Better Customer Support" },
                            { value: "faster_delivery", label: "Faster Delivery" },
                            { value: "lower_prices", label: "Lower Prices" }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  id: "row_3",
                  columns: [
                    {
                      fields: [
                        {
                          id: "comments",
                          type: "textarea",
                          label: "Additional Comments",
                          placeholder: "Please share any additional feedback",
                          required: false
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    createdBy: "survey_admin"
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/form-builder');
    console.log('Connected to MongoDB');

    // Clear existing form configurations
    await FormConfiguration.deleteMany({});
    console.log('Cleared existing form configurations');

    // Insert sample data
    const createdForms = await FormConfiguration.insertMany(sampleFormConfigurations);
    console.log(`✅ Created ${createdForms.length} sample form configurations`);

    createdForms.forEach((form, index) => {
      console.log(`${index + 1}. ${form.name} (ID: ${form._id})`);
    });

    console.log('\\n🎉 Database seeded successfully!');
    console.log('\\nYou can now:');
    console.log('- Start the server: npm run dev');
    console.log('- View forms: GET http://localhost:3001/api/form-configurations');
    console.log('- Submit data to any form using its ID');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\\nDatabase connection closed');
  }
}

// Run the seed function
seedDatabase();
