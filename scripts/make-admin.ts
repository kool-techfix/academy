/**
 * Promote an existing account to ADMIN. There is intentionally no admin
 * sign-up flow: register a normal account first, then run
 *
 *   pnpm admin:promote someone@example.com
 */
import { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    console.error("Usage: pnpm admin:promote <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: Role.ADMIN, instructorStatus: null },
  });

  console.log(`${email} is now an admin. The change applies on their next page load.`);
}

main().finally(() => prisma.$disconnect());
