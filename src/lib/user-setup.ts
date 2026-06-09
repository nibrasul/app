import prisma from './db';

/**
 * Idempotent, transaction-locked helper to ensure a user has an initialized Profile and SharingSettings.
 * This function handles username generation with safe conflict resolution (no infinite loop risk)
 * and database-level unique constraint collision retries by wrapping the interactive transaction
 * in a retry loop from the outside.
 */
export async function ensureUserSetup(userId: number, email: string, name: string, customUsername?: string) {
  console.log(`[AUTH] Initializing setup check for userId=${userId}, email=${email}`);

  let base = (customUsername || email.split('@')[0])
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, ''); // Keep alphanumeric, hyphen, underscore matching schema
  if (!base || base.length < 3) base = 'user';

  let currentUsername = base;
  let retries = 0;

  while (retries < 5) {
    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Check if already exists (FAST EXIT)
        const existingProfile = await tx.profile.findUnique({
          where: { userId }
        });

        if (existingProfile) {
          console.log(`[AUTH] Profile already exists for userId=${userId}. Fast-exiting.`);
          
          // Also ensure sharing settings exist just in case
          const existingSettings = await tx.sharingSettings.findUnique({
            where: { userId }
          });
          if (!existingSettings) {
            console.log(`[AUTH] SharingSettings missing for existing userId=${userId}. Restoring.`);
            await tx.sharingSettings.create({
              data: { userId }
            });
          }

          // Ensure User.profileReady flag is true
          const existingUser = await tx.user.findUnique({
            where: { id: userId }
          });
          if (existingUser && !existingUser.profileReady) {
            console.log(`[AUTH] Updating profileReady flag to true for existing userId=${userId}`);
            await tx.user.update({
              where: { id: userId },
              data: { profileReady: true }
            });
          }

          return existingProfile;
        }

        // 2. Username check
        // Check if current username is taken
        const isTaken = await tx.profile.findUnique({
          where: { username: currentUsername }
        });

        if (isTaken) {
          if (retries === 0 && customUsername) {
            // custom username taken, generate suggestions
            let counter = 1;
            currentUsername = `${base}${counter}`;
            while (await tx.profile.findUnique({ where: { username: currentUsername } })) {
              currentUsername = `${base}${counter++}`;
              if (counter > 999) {
                currentUsername = `${base}_${Date.now()}`;
                break;
              }
            }
          } else {
            currentUsername = `${base}${Math.floor(Math.random() * 9000) + 1000}`;
          }
          console.log(`[AUTH] Username target in-transaction occupied. Adjusting target to @${currentUsername}`);
        }

        // 3. Create profile
        const profile = await tx.profile.create({
          data: {
            userId,
            username: currentUsername,
            name: name || base,
            bio: "I design meaningful experiences.",
            tagline: "Let's connect!",
            avatar: '/profile_avatar.png',
            diamonds: '0',
            isPremium: false,
            tapCount: 0,
            tags: {
              createMany: {
                data: [
                  { text: 'Creator', type: 'role' },
                  { text: 'Earth', type: 'location' }
                ]
              }
            }
          }
        });
        console.log(`[AUTH] Profile successfully created for userId=${userId} with username=@${currentUsername}`);

        // 4. Create settings
        await tx.sharingSettings.create({
          data: { userId }
        });
        console.log(`[AUTH] SharingSettings successfully created for userId=${userId}`);

        // 5. Update user's profileReady flag
        await tx.user.update({
          where: { id: userId },
          data: { profileReady: true }
        });
        console.log(`[AUTH] User profileReady set to true for userId=${userId}`);

        return profile;
      });
    } catch (err: any) {
      // P2002 is Prisma's code for unique constraint violation
      const isUniqueError = err.code === 'P2002' || (err.message && err.message.includes('Unique constraint failed'));
      if (isUniqueError && retries < 4) {
        retries++;
        console.warn(`[AUTH] Database unique collision on username=@${currentUsername} (or userId). Retrying transaction setup (attempt ${retries + 1}/5)...`);
        currentUsername = `${base}${Math.floor(Math.random() * 9000) + 1000}`;
      } else {
        console.error(`[AUTH] Failed profile setup for userId=${userId}:`, err);
        throw err;
      }
    }
  }

  throw new Error(`[AUTH] Failed to create profile for userId=${userId} after maximum unique constraint retries.`);
}
