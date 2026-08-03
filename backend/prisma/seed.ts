import {
  PrismaClient,
  Role,
  UserStatus,
  InstituteStatus,
  InstitutePlan,
} from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

const PASSWORD = "password123";

interface StudentSeed {
  name: string;
  email: string;
  rollNumber: string;
  guardianName: string;
  guardianPhone: string;
  dob: Date;
  address: string;
}

function student(
  name: string,
  email: string,
  rollNumber: string,
  guardianName: string,
  guardianPhone: string,
  dob: string,
  address: string,
): StudentSeed {
  return { name, email, rollNumber, guardianName, guardianPhone, dob: new Date(dob), address };
}

interface TeacherSeed {
  name: string;
  email: string;
  employeeId: string;
  department: string;
  qualification: string;
  specialization: string;
}

function teacher(
  name: string,
  email: string,
  employeeId: string,
  department: string,
  qualification: string,
  specialization: string,
): TeacherSeed {
  return { name, email, employeeId, department, qualification, specialization };
}

async function upsertUser(
  email: string,
  name: string,
  role: Role,
  instituteId: string | null,
  passwordHash: string,
) {
  return prisma.user.upsert({
    where: { email_role: { email, role } },
    update: { passwordHash, name },
    create: {
      email,
      name,
      passwordHash,
      role,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      instituteId,
    },
  });
}

async function upsertTeacherProfile(
  userId: string,
  instituteId: string,
  t: TeacherSeed,
) {
  return prisma.teacherProfile.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      instituteId,
      employeeId: t.employeeId,
      department: t.department,
      qualification: t.qualification,
      specialization: t.specialization,
    },
  });
}

async function upsertStudentProfile(
  userId: string,
  instituteId: string,
  batchId: string | null,
  s: StudentSeed,
) {
  return prisma.studentProfile.upsert({
    where: { userId },
    update: { batchId },
    create: {
      userId,
      instituteId,
      batchId,
      rollNumber: s.rollNumber,
      admissionNo: `ADM-2026-${s.rollNumber.split("-").pop()}`,
      guardianName: s.guardianName,
      guardianPhone: s.guardianPhone,
      dateOfBirth: s.dob,
      address: s.address,
    },
  });
}

async function createEnrollmentIfMissing(
  studentProfileId: string,
  batchId: string,
  courseId: string | null,
  fee: number,
) {
  const existing = await prisma.enrollment.findFirst({
    where: { studentId: studentProfileId },
  });
  if (!existing) {
    await prisma.enrollment.create({
      data: {
        studentId: studentProfileId,
        batchId,
        courseId,
        fee,
        feePaid: true,
      },
    });
  }
}

interface InstituteSeedConfig {
  slug: string;
  name: string;
  contactEmail: string;
  phone: string;
  address: string;
  about: string;
  plan: InstitutePlan;
  status: InstituteStatus;
  primaryColor: string;
  accentColor: string;
  admin: { name: string; email: string };
  teachers: TeacherSeed[];
  students: StudentSeed[];
  batchId: string;
  batchName: string;
  batchCode: string;
  communityId: string;
  courseId: string;
  courseTitle: string;
  courseCode: string;
  courseCategory: string;
  courseDescription: string;
}

async function seedInstitute(cfg: InstituteSeedConfig) {
  const passwordHash = await hashPassword(PASSWORD);

  const institute = await prisma.institute.upsert({
    where: { slug: cfg.slug },
    update: {},
    create: {
      name: cfg.name,
      slug: cfg.slug,
      contactEmail: cfg.contactEmail,
      phone: cfg.phone,
      address: cfg.address,
      about: cfg.about,
      plan: cfg.plan,
      status: cfg.status,
      academicYear: "2026-27",
      gradingSystem: "percentage",
      passingMarks: 40,
      attendanceThreshold: 75,
      branding: {
        primaryColor: cfg.primaryColor,
        accentColor: cfg.accentColor,
        logoText: cfg.name
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase(),
      },
    },
  });

  const adminUser = await upsertUser(cfg.admin.email, cfg.admin.name, Role.INSTITUTE_ADMIN, institute.id, passwordHash);

  const teacherUsers = [];
  for (const t of cfg.teachers) {
    const user = await upsertUser(t.email, t.name, Role.TEACHER, institute.id, passwordHash);
    const profile = await upsertTeacherProfile(user.id, institute.id, t);
    teacherUsers.push({ user, profile });
  }

  const batch = await prisma.batch.upsert({
    where: { id: cfg.batchId },
    update: {},
    create: {
      id: cfg.batchId,
      instituteId: institute.id,
      name: cfg.batchName,
      code: cfg.batchCode,
      status: "ACTIVE",
      capacity: 60,
      startDate: new Date("2026-04-01"),
      endDate: new Date("2027-03-31"),
      timetable: {
        mon: ["06:30 - 08:00", "18:00 - 19:30"],
        tue: ["18:00 - 19:30"],
        thu: ["06:30 - 08:00", "18:00 - 19:30"],
        sat: ["10:00 - 13:00"],
      },
    },
  });

  const course = await prisma.course.upsert({
    where: { id: cfg.courseId },
    update: {},
    create: {
      id: cfg.courseId,
      instituteId: institute.id,
      title: cfg.courseTitle,
      code: cfg.courseCode,
      description: cfg.courseDescription,
      category: cfg.courseCategory,
      level: "Class 12",
      duration: "12 months",
      credits: 4,
      status: "PUBLISHED",
      createdById: teacherUsers[0].profile.id,
    },
  });

  for (const s of cfg.students) {
    const user = await upsertUser(s.email, s.name, Role.STUDENT, institute.id, passwordHash);
    const profile = await upsertStudentProfile(user.id, institute.id, batch.id, s);
    await createEnrollmentIfMissing(profile.id, batch.id, course.id, 150000);
  }

  // ---- Community group chat for this batch ----
  const memberIds = [
    adminUser.id,
    ...teacherUsers.map((t) => t.user.id),
    ...(await prisma.user.findMany({ where: { instituteId: institute.id, role: Role.STUDENT }, select: { id: true } })).map((u) => u.id),
  ];
  const community = await prisma.conversation.upsert({
    where: { id: cfg.communityId },
    update: {},
    create: {
      id: cfg.communityId,
      instituteId: institute.id,
      isGroup: true,
      title: `${cfg.batchName} – Community`,
      createdById: adminUser.id,
      members: {
        create: [...new Set(memberIds)].map((userId) => ({ userId })),
      },
    },
  });
  const welcomeExists = await prisma.message.findFirst({ where: { conversationId: community.id } });
  if (!welcomeExists) {
    await prisma.message.create({
      data: {
        conversationId: community.id,
        senderId: adminUser.id,
        content: `Welcome to the ${cfg.batchName} community group! Ask doubts, share notes and stay updated with announcements here.`,
      },
    });
  }

  return { institute, batch, course, teacherUsers, adminUser, community };
}

async function main() {
  console.log("🌱 Seeding AcademyX database...");

  const passwordHash = await hashPassword(PASSWORD);

  // Clean up the old demo institute (kept the DB all-Indian).
  const vantageUsers = await prisma.user.findMany({
    where: { email: { endsWith: "@vantage.edu" } },
    select: { id: true },
  });
  const vantageIds = vantageUsers.map((u) => u.id);
  if (vantageIds.length > 0) {
    // Clear RESTRICT-referencing rows before deleting the users/institute.
    await prisma.message.deleteMany({ where: { senderId: { in: vantageIds } } });
    await prisma.supportTicket.deleteMany({ where: { userId: { in: vantageIds } } });
    await prisma.assignment.deleteMany({ where: { createdById: { in: vantageIds } } });
    await prisma.exam.deleteMany({ where: { createdById: { in: vantageIds } } });
    await prisma.recordedLecture.deleteMany({ where: { uploadedById: { in: vantageIds } } });
    await prisma.studyMaterial.deleteMany({ where: { uploadedById: { in: vantageIds } } });
    await prisma.announcement.deleteMany({ where: { authorId: { in: vantageIds } } });
    await prisma.conversation.deleteMany({ where: { createdById: { in: vantageIds } } });
    await prisma.institute.deleteMany({ where: { slug: "vantage" } });
    await prisma.user.deleteMany({ where: { id: { in: vantageIds } } });
    console.log("✓ Removed legacy Vantage demo institute");
  }

  // ---- Super admin ----
  await upsertUser("super@academyx.app", "Super Admin", Role.SUPER_ADMIN, null, passwordHash);
  console.log("✓ Super admin: super@academyx.app");

  // =========================================================================
  // Primary demo institute: Sunrise Academy
  // =========================================================================
  await prisma.announcement.deleteMany({ where: { id: "seed_ann_001" } });
  await prisma.exam.deleteMany({ where: { id: "seed_exam_001" } });
  await prisma.assignment.deleteMany({ where: { id: "seed_assign_001" } });
  await prisma.recordedLecture.deleteMany({
    where: { id: { in: ["seed_lect_001", "seed_lect_002"] } },
  });
  await prisma.liveClass.deleteMany({
    where: { roomId: { in: ["room_xyz123", "room_abc456"] } },
  });
  await prisma.payment.deleteMany({
    where: { txId: { in: ["TXN-SEED-1001", "TXN-SEED-1002"] } },
  });
  await prisma.enrollment.deleteMany({ where: { id: "seed_enroll_001" } });
  await prisma.course.deleteMany({ where: { id: "seed_course_001" } });
  await prisma.batch.deleteMany({
    where: { id: { in: ["seed_batch_sunrise_01", "seed_batch_sunrise_02"] } },
  });

  // Remove the legacy institute admin login (replaced by admin@sunriseacademy.in).
  const legacyAdmin = await prisma.user.findUnique({
    where: { email_role: { email: "arif.hussain@sunriseacademy.in", role: Role.INSTITUTE_ADMIN } },
  });
  if (legacyAdmin) {
    await prisma.announcement.deleteMany({ where: { authorId: legacyAdmin.id } });
    await prisma.user.deleteMany({ where: { id: legacyAdmin.id } });
  }

  const sunrise = await seedInstitute({
    slug: "sunrise",
    name: "Sunrise Academy",
    contactEmail: "admin@sunriseacademy.in",
    phone: "+91 98765 43210",
    address: "Begumpet, Hyderabad, Telangana 500016",
    about: "Premier JEE & NEET coaching centre with small batches and daily doubt sessions.",
    plan: InstitutePlan.PRO,
    status: InstituteStatus.ACTIVE,
    primaryColor: "#6366f1",
    accentColor: "#37cd8f",
    admin: { name: "Mohammed Arif Hussain", email: "admin@sunriseacademy.in" },
    teachers: [
      teacher("Dr. Ayesha Ansari", "teacher@sunriseacademy.in", "EMP-001", "Physics", "PhD, Physics", "Rotational Mechanics"),
      teacher("Prof. Arjun Nair", "arjun.nair@sunriseacademy.in", "EMP-002", "Mathematics", "MSc, Mathematics", "Calculus & Algebra"),
      teacher("Dr. Kavya Reddy", "kavya.reddy@sunriseacademy.in", "EMP-003", "Chemistry", "PhD, Chemistry", "Organic Chemistry"),
    ],
    students: [
      student("Ayesha Khan", "student@sunriseacademy.in", "AX-2026-001", "Imran Khan", "+91 99887 76651", "2008-06-15", "Secunderabad, Hyderabad"),
      student("Mohammed Imran", "mohammed.imran@sunriseacademy.in", "AX-2026-002", "Naseer Imran", "+91 99887 76652", "2008-02-09", "Kukatpally, Hyderabad"),
      student("Aisha Siddiqui", "aisha.siddiqui@sunriseacademy.in", "AX-2026-003", "Faisal Siddiqui", "+91 99887 76653", "2008-11-22", "Banjara Hills, Hyderabad"),
      student("Rohan Sharma", "rohan.sharma@sunriseacademy.in", "AX-2026-004", "Pradeep Sharma", "+91 99887 76654", "2008-04-18", "Ameerpet, Hyderabad"),
      student("Priya Patel", "priya.patel@sunriseacademy.in", "AX-2026-005", "Rajesh Patel", "+91 99887 76655", "2008-09-03", "Madhapur, Hyderabad"),
      student("Rahul Verma", "rahul.verma@sunriseacademy.in", "AX-2026-006", "Sunil Verma", "+91 99887 76656", "2008-01-27", "Gachibowli, Hyderabad"),
      student("Fatima Sheikh", "fatima.sheikh@sunriseacademy.in", "AX-2026-007", "Yusuf Sheikh", "+91 99887 76657", "2008-07-12", "Charminar, Hyderabad"),
      student("Aditya Gupta", "aditya.gupta@sunriseacademy.in", "AX-2026-008", "Manoj Gupta", "+91 99887 76658", "2008-03-30", "Kavuri Hills, Hyderabad"),
      student("Zainab Ansari", "zainab.ansari@sunriseacademy.in", "AX-2026-009", "Rashid Ansari", "+91 99887 76659", "2008-12-08", "Tolichowki, Hyderabad"),
      student("Kabir Singh", "kabir.singh@sunriseacademy.in", "AX-2026-010", "Gurpreet Singh", "+91 99887 76660", "2008-05-25", "Attapur, Hyderabad"),
      student("Neha Reddy", "neha.reddy@sunriseacademy.in", "AX-2026-011", "Srinivas Reddy", "+91 99887 76661", "2008-10-14", "Manikonda, Hyderabad"),
      student("Irfan Qureshi", "irfan.qureshi@sunriseacademy.in", "AX-2026-012", "Salim Qureshi", "+91 99887 76662", "2008-08-21", "Mehdipatnam, Hyderabad"),
    ],
    batchId: "seed_batch_sunrise_01",
    batchName: "JEE Advanced 2027 – Batch A",
    batchCode: "JE-A",
    communityId: "seed_conv_sunrise",
    courseId: "seed_course_001",
    courseTitle: "JEE Advanced Physics – Complete Syllabus",
    courseCode: "PHY-101",
    courseCategory: "Physics",
    courseDescription: "Full JEE Advanced physics syllabus: mechanics, electrodynamics, optics and modern physics with daily practice problems.",
  });
  console.log("✓ Institute: Sunrise Academy");

  // Second batch + demo student in it as well
  const batchB = await prisma.batch.upsert({
    where: { id: "seed_batch_sunrise_02" },
    update: {},
    create: {
      id: "seed_batch_sunrise_02",
      instituteId: sunrise.institute.id,
      name: "JEE Advanced 2027 – Batch B",
      code: "JE-B",
      status: "ACTIVE",
      capacity: 60,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-03-31"),
      timetable: {
        tue: ["06:30 - 08:00"],
        thu: ["18:00 - 19:30"],
        sat: ["14:00 - 17:00"],
      },
    },
  });

  // ---- Course modules + lessons ----
  const course = await prisma.course.upsert({
    where: { id: "seed_course_001" },
    update: {},
    create: {
      id: "seed_course_001",
      instituteId: sunrise.institute.id,
      title: "JEE Advanced Physics – Complete Syllabus",
      code: "PHY-101",
      description: "Full JEE Advanced physics syllabus: mechanics, electrodynamics, optics and modern physics with daily practice problems.",
      category: "Physics",
      level: "Class 12",
      duration: "12 months",
      credits: 4,
      status: "PUBLISHED",
      createdById: sunrise.teacherUsers[0].profile.id,
      modules: {
        create: [
          {
            title: "Module 1: Mechanics",
            order: 0,
            type: "LECTURE",
            description: "Kinematics, Newton's laws and work-energy.",
            lessons: {
              create: [
                { title: "Kinematics in 1D & 2D", order: 0, duration: "42:18" },
                { title: "Newton's Laws of Motion", order: 1, duration: "38:44" },
                { title: "Work, Energy & Power", order: 2, duration: "51:09" },
              ],
            },
          },
          {
            title: "Module 2: Electrodynamics",
            order: 1,
            type: "LECTURE",
            description: "Current electricity, magnetism and induction.",
            lessons: {
              create: [
                { title: "Electrostatics & Capacitors", order: 0, duration: "46:30" },
                { title: "Magnetic Effects of Current", order: 1, duration: "40:12" },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("✓ Course: JEE Advanced Physics – Complete Syllabus");

  // ---- Demo student enrollment in both batches ----
  const demoStudent = await prisma.user.findUnique({
    where: { email_role: { email: "student@sunriseacademy.in", role: Role.STUDENT } },
  });
  if (demoStudent) {
    const demoProfile = await prisma.studentProfile.findUnique({ where: { userId: demoStudent.id } });
    if (demoProfile) {
      const existing = await prisma.enrollment.findFirst({
        where: { studentId: demoProfile.id, batchId: batchB.id },
      });
      if (!existing) {
        await prisma.enrollment.create({
          data: {
            studentId: demoProfile.id,
            batchId: batchB.id,
            courseId: course.id,
            fee: 150000,
            feePaid: false,
          },
        });
      }
    }
  }

  // ---- Live classes ----
  const now = new Date();
  await prisma.liveClass.createMany({
    data: [
      {
        instituteId: sunrise.institute.id,
        title: "Rotational Motion – Live Doubt Session",
        courseId: course.id,
        batchId: batchB.id,
        teacherId: sunrise.teacherUsers[0].user.id,
        roomId: "room_xyz123",
        startsAt: new Date(now.getTime() + 14 * 60 * 1000),
        durationMin: 90,
        status: "LIVE",
      },
      {
        instituteId: sunrise.institute.id,
        title: "Organic Chemistry – Reaction Mechanisms",
        courseId: course.id,
        batchId: batchB.id,
        teacherId: sunrise.teacherUsers[2].user.id,
        roomId: "room_abc456",
        startsAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        durationMin: 60,
        status: "SCHEDULED",
      },
    ],
  });

  // ---- Recorded lectures ----
  await prisma.recordedLecture.createMany({
    data: [
      {
        id: "seed_lect_001",
        instituteId: sunrise.institute.id,
        title: "Kinematics in 1D & 2D – Full Lesson",
        courseId: course.id,
        videoUrl: "https://example.com/rec/001",
        duration: "42:18",
        size: "1.2 GB",
        visibility: "Batch Only",
        uploadedById: sunrise.teacherUsers[0].user.id,
      },
      {
        id: "seed_lect_002",
        instituteId: sunrise.institute.id,
        title: "Electrostatics & Capacitors – Full Lesson",
        courseId: course.id,
        videoUrl: "https://example.com/rec/002",
        duration: "46:30",
        size: "860 MB",
        visibility: "Public",
        uploadedById: sunrise.teacherUsers[0].user.id,
      },
    ],
  });

  // ---- Assignment ----
  await prisma.assignment.create({
    data: {
      id: "seed_assign_001",
      instituteId: sunrise.institute.id,
      title: "Projectile Motion Problem Set",
      description: "30 numerical problems covering projectile motion and relative velocity. Submit solutions with full working.",
      courseId: course.id,
      batchId: batchB.id,
      maxMarks: 100,
      dueAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
      createdById: sunrise.teacherUsers[0].user.id,
    },
  });

  // ---- Exam with questions ----
  await prisma.exam.create({
    data: {
      id: "seed_exam_001",
      instituteId: sunrise.institute.id,
      title: "Mechanics Unit Test 1",
      description: "Unit test covering kinematics and Newton's laws.",
      type: "MCQ",
      courseId: course.id,
      batchId: batchB.id,
      durationMin: 90,
      totalMarks: 100,
      passMarks: 40,
      status: "PUBLISHED",
      scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      createdById: sunrise.teacherUsers[0].user.id,
      questions: {
        create: [
          {
            text: "A projectile is launched at 45° with speed 20 m/s. The horizontal range is (take g = 10 m/s²):",
            options: ["20 m", "30 m", "40 m", "50 m"],
            correctOption: 2,
            marks: 4,
            order: 0,
            type: "mcq",
          },
          {
            text: "Which of the following pairs of forces can never produce a resultant of 5 N?",
            options: ["2 N and 4 N", "3 N and 3 N", "1 N and 8 N", "4 N and 6 N"],
            correctOption: 2,
            marks: 4,
            order: 1,
            type: "mcq",
          },
          {
            text: "The SI unit of angular momentum is:",
            options: ["kg m²/s", "kg m/s", "N m", "J s²"],
            correctOption: 0,
            marks: 4,
            order: 2,
            type: "mcq",
          },
        ],
      },
    },
  });

  // ---- Payments ----
  const sunriseDemoProfile = demoStudent
    ? await prisma.studentProfile.findUnique({ where: { userId: demoStudent.id } })
    : null;
  if (sunriseDemoProfile) {
    await prisma.payment.createMany({
      data: [
        {
          instituteId: sunrise.institute.id,
          studentId: sunriseDemoProfile.id,
          txId: "TXN-SEED-1001",
          amount: 25000,
          currency: "INR",
          method: "RAZORPAY",
          status: "SUCCESS",
          purpose: "Tuition – Term 2",
          paidAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          instituteId: sunrise.institute.id,
          studentId: sunriseDemoProfile.id,
          txId: "TXN-SEED-1002",
          amount: 5000,
          currency: "INR",
          method: "UPI",
          status: "PENDING",
          purpose: "Study Material Fee",
        },
      ],
    });
  }

  // ---- Announcement ----
  const sunriseAdmin = await prisma.user.findUnique({
    where: { email_role: { email: "admin@sunriseacademy.in", role: Role.INSTITUTE_ADMIN } },
  });
  if (sunriseAdmin) {
    await prisma.announcement.create({
      data: {
        id: "seed_ann_001",
        instituteId: sunrise.institute.id,
        title: "Unit test schedule published",
        content: "The Unit Test 1 schedule for JEE Advanced batches is now live on the portal. Carry your admit cards.",
        audience: "all",
        authorId: sunriseAdmin.id,
        pinned: true,
      },
    });
  }

  // =========================================================================
  // Sharma Classes – Jaipur
  // =========================================================================
  await seedInstitute({
    slug: "sharma",
    name: "Sharma Classes",
    contactEmail: "admin@sharmaclasses.in",
    phone: "+91 98290 12345",
    address: "Malviya Nagar, Jaipur, Rajasthan 302017",
    about: "Trusted maths & science coaching for board and competitive exams in Rajasthan.",
    plan: InstitutePlan.BASIC,
    status: InstituteStatus.ACTIVE,
    primaryColor: "#e11d48",
    accentColor: "#fbbf24",
    admin: { name: "Rahul Sharma", email: "admin@sharmaclasses.in" },
    teachers: [
      teacher("Dr. Pooja Sharma", "pooja.sharma@sharmaclasses.in", "EMP-101", "Mathematics", "PhD, Mathematics", "Algebra"),
      teacher("Vinod Meena", "vinod.meena@sharmaclasses.in", "EMP-102", "Science", "MSc, Physics", "Numericals"),
      teacher("Sunita Verma", "sunita.verma@sharmaclasses.in", "EMP-103", "Chemistry", "MSc, Chemistry", "Physical Chemistry"),
    ],
    students: [
      student("Rohan Meena", "rohan.meena@sharmaclasses.in", "SC-2026-001", "Prakash Meena", "+91 98290 12346", "2008-05-11", "Malviya Nagar, Jaipur"),
      student("Aarav Choudhary", "aarav.choudhary@sharmaclasses.in", "SC-2026-002", "Deepak Choudhary", "+91 98290 12347", "2008-09-19", "Jhotwara, Jaipur"),
      student("Priyanka Jangid", "priyanka.jangid@sharmaclasses.in", "SC-2026-003", "Mahesh Jangid", "+91 98290 12348", "2008-12-02", "Vaishali Nagar, Jaipur"),
      student("Mohit Sharma", "mohit.sharma@sharmaclasses.in", "SC-2026-004", "Kailash Sharma", "+91 98290 12349", "2008-03-27", "Sodala, Jaipur"),
      student("Suman Gurjar", "suman.gurjar@sharmaclasses.in", "SC-2026-005", "Ramesh Gurjar", "+91 98290 12350", "2008-07-08", "Sanganer, Jaipur"),
      student("Deepak Saini", "deepak.saini@sharmaclasses.in", "SC-2026-006", "Om Prakash Saini", "+91 98290 12351", "2008-01-16", "Mansarovar, Jaipur"),
      student("Komal Rathore", "komal.rathore@sharmaclasses.in", "SC-2026-007", "Bhanwar Rathore", "+91 98290 12352", "2008-10-05", "C-Scheme, Jaipur"),
      student("Vishal Bansal", "vishal.bansal@sharmaclasses.in", "SC-2026-008", "Rajesh Bansal", "+91 98290 12353", "2008-04-29", "Vidhyadhar Nagar, Jaipur"),
    ],
    batchId: "seed_batch_sharma_01",
    batchName: "Class 12 Board + JEE Foundation",
    batchCode: "SC-12",
    communityId: "seed_conv_sharma",
    courseId: "seed_course_sharma_001",
    courseTitle: "Mathematics & Science – Class 12 Boards",
    courseCode: "MATH-12",
    courseCategory: "Mathematics",
    courseDescription: "Complete board exam preparation with weekly tests and parent meetings.",
  });
  console.log("✓ Institute: Sharma Classes");

  // =========================================================================
  // Al-Madina Coaching Centre – Lucknow
  // =========================================================================
  await seedInstitute({
    slug: "almadina",
    name: "Al-Madina Coaching Centre",
    contactEmail: "admin@almadina.in",
    phone: "+91 98391 23456",
    address: "Hazratganj, Lucknow, Uttar Pradesh 226001",
    about: "Leading coaching centre in Lucknow for JEE, NEET and UPPSC foundation courses.",
    plan: InstitutePlan.ENTERPRISE,
    status: InstituteStatus.ACTIVE,
    primaryColor: "#059669",
    accentColor: "#10b981",
    admin: { name: "Imtiaz Ahmed", email: "admin@almadina.in" },
    teachers: [
      teacher("Dr. Zafar Ali", "zafar.ali@almadina.in", "EMP-201", "Physics", "PhD, Physics", "Optics"),
      teacher("Farhana Khan", "farhana.khan@almadina.in", "EMP-202", "Biology", "MSc, Botany", "Genetics"),
      teacher("Salma Begum", "salma.begum@almadina.in", "EMP-203", "Chemistry", "MSc, Chemistry", "Organic Chemistry"),
    ],
    students: [
      student("Aamir Khan", "aamir.khan@almadina.in", "AM-2026-001", "Irfan Khan", "+91 98391 23457", "2008-06-21", "Chowk, Lucknow"),
      student("Sana Siddiqui", "sana.siddiqui@almadina.in", "AM-2026-002", "Javed Siddiqui", "+91 98391 23458", "2008-02-14", "Alambagh, Lucknow"),
      student("Bilal Ansari", "bilal.ansari@almadina.in", "AM-2026-003", "Ashfaq Ansari", "+91 98391 23459", "2008-11-09", "Gomti Nagar, Lucknow"),
      student("Hina Fatima", "hina.fatima@almadina.in", "AM-2026-004", "Shamim Fatima", "+91 98391 23460", "2008-08-17", "Wazirganj, Lucknow"),
      student("Yusuf Raza", "yusuf.raza@almadina.in", "AM-2026-005", "Akhtar Raza", "+91 98391 23461", "2008-05-03", "Thakurganj, Lucknow"),
      student("Maryam Noor", "maryam.noor@almadina.in", "AM-2026-006", "Abdul Noor", "+91 98391 23462", "2008-12-25", "Indira Nagar, Lucknow"),
      student("Ibrahim Sheikh", "ibrahim.sheikh@almadina.in", "AM-2026-007", "Ismail Sheikh", "+91 98391 23463", "2008-03-06", "Aminabad, Lucknow"),
      student("Zoya Ali", "zoya.ali@almadina.in", "AM-2026-008", "Shahid Ali", "+91 98391 23464", "2008-09-28", "Rajajipuram, Lucknow"),
    ],
    batchId: "seed_batch_almadina_01",
    batchName: "NEET 2027 – Target Batch",
    batchCode: "NEET-1",
    communityId: "seed_conv_almadina",
    courseId: "seed_course_almadina_001",
    courseTitle: "NEET Biology & Chemistry",
    courseCode: "NEET-BC",
    courseCategory: "Biology",
    courseDescription: "NEET-focused Biology and Chemistry with NCERT-aligned practice and mock tests.",
  });
  console.log("✓ Institute: Al-Madina Coaching Centre");

  // =========================================================================
  // Navodaya Academy – Patna
  // =========================================================================
  await seedInstitute({
    slug: "navodaya",
    name: "Navodaya Academy",
    contactEmail: "admin@navodaya.in",
    phone: "+91 90063 45678",
    address: "Boring Road, Patna, Bihar 800001",
    about: "Regional coaching academy for JEE, NEET and Bihar board exams with hostel facilities.",
    plan: InstitutePlan.PRO,
    status: InstituteStatus.TRIAL,
    primaryColor: "#2563eb",
    accentColor: "#f59e0b",
    admin: { name: "Sushil Kumar", email: "admin@navodaya.in" },
    teachers: [
      teacher("Meera Mishra", "meera.mishra@navodaya.in", "EMP-301", "Physics", "MSc, Physics", "Electrodynamics"),
      teacher("Arun Sinha", "arun.sinha@navodaya.in", "EMP-302", "Mathematics", "MSc, Mathematics", "Coordinate Geometry"),
      teacher("Rekha Kumari", "rekha.kumari@navodaya.in", "EMP-303", "Chemistry", "MSc, Chemistry", "Inorganic Chemistry"),
    ],
    students: [
      student("Vikash Kumar", "vikash.kumar@navodaya.in", "NV-2026-001", "Ramanand Kumar", "+91 90063 45679", "2008-04-12", "Danapur, Patna"),
      student("Anjali Singh", "anjali.singh@navodaya.in", "NV-2026-002", "Rakesh Singh", "+91 90063 45680", "2008-10-01", "Kankarbagh, Patna"),
      student("Ravi Ranjan", "ravi.ranjan@navodaya.in", "NV-2026-003", "Mahendra Ranjan", "+91 90063 45681", "2008-07-23", "Phulwari Sharif, Patna"),
      student("Nisha Kumari", "nisha.kumari@navodaya.in", "NV-2026-004", "Binod Kumar", "+91 90063 45682", "2008-01-19", "Bailey Road, Patna"),
      student("Sanjay Yadav", "sanjay.yadav@navodaya.in", "NV-2026-005", "Ramashray Yadav", "+91 90063 45683", "2008-06-30", "Digha, Patna"),
      student("Pooja Gupta", "pooja.gupta@navodaya.in", "NV-2026-006", "Ashok Gupta", "+91 90063 45684", "2008-11-11", "Patliputra, Patna"),
      student("Amit Raj", "amit.raj@navodaya.in", "NV-2026-007", "Suresh Raj", "+91 90063 45685", "2008-02-26", "Rajendra Nagar, Patna"),
      student("Sweety Sharma", "sweety.sharma@navodaya.in", "NV-2026-008", "Pramod Sharma", "+91 90063 45686", "2008-09-14", "Mithapur, Patna"),
    ],
    batchId: "seed_batch_navodaya_01",
    batchName: "JEE Main 2027 – Crash Batch",
    batchCode: "JM-C",
    communityId: "seed_conv_navodaya",
    courseId: "seed_course_navodaya_001",
    courseTitle: "JEE Main Physics & Maths",
    courseCode: "JM-PM",
    courseCategory: "Physics",
    courseDescription: "Focused JEE Main preparation with weekly mock tests and rank tracking.",
  });
  console.log("✓ Institute: Navodaya Academy");

  // =========================================================================
  // Crescent Institute – Kozhikode
  // =========================================================================
  await seedInstitute({
    slug: "crescent",
    name: "Crescent Institute",
    contactEmail: "admin@crescent.edu.in",
    phone: "+91 98470 56789",
    address: "Mananchira, Kozhikode, Kerala 673001",
    about: "Kerala-based coaching centre for KEAM, NEET and higher secondary board exams.",
    plan: InstitutePlan.BASIC,
    status: InstituteStatus.SUSPENDED,
    primaryColor: "#7c3aed",
    accentColor: "#22d3ee",
    admin: { name: "Abdul Rahman", email: "admin@crescent.edu.in" },
    teachers: [
      teacher("Reena Mathew", "reena.mathew@crescent.edu.in", "EMP-401", "Mathematics", "MSc, Mathematics", "Vectors"),
      teacher("Suresh Menon", "suresh.menon@crescent.edu.in", "EMP-402", "Physics", "MSc, Physics", "Thermodynamics"),
      teacher("Asif Ali", "asif.ali@crescent.edu.in", "EMP-403", "Chemistry", "MSc, Chemistry", "Physical Chemistry"),
    ],
    students: [
      student("Muhammed Faizal", "muhammed.faizal@crescent.edu.in", "CR-2026-001", "Abdul Faizal", "+91 98470 56790", "2008-05-27", "Kunnamangalam, Kozhikode"),
      student("Sneha Nair", "sneha.nair@crescent.edu.in", "CR-2026-002", "Mohan Nair", "+91 98470 56791", "2008-03-15", "Mavoor, Kozhikode"),
      student("Arjun Prakash", "arjun.prakash@crescent.edu.in", "CR-2026-003", "Prakash Menon", "+91 98470 56792", "2008-08-04", "Feroke, Kozhikode"),
      student("Fathima Beevi", "fathima.beevi@crescent.edu.in", "CR-2026-004", "Abdul Sathar", "+91 98470 56793", "2008-12-19", "Pantheerankavu, Kozhikode"),
      student("Rahul Menon", "rahul.menon@crescent.edu.in", "CR-2026-005", "Gopal Menon", "+91 98470 56794", "2008-06-06", "Nadakkavu, Kozhikode"),
      student("Aswathy Pillai", "aswathy.pillai@crescent.edu.in", "CR-2026-006", "Rajesh Pillai", "+91 98470 56795", "2008-10-30", "Kakkodi, Kozhikode"),
      student("Nabeel Hassan", "nabeel.hassan@crescent.edu.in", "CR-2026-007", "Rasheed Hassan", "+91 98470 56796", "2008-01-08", "Balussery, Kozhikode"),
      student("Lakshmi Narayanan", "lakshmi.narayanan@crescent.edu.in", "CR-2026-008", "Narayanan", "+91 98470 56797", "2008-09-22", "Chevayur, Kozhikode"),
    ],
    batchId: "seed_batch_crescent_01",
    batchName: "KEAM 2027 – Physics Batch",
    batchCode: "KEAM-P",
    communityId: "seed_conv_crescent",
    courseId: "seed_course_crescent_001",
    courseTitle: "KEAM Physics & Maths",
    courseCode: "KEAM-PM",
    courseCategory: "Physics",
    courseDescription: "KEAM-oriented Physics and Maths with Kerala board syllabus alignment.",
  });
  console.log("✓ Institute: Crescent Institute");

  // =========================================================================
  // Iqra Girls Academy – Bhopal
  // =========================================================================
  await seedInstitute({
    slug: "iqra",
    name: "Iqra Girls Academy",
    contactEmail: "admin@iqra.in",
    phone: "+91 98930 67890",
    address: "Kolar Road, Bhopal, Madhya Pradesh 462042",
    about: "All-girls coaching academy in Bhopal for NEET, board exams and Olympiads.",
    plan: InstitutePlan.PRO,
    status: InstituteStatus.ACTIVE,
    primaryColor: "#db2777",
    accentColor: "#a21caf",
    admin: { name: "Rabia Khan", email: "admin@iqra.in" },
    teachers: [
      teacher("Nazia Parveen", "nazia.parveen@iqra.in", "EMP-501", "Biology", "MSc, Botany", "Human Physiology"),
      teacher("Shahana Mirza", "shahana.mirza@iqra.in", "EMP-502", "Mathematics", "MSc, Mathematics", "Probability"),
      teacher("Ayesha Begum", "ayesha.begum@iqra.in", "EMP-503", "Chemistry", "MSc, Chemistry", "Organic Chemistry"),
    ],
    students: [
      student("Farheen Sultana", "farheen.sultana@iqra.in", "IQ-2026-001", "Naseem Sultana", "+91 98930 67891", "2008-04-07", "Arera Colony, Bhopal"),
      student("Areeba Khan", "areeba.khan@iqra.in", "IQ-2026-002", "Tariq Khan", "+91 98930 67892", "2008-11-16", "Shahpura, Bhopal"),
      student("Mehak Siddiqui", "mehak.siddiqui@iqra.in", "IQ-2026-003", "Rafiq Siddiqui", "+91 98930 67893", "2008-07-01", "Kolar Road, Bhopal"),
      student("Sana Khan", "sana.khan@iqra.in", "IQ-2026-004", "Aslam Khan", "+91 98930 67894", "2008-02-28", "Bawadiya, Bhopal"),
      student("Iqra Fatima", "iqra.fatima@iqra.in", "IQ-2026-005", "Shabbir Fatima", "+91 98930 67895", "2008-09-09", "MP Nagar, Bhopal"),
      student("Zainab Malik", "zainab.malik@iqra.in", "IQ-2026-006", "Salim Malik", "+91 98930 67896", "2008-05-20", "Awadhpuri, Bhopal"),
      student("Humera Jabeen", "humera.jabeen@iqra.in", "IQ-2026-007", "Rashid Jabeen", "+91 98930 67897", "2008-12-03", "Piplani, Bhopal"),
      student("Ruqayya Ansari", "ruqayya.ansari@iqra.in", "IQ-2026-008", "Mazhar Ansari", "+91 98930 67898", "2008-08-12", "Nishatpura, Bhopal"),
    ],
    batchId: "seed_batch_iqra_01",
    batchName: "NEET 2027 – Girls Batch",
    batchCode: "NEET-G",
    communityId: "seed_conv_iqra",
    courseId: "seed_course_iqra_001",
    courseTitle: "NEET Biology, Physics & Chemistry",
    courseCode: "NEET-BPC",
    courseCategory: "Biology",
    courseDescription: "Complete NEET preparation for girls with NCERT mastery and weekly mock tests.",
  });
  console.log("✓ Institute: Iqra Girls Academy");

  console.log("🌱 Seeding complete.");
  console.log("\nDemo logins (password: password123):");
  console.log("  super@academyx.app          → SUPER_ADMIN");
  console.log("  admin@sunriseacademy.in     → INSTITUTE_ADMIN");
  console.log("  teacher@sunriseacademy.in   → TEACHER");
  console.log("  student@sunriseacademy.in   → STUDENT");
  console.log("\nAlso seeded:");
  console.log("  Sharma Classes · Al-Madina Coaching Centre · Navodaya Academy · Crescent Institute · Iqra Girls Academy");
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
