import prisma from './db';

/**
 * Idempotent, transaction-locked helper to ensure a user has an initialized Profile and SharingSettings.
 * Catches database unique constraint errors (Prisma P2002) and retries to prevent concurrent registration race conditions.
 */
export async function ensureUserSetup(userId: number, email: string, name: string, customUsername?: string) {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Check if already exists (FAST EXIT)
        const existingProfile = await tx.profile.findUnique({
          where: { userId }
        });

        if (existingProfile) {
          const existingSettings = await tx.sharingSettings.findUnique({
            where: { userId }
          });
          if (!existingSettings) {
            await tx.sharingSettings.create({
              data: { userId }
            });
          }
          return existingProfile;
        }

        // 2. Username generation
        let base = (customUsername || email.split('@')[0])
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, ''); // Keep alphanumeric, hyphen, underscore
        if (!base || base.length < 3) base = 'user';

        let username = base;
        if (attempts > 1) {
          // Append random suffix if previous attempts collided
          username = `${base}${Math.floor(Math.random() * 900) + 100}`;
        }

        let counter = 1;
        while (await tx.profile.findUnique({ where: { username } })) {
          username = `${base}${counter++}`;
          if (counter > 9999) {
            username = `${base}_${Date.now()}`;
            break;
          }
        }

        console.log(`[AUTH] Attempting profile creation (Attempt ${attempts}/${maxAttempts}) for userId: ${userId}, username: ${username}`);

        // 3. Create profile
        const profile = await tx.profile.create({
          data: {
            userId,
            username,
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

        // 4. Create settings
        await tx.sharingSettings.create({
          data: { userId }
        });

        console.log(`[AUTH] Successfully created profile and sharing settings for userId: ${userId}, username: ${username}`);
        return profile;
      });
    } catch (error: any) {
      // Prisma Unique Constraint violation error code is 'P2002'
      const isUniqueConstraintViolation = 
        error.code === 'P2002' || 
        error.message?.includes('Unique constraint') || 
        error.message?.includes('unique constraint');

      if (isUniqueConstraintViolation && attempts < maxAttempts) {
        console.warn(`[AUTH] Concurrency collision or duplicate key race detected on attempt ${attempts}. Retrying...`, error);
        continue;
      }
      
      console.error(`[AUTH_ERROR] ensureUserSetup failed at attempt ${attempts} with non-retryable error:`, error);
      throw error;
    }
  }

  throw new Error(`ensureUserSetup failed after ${maxAttempts} attempts due to persistent unique constraint collisions.`);
}
