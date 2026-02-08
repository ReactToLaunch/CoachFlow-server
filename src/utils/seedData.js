/**
 * Database Seeding Script for CoachFlow
 * Populates the database with realistic demo data for testing
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';
import { Batch } from '../models/batch.model.js';
import { Fee } from '../models/fees.model.js';
import { Attendance } from '../models/attendence.model.js';
import { Notice } from '../models/notice.model.js';
import { StudyMaterial } from '../models/studyMaterial.model.js';
import { Result } from '../models/result.model.js';
import { StudentProfile } from '../models/studentProfile.js';
import { Admin } from '../models/admin.model.js';

dotenv.config();

// Sample student names
const studentNames = [
    'Rahul Kumar', 'Priya Singh', 'Arjun Verma', 'Sneha Patel', 'Rohan Das',
    'Ananya Sharma', 'Vikram Reddy', 'Pooja Gupta', 'Karan Mehta', 'Riya Joshi',
    'Aditya Nair', 'Divya Iyer', 'Siddharth Rao', 'Kavya Menon', 'Harsh Agarwal',
    'Neha Kapoor', 'Varun Malhotra', 'Ishita Bansal', 'Akash Choudhary', 'Tanvi Desai',
    'Nikhil Pandey', 'Shreya Kulkarni', 'Abhishek Jain', 'Megha Saxena', 'Rajat Tiwari',
    'Sakshi Bhatt', 'Yash Sinha', 'Kritika Arora', 'Mohit Chauhan', 'Anjali Mishra',
    'Gaurav Yadav', 'Simran Kaur', 'Kunal Thakur', 'Preeti Rawat', 'Shubham Dubey',
    'Nidhi Tripathi', 'Aman Shukla', 'Ritu Bhatia', 'Vishal Goyal', 'Pallavi Jha',
    'Deepak Soni', 'Swati Chawla', 'Manish Kohli', 'Priyanka Sethi', 'Ashish Garg',
    'Komal Bajaj', 'Sandeep Mittal', 'Poonam Khanna', 'Tarun Oberoi', 'Nisha Chopra',
    'Rohit Bose', 'Meera Dutta', 'Vivek Sen', 'Ayesha Khan', 'Pranav Pillai'
];

// Parent names
const parentNames = [
    'Mr. Rajesh Kumar', 'Mrs. Sunita Singh', 'Mr. Prakash Verma', 'Mrs. Meena Patel', 'Mr. Suresh Das',
    'Mrs. Rekha Sharma', 'Mr. Venkat Reddy', 'Mrs. Anjali Gupta', 'Mr. Ramesh Mehta', 'Mrs. Kavita Joshi',
    'Mr. Anil Nair', 'Mrs. Lakshmi Iyer', 'Mr. Mohan Rao', 'Mrs. Priya Menon', 'Mr. Vijay Agarwal',
    'Mrs. Pooja Kapoor', 'Mr. Ashok Malhotra', 'Mrs. Neelam Bansal', 'Mr. Dinesh Choudhary', 'Mrs. Suman Desai',
    'Mr. Manoj Pandey', 'Mrs. Shobha Kulkarni', 'Mr. Rajiv Jain', 'Mrs. Geeta Saxena', 'Mr. Alok Tiwari',
    'Mrs. Renu Bhatt', 'Mr. Pankaj Sinha', 'Mrs. Nisha Arora', 'Mr. Sanjay Chauhan', 'Mrs. Anita Mishra',
    'Mr. Deepak Yadav', 'Mrs. Harpreet Kaur', 'Mr. Amit Thakur', 'Mrs. Savita Rawat', 'Mr. Ravi Dubey',
    'Mrs. Madhuri Tripathi', 'Mr. Sunil Shukla', 'Mrs. Vandana Bhatia', 'Mr. Naresh Goyal', 'Mrs. Seema Jha',
    'Mr. Arun Soni', 'Mrs. Kiran Chawla', 'Mr. Praveen Kohli', 'Mrs. Usha Sethi', 'Mr. Rakesh Garg',
    'Mrs. Jyoti Bajaj', 'Mr. Mukesh Mittal', 'Mrs. Asha Khanna', 'Mr. Vinod Oberoi', 'Mrs. Ritu Chopra',
    'Mr. Subhash Bose', 'Mrs. Mala Dutta', 'Mr. Ajay Sen', 'Mrs. Farida Khan', 'Mr. Krishnan Pillai'
];

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

// Clear existing data
const clearDatabase = async () => {
    try {
        await User.deleteMany({ selectedRole: 'student' });
        await Batch.deleteMany({});
        await Fee.deleteMany({});
        await Attendance.deleteMany({});
        await Notice.deleteMany({});
        await StudyMaterial.deleteMany({});
        await Result.deleteMany({});
        await StudentProfile.deleteMany({});
        console.log('🗑️  Cleared existing demo data');
    } catch (error) {
        console.error('Error clearing database:', error);
    }
};

// Seed Batches
const seedBatches = async () => {
    const batches = [
        {
            Name: 'NEET Dropper Batch 2024',
            batchcode: 'NEET-DROP-24',
            subjects: ['PHYSICS', 'CHEMISTRY', 'BIOLOGY'],
            year: 2024,
            time: '7:00 AM - 1:00 PM',
            isActive: true
        },
        {
            Name: 'JEE Advanced 2024',
            batchcode: 'JEE-ADV-24',
            subjects: ['PHYSICS', 'CHEMISTRY', 'MATHEMATICS'],
            year: 2024,
            time: '2:00 PM - 8:00 PM',
            isActive: true
        },
        {
            Name: 'Foundation Class 11',
            batchcode: 'FOUND-11-24',
            subjects: ['PHYSICS', 'CHEMISTRY', 'MATHEMATICS', 'BIOLOGY'],
            year: 2024,
            time: '4:00 PM - 7:00 PM',
            isActive: true
        }
    ];

    const createdBatches = await Batch.insertMany(batches);
    console.log(`✅ Created ${createdBatches.length} batches`);
    return createdBatches;
};

// Seed Students
const seedStudents = async (batches) => {
    const students = [];
    const studentProfiles = [];
    let enrollmentCounter = 1001;

    for (let i = 0; i < 55; i++) {
        const batchIndex = i % 3; // Distribute students across batches
        const batch = batches[batchIndex];

        const student = {
            fullName: studentNames[i],
            EnrollmentNumber: `ENR${enrollmentCounter++}`,
            email: `${studentNames[i].toLowerCase().replace(' ', '.')}@student.com`,
            batch: batch._id,
            isVerified: true,
            password: 'Student@123', // Will be hashed by pre-save hook
            phone: `98765${String(43210 + i).padStart(5, '0')}`,
            avatar: '',
            selectedRole: 'student',
            fcmToken: null
        };

        students.push(student);
    }

    const createdStudents = await User.insertMany(students);
    console.log(`✅ Created ${createdStudents.length} students`);

    // Create student profiles
    for (let i = 0; i < createdStudents.length; i++) {
        const student = createdStudents[i];
        const profile = {
            user: student._id,
            batch: student.batch,
            admissionNumber: `ADM${2024}${String(i + 1).padStart(4, '0')}`,
            rollNumber: `ROLL${String(i + 1).padStart(3, '0')}`,
            parentsName: parentNames[i],
            parentsPhone: `98765${String(10000 + i).padStart(5, '0')}`,
            address: `${i + 1}, Model Town, Delhi, India`,
            dob: new Date(2005 + (i % 3), i % 12, (i % 28) + 1),
            gender: i % 3 === 0 ? 'Male' : i % 3 === 1 ? 'Female' : 'Male'
        };
        studentProfiles.push(profile);
    }

    await StudentProfile.insertMany(studentProfiles);
    console.log(`✅ Created ${studentProfiles.length} student profiles`);

    return createdStudents;
};

// Seed Fees
const seedFees = async (students, batches, admin) => {
    const fees = [];
    const now = new Date();

    for (const student of students) {
        const totalFees = 50000 + Math.floor(Math.random() * 20000); // 50k-70k
        const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 5000) : 0;
        const paidAmount = Math.random() > 0.3 ? Math.floor(Math.random() * (totalFees - discount)) : 0;

        const transactions = [];
        if (paidAmount > 0) {
            const numTransactions = Math.floor(Math.random() * 3) + 1;
            let remainingAmount = paidAmount;

            for (let i = 0; i < numTransactions && remainingAmount > 0; i++) {
                const amount = i === numTransactions - 1 ? remainingAmount : Math.floor(remainingAmount / (numTransactions - i));
                transactions.push({
                    amount,
                    paymentMode: ['CASH', 'ONLINE', 'UPI'][Math.floor(Math.random() * 3)],
                    transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    date: new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Last 60 days
                    collectedBy: admin._id
                });
                remainingAmount -= amount;
            }
        }

        const fee = {
            student: student._id,
            batch: student.batch,
            totalFees,
            discount,
            finalAmount: totalFees - discount,
            paidAmount,
            pendingAmount: (totalFees - discount) - paidAmount,
            nextDueDate: new Date(now.getTime() + (Math.random() * 30 * 24 * 60 * 60 * 1000)), // Next 30 days
            transactions
        };

        fees.push(fee);
    }

    const createdFees = await Fee.insertMany(fees);
    console.log(`✅ Created ${createdFees.length} fee records`);
    return createdFees;
};

// Seed Attendance
const seedAttendance = async (students, batches, admin) => {
    const attendanceRecords = [];
    const now = new Date();

    // Create attendance for last 30 days
    for (let day = 0; day < 30; day++) {
        const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);

        for (const batch of batches) {
            const batchStudents = students.filter(s => s.batch.toString() === batch._id.toString());
            const absentCount = Math.floor(Math.random() * 5); // 0-4 absent students
            const absentStudents = batchStudents
                .sort(() => 0.5 - Math.random())
                .slice(0, absentCount)
                .map(s => s._id);

            attendanceRecords.push({
                date,
                batch: batch._id,
                absentStudents,
                totalStudents: batchStudents.length,
                markedBy: admin._id
            });
        }
    }

    const createdAttendance = await Attendance.insertMany(attendanceRecords);
    console.log(`✅ Created ${createdAttendance.length} attendance records`);
    return createdAttendance;
};

// Seed Notices
const seedNotices = async (batches, admin) => {
    const notices = [
        {
            title: 'Important: Mock Test Schedule',
            content: 'Mock test for NEET will be conducted on 15th February 2024. All students must attend. Reporting time: 8:00 AM sharp.',
            type: 'URGENT',
            targetBatches: [batches[0]._id],
            postedBy: admin._id
        },
        {
            title: 'Holiday Notice - Republic Day',
            content: 'The coaching center will remain closed on 26th January 2024 on account of Republic Day. Classes will resume from 27th January.',
            type: 'HOLIDAY',
            targetBatches: batches.map(b => b._id),
            postedBy: admin._id
        },
        {
            title: 'New Study Material Available',
            content: 'New study material for Organic Chemistry has been uploaded. Please check the study materials section.',
            type: 'INFO',
            targetBatches: [batches[0]._id, batches[1]._id],
            postedBy: admin._id
        },
        {
            title: 'Result Announcement',
            content: 'Results for the monthly test conducted on 5th January are now available. Check your student portal.',
            type: 'RESULT',
            targetBatches: batches.map(b => b._id),
            postedBy: admin._id
        },
        {
            title: 'Fee Payment Reminder',
            content: 'Students with pending fees are requested to clear their dues by 10th February to avoid late fees.',
            type: 'URGENT',
            targetBatches: batches.map(b => b._id),
            postedBy: admin._id
        }
    ];

    const createdNotices = await Notice.insertMany(notices);
    console.log(`✅ Created ${createdNotices.length} notices`);
    return createdNotices;
};

// Seed Study Materials
const seedStudyMaterials = async (batches, admin) => {
    const materials = [
        {
            title: 'Organic Chemistry - Reaction Mechanisms',
            description: 'Comprehensive notes on organic reaction mechanisms with solved examples',
            subject: 'CHEMISTRY',
            batch: batches[0]._id,
            fileUrl: 'https://example.com/organic-chemistry.pdf',
            fileType: 'PDF',
            cloudinaryId: 'demo_organic_chem_001',
            uploadedBy: admin._id
        },
        {
            title: 'Physics - Electrostatics Formula Sheet',
            description: 'All important formulas and derivations for electrostatics',
            subject: 'PHYSICS',
            batch: batches[1]._id,
            fileUrl: 'https://example.com/electrostatics.pdf',
            fileType: 'PDF',
            cloudinaryId: 'demo_physics_elec_001',
            uploadedBy: admin._id
        },
        {
            title: 'Mathematics - Calculus Practice Problems',
            description: '100+ practice problems on differential and integral calculus',
            subject: 'MATHEMATICS',
            batch: batches[1]._id,
            fileUrl: 'https://example.com/calculus-problems.pdf',
            fileType: 'PDF',
            cloudinaryId: 'demo_math_calc_001',
            uploadedBy: admin._id
        },
        {
            title: 'Biology - Human Physiology Notes',
            description: 'Detailed notes on human physiology with diagrams',
            subject: 'BIOLOGY',
            batch: batches[0]._id,
            fileUrl: 'https://example.com/human-physiology.pdf',
            fileType: 'PDF',
            cloudinaryId: 'demo_bio_physio_001',
            uploadedBy: admin._id
        },
        {
            title: 'Chemistry - Periodic Table Trends',
            description: 'Visual guide to periodic table trends and properties',
            subject: 'CHEMISTRY',
            batch: batches[2]._id,
            fileUrl: 'https://example.com/periodic-trends.pdf',
            fileType: 'IMAGE',
            cloudinaryId: 'demo_chem_periodic_001',
            uploadedBy: admin._id
        }
    ];

    const createdMaterials = await StudyMaterial.insertMany(materials);
    console.log(`✅ Created ${createdMaterials.length} study materials`);
    return createdMaterials;
};

// Seed Results
const seedResults = async (students, batches) => {
    const results = [];
    const testNames = [
        'Monthly Test - January',
        'Unit Test - Physics',
        'Mock Test - Full Syllabus',
        'Weekly Quiz - Chemistry',
        'Practice Test - Mathematics'
    ];

    for (const student of students) {
        const numTests = Math.floor(Math.random() * 3) + 2; // 2-4 tests per student

        for (let i = 0; i < numTests; i++) {
            const totalMarks = 100;
            const marksObtained = Math.floor(Math.random() * 40) + 50; // 50-90 marks

            results.push({
                student: student._id,
                batch: student.batch,
                testName: testNames[i % testNames.length],
                testDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Last 60 days
                marksObtained,
                totalMarks
            });
        }
    }

    const createdResults = await Result.insertMany(results);
    console.log(`✅ Created ${createdResults.length} result records`);
    return createdResults;
};

// Main seeding function
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...\n');

        await connectDB();
        await clearDatabase();

        // Get or create admin
        let admin = await Admin.findOne({});
        if (!admin) {
            console.log('⚠️  No admin found. Please create an admin first using the registration endpoint.');
            process.exit(1);
        }
        console.log(`✅ Using admin: ${admin.Name}\n`);

        // Seed data in order
        const batches = await seedBatches();
        const students = await seedStudents(batches);
        const fees = await seedFees(students, batches, admin);
        const attendance = await seedAttendance(students, batches, admin);
        const notices = await seedNotices(batches, admin);
        const materials = await seedStudyMaterials(batches, admin);
        const results = await seedResults(students, batches);

        console.log('\n✨ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Batches: ${batches.length}`);
        console.log(`   - Students: ${students.length}`);
        console.log(`   - Fee Records: ${fees.length}`);
        console.log(`   - Attendance Records: ${attendance.length}`);
        console.log(`   - Notices: ${notices.length}`);
        console.log(`   - Study Materials: ${materials.length}`);
        console.log(`   - Test Results: ${results.length}`);
        console.log('\n🎉 Your dashboard is now ready with demo data!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

// Run the seeder
seedDatabase();
