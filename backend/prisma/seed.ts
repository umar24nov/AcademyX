import { PrismaClient, Role, UserStatus, InstituteStatus, InstitutePlan } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding AcademyX database...");

  const passwordHash = await hashPassword("password123");

  // ---- Institute ----
  const institute = await prisma.institute.upsert({
    where: { slug: "vantage" },
    update: {},
    create: {
      name: "Vantage Institute of Technology",
      slug: "vantage",
      contactEmail: "admin@vantage.edu",
      phone: "+91 98765 43210",
      address: "221B, Tech Park, Bangalore",
      about: "Leading institute for engineering and computer science education.",
      plan: InstitutePlan.ENTERPRISE,
      status: InstituteStatus.ACTIVE,
      academicYear: "2026-27",
      gradingSystem: "percentage",
      passingMarks: 40,
      attendanceThreshold: 75,
      branding: {
        primaryColor: "#6366f1",
        accentColor: "#37cd8f",
        logoText: "VI",
      },
    },
  });
  console.log("✓ Institute:", institute.name);

  // ---- Super admin ----
  const superAdmin = await prisma.user.upsert({
    where: { email_role: { email: "super@academyx.app", role: Role.SUPER_ADMIN } },
    update: { passwordHash },
    create: {
      email: "super@academyx.app",
      name: "Super Admin",
      passwordHash,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });
  console.log("✓ Super admin:", superAdmin.email);

  // ---- Institute admin ----
  const instituteAdmin = await prisma.user.upsert({
    where: { email_role: { email: "admin@vantage.edu", role: Role.INSTITUTE_ADMIN } },
    update: { passwordHash },
    create: {
      email: "admin@vantage.edu",
      name: "Alex Rivera",
      passwordHash,
      role: Role.INSTITUTE_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      instituteId: institute.id,
    },
  });
  console.log("✓ Institute admin:", instituteAdmin.email);

  // ---- Teacher ----
  const teacherUser = await prisma.user.upsert({
    where: { email_role: { email: "teacher@vantage.edu", role: Role.TEACHER } },
    update: { passwordHash },
    create: {
      email: "teacher@vantage.edu",
      name: "Prof. Aris Thorne",
      passwordHash,
      role: Role.TEACHER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      instituteId: institute.id,
    },
  });

  const teacherProfile = await prisma.teacherProfile.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      instituteId: institute.id,
      employeeId: "EMP-001",
      department: "Computer Science",
      qualification: "PhD, Distributed Systems",
      specialization: "Distributed Computing",
    },
  });
  console.log("✓ Teacher:", teacherUser.email);

  // ---- Student ----
  const studentUser = await prisma.user.upsert({
    where: { email_role: { email: "student@vantage.edu", role: Role.STUDENT } },
    update: { passwordHash },
    create: {
      email: "student@vantage.edu",
      name: "Alex Johnson",
      passwordHash,
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      instituteId: institute.id,
    },
  });

  // ---- Batch ----
  const batch = await prisma.batch.upsert({
    where: { id: "seed_batch_001" },
    update: {},
    create: {
      id: "seed_batch_001",
      instituteId: institute.id,
      name: "Distributed Systems M1",
      code: "DS-M1",
      status: "ACTIVE",
      capacity: 40,
      startDate: new Date("2026-01-05"),
      endDate: new Date("2026-12-20"),
      timetable: {
        mon: ["10:00 - 11:30", "14:00 - 15:30"],
        wed: ["10:00 - 11:30"],
      },
    },
  });

  const studentProfile = await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: { batchId: batch.id },
    create: {
      userId: studentUser.id,
      instituteId: institute.id,
      batchId: batch.id,
      rollNumber: "AX-2026-001",
      admissionNo: "ADM-2026-001",
      guardianName: "Michael Johnson",
      guardianPhone: "+91 99887 76655",
      dateOfBirth: new Date("2005-04-12"),
      address: "4th Cross, Indiranagar, Bangalore",
    },
  });
  console.log("✓ Student:", studentUser.email);

  // ---- Course + module + lessons ----
  const course = await prisma.course.create({
    data: {
      instituteId: institute.id,
      title: "Advanced Distributed Systems",
      code: "ADS-601",
      description: "Deep dive into distributed systems: consensus, replication, and fault tolerance.",
      category: "Computer Science",
      level: "Graduate",
      duration: "16 weeks",
      credits: 4,
      status: "PUBLISHED",
      createdById: teacherProfile.id,
      modules: {
        create: [
          {
            title: "Module 1: Introduction to Latency",
            order: 0,
            type: "LECTURE",
            description: "Foundations of distributed systems.",
            lessons: {
              create: [
                { title: "The History of Distributed Tech", order: 0, duration: "12:04" },
                { title: "CAP Theorem Principles", order: 1, duration: "24:45" },
              ],
            },
          },
          {
            title: "Module 2: Consensus Protocols",
            order: 1,
            type: "LECTURE",
            description: "Raft, Paxos and leader election.",
            lessons: {
              create: [
                { title: "Deep Dive into Paxos", order: 0, duration: "24:45" },
                { title: "Raft vs Paxos Performance", order: 1, duration: "18:20" },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("✓ Course:", course.title);

  // ---- Enrollment ----
  await prisma.enrollment.create({
    data: {
      studentId: studentProfile.id,
      batchId: batch.id,
      courseId: course.id,
      fee: 49900,
      feePaid: true,
    },
  });

  // ---- Live classes ----
  const now = new Date();
  await prisma.liveClass.createMany({
    data: [
      {
        instituteId: institute.id,
        title: "Introduction to UI Design Systems",
        courseId: course.id,
        batchId: batch.id,
        teacherId: teacherUser.id,
        roomId: "room_xyz123",
        startsAt: new Date(now.getTime() + 14 * 60 * 1000),
        durationMin: 90,
        status: "LIVE",
      },
      {
        instituteId: institute.id,
        title: "Recurrence Relations & Master Theorem",
        courseId: course.id,
        batchId: batch.id,
        teacherId: teacherUser.id,
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
        instituteId: institute.id,
        title: "The History of Distributed Tech",
        courseId: course.id,
        videoUrl: "https://example.com/rec/001",
        duration: "12:04",
        size: "1.2 GB",
        visibility: "Batch Only",
        uploadedById: teacherUser.id,
      },
      {
        instituteId: institute.id,
        title: "Gradient Descent Explained",
        courseId: course.id,
        videoUrl: "https://example.com/rec/002",
        duration: "24:45",
        size: "860 MB",
        visibility: "Public",
        uploadedById: teacherUser.id,
      },
    ],
  });

  // ---- Assignment ----
  const assignment = await prisma.assignment.create({
    data: {
      instituteId: institute.id,
      title: "Distributed Key-Value Store Implementation",
      description: "Implement a fault-tolerant key-value store using Raft consensus.",
      courseId: course.id,
      batchId: batch.id,
      maxMarks: 100,
      dueAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
      createdById: teacherUser.id,
    },
  });

  // ---- Exam with questions ----
  const exam = await prisma.exam.create({
    data: {
      instituteId: institute.id,
      title: "Advanced Algorithms Midterm",
      description: "Midterm assessment covering consensus and replication.",
      type: "MCQ",
      courseId: course.id,
      batchId: batch.id,
      durationMin: 90,
      totalMarks: 100,
      passMarks: 40,
      status: "PUBLISHED",
      scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      createdById: teacherUser.id,
      questions: {
        create: [
          {
            text: "Which of the following best describes the CAP theorem?",
            options: [
              "A distributed system can only guarantee two of three properties simultaneously",
              "Distributed systems require all three guarantees at all times",
              "Consistency is always achievable under network partitions",
              "Partition tolerance is optional for modern systems",
            ],
            correctOption: 0,
            marks: 2,
            order: 0,
            type: "mcq",
          },
          {
            text: "In Raft, what triggers a leader election?",
            options: [
              "A follower losing contact with the leader",
              "Periodic log compaction",
              "A write request exceeding the limit",
              "The size of the replicated log",
            ],
            correctOption: 0,
            marks: 2,
            order: 1,
            type: "mcq",
          },
          {
            text: "What does eventual consistency guarantee?",
            options: [
              "Replicas converge after updates cease",
              "Reads always return the latest write",
              "All nodes update atomically",
              "The system can never partition",
            ],
            correctOption: 0,
            marks: 2,
            order: 2,
            type: "mcq",
          },
        ],
      },
    },
  });

  // ---- Payments ----
  await prisma.payment.createMany({
    data: [
      {
        instituteId: institute.id,
        studentId: studentProfile.id,
        txId: "TXN-SEED-1001",
        amount: 499,
        currency: "INR",
        method: "RAZORPAY",
        status: "SUCCESS",
        purpose: "Tuition - Term 2",
        paidAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        instituteId: institute.id,
        studentId: studentProfile.id,
        txId: "TXN-SEED-1002",
        amount: 650,
        currency: "INR",
        method: "UPI",
        status: "PENDING",
        purpose: "Lab Fees",
      },
    ],
  });

  // ---- Announcements ----
  await prisma.announcement.create({
    data: {
      instituteId: institute.id,
      title: "Midterm schedule published",
      content: "The midterm examination schedule for all batches is now available on the portal.",
      audience: "all",
      authorId: instituteAdmin.id,
      pinned: true,
    },
  });

  console.log("🌱 Seeding complete.");
  console.log("\nDemo logins (password: password123):");
  console.log("  super@academyx.app    → SUPER_ADMIN");
  console.log("  admin@vantage.edu     → INSTITUTE_ADMIN");
  console.log("  teacher@vantage.edu   → TEACHER");
  console.log("  student@vantage.edu   → STUDENT");
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
