const User = require('../models/User');
const Department = require('../models/Department');
const Complaint = require('../models/Complaint');

const backfillComplaintDepartments = async () => {
  try {
    // Find complaints that have no department assigned (null or missing)
    const complaints = await Complaint.find({ department: null });
    if (!complaints.length) return;

    let updated = 0;
    for (const complaint of complaints) {
      const dept = await Department.findOne({ categories: complaint.category, isActive: true });
      if (dept) {
        complaint.department = dept._id;
        await complaint.save();
        updated++;
      }
    }

    console.log(`✓ Backfilled department for ${updated} complaints`);
  } catch (error) {
    console.error('Error backfilling complaint departments:', error.message);
  }
};

const seedDepartments = async () => {
  try {
    // Check if departments already exist
    const existingDepts = await Department.countDocuments();
    
    if (existingDepts === 0) {
      // Only seed departments and department users if they don't exist
      const departments = [
        {
          name: 'Water Supply Department',
          email: 'water@example.com',
          phone: '1234567890',
          description: 'Handles water supply and distribution complaints',
          categories: ['water']
        },
        {
          name: 'Roads & Infrastructure Department',
          email: 'roads@example.com',
          phone: '1234567891',
          description: 'Handles roads, potholes, and infrastructure complaints',
          categories: ['roads']
        },
        {
          name: 'Electricity & Power Department',
          email: 'electricity@example.com',
          phone: '1234567892',
          description: 'Handles electricity and power supply complaints',
          categories: ['electricity']
        },
        {
          name: 'Sanitation & Cleaning Department',
          email: 'sanitation@example.com',
          phone: '1234567893',
          description: 'Handles sanitation and cleaning complaints',
          categories: ['sanitation']
        },
        {
          name: 'General Services Department',
          email: 'other@example.com',
          phone: '1234567894',
          description: 'Handles other general service complaints',
          categories: ['other']
        }
      ];

      // Create departments
      const createdDepts = await Department.insertMany(departments);
      console.log(`✓ Created ${createdDepts.length} departments`);

      // Create department admin users
      const departmentUsers = [
        {
          name: 'Water Supply Admin',
          email: 'water@example.com',
          password: 'dept123',
          phone: '1234567890',
          address: 'Water Department Office',
          role: 'department',
          department: createdDepts[0]._id,
          isActive: true
        },
        {
          name: 'Roads & Infrastructure Admin',
          email: 'roads@example.com',
          password: 'dept123',
          phone: '1234567891',
          address: 'Roads Department Office',
          role: 'department',
          department: createdDepts[1]._id,
          isActive: true
        },
        {
          name: 'Electricity & Power Admin',
          email: 'electricity@example.com',
          password: 'dept123',
          phone: '1234567892',
          address: 'Electricity Department Office',
          role: 'department',
          department: createdDepts[2]._id,
          isActive: true
        },
        {
          name: 'Sanitation & Cleaning Admin',
          email: 'sanitation@example.com',
          password: 'dept123',
          phone: '1234567893',
          address: 'Sanitation Department Office',
          role: 'department',
          department: createdDepts[3]._id,
          isActive: true
        },
        {
          name: 'General Services Admin',
          email: 'other@example.com',
          password: 'dept123',
          phone: '1234567894',
          address: 'General Services Office',
          role: 'department',
          department: createdDepts[4]._id,
          isActive: true
        }
      ];

      // Create users (use create so pre-save hooks run to hash passwords)
      const createdUsers = await User.create(departmentUsers);
      console.log(`✓ Created ${createdUsers.length} department users`);

      // Update departments with their head
      for (let i = 0; i < createdDepts.length; i++) {
        await Department.findByIdAndUpdate(
          createdDepts[i]._id,
          {
            head: createdUsers[i]._id,
            staff: [createdUsers[i]._id]
          }
        );
      }

      console.log('✓ Department seed data initialized successfully!');
    } else {
      console.log('Departments already exist, skipping department seed...');
    }

    // Always ensure there is an admin user for quick access
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'System Administrator',
        email: 'admin@example.com',
        password: 'admin123',
        phone: '1234567899',
        address: 'Head Office',
        role: 'admin',
        isActive: true
      });
      await adminUser.save();
      console.log('✓ Created default admin user (admin@example.com / admin123)');
    } else {
      console.log('Admin user already exists, skipping admin seed...');
    }

    // Ensure complaints created prior to department assignment are fixed
    await backfillComplaintDepartments();
  } catch (error) {
    console.error('Error seeding departments:', error.message);
  }
};

module.exports = seedDepartments;
