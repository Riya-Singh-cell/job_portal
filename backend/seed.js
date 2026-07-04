/**
 * @file seed.js
 * @description Database seeder — populates the DB with demo data for development.
 * Run with: node seed.js
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Company = require('./models/Company');
const Job = require('./models/Job');
const Application = require('./models/Application');
const SavedJob = require('./models/SavedJob');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jobportal';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Company.deleteMany(),
      Job.deleteMany(),
      Application.deleteMany(),
      SavedJob.deleteMany(),
      Notification.deleteMany(),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Users ─────────────────────────────────────────────────────────────────
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@jobportal.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      status: 'active',
    });

    const recruiters = await User.create([
      {
        name: 'Sarah Johnson',
        email: 'sarah@techcorp.com',
        password: 'recruiter123',
        role: 'recruiter',
        isVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      },
      {
        name: 'Michael Chen',
        email: 'michael@innovate.io',
        password: 'recruiter123',
        role: 'recruiter',
        isVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
      },
      {
        name: 'Emma Wilson',
        email: 'emma@designstudio.com',
        password: 'recruiter123',
        role: 'recruiter',
        isVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
      },
    ]);

    const candidates = await User.create([
      {
        name: 'Alex Rivera',
        email: 'alex@candidate.com',
        password: 'candidate123',
        role: 'candidate',
        isVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
        profile: {
          bio: 'Passionate full-stack developer with 3 years of experience building scalable web applications.',
          skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS'],
          experience: [
            {
              title: 'Full Stack Developer',
              company: 'StartupXYZ',
              location: 'San Francisco, CA',
              from: new Date('2021-01-01'),
              current: true,
              description: 'Building and maintaining React/Node.js applications.',
            },
          ],
          education: [
            {
              school: 'University of California',
              degree: 'B.Sc.',
              fieldOfStudy: 'Computer Science',
              from: new Date('2017-09-01'),
              to: new Date('2021-05-01'),
            },
          ],
          socialLinks: [
            { platform: 'GitHub', url: 'https://github.com/alexrivera' },
            { platform: 'LinkedIn', url: 'https://linkedin.com/in/alexrivera' },
          ],
        },
      },
      {
        name: 'Priya Sharma',
        email: 'priya@candidate.com',
        password: 'candidate123',
        role: 'candidate',
        isVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
        profile: {
          bio: 'UI/UX Designer and frontend developer passionate about creating beautiful user experiences.',
          skills: ['React', 'Figma', 'CSS', 'JavaScript', 'Tailwind CSS'],
          experience: [
            {
              title: 'UI Developer',
              company: 'DesignAgency',
              location: 'New York, NY',
              from: new Date('2020-06-01'),
              current: true,
              description: 'Creating beautiful, responsive UI components.',
            },
          ],
          education: [
            {
              school: 'NYU',
              degree: 'B.F.A.',
              fieldOfStudy: 'Interaction Design',
              from: new Date('2016-09-01'),
              to: new Date('2020-05-01'),
            },
          ],
        },
      },
      {
        name: 'Jordan Lee',
        email: 'jordan@candidate.com',
        password: 'candidate123',
        role: 'candidate',
        isVerified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
        profile: {
          bio: 'Backend engineer specializing in microservices and cloud architecture.',
          skills: ['Python', 'Django', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL'],
          experience: [
            {
              title: 'Backend Engineer',
              company: 'CloudSolutions',
              location: 'Austin, TX',
              from: new Date('2019-03-01'),
              current: true,
              description: 'Architecting scalable microservices on AWS.',
            },
          ],
          education: [
            {
              school: 'UT Austin',
              degree: 'M.Sc.',
              fieldOfStudy: 'Software Engineering',
              from: new Date('2017-09-01'),
              to: new Date('2019-05-01'),
            },
          ],
        },
      },
    ]);

    console.log('👥 Created users');

    // ── Companies ─────────────────────────────────────────────────────────────
    const companies = await Company.create([
      {
        name: 'TechCorp Solutions',
        description: 'A leading technology company building the future of enterprise software.',
        website: 'https://techcorp.example.com',
        location: 'San Francisco, CA',
        industry: 'Technology',
        employeeCount: '501-1000',
        logo: 'https://api.dicebear.com/7.x/initials/svg?seed=TC&backgroundColor=6366f1',
        createdBy: recruiters[0]._id,
      },
      {
        name: 'Innovate.io',
        description: 'Cutting-edge startup building AI-powered productivity tools.',
        website: 'https://innovate.example.io',
        location: 'New York, NY',
        industry: 'Artificial Intelligence',
        employeeCount: '51-200',
        logo: 'https://api.dicebear.com/7.x/initials/svg?seed=IN&backgroundColor=10b981',
        createdBy: recruiters[1]._id,
      },
      {
        name: 'Design Studio Pro',
        description: 'Award-winning design agency creating impactful digital experiences.',
        website: 'https://designstudio.example.com',
        location: 'Los Angeles, CA',
        industry: 'Design',
        employeeCount: '11-50',
        logo: 'https://api.dicebear.com/7.x/initials/svg?seed=DS&backgroundColor=f59e0b',
        createdBy: recruiters[2]._id,
      },
    ]);

    // Link companies to recruiters
    await User.findByIdAndUpdate(recruiters[0]._id, { company: companies[0]._id });
    await User.findByIdAndUpdate(recruiters[1]._id, { company: companies[1]._id });
    await User.findByIdAndUpdate(recruiters[2]._id, { company: companies[2]._id });

    console.log('🏢 Created companies');

    // ── Jobs ──────────────────────────────────────────────────────────────────
    const jobs = await Job.create([
      {
        title: 'Senior Full Stack Developer',
        description: 'We are looking for a Senior Full Stack Developer to join our growing engineering team. You will be responsible for building scalable web applications using React and Node.js.',
        requirements: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS', 'REST APIs', 'Git'],
        salary: { min: 120000, max: 160000, currency: 'USD' },
        location: 'San Francisco, CA',
        jobType: 'Full-time',
        experienceLevel: 'Senior',
        company: companies[0]._id,
        recruiter: recruiters[0]._id,
        status: 'open',
        views: 245,
        applicationsCount: 0,
      },
      {
        title: 'React Frontend Engineer',
        description: 'Join our team to build beautiful, performant user interfaces using React and modern web technologies.',
        requirements: ['React', 'TypeScript', 'CSS', 'Redux', 'Jest', 'Tailwind CSS'],
        salary: { min: 90000, max: 130000, currency: 'USD' },
        location: 'Remote',
        jobType: 'Remote',
        experienceLevel: 'Mid',
        company: companies[0]._id,
        recruiter: recruiters[0]._id,
        status: 'open',
        views: 189,
        applicationsCount: 0,
      },
      {
        title: 'AI/ML Engineer',
        description: 'Help us build the next generation of AI-powered features. Strong background in machine learning and Python required.',
        requirements: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'NLP', 'AWS SageMaker'],
        salary: { min: 140000, max: 200000, currency: 'USD' },
        location: 'New York, NY',
        jobType: 'Full-time',
        experienceLevel: 'Senior',
        company: companies[1]._id,
        recruiter: recruiters[1]._id,
        status: 'open',
        views: 312,
        applicationsCount: 0,
      },
      {
        title: 'Product Designer',
        description: 'Create stunning user experiences for our AI productivity platform. Work closely with engineering and product teams.',
        requirements: ['Figma', 'UI/UX Design', 'Prototyping', 'User Research', 'Design Systems'],
        salary: { min: 85000, max: 115000, currency: 'USD' },
        location: 'New York, NY',
        jobType: 'Full-time',
        experienceLevel: 'Mid',
        company: companies[1]._id,
        recruiter: recruiters[1]._id,
        status: 'open',
        views: 156,
        applicationsCount: 0,
      },
      {
        title: 'UI/UX Designer',
        description: 'We are looking for a talented UI/UX designer to create visually stunning and user-friendly digital products.',
        requirements: ['Figma', 'Adobe XD', 'CSS', 'HTML', 'User Testing', 'Prototyping'],
        salary: { min: 70000, max: 100000, currency: 'USD' },
        location: 'Los Angeles, CA',
        jobType: 'Full-time',
        experienceLevel: 'Mid',
        company: companies[2]._id,
        recruiter: recruiters[2]._id,
        status: 'open',
        views: 98,
        applicationsCount: 0,
      },
      {
        title: 'DevOps Engineer',
        description: 'Manage our cloud infrastructure and CI/CD pipelines. Strong AWS and Kubernetes experience required.',
        requirements: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux'],
        salary: { min: 110000, max: 150000, currency: 'USD' },
        location: 'Austin, TX',
        jobType: 'Full-time',
        experienceLevel: 'Senior',
        company: companies[0]._id,
        recruiter: recruiters[0]._id,
        status: 'open',
        views: 134,
        applicationsCount: 0,
      },
      {
        title: 'Backend Node.js Developer',
        description: 'Build robust APIs and microservices using Node.js. Experience with MongoDB and Redis preferred.',
        requirements: ['Node.js', 'Express.js', 'MongoDB', 'Redis', 'REST APIs', 'Docker'],
        salary: { min: 95000, max: 135000, currency: 'USD' },
        location: 'Remote',
        jobType: 'Remote',
        experienceLevel: 'Mid',
        company: companies[1]._id,
        recruiter: recruiters[1]._id,
        status: 'open',
        views: 201,
        applicationsCount: 0,
      },
      {
        title: 'Junior React Developer',
        description: 'Great opportunity for a junior developer to grow their React skills in a supportive environment.',
        requirements: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
        salary: { min: 55000, max: 75000, currency: 'USD' },
        location: 'Chicago, IL',
        jobType: 'Full-time',
        experienceLevel: 'Entry',
        company: companies[2]._id,
        recruiter: recruiters[2]._id,
        status: 'open',
        views: 423,
        applicationsCount: 0,
      },
      {
        title: 'Data Engineer',
        description: 'Design and build data pipelines to support our analytics and ML initiatives.',
        requirements: ['Python', 'SQL', 'Apache Spark', 'AWS', 'Airflow', 'PostgreSQL'],
        salary: { min: 115000, max: 155000, currency: 'USD' },
        location: 'Seattle, WA',
        jobType: 'Full-time',
        experienceLevel: 'Senior',
        company: companies[0]._id,
        recruiter: recruiters[0]._id,
        status: 'open',
        views: 178,
        applicationsCount: 0,
      },
      {
        title: 'Mobile Developer (React Native)',
        description: 'Build cross-platform mobile applications for iOS and Android using React Native.',
        requirements: ['React Native', 'JavaScript', 'TypeScript', 'iOS', 'Android', 'Redux'],
        salary: { min: 100000, max: 140000, currency: 'USD' },
        location: 'Boston, MA',
        jobType: 'Full-time',
        experienceLevel: 'Mid',
        company: companies[1]._id,
        recruiter: recruiters[1]._id,
        status: 'open',
        views: 267,
        applicationsCount: 0,
      },
      {
        title: 'Frontend Intern',
        description: 'Summer internship for students interested in frontend development.',
        requirements: ['HTML', 'CSS', 'JavaScript', 'React basics'],
        salary: { min: 25000, max: 35000, currency: 'USD' },
        location: 'San Francisco, CA',
        jobType: 'Internship',
        experienceLevel: 'Entry',
        company: companies[0]._id,
        recruiter: recruiters[0]._id,
        status: 'open',
        views: 512,
        applicationsCount: 0,
      },
      {
        title: 'Graphic Designer',
        description: 'Create stunning visual content for our clients across digital and print media.',
        requirements: ['Adobe Photoshop', 'Illustrator', 'InDesign', 'Brand Design', 'Typography'],
        salary: { min: 55000, max: 75000, currency: 'USD' },
        location: 'Los Angeles, CA',
        jobType: 'Full-time',
        experienceLevel: 'Entry',
        company: companies[2]._id,
        recruiter: recruiters[2]._id,
        status: 'open',
        views: 88,
        applicationsCount: 0,
      },
      {
        title: 'Cloud Architect',
        description: 'Design and implement enterprise-scale cloud solutions on AWS and Azure.',
        requirements: ['AWS', 'Azure', 'Architecture', 'Terraform', 'Security', 'Cost Optimization'],
        salary: { min: 160000, max: 220000, currency: 'USD' },
        location: 'Remote',
        jobType: 'Remote',
        experienceLevel: 'Lead',
        company: companies[0]._id,
        recruiter: recruiters[0]._id,
        status: 'open',
        views: 345,
        applicationsCount: 0,
      },
      {
        title: 'QA Engineer',
        description: 'Ensure quality across our product by building and executing comprehensive test suites.',
        requirements: ['Selenium', 'Cypress', 'Jest', 'API Testing', 'Test Planning'],
        salary: { min: 80000, max: 110000, currency: 'USD' },
        location: 'Denver, CO',
        jobType: 'Full-time',
        experienceLevel: 'Mid',
        company: companies[1]._id,
        recruiter: recruiters[1]._id,
        status: 'open',
        views: 120,
        applicationsCount: 0,
      },
      {
        title: 'Technical Project Manager',
        description: 'Lead cross-functional engineering teams to deliver complex software projects on time.',
        requirements: ['Agile', 'Scrum', 'JIRA', 'Technical Background', 'Stakeholder Management'],
        salary: { min: 120000, max: 160000, currency: 'USD' },
        location: 'Austin, TX',
        jobType: 'Full-time',
        experienceLevel: 'Senior',
        company: companies[2]._id,
        recruiter: recruiters[2]._id,
        status: 'open',
        views: 195,
        applicationsCount: 0,
      },
    ]);

    console.log('💼 Created jobs');

    // ── Applications ──────────────────────────────────────────────────────────
    const apps = await Application.create([
      {
        job: jobs[0]._id,
        candidate: candidates[0]._id,
        resume: 'https://example.com/resume-alex.pdf',
        coverLetter: 'I am very excited about this opportunity at TechCorp.',
        status: 'shortlisted',
        aiMatchScore: 85,
        timeline: [
          { status: 'pending', date: new Date('2024-01-10'), comment: 'Application submitted' },
          { status: 'shortlisted', date: new Date('2024-01-15'), comment: 'Strong profile' },
        ],
      },
      {
        job: jobs[1]._id,
        candidate: candidates[0]._id,
        resume: 'https://example.com/resume-alex.pdf',
        coverLetter: 'React is my primary skill and I would love to contribute to your team.',
        status: 'pending',
        aiMatchScore: 78,
        timeline: [{ status: 'pending', date: new Date('2024-01-20'), comment: 'Application submitted' }],
      },
      {
        job: jobs[4]._id,
        candidate: candidates[1]._id,
        resume: 'https://example.com/resume-priya.pdf',
        coverLetter: 'UI/UX is my passion and I would bring great value to your design team.',
        status: 'interviewing',
        aiMatchScore: 92,
        timeline: [
          { status: 'pending', date: new Date('2024-01-08'), comment: 'Application submitted' },
          { status: 'shortlisted', date: new Date('2024-01-12'), comment: 'Portfolio is excellent' },
          { status: 'interviewing', date: new Date('2024-01-18'), comment: 'Interview scheduled' },
        ],
      },
      {
        job: jobs[5]._id,
        candidate: candidates[2]._id,
        resume: 'https://example.com/resume-jordan.pdf',
        coverLetter: 'I have extensive DevOps experience and would be a great fit.',
        status: 'accepted',
        aiMatchScore: 88,
        timeline: [
          { status: 'pending', date: new Date('2024-01-05') },
          { status: 'shortlisted', date: new Date('2024-01-10') },
          { status: 'interviewing', date: new Date('2024-01-15') },
          { status: 'accepted', date: new Date('2024-01-25'), comment: 'Offer extended!' },
        ],
      },
      {
        job: jobs[2]._id,
        candidate: candidates[2]._id,
        resume: 'https://example.com/resume-jordan.pdf',
        status: 'rejected',
        aiMatchScore: 45,
        timeline: [
          { status: 'pending', date: new Date('2024-01-18') },
          { status: 'rejected', date: new Date('2024-01-22'), comment: 'Not enough ML experience' },
        ],
      },
    ]);

    // Update application counts for jobs
    await Job.findByIdAndUpdate(jobs[0]._id, { applicationsCount: 1 });
    await Job.findByIdAndUpdate(jobs[1]._id, { applicationsCount: 1 });
    await Job.findByIdAndUpdate(jobs[4]._id, { applicationsCount: 1 });
    await Job.findByIdAndUpdate(jobs[5]._id, { applicationsCount: 1 });
    await Job.findByIdAndUpdate(jobs[2]._id, { applicationsCount: 1 });

    console.log('📋 Created applications');

    // ── Saved Jobs ────────────────────────────────────────────────────────────
    await SavedJob.create([
      { user: candidates[0]._id, job: jobs[2]._id },
      { user: candidates[0]._id, job: jobs[5]._id },
      { user: candidates[0]._id, job: jobs[9]._id },
      { user: candidates[1]._id, job: jobs[3]._id },
      { user: candidates[1]._id, job: jobs[7]._id },
      { user: candidates[2]._id, job: jobs[0]._id },
      { user: candidates[2]._id, job: jobs[8]._id },
    ]);

    console.log('🔖 Created saved jobs');

    // ── Notifications ─────────────────────────────────────────────────────────
    await Notification.create([
      {
        recipient: candidates[0]._id,
        type: 'application_status',
        title: 'Application Shortlisted!',
        message: 'Congratulations! Your application for Senior Full Stack Developer has been shortlisted.',
        isRead: false,
        link: '/candidate/applications',
      },
      {
        recipient: candidates[1]._id,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: 'Your interview for UI/UX Designer at Design Studio Pro has been scheduled.',
        isRead: false,
        link: '/candidate/applications',
      },
      {
        recipient: candidates[2]._id,
        type: 'application_status',
        title: 'Offer Extended!',
        message: 'Congratulations! You have been accepted for the DevOps Engineer position.',
        isRead: true,
        link: '/candidate/applications',
      },
      {
        recipient: recruiters[0]._id,
        type: 'application_status',
        title: 'New Application Received',
        message: 'Alex Rivera applied to Senior Full Stack Developer.',
        isRead: false,
        link: '/recruiter/applications',
      },
      {
        recipient: recruiters[2]._id,
        type: 'application_status',
        title: 'New Application Received',
        message: 'Priya Sharma applied to UI/UX Designer.',
        isRead: true,
        link: '/recruiter/applications',
      },
    ]);

    console.log('🔔 Created notifications');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('─────────────────────────────────────────');
    console.log('📧 Test Credentials:');
    console.log('  Admin:     admin@jobportal.com     / admin123');
    console.log('  Recruiter: sarah@techcorp.com      / recruiter123');
    console.log('  Recruiter: michael@innovate.io     / recruiter123');
    console.log('  Candidate: alex@candidate.com      / candidate123');
    console.log('  Candidate: priya@candidate.com     / candidate123');
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
