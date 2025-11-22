import { PrismaClient, UserRole, MessageSender } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.memory.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Existing data cleared\n');

  // Create users
  console.log('👥 Creating users...');
  const students = await Promise.all([
    prisma.user.create({
      data: {
        id: 'student-001',
        name: 'Alice Johnson',
        role: UserRole.student,
        userInfo: {
          email: 'alice.johnson@example.com',
          grade: '10',
          subjects: ['Mathematics', 'Physics', 'Computer Science'],
        },
      },
    }),
    prisma.user.create({
      data: {
        id: 'student-002',
        name: 'Bob Smith',
        role: UserRole.student,
        userInfo: {
          email: 'bob.smith@example.com',
          grade: '11',
          subjects: ['Chemistry', 'Biology', 'English'],
        },
      },
    }),
    prisma.user.create({
      data: {
        id: 'student-003',
        name: 'Carol Davis',
        role: UserRole.student,
        userInfo: {
          email: 'carol.davis@example.com',
          grade: '12',
          subjects: ['History', 'Literature', 'Art'],
        },
      },
    }),
  ]);

  const teacher = await prisma.user.create({
    data: {
      id: 'teacher-001',
      name: 'Dr. Emily Brown',
      role: UserRole.teacher,
      userInfo: {
        email: 'emily.brown@example.com',
        department: 'Mathematics',
        yearsOfExperience: 15,
      },
    },
  });

  const admin = await prisma.user.create({
    data: {
      id: 'admin-001',
      name: 'John Administrator',
      role: UserRole.admin,
      userInfo: {
        email: 'admin@example.com',
        permissions: ['all'],
      },
    },
  });

  console.log(`✅ Created ${students.length} students, 1 teacher, and 1 admin\n`);

  // Create chats for Alice
  console.log('💬 Creating chats and messages...');
  const aliceChat1 = await prisma.chat.create({
    data: {
      userId: students[0].id,
      title: 'Calculus Help - Derivatives',
      messageCount: 6,
      messages: {
        create: [
          {
            content: 'Hi! I need help understanding derivatives in calculus.',
            sender: MessageSender.user,
            metadata: { timestamp: new Date('2025-01-15T10:00:00Z').toISOString() },
          },
          {
            content: 'Hello Alice! I\'d be happy to help you with derivatives. What specific aspect are you struggling with?',
            sender: MessageSender.assistant,
            metadata: { timestamp: new Date('2025-01-15T10:00:05Z').toISOString() },
          },
          {
            content: 'I don\'t understand the power rule. Can you explain it?',
            sender: MessageSender.user,
            metadata: { timestamp: new Date('2025-01-15T10:01:00Z').toISOString() },
          },
          {
            content: 'The power rule states that if f(x) = x^n, then f\'(x) = n*x^(n-1). For example, if f(x) = x^3, then f\'(x) = 3x^2. Would you like to try a practice problem?',
            sender: MessageSender.assistant,
            metadata: { timestamp: new Date('2025-01-15T10:01:15Z').toISOString() },
          },
          {
            content: 'Yes please! Give me a problem to solve.',
            sender: MessageSender.user,
            metadata: { timestamp: new Date('2025-01-15T10:02:00Z').toISOString() },
          },
          {
            content: 'Great! Find the derivative of f(x) = 5x^4 + 3x^2 - 7x + 2',
            sender: MessageSender.assistant,
            metadata: { timestamp: new Date('2025-01-15T10:02:10Z').toISOString() },
          },
        ],
      },
    },
  });

  const aliceChat2 = await prisma.chat.create({
    data: {
      userId: students[0].id,
      title: 'Physics - Newton\'s Laws',
      messageCount: 4,
      lastUpdatedAt: new Date('2025-01-16T14:30:00Z'),
      messages: {
        create: [
          {
            content: 'Can you explain Newton\'s second law of motion?',
            sender: MessageSender.user,
            metadata: { timestamp: new Date('2025-01-16T14:30:00Z').toISOString() },
          },
          {
            content: 'Newton\'s second law states that Force = mass × acceleration (F = ma). This means the force applied to an object is directly proportional to its acceleration, and the constant of proportionality is the object\'s mass.',
            sender: MessageSender.assistant,
            metadata: { timestamp: new Date('2025-01-16T14:30:15Z').toISOString() },
          },
          {
            content: 'If I push a 10kg box with 50N of force, what\'s the acceleration?',
            sender: MessageSender.user,
            metadata: { timestamp: new Date('2025-01-16T14:31:00Z').toISOString() },
          },
          {
            content: 'Using F = ma, we can rearrange to get a = F/m. So a = 50N / 10kg = 5 m/s². The box accelerates at 5 meters per second squared.',
            sender: MessageSender.assistant,
            metadata: { timestamp: new Date('2025-01-16T14:31:20Z').toISOString() },
          },
        ],
      },
    },
  });

  // Create chats for Bob
  const bobChat1 = await prisma.chat.create({
    data: {
      userId: students[1].id,
      title: 'Chemistry - Periodic Table',
      messageCount: 5,
      lastUpdatedAt: new Date('2025-01-17T09:00:00Z'),
      messages: {
        create: [
          {
            content: 'What are the noble gases and why are they called that?',
            sender: MessageSender.user,
            metadata: { timestamp: new Date('2025-01-17T09:00:00Z').toISOString() },
          },
          {
            content: 'Noble gases are the elements in Group 18 of the periodic table: Helium (He), Neon (Ne), Argon (Ar), Krypton (Kr), Xenon (Xe), and Radon (Rn). They\'re called "noble" because they rarely react with other elements, similar to how nobility historically kept to themselves.',
            sender: MessageSender.assistant,
            metadata: { timestamp: new Date('2025-01-17T09:00:20Z').toISOString() },
          },
          {
            content: 'Why don\'t they react?',
            sender: MessageSender.user,
            metadata: { timestamp: new Date('2025-01-17T09:01:00Z').toISOString() },
          },
          {
            content: 'Noble gases have a full outer electron shell, which makes them very stable. Most chemical reactions occur because atoms want to achieve a full outer shell by gaining, losing, or sharing electrons. Since noble gases already have this stable configuration, they have little incentive to react.',
            sender: MessageSender.assistant,
            metadata: { timestamp: new Date('2025-01-17T09:01:25Z').toISOString() },
          },
          {
            content: 'That makes sense! Thanks for explaining.',
            sender: MessageSender.user,
            metadata: { timestamp: new Date('2025-01-17T09:02:00Z').toISOString() },
          },
        ],
      },
    },
  });

  // Create chats for Carol
  const carolChat1 = await prisma.chat.create({
    data: {
      userId: students[2].id,
      title: 'Literature Analysis - Shakespeare',
      messageCount: 3,
      lastUpdatedAt: new Date('2025-01-18T11:00:00Z'),
      messages: {
        create: [
          {
            content: 'I\'m writing an essay on Hamlet. What\'s the main theme?',
            sender: MessageSender.user,
            metadata: { timestamp: new Date('2025-01-18T11:00:00Z').toISOString() },
          },
          {
            content: 'Hamlet explores several major themes, but the central one is the complexity of action vs. inaction. Hamlet struggles with whether to act on revenge for his father\'s murder. Other key themes include mortality, madness (real vs. feigned), and corruption in Denmark.',
            sender: MessageSender.assistant,
            metadata: { timestamp: new Date('2025-01-18T11:00:30Z').toISOString() },
          },
          {
            content: 'Can you give me an example of his inaction from the text?',
            sender: MessageSender.user,
            metadata: { timestamp: new Date('2025-01-18T11:01:30Z').toISOString() },
          },
        ],
      },
    },
  });

  console.log('✅ Created chats with messages for all students\n');

  // Create memories
  console.log('🧠 Creating memories...');
  await Promise.all([
    // Alice's memories
    prisma.memory.create({
      data: {
        userId: students[0].id,
        content: 'Alice is a 10th grade student who is currently studying calculus and physics. She prefers visual explanations and step-by-step examples.',
        mem0MemoryId: 'mem0-alice-001',
        sourceChatIds: [aliceChat1.id, aliceChat2.id],
      },
    }),
    prisma.memory.create({
      data: {
        userId: students[0].id,
        content: 'Alice struggles with derivatives but improves quickly with practice problems. She appreciates when complex formulas are broken down into smaller parts.',
        mem0MemoryId: 'mem0-alice-002',
        sourceChatIds: [aliceChat1.id],
      },
    }),
    prisma.memory.create({
      data: {
        userId: students[0].id,
        content: 'Alice has a strong interest in Computer Science and often tries to connect mathematical concepts to programming.',
        mem0MemoryId: 'mem0-alice-003',
        sourceChatIds: [],
      },
    }),

    // Bob's memories
    prisma.memory.create({
      data: {
        userId: students[1].id,
        content: 'Bob is an 11th grade student studying chemistry and biology. He learns best through real-world examples and analogies.',
        mem0MemoryId: 'mem0-bob-001',
        sourceChatIds: [bobChat1.id],
      },
    }),
    prisma.memory.create({
      data: {
        userId: students[1].id,
        content: 'Bob has a curious nature and frequently asks "why" questions to understand the underlying principles rather than just memorizing facts.',
        mem0MemoryId: 'mem0-bob-002',
        sourceChatIds: [bobChat1.id],
      },
    }),

    // Carol's memories
    prisma.memory.create({
      data: {
        userId: students[2].id,
        content: 'Carol is a 12th grade student with a passion for literature and history. She is working on analytical essays and needs help with textual evidence.',
        mem0MemoryId: 'mem0-carol-001',
        sourceChatIds: [carolChat1.id],
      },
    }),
    prisma.memory.create({
      data: {
        userId: students[2].id,
        content: 'Carol excels at identifying themes but sometimes needs guidance on how to support her arguments with specific quotes from the text.',
        mem0MemoryId: 'mem0-carol-002',
        sourceChatIds: [carolChat1.id],
      },
    }),
  ]);

  console.log('✅ Created memories for all students\n');

  // Summary
  const userCount = await prisma.user.count();
  const chatCount = await prisma.chat.count();
  const messageCount = await prisma.message.count();
  const memoryCount = await prisma.memory.count();

  console.log('📊 Seeding Summary:');
  console.log(`   - Users: ${userCount}`);
  console.log(`   - Chats: ${chatCount}`);
  console.log(`   - Messages: ${messageCount}`);
  console.log(`   - Memories: ${memoryCount}`);
  console.log('\n✨ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
