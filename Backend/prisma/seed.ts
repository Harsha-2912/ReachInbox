import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dummy data...');

  // 1. Create a dummy user
  const user = await prisma.user.upsert({
    where: { email: 'test@reachinbox.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'test@reachinbox.com',
      googleId: 'google-test-id-123',
      avatarUrl: 'https://ui-avatars.com/api/?name=Test+User',
    },
  });
  console.log(`User created: ${user.id}`);

  // 2. Create a dummy sender
  const sender = await prisma.sender.upsert({
    where: { id: 'sender-test-123' },
    update: {},
    create: {
      id: 'sender-test-123',
      userId: user.id,
      email: 'sender@reachinbox.com',
      displayName: 'ReachInbox Sender',
      hourlyLimit: 100,
    },
  });
  console.log(`Sender created: ${sender.id}`);

  // 3. Create a dummy campaign
  const campaign = await prisma.campaign.create({
    data: {
      userId: user.id,
      senderId: sender.id,
      subject: 'Welcome to ReachInbox',
      body: '<p>Hello, this is a test campaign!</p>',
      startTime: new Date(),
      delayMs: 2000,
      hourlyLimit: 100,
      totalRecipients: 3,
      status: 'active',
      emails: {
        create: [
          {
            senderId: sender.id,
            recipient: 'recipient1@example.com',
            subject: 'Welcome to ReachInbox',
            body: '<p>Hello, this is a test campaign!</p>',
            scheduledAt: new Date(Date.now() + 5000), // in 5 seconds
            status: 'scheduled',
          },
          {
            senderId: sender.id,
            recipient: 'recipient2@example.com',
            subject: 'Welcome to ReachInbox',
            body: '<p>Hello, this is a test campaign!</p>',
            scheduledAt: new Date(Date.now() + 10000), // in 10 seconds
            status: 'scheduled',
          },
          {
            senderId: sender.id,
            recipient: 'recipient3@example.com',
            subject: 'Welcome to ReachInbox',
            body: '<p>Hello, this is a test campaign!</p>',
            scheduledAt: new Date(Date.now() + 15000), // in 15 seconds
            status: 'scheduled',
          }
        ]
      }
    }
  });
  console.log(`Campaign created: ${campaign.id}`);

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
