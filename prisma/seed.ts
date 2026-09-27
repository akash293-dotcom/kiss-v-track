// ============================================================
// KISS V-TRACK — Database Seed Data
// ============================================================
// DEVELOPMENT ONLY — Do NOT use real personal information
// Default credentials are for development only

import { PrismaClient, UserRole, Gender, BatchStatus, SessionType, AttendanceStatus, SkillDifficulty, SkillStatus, SkillLevel, ProductStatus, AssessmentType, AssessmentResult, CertificateStatus, ElectiveStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Seeding KISS V-TRACK database...\n');

  // ── Organization ──
  const org = await prisma.organization.upsert({
    where: { code: 'KISS' },
    update: {},
    create: {
      id: uuid(),
      name: 'Kalinga Institute of Social Sciences',
      code: 'KISS',
      description: 'Kalinga Institute of Social Sciences (KISS) is a home for 70,000+ tribal students providing free education, food, accommodation, and vocational training.',
      website: 'https://www.kiss.ac.in',
      email: 'info@kiss.ac.in',
      address: 'Campus-11, KIIT Road, Patia, Bhubaneswar, Odisha 751024',
    },
  });
  console.log('✓ Organization created');

  // ── Campuses ──
  const campusData = [
    { name: 'KISS Bhubaneswar Main Campus', code: 'KISS-BBSR', city: 'Bhubaneswar', state: 'Odisha', pincode: '751024' },
    { name: 'KISS Balangir Campus', code: 'KISS-BLGR', city: 'Balangir', state: 'Odisha', pincode: '767001' },
    { name: 'KISS Mayurbhanj Campus', code: 'KISS-MYBJ', city: 'Baripada', state: 'Odisha', pincode: '757001' },
  ];

  const campuses = [];
  for (const c of campusData) {
    const campus = await prisma.campus.upsert({
      where: { code: c.code },
      update: {},
      create: {
        id: uuid(),
        organizationId: org.id,
        name: c.name,
        code: c.code,
        city: c.city,
        state: c.state,
        pincode: c.pincode,
      },
    });
    campuses.push(campus);
  }
  console.log(`✓ ${campuses.length} campuses created`);

  const mainCampus = campuses[0]!;

  // ── Admin User ──
  const adminPassword = await hashPassword('Admin@123');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kiss-vtrack.dev' },
    update: {},
    create: {
      id: uuid(),
      email: 'admin@kiss-vtrack.dev',
      username: 'admin',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+91-9876543210',
      campusId: mainCampus.id,
      isActive: true,
      isVerified: true,
    },
  });
  console.log('✓ Admin user created (admin@kiss-vtrack.dev / Admin@123)');

  // ── Vocational Categories ──
  const categoryData = [
    { name: 'Handicrafts', code: 'HNDCRFT', description: 'Traditional and modern handicraft skills', icon: '🎨', sortOrder: 1 },
    { name: 'Textile & Embroidery', code: 'TEXTILE', description: 'Textile production, embroidery, and fabric arts', icon: '🧵', sortOrder: 2 },
    { name: 'Traditional Art', code: 'TRDART', description: 'Traditional tribal and folk art forms', icon: '🖼️', sortOrder: 3 },
    { name: 'Agriculture', code: 'AGRI', description: 'Agricultural practices and sustainable farming', icon: '🌾', sortOrder: 4 },
    { name: 'Food Processing', code: 'FOODPROC', description: 'Food preservation, processing, and packaging', icon: '🍽️', sortOrder: 5 },
    { name: 'Beauty & Wellness', code: 'BEAUTY', description: 'Beauty therapy, wellness, and personal care', icon: '💆', sortOrder: 6 },
    { name: 'Computer & Digital Skills', code: 'DIGITAL', description: 'Computer literacy, digital design, and IT skills', icon: '💻', sortOrder: 7 },
    { name: 'Entrepreneurship', code: 'ENTREP', description: 'Business skills, marketing, and entrepreneurship', icon: '📊', sortOrder: 8 },
    { name: 'Electrical', code: 'ELEC', description: 'Electrical wiring, maintenance, and repair', icon: '⚡', sortOrder: 9 },
    { name: 'Communication & Employability', code: 'COMEMP', description: 'Communication skills and employability training', icon: '🗣️', sortOrder: 10 },
  ];

  const categories: Record<string, typeof org> = {};
  for (const c of categoryData) {
    const cat = await prisma.vocationalCategory.upsert({
      where: { code: c.code },
      update: {},
      create: { id: uuid(), ...c },
    });
    categories[c.code] = cat;
  }
  console.log(`✓ ${Object.keys(categories).length} vocational categories created`);

  // ── Skills ──
  const skillsData = [
    // Textile skills
    { categoryCode: 'TEXTILE', name: 'Basic Stitching', code: 'SKL-STITCH', difficulty: SkillDifficulty.BEGINNER, description: 'Ability to perform basic hand and machine stitching' },
    { categoryCode: 'TEXTILE', name: 'Embroidery Design', code: 'SKL-EMBDES', difficulty: SkillDifficulty.INTERMEDIATE, description: 'Create embroidery patterns and designs' },
    { categoryCode: 'TEXTILE', name: 'Pattern Cutting', code: 'SKL-PATCUT', difficulty: SkillDifficulty.INTERMEDIATE, description: 'Cut fabric accurately following patterns' },
    { categoryCode: 'TEXTILE', name: 'Appliqué Work', code: 'SKL-APPLQ', difficulty: SkillDifficulty.INTERMEDIATE, description: 'Create appliqué designs and applications' },
    { categoryCode: 'TEXTILE', name: 'Finishing & Quality Control', code: 'SKL-FINQC', difficulty: SkillDifficulty.ADVANCED, description: 'Product finishing, inspection, and quality control' },
    { categoryCode: 'TEXTILE', name: 'Fabric Selection', code: 'SKL-FABSEL', difficulty: SkillDifficulty.BASIC, description: 'Select appropriate fabrics for different products' },
    // Handicraft skills
    { categoryCode: 'HNDCRFT', name: 'Clay Modeling', code: 'SKL-CLAY', difficulty: SkillDifficulty.BEGINNER, description: 'Basic clay modeling and pottery' },
    { categoryCode: 'HNDCRFT', name: 'Basket Weaving', code: 'SKL-BSKTW', difficulty: SkillDifficulty.INTERMEDIATE, description: 'Weaving baskets from natural materials' },
    { categoryCode: 'HNDCRFT', name: 'Wood Carving', code: 'SKL-WDCRV', difficulty: SkillDifficulty.ADVANCED, description: 'Carving designs in wood' },
    { categoryCode: 'HNDCRFT', name: 'Paper Craft', code: 'SKL-PAPER', difficulty: SkillDifficulty.BEGINNER, description: 'Creating craft items from paper' },
    // Digital skills
    { categoryCode: 'DIGITAL', name: 'Computer Basics', code: 'SKL-COMPB', difficulty: SkillDifficulty.BEGINNER, description: 'Basic computer operation and file management' },
    { categoryCode: 'DIGITAL', name: 'Typing & Data Entry', code: 'SKL-TYPNG', difficulty: SkillDifficulty.BASIC, description: 'Touch typing and accurate data entry' },
    { categoryCode: 'DIGITAL', name: 'Digital Design', code: 'SKL-DIGDS', difficulty: SkillDifficulty.INTERMEDIATE, description: 'Using design software for digital creations' },
    { categoryCode: 'DIGITAL', name: 'Internet & Email', code: 'SKL-INTEM', difficulty: SkillDifficulty.BEGINNER, description: 'Using internet, email, and online tools' },
    // Entrepreneurship skills
    { categoryCode: 'ENTREP', name: 'Product Pricing', code: 'SKL-PRICE', difficulty: SkillDifficulty.BASIC, description: 'Calculate costs and set product prices' },
    { categoryCode: 'ENTREP', name: 'Basic Accounting', code: 'SKL-ACCTG', difficulty: SkillDifficulty.INTERMEDIATE, description: 'Maintain basic financial records' },
    { categoryCode: 'ENTREP', name: 'Marketing Basics', code: 'SKL-MKTNG', difficulty: SkillDifficulty.BASIC, description: 'Basic marketing and sales skills' },
    // Agriculture skills
    { categoryCode: 'AGRI', name: 'Organic Farming', code: 'SKL-ORGFM', difficulty: SkillDifficulty.INTERMEDIATE, description: 'Organic farming practices' },
    { categoryCode: 'AGRI', name: 'Seed Management', code: 'SKL-SEEDM', difficulty: SkillDifficulty.BASIC, description: 'Seed selection, storage, and management' },
    { categoryCode: 'AGRI', name: 'Soil Testing', code: 'SKL-SOILT', difficulty: SkillDifficulty.INTERMEDIATE, description: 'Basic soil testing and analysis' },
  ];

  const skills: Record<string, typeof org> = {};
  for (const s of skillsData) {
    const cat = categories[s.categoryCode];
    if (!cat) continue;
    const skill = await prisma.skill.upsert({
      where: { code: s.code },
      update: {},
      create: {
        id: uuid(),
        categoryId: cat.id,
        name: s.name,
        code: s.code,
        difficulty: s.difficulty,
        description: s.description,
      },
    });
    skills[s.code] = skill;
  }
  console.log(`✓ ${Object.keys(skills).length} skills created`);

  // ── Vocational Electives ──
  const textileCat = categories['TEXTILE']!;
  const digitalCat = categories['DIGITAL']!;

  const electiveAppliqueEmb = await prisma.vocationalElective.upsert({
    where: { code: 'VE-APPEMP' },
    update: {},
    create: {
      id: uuid(),
      categoryId: textileCat.id,
      name: 'Appliqué & Embroidery',
      code: 'VE-APPEMP',
      description: 'Comprehensive training in appliqué work and embroidery techniques including traditional Odisha designs.',
      objectives: 'Develop skills in pattern design, cutting, stitching, embroidery, and product finishing.',
      durationWeeks: 16,
      totalTrainingHours: 200,
      theoryHours: 40,
      practicalHours: 160,
      requiredAttendancePct: 80,
      status: ElectiveStatus.ACTIVE,
    },
  });

  const electiveDigital = await prisma.vocationalElective.upsert({
    where: { code: 'VE-DIGLIT' },
    update: {},
    create: {
      id: uuid(),
      categoryId: digitalCat.id,
      name: 'Digital Literacy & Design',
      code: 'VE-DIGLIT',
      description: 'Basic computer skills, digital design, internet usage, and digital productivity tools.',
      objectives: 'Enable trainees to use computers, internet, and basic design tools effectively.',
      durationWeeks: 12,
      totalTrainingHours: 120,
      theoryHours: 40,
      practicalHours: 80,
      requiredAttendancePct: 75,
      status: ElectiveStatus.ACTIVE,
    },
  });
  console.log('✓ 2 vocational electives created');

  // ── Modules for Appliqué & Embroidery ──
  const moduleData = [
    { name: 'Introduction to Textile Arts', seq: 1, theory: 6, practical: 4, desc: 'Overview of textile arts, history, and cultural significance.' },
    { name: 'Materials & Tools', seq: 2, theory: 4, practical: 8, desc: 'Identification and use of fabrics, threads, needles, and tools.' },
    { name: 'Basic Stitching Techniques', seq: 3, theory: 4, practical: 20, desc: 'Hand stitching, running stitch, back stitch, chain stitch, etc.' },
    { name: 'Pattern Design', seq: 4, theory: 6, practical: 18, desc: 'Creating and transferring patterns, design principles.' },
    { name: 'Appliqué Techniques', seq: 5, theory: 4, practical: 24, desc: 'Cut-work appliqué, layered appliqué, reverse appliqué.' },
    { name: 'Embroidery Techniques', seq: 6, theory: 4, practical: 28, desc: 'Traditional and modern embroidery techniques.' },
    { name: 'Product Development', seq: 7, theory: 6, practical: 30, desc: 'Designing and creating complete textile products.' },
    { name: 'Finishing & Quality Control', seq: 8, theory: 6, practical: 28, desc: 'Product finishing, pressing, packaging, and quality inspection.' },
  ];

  const modules = [];
  for (const m of moduleData) {
    const mod = await prisma.module.create({
      data: {
        id: uuid(),
        electiveId: electiveAppliqueEmb.id,
        name: m.name,
        sequenceOrder: m.seq,
        theoryHours: m.theory,
        practicalHours: m.practical,
        description: m.desc,
        learningObjectives: `Complete ${m.name.toLowerCase()} with demonstrated competency.`,
      },
    });
    modules.push(mod);
  }
  console.log(`✓ ${modules.length} modules created for Appliqué & Embroidery`);

  // ── Module-Skill Mappings ──
  const stitchingModule = modules[2]; // Basic Stitching
  const patternModule = modules[3]; // Pattern Design
  const finishingModule = modules[7]; // Finishing & QC
  if (stitchingModule && skills['SKL-STITCH']) {
    await prisma.moduleSkill.create({ data: { id: uuid(), moduleId: stitchingModule.id, skillId: skills['SKL-STITCH']!.id } });
  }
  if (patternModule && skills['SKL-PATCUT']) {
    await prisma.moduleSkill.create({ data: { id: uuid(), moduleId: patternModule.id, skillId: skills['SKL-PATCUT']!.id } });
  }
  if (finishingModule && skills['SKL-FINQC']) {
    await prisma.moduleSkill.create({ data: { id: uuid(), moduleId: finishingModule.id, skillId: skills['SKL-FINQC']!.id } });
  }
  console.log('✓ Module-skill mappings created');

  // ── Completion Rules ──
  await prisma.completionRule.createMany({
    data: [
      { id: uuid(), electiveId: electiveAppliqueEmb.id, ruleType: 'MIN_ATTENDANCE_PCT', ruleValue: '80', description: 'Minimum 80% attendance required', isRequired: true, sortOrder: 1 },
      { id: uuid(), electiveId: electiveAppliqueEmb.id, ruleType: 'MODULES_COMPLETED', ruleValue: 'ALL', description: 'All modules must be completed', isRequired: true, sortOrder: 2 },
      { id: uuid(), electiveId: electiveAppliqueEmb.id, ruleType: 'SKILLS_VERIFIED', ruleValue: 'ALL', description: 'All required skills must be verified', isRequired: true, sortOrder: 3 },
      { id: uuid(), electiveId: electiveAppliqueEmb.id, ruleType: 'PRODUCT_APPROVED', ruleValue: '1', description: 'At least 1 product must be approved', isRequired: true, sortOrder: 4 },
      { id: uuid(), electiveId: electiveAppliqueEmb.id, ruleType: 'PRACTICAL_ASSESSMENT_PASSED', ruleValue: 'true', description: 'Practical assessment must be passed', isRequired: true, sortOrder: 5 },
    ],
  });
  console.log('✓ Completion rules created');

  // ── Trainer Users ──
  const trainerPassword = await hashPassword('Trainer@123');
  const trainerUsers = [
    { email: 'priya.trainer@kiss-vtrack.dev', username: 'priya_trainer', firstName: 'Priya', lastName: 'Mohanty', empId: 'TR-001', specialization: 'Textile & Embroidery', qualification: 'Diploma in Textile Design' },
    { email: 'rajesh.trainer@kiss-vtrack.dev', username: 'rajesh_trainer', firstName: 'Rajesh', lastName: 'Patel', empId: 'TR-002', specialization: 'Computer Skills', qualification: 'B.Tech Computer Science' },
    { email: 'sunita.trainer@kiss-vtrack.dev', username: 'sunita_trainer', firstName: 'Sunita', lastName: 'Behera', empId: 'TR-003', specialization: 'Handicrafts', qualification: 'Master Artisan Certification' },
  ];

  const trainers = [];
  for (const t of trainerUsers) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        id: uuid(),
        email: t.email,
        username: t.username,
        passwordHash: trainerPassword,
        role: UserRole.TRAINER,
        firstName: t.firstName,
        lastName: t.lastName,
        campusId: mainCampus.id,
        isActive: true,
        isVerified: true,
      },
    });

    const trainer = await prisma.trainer.upsert({
      where: { employeeId: t.empId },
      update: {},
      create: {
        id: uuid(),
        userId: user.id,
        employeeId: t.empId,
        qualification: t.qualification,
        specialization: t.specialization,
        experience: '5+ years',
        campusId: mainCampus.id,
      },
    });
    trainers.push(trainer);
  }
  console.log(`✓ ${trainers.length} trainers created (password: Trainer@123)`);

  const trainerPriya = trainers[0]!;

  // ── Trainee Users ──
  const traineePassword = await hashPassword('Trainee@123');
  const traineeData = [
    { email: 'anita.trainee@kiss-vtrack.dev', username: 'anita_trainee', firstName: 'Anita', lastName: 'Majhi', studentId: 'KISS-2026-001', gender: Gender.FEMALE, className: 'Class 10', academicYear: '2025-2026', department: 'Vocational Studies' },
    { email: 'bijay.trainee@kiss-vtrack.dev', username: 'bijay_trainee', firstName: 'Bijay', lastName: 'Munda', studentId: 'KISS-2026-002', gender: Gender.MALE, className: 'Class 10', academicYear: '2025-2026', department: 'Vocational Studies' },
    { email: 'champa.trainee@kiss-vtrack.dev', username: 'champa_trainee', firstName: 'Champa', lastName: 'Naik', studentId: 'KISS-2026-003', gender: Gender.FEMALE, className: 'Class 11', academicYear: '2025-2026', department: 'Vocational Studies' },
    { email: 'deepak.trainee@kiss-vtrack.dev', username: 'deepak_trainee', firstName: 'Deepak', lastName: 'Kisku', studentId: 'KISS-2026-004', gender: Gender.MALE, className: 'Class 11', academicYear: '2025-2026', department: 'Vocational Studies' },
    { email: 'esha.trainee@kiss-vtrack.dev', username: 'esha_trainee', firstName: 'Esha', lastName: 'Hembram', studentId: 'KISS-2026-005', gender: Gender.FEMALE, className: 'Class 10', academicYear: '2025-2026', department: 'Vocational Studies' },
  ];

  const trainees = [];
  for (const t of traineeData) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        id: uuid(),
        email: t.email,
        username: t.username,
        passwordHash: traineePassword,
        role: UserRole.TRAINEE,
        firstName: t.firstName,
        lastName: t.lastName,
        campusId: mainCampus.id,
        isActive: true,
        isVerified: true,
      },
    });

    const trainee = await prisma.trainee.upsert({
      where: { studentId: t.studentId },
      update: {},
      create: {
        id: uuid(),
        userId: user.id,
        studentId: t.studentId,
        gender: t.gender,
        className: t.className,
        academicYear: t.academicYear,
        department: t.department,
        campusId: mainCampus.id,
        dateOfBirth: new Date('2008-06-15'),
      },
    });
    trainees.push(trainee);
  }
  console.log(`✓ ${trainees.length} trainees created (password: Trainee@123)`);

  // ── Training Batch ──
  const batch = await prisma.trainingBatch.upsert({
    where: { code: 'BATCH-AE-2026-01' },
    update: {},
    create: {
      id: uuid(),
      electiveId: electiveAppliqueEmb.id,
      campusId: mainCampus.id,
      trainerId: trainerPriya.id,
      name: 'Appliqué & Embroidery — Batch 2026-01',
      code: 'BATCH-AE-2026-01',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-10-31'),
      capacity: 25,
      status: BatchStatus.ACTIVE,
      description: 'First batch for Appliqué & Embroidery vocational program, July-October 2026.',
    },
  });
  console.log('✓ Training batch created');

  // ── Enrollments ──
  for (const trainee of trainees) {
    await prisma.enrollment.upsert({
      where: { traineeId_batchId: { traineeId: trainee.id, batchId: batch.id } },
      update: {},
      create: {
        id: uuid(),
        traineeId: trainee.id,
        batchId: batch.id,
        enrollmentDate: new Date('2026-07-01'),
        status: 'ACTIVE',
      },
    });
  }
  console.log(`✓ ${trainees.length} trainees enrolled in batch`);

  // ── Training Sessions ──
  const sessionDates = [];
  const startDate = new Date('2026-07-07');
  for (let week = 0; week < 12; week++) {
    for (const dayOffset of [0, 2, 4]) { // Mon, Wed, Fri
      const date = new Date(startDate);
      date.setDate(date.getDate() + week * 7 + dayOffset);
      sessionDates.push(date);
    }
  }

  const sessions = [];
  for (let i = 0; i < Math.min(sessionDates.length, 36); i++) {
    const date = sessionDates[i]!;
    const moduleIndex = Math.min(Math.floor(i / 5), modules.length - 1);
    const mod = modules[moduleIndex]!;
    const isPractical = i % 3 !== 0;

    const session = await prisma.trainingSession.create({
      data: {
        id: uuid(),
        batchId: batch.id,
        trainerId: trainerPriya.id,
        moduleId: mod.id,
        date: date,
        startTime: '09:00',
        endTime: '12:00',
        durationMin: 180,
        location: 'Vocational Training Hall - Block A',
        sessionType: isPractical ? SessionType.PRACTICAL : SessionType.THEORY,
        topic: `${mod.name} — Session ${(i % 5) + 1}`,
        status: date < new Date() ? 'COMPLETED' : 'SCHEDULED',
      },
    });
    sessions.push(session);
  }
  console.log(`✓ ${sessions.length} training sessions created`);

  // ── Attendance for past sessions ──
  let attendanceCount = 0;
  const pastSessions = sessions.filter(s => new Date(s.date) < new Date());
  for (const session of pastSessions) {
    for (const trainee of trainees) {
      const rand = Math.random();
      let status: AttendanceStatus;
      if (rand < 0.80) status = AttendanceStatus.PRESENT;
      else if (rand < 0.90) status = AttendanceStatus.LATE;
      else if (rand < 0.95) status = AttendanceStatus.EXCUSED;
      else status = AttendanceStatus.ABSENT;

      await prisma.attendance.create({
        data: {
          id: uuid(),
          traineeId: trainee.id,
          sessionId: session.id,
          trainerId: trainerPriya.id,
          status: status,
          markedById: adminUser.id,
          markedAt: new Date(session.date),
        },
      });
      attendanceCount++;
    }
  }
  console.log(`✓ ${attendanceCount} attendance records created`);

  // ── Trainee Skills ──
  const traineeAnita = trainees[0]!;
  const traineeBijay = trainees[1]!;
  const textileSkillCodes = ['SKL-STITCH', 'SKL-EMBDES', 'SKL-PATCUT', 'SKL-APPLQ', 'SKL-FINQC', 'SKL-FABSEL'];

  for (const trainee of [traineeAnita, traineeBijay]) {
    for (let i = 0; i < textileSkillCodes.length; i++) {
      const skillCode = textileSkillCodes[i]!;
      const skill = skills[skillCode];
      if (!skill) continue;

      let status: SkillStatus;
      let level: SkillLevel;
      let progress: number;

      if (i < 3) {
        status = SkillStatus.VERIFIED;
        level = SkillLevel.INTERMEDIATE;
        progress = 100;
      } else if (i < 5) {
        status = SkillStatus.PRACTICING;
        level = SkillLevel.BASIC;
        progress = 60 + Math.floor(Math.random() * 20);
      } else {
        status = SkillStatus.LEARNING;
        level = SkillLevel.BEGINNER;
        progress = 20 + Math.floor(Math.random() * 30);
      }

      await prisma.traineeSkill.create({
        data: {
          id: uuid(),
          traineeId: trainee.id,
          skillId: skill.id,
          status,
          level,
          progressPct: progress,
          dateStarted: new Date('2026-07-10'),
          dateLearned: status === SkillStatus.VERIFIED ? new Date('2026-08-15') : null,
          dateVerified: status === SkillStatus.VERIFIED ? new Date('2026-08-20') : null,
          verifiedById: status === SkillStatus.VERIFIED ? trainerPriya.id : null,
        },
      });
    }
  }
  console.log('✓ Trainee skill records created');

  // ── Products ──
  const product1 = await prisma.product.create({
    data: {
      id: uuid(),
      traineeId: traineeAnita.id,
      batchId: batch.id,
      name: 'Embroidered Table Runner',
      category: 'Textile Product',
      description: 'A handmade table runner featuring traditional Odisha appliqué work with floral embroidery border.',
      materials: 'Cotton fabric, embroidery thread, appliqué patches, lining material',
      productionDate: new Date('2026-08-25'),
      submissionDate: new Date('2026-09-01'),
      status: ProductStatus.APPROVED,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      id: uuid(),
      traineeId: traineeBijay.id,
      batchId: batch.id,
      name: 'Decorative Cushion Covers (Set of 2)',
      category: 'Textile Product',
      description: 'A set of two cushion covers with mirror work and chain stitch embroidery.',
      materials: 'Cotton fabric, mirror pieces, embroidery thread, zipper',
      productionDate: new Date('2026-09-05'),
      submissionDate: new Date('2026-09-10'),
      status: ProductStatus.UNDER_REVIEW,
    },
  });
  console.log('✓ 2 products created');

  // ── Product-Skill Mappings ──
  const productSkillCodes = ['SKL-STITCH', 'SKL-EMBDES', 'SKL-PATCUT', 'SKL-FINQC'];
  for (const code of productSkillCodes) {
    const skill = skills[code];
    if (skill) {
      await prisma.productSkill.create({
        data: { id: uuid(), productId: product1.id, skillId: skill.id },
      });
    }
  }
  console.log('✓ Product-skill mappings created');

  // ── Product Review ──
  await prisma.productReview.create({
    data: {
      id: uuid(),
      productId: product1.id,
      trainerId: trainerPriya.id,
      criteria: JSON.stringify([
        { criterion: 'Technical Skill', score: 8, weight: 1.5, comment: 'Excellent stitching quality' },
        { criterion: 'Accuracy', score: 7, weight: 1, comment: 'Good pattern alignment' },
        { criterion: 'Quality', score: 8, weight: 1.5, comment: 'High-quality finish' },
        { criterion: 'Creativity', score: 9, weight: 1, comment: 'Beautiful color combinations' },
        { criterion: 'Completion', score: 10, weight: 1, comment: 'Fully completed on time' },
      ]),
      overallScore: 84,
      maxScore: 100,
      feedback: 'Excellent work, Anita! The table runner demonstrates strong embroidery skills and creative use of traditional patterns. Quality of stitching is very good.',
      recommendation: 'Recommend for skill verification',
    },
  });
  console.log('✓ Product review created');

  // ── Status History ──
  const statusTransitions: ProductStatus[] = [ProductStatus.IDEA, ProductStatus.DESIGN, ProductStatus.IN_PROGRESS, ProductStatus.SUBMITTED, ProductStatus.UNDER_REVIEW, ProductStatus.APPROVED];
  for (let i = 0; i < statusTransitions.length; i++) {
    await prisma.productStatusHistory.create({
      data: {
        id: uuid(),
        productId: product1.id,
        fromStatus: i > 0 ? statusTransitions[i - 1] : null,
        toStatus: statusTransitions[i]!,
        changedBy: i < 4 ? traineeAnita.userId : trainerPriya.userId,
        createdAt: new Date(Date.now() - (statusTransitions.length - i) * 86400000 * 3),
      },
    });
  }
  console.log('✓ Product status history created');

  // ── Assessments ──
  const assessment = await prisma.assessment.create({
    data: {
      id: uuid(),
      traineeId: traineeAnita.id,
      trainerId: trainerPriya.id,
      batchId: batch.id,
      type: AssessmentType.PRACTICAL,
      title: 'Appliqué & Embroidery Mid-Term Practical Assessment',
      description: 'Assessment of stitching, pattern design, and embroidery techniques learned in modules 1-5.',
      score: 82,
      maxScore: 100,
      result: AssessmentResult.MERIT,
      feedback: 'Good practical skills demonstrated. Pattern work is strong. Continue improving embroidery precision.',
      assessedAt: new Date('2026-08-20'),
    },
  });

  // ── Assessment-Skill Mapping ──
  for (const code of ['SKL-STITCH', 'SKL-PATCUT', 'SKL-EMBDES']) {
    const skill = skills[code];
    if (skill) {
      await prisma.assessmentSkill.create({
        data: {
          id: uuid(),
          assessmentId: assessment.id,
          skillId: skill.id,
          score: 75 + Math.floor(Math.random() * 20),
          maxScore: 100,
          feedback: `Good performance in ${skill.name}`,
        },
      });
    }
  }
  console.log('✓ Assessment and skill assessments created');

  // ── Certificate ──
  await prisma.certificate.create({
    data: {
      id: uuid(),
      traineeId: traineeAnita.id,
      electiveId: electiveAppliqueEmb.id,
      certificateNo: 'KISS-VT-2026-000001',
      title: 'Certificate of Vocational Training — Appliqué & Embroidery',
      description: 'Successfully completed the Appliqué & Embroidery vocational training program.',
      trainingPeriod: 'July 2026 — October 2026',
      trainingHours: 200,
      skillsSummary: JSON.stringify(['Basic Stitching', 'Embroidery Design', 'Pattern Cutting', 'Appliqué Work', 'Finishing & Quality Control']),
      issueDate: new Date('2026-09-20'),
      status: CertificateStatus.ISSUED,
      issuedById: adminUser.id,
      signatory: 'Dr. Achyuta Samanta, Founder — KISS',
    },
  });
  console.log('✓ Sample certificate created');

  // ── Practical Tasks ──
  const task = await prisma.practicalTask.create({
    data: {
      id: uuid(),
      trainerId: trainerPriya.id,
      moduleId: modules[5]?.id, // Embroidery Techniques
      title: 'Create an Embroidered Sampler',
      description: 'Create a fabric sampler demonstrating at least 5 different embroidery stitches.',
      instructions: '1. Select a 30cm x 30cm cotton fabric piece.\n2. Mark 5 sections.\n3. Execute a different embroidery stitch in each section.\n4. Label each stitch.\n5. Submit with photographs.',
      requiredSkills: JSON.stringify(['Basic Stitching', 'Embroidery Design']),
      deadline: new Date('2026-09-15'),
      evaluationCriteria: 'Stitch accuracy, consistency, neatness, variety, labeling',
      status: 'ACTIVE',
    },
  });

  await prisma.practicalSubmission.create({
    data: {
      id: uuid(),
      taskId: task.id,
      traineeId: traineeAnita.id,
      description: 'My embroidery sampler with 6 different stitches: running stitch, back stitch, chain stitch, satin stitch, French knot, and blanket stitch.',
      submittedAt: new Date('2026-09-12'),
      status: 'APPROVED',
      feedback: 'Excellent sampler! All 6 stitches are well-executed with consistent tension.',
      score: 90,
      maxScore: 100,
      reviewedAt: new Date('2026-09-14'),
    },
  });
  console.log('✓ Practical task and submission created');

  // ── Evaluation Criteria ──
  const evalCriteria = [
    { name: 'Technical Skill', description: 'Mastery of required techniques', weight: 1.5, maxScore: 10 },
    { name: 'Accuracy', description: 'Precision and accuracy of work', weight: 1.0, maxScore: 10 },
    { name: 'Quality', description: 'Overall product quality and finish', weight: 1.5, maxScore: 10 },
    { name: 'Creativity', description: 'Creative expression and design', weight: 1.0, maxScore: 10 },
    { name: 'Safety & Work Practice', description: 'Safe tool usage and workspace management', weight: 0.5, maxScore: 10 },
    { name: 'Completion', description: 'Project completed within deadline', weight: 1.0, maxScore: 10 },
    { name: 'Product Presentation', description: 'Presentation and packaging quality', weight: 0.5, maxScore: 10 },
  ];

  for (const ec of evalCriteria) {
    await prisma.evaluationCriteria.create({
      data: { id: uuid(), electiveId: electiveAppliqueEmb.id, ...ec },
    });
  }
  console.log('✓ Evaluation criteria created');

  // ── Notifications ──
  const anitaUserId = (await prisma.trainee.findUnique({ where: { id: traineeAnita.id }, include: { user: true } }))?.user?.id;
  if (anitaUserId) {
    await prisma.notification.createMany({
      data: [
        { id: uuid(), userId: anitaUserId, type: 'CERTIFICATE_AVAILABLE', title: 'Certificate Ready!', message: 'Your certificate for Appliqué & Embroidery is ready for download.' },
        { id: uuid(), userId: anitaUserId, type: 'ASSESSMENT_RESULT', title: 'Assessment Result Available', message: 'Your mid-term practical assessment result is now available. Score: 82/100 — Merit.' },
        { id: uuid(), userId: anitaUserId, type: 'SKILL_VERIFICATION', title: 'Skill Verified', message: 'Your Basic Stitching skill has been verified by Trainer Priya Mohanty.' },
      ],
    });
  }
  console.log('✓ Notifications created');

  // ── Audit Logs ──
  await prisma.auditLog.createMany({
    data: [
      { id: uuid(), userId: adminUser.id, action: 'CREATE', entity: 'VocationalElective', entityId: electiveAppliqueEmb.id, newValues: JSON.stringify({ name: 'Appliqué & Embroidery' }), createdAt: new Date('2026-06-15') },
      { id: uuid(), userId: adminUser.id, action: 'CREATE', entity: 'TrainingBatch', entityId: batch.id, newValues: JSON.stringify({ code: 'BATCH-AE-2026-01' }), createdAt: new Date('2026-06-20') },
      { id: uuid(), userId: adminUser.id, action: 'ENROLL', entity: 'Enrollment', entityId: traineeAnita.id, newValues: JSON.stringify({ batch: 'BATCH-AE-2026-01' }), createdAt: new Date('2026-07-01') },
      { id: uuid(), userId: adminUser.id, action: 'ISSUE_CERTIFICATE', entity: 'Certificate', entityId: 'KISS-VT-2026-000001', newValues: JSON.stringify({ trainee: 'Anita Majhi' }), createdAt: new Date('2026-09-20') },
    ],
  });
  console.log('✓ Audit logs created');

  console.log('\n══════════════════════════════════════════════');
  console.log('  🎓 KISS V-TRACK seed data complete!');
  console.log('══════════════════════════════════════════════');
  console.log('\n  Development Login Credentials:');
  console.log('  ──────────────────────────────');
  console.log('  Admin:   admin@kiss-vtrack.dev / Admin@123');
  console.log('  Trainer: priya.trainer@kiss-vtrack.dev / Trainer@123');
  console.log('  Trainee: anita.trainee@kiss-vtrack.dev / Trainee@123');
  console.log('\n  ⚠️  These credentials are for DEVELOPMENT ONLY');
  console.log('══════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
