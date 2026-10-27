import { hash } from "bcryptjs";
import { LibraryStatus, PrismaClient, Role } from "@prisma/client";

import { demoCoverUrl, steamLibraryCover } from "../lib/games/covers";

const prisma = new PrismaClient();

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const genres = [
  "Action",
  "Adventure",
  "RPG",
  "Indie",
  "Strategy",
  "Shooter",
  "Puzzle",
  "Platformer",
];

const platforms = ["PC", "PlayStation 5", "Xbox Series X|S", "Nintendo Switch"];

const games: Array<{
  title: string;
  externalId: string;
  steamAppId?: number;
  rating: number;
  year: number;
  genres: string[];
  platforms: string[];
}> = [
  {
    title: "Hollow Knight",
    externalId: "steam-367520",
    steamAppId: 367520,
    rating: 4.6,
    year: 2017,
    genres: ["Action", "Indie", "Platformer"],
    platforms: ["PC", "Nintendo Switch"],
  },
  {
    title: "Hades",
    externalId: "steam-1145360",
    steamAppId: 1145360,
    rating: 4.7,
    year: 2020,
    genres: ["Action", "Indie", "RPG"],
    platforms: ["PC", "Nintendo Switch"],
  },
  {
    title: "Celeste",
    externalId: "steam-504230",
    steamAppId: 504230,
    rating: 4.5,
    year: 2018,
    genres: ["Platformer", "Indie"],
    platforms: ["PC", "Nintendo Switch"],
  },
  {
    title: "The Witcher 3: Wild Hunt",
    externalId: "steam-292030",
    steamAppId: 292030,
    rating: 4.7,
    year: 2015,
    genres: ["RPG", "Adventure"],
    platforms: ["PC", "PlayStation 5", "Xbox Series X|S"],
  },
  {
    title: "Elden Ring",
    externalId: "steam-1245620",
    steamAppId: 1245620,
    rating: 4.6,
    year: 2022,
    genres: ["RPG", "Action"],
    platforms: ["PC", "PlayStation 5", "Xbox Series X|S"],
  },
  {
    title: "Stardew Valley",
    externalId: "steam-413150",
    steamAppId: 413150,
    rating: 4.6,
    year: 2016,
    genres: ["Indie", "RPG"],
    platforms: ["PC", "Nintendo Switch"],
  },
  {
    title: "Disco Elysium",
    externalId: "steam-632470",
    steamAppId: 632470,
    rating: 4.5,
    year: 2019,
    genres: ["RPG", "Adventure"],
    platforms: ["PC"],
  },
  {
    title: "Dead Cells",
    externalId: "steam-588650",
    steamAppId: 588650,
    rating: 4.3,
    year: 2018,
    genres: ["Action", "Indie", "Platformer"],
    platforms: ["PC", "Nintendo Switch"],
  },
  {
    title: "Slay the Spire",
    externalId: "steam-646570",
    steamAppId: 646570,
    rating: 4.5,
    year: 2019,
    genres: ["Strategy", "Indie"],
    platforms: ["PC", "Nintendo Switch"],
  },
  {
    title: "Ori and the Will of the Wisps",
    externalId: "steam-1057090",
    steamAppId: 1057090,
    rating: 4.5,
    year: 2020,
    genres: ["Platformer", "Adventure"],
    platforms: ["PC", "Xbox Series X|S", "Nintendo Switch"],
  },
  {
    title: "Portal 2",
    externalId: "steam-620",
    steamAppId: 620,
    rating: 4.6,
    year: 2011,
    genres: ["Puzzle", "Shooter"],
    platforms: ["PC"],
  },
  {
    title: "Doom Eternal",
    externalId: "steam-782330",
    steamAppId: 782330,
    rating: 4.4,
    year: 2020,
    genres: ["Shooter", "Action"],
    platforms: ["PC", "PlayStation 5", "Xbox Series X|S"],
  },
  {
    title: "Baldur's Gate 3",
    externalId: "steam-1086940",
    steamAppId: 1086940,
    rating: 4.8,
    year: 2023,
    genres: ["RPG", "Adventure"],
    platforms: ["PC", "PlayStation 5"],
  },
  {
    title: "Monster Hunter: World",
    externalId: "steam-582010",
    steamAppId: 582010,
    rating: 4.2,
    year: 2018,
    genres: ["Action", "RPG"],
    platforms: ["PC", "PlayStation 5"],
  },
  {
    title: "Cuphead",
    externalId: "steam-268910",
    steamAppId: 268910,
    rating: 4.3,
    year: 2017,
    genres: ["Platformer", "Indie"],
    platforms: ["PC", "Nintendo Switch"],
  },
  {
    title: "Factorio",
    externalId: "steam-427520",
    steamAppId: 427520,
    rating: 4.6,
    year: 2020,
    genres: ["Strategy", "Indie"],
    platforms: ["PC"],
  },
  {
    title: "Divinity: Original Sin 2",
    externalId: "steam-435150",
    steamAppId: 435150,
    rating: 4.6,
    year: 2017,
    genres: ["RPG", "Strategy"],
    platforms: ["PC", "Nintendo Switch"],
  },
  {
    title: "Sekiro: Shadows Die Twice",
    externalId: "steam-814380",
    steamAppId: 814380,
    rating: 4.5,
    year: 2019,
    genres: ["Action", "Adventure"],
    platforms: ["PC", "PlayStation 5"],
  },
  {
    title: "Undertale",
    externalId: "steam-391540",
    steamAppId: 391540,
    rating: 4.4,
    year: 2015,
    genres: ["Indie", "RPG"],
    platforms: ["PC", "Nintendo Switch"],
  },
  {
    title: "Outer Wilds",
    externalId: "steam-753640",
    steamAppId: 753640,
    rating: 4.5,
    year: 2019,
    genres: ["Adventure", "Indie"],
    platforms: ["PC", "PlayStation 5"],
  },
  {
    title: "Return of the Obra Dinn",
    externalId: "steam-653530",
    steamAppId: 653530,
    rating: 4.4,
    year: 2018,
    genres: ["Puzzle", "Indie"],
    platforms: ["PC", "Nintendo Switch"],
  },
  {
    title: "Deep Rock Galactic",
    externalId: "steam-548430",
    steamAppId: 548430,
    rating: 4.4,
    year: 2020,
    genres: ["Shooter", "Action"],
    platforms: ["PC", "Xbox Series X|S"],
  },
  {
    title: "Metroid Dread",
    externalId: "nintendo-metroid-dread",
    rating: 4.5,
    year: 2021,
    genres: ["Action", "Platformer"],
    platforms: ["Nintendo Switch"],
  },
  {
    title: "It Takes Two",
    externalId: "steam-1426210",
    steamAppId: 1426210,
    rating: 4.4,
    year: 2021,
    genres: ["Adventure", "Platformer"],
    platforms: ["PC", "PlayStation 5", "Xbox Series X|S"],
  },
  {
    title: "Control",
    externalId: "steam-870780",
    steamAppId: 870780,
    rating: 4.2,
    year: 2019,
    genres: ["Action", "Adventure", "Shooter"],
    platforms: ["PC", "PlayStation 5"],
  },
  {
    title: "Inscryption",
    externalId: "steam-1092790",
    steamAppId: 1092790,
    rating: 4.4,
    year: 2021,
    genres: ["Strategy", "Indie"],
    platforms: ["PC", "Nintendo Switch"],
  },
  {
    title: "Tunic",
    externalId: "steam-553420",
    steamAppId: 553420,
    rating: 4.3,
    year: 2022,
    genres: ["Adventure", "Indie"],
    platforms: ["PC", "Xbox Series X|S"],
  },
  {
    title: "Vampire Survivors",
    externalId: "steam-1794680",
    steamAppId: 1794680,
    rating: 4.3,
    year: 2022,
    genres: ["Action", "Indie"],
    platforms: ["PC", "Nintendo Switch"],
  },
  {
    title: "Animal Well",
    externalId: "steam-2183900",
    steamAppId: 2183900,
    rating: 4.4,
    year: 2024,
    genres: ["Adventure", "Indie", "Puzzle"],
    platforms: ["PC", "PlayStation 5", "Nintendo Switch"],
  },
  {
    title: "Balatro",
    externalId: "steam-2379780",
    steamAppId: 2379780,
    rating: 4.6,
    year: 2024,
    genres: ["Strategy", "Indie"],
    platforms: ["PC", "Nintendo Switch"],
  },
  {
    title: "Dave the Diver",
    externalId: "steam-1868140",
    steamAppId: 1868140,
    rating: 4.4,
    year: 2023,
    genres: ["Adventure", "Indie"],
    platforms: ["PC", "Nintendo Switch"],
  },
  {
    title: "Persona 5 Royal",
    externalId: "steam-1687950",
    steamAppId: 1687950,
    rating: 4.7,
    year: 2020,
    genres: ["RPG"],
    platforms: ["PC", "PlayStation 5", "Xbox Series X|S", "Nintendo Switch"],
  },
];

const achievements = [
  {
    code: "FIRST_GAME",
    title: "First Forge Entry",
    description: "Add your first game to the library.",
    xpReward: 50,
    criteria: { type: "library_count", min: 1 },
  },
  {
    code: "COMPLETIONIST_3",
    title: "Triple Clear",
    description: "Mark 3 games as completed.",
    xpReward: 150,
    criteria: { type: "status_count", status: "COMPLETED", min: 3 },
  },
  {
    code: "WISHLIST_5",
    title: "Wishlist Architect",
    description: "Keep 5 games on your wishlist.",
    xpReward: 100,
    criteria: { type: "status_count", status: "WISHLIST", min: 5 },
  },
  {
    code: "XP_500",
    title: "Forged in XP",
    description: "Reach 500 XP on your profile.",
    xpReward: 0,
    criteria: { type: "xp", min: 500 },
  },
  {
    code: "FAVORITE_1",
    title: "Personal Classic",
    description: "Favorite a game in your library.",
    xpReward: 40,
    criteria: { type: "favorite_count", min: 1 },
  },
];

async function main() {
  await prisma.activity.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.userGame.deleteMany();
  await prisma.gameGenre.deleteMany();
  await prisma.gamePlatform.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.game.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.platform.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash("Password123!", 12);

  const genreRecords = await Promise.all(
    genres.map((name) =>
      prisma.genre.create({
        data: { name, slug: slugify(name) },
      }),
    ),
  );
  const genreByName = Object.fromEntries(
    genreRecords.map((g) => [g.name, g.id]),
  );

  const platformRecords = await Promise.all(
    platforms.map((name) =>
      prisma.platform.create({
        data: { name, slug: slugify(name) },
      }),
    ),
  );
  const platformByName = Object.fromEntries(
    platformRecords.map((p) => [p.name, p.id]),
  );

  const gameRecords = [];
  for (const game of games) {
    const slug = slugify(game.title);
    const created = await prisma.game.create({
      data: {
        title: game.title,
        slug,
        externalId: game.externalId,
        rating: game.rating,
        coverUrl: game.steamAppId
          ? steamLibraryCover(game.steamAppId)
          : demoCoverUrl(slug),
        releaseDate: new Date(`${game.year}-01-01`),
        description: `${game.title} is part of the Vaultforge demo catalog.`,
        genres: {
          create: game.genres.map((name) => ({
            genreId: genreByName[name],
          })),
        },
        platforms: {
          create: game.platforms.map((name) => ({
            platformId: platformByName[name],
          })),
        },
      },
    });
    gameRecords.push(created);
  }

  const achievementRecords = await Promise.all(
    achievements.map((item) =>
      prisma.achievement.create({
        data: {
          code: item.code,
          title: item.title,
          description: item.description,
          xpReward: item.xpReward,
          criteria: item.criteria,
        },
      }),
    ),
  );

  const users = [
    {
      email: "admin@vaultforge.dev",
      username: "forgeadmin",
      displayName: "Forge Admin",
      role: Role.ADMIN,
      xp: 1200,
      bio: "Keeping the vault sharp.",
    },
    {
      email: "aria@vaultforge.dev",
      username: "aria",
      displayName: "Aria Nova",
      role: Role.USER,
      xp: 860,
      bio: "Always hunting the next indie gem.",
    },
    {
      email: "kai@vaultforge.dev",
      username: "kai",
      displayName: "Kai Drift",
      role: Role.USER,
      xp: 640,
      bio: "Soulsborne enjoyer. Backlog menace.",
    },
    {
      email: "mira@vaultforge.dev",
      username: "mira",
      displayName: "Mira Quill",
      role: Role.USER,
      xp: 420,
      bio: "Narrative RPGs and cozy evenings.",
    },
    {
      email: "jon@vaultforge.dev",
      username: "jon",
      displayName: "Jon Relay",
      role: Role.USER,
      xp: 310,
      bio: "Strategy nights and deckbuilders.",
    },
    {
      email: "lena@vaultforge.dev",
      username: "lena",
      displayName: "Lena Circuit",
      role: Role.USER,
      xp: 505,
      bio: "Platformers and perfectionism.",
    },
  ];

  const createdUsers = [];
  for (const user of users) {
    const created = await prisma.user.create({
      data: {
        email: user.email,
        passwordHash,
        role: user.role,
        name: user.displayName,
        profile: {
          create: {
            username: user.username,
            displayName: user.displayName,
            bio: user.bio,
            xp: user.xp,
            isPublic: true,
          },
        },
      },
      include: { profile: true },
    });
    createdUsers.push(created);
  }

  const [admin, aria, kai, mira, jon, lena] = createdUsers;

  const librarySeed: Array<{
    userId: string;
    gameIndex: number;
    status: LibraryStatus;
    favorited?: boolean;
    rating?: number;
  }> = [
    {
      userId: aria.id,
      gameIndex: 0,
      status: LibraryStatus.COMPLETED,
      favorited: true,
      rating: 10,
    },
    {
      userId: aria.id,
      gameIndex: 1,
      status: LibraryStatus.PLAYING,
      favorited: true,
      rating: 9,
    },
    { userId: aria.id, gameIndex: 5, status: LibraryStatus.BACKLOG },
    { userId: aria.id, gameIndex: 29, status: LibraryStatus.WISHLIST },
    { userId: aria.id, gameIndex: 12, status: LibraryStatus.WISHLIST },
    { userId: kai.id, gameIndex: 4, status: LibraryStatus.PLAYING, rating: 9 },
    {
      userId: kai.id,
      gameIndex: 17,
      status: LibraryStatus.COMPLETED,
      favorited: true,
      rating: 10,
    },
    {
      userId: kai.id,
      gameIndex: 3,
      status: LibraryStatus.COMPLETED,
      rating: 9,
    },
    { userId: kai.id, gameIndex: 13, status: LibraryStatus.BACKLOG },
    {
      userId: mira.id,
      gameIndex: 6,
      status: LibraryStatus.COMPLETED,
      favorited: true,
      rating: 10,
    },
    { userId: mira.id, gameIndex: 31, status: LibraryStatus.PLAYING },
    { userId: mira.id, gameIndex: 19, status: LibraryStatus.WISHLIST },
    {
      userId: jon.id,
      gameIndex: 8,
      status: LibraryStatus.COMPLETED,
      rating: 9,
    },
    { userId: jon.id, gameIndex: 15, status: LibraryStatus.PLAYING },
    { userId: jon.id, gameIndex: 25, status: LibraryStatus.WISHLIST },
    {
      userId: lena.id,
      gameIndex: 2,
      status: LibraryStatus.COMPLETED,
      favorited: true,
      rating: 10,
    },
    {
      userId: lena.id,
      gameIndex: 9,
      status: LibraryStatus.COMPLETED,
      rating: 9,
    },
    { userId: lena.id, gameIndex: 14, status: LibraryStatus.PLAYED },
    { userId: admin.id, gameIndex: 12, status: LibraryStatus.PLAYING },
    {
      userId: admin.id,
      gameIndex: 0,
      status: LibraryStatus.COMPLETED,
      rating: 9,
    },
  ];

  for (const entry of librarySeed) {
    await prisma.userGame.create({
      data: {
        userId: entry.userId,
        gameId: gameRecords[entry.gameIndex].id,
        status: entry.status,
        favorited: entry.favorited ?? false,
        rating: entry.rating,
      },
    });
  }

  await prisma.userAchievement.createMany({
    data: [
      {
        userId: aria.id,
        achievementId: achievementRecords[0].id,
        progress: 1,
        unlockedAt: new Date(),
      },
      {
        userId: kai.id,
        achievementId: achievementRecords[0].id,
        progress: 1,
        unlockedAt: new Date(),
      },
      {
        userId: kai.id,
        achievementId: achievementRecords[1].id,
        progress: 0.66,
      },
      {
        userId: lena.id,
        achievementId: achievementRecords[0].id,
        progress: 1,
        unlockedAt: new Date(),
      },
      {
        userId: lena.id,
        achievementId: achievementRecords[4].id,
        progress: 1,
        unlockedAt: new Date(),
      },
    ],
  });

  await prisma.activity.createMany({
    data: [
      {
        actorId: aria.id,
        type: "LIBRARY_ADD",
        metadata: { gameSlug: "hollow-knight", status: "COMPLETED" },
      },
      {
        actorId: kai.id,
        type: "LIBRARY_STATUS",
        metadata: { gameSlug: "elden-ring", status: "PLAYING" },
      },
      {
        actorId: mira.id,
        type: "ACHIEVEMENT_UNLOCK",
        metadata: { code: "FIRST_GAME" },
      },
      {
        actorId: jon.id,
        type: "LIBRARY_ADD",
        metadata: { gameSlug: "slay-the-spire", status: "COMPLETED" },
      },
      {
        actorId: lena.id,
        type: "LIBRARY_ADD",
        metadata: { gameSlug: "celeste", status: "COMPLETED" },
      },
      {
        actorId: admin.id,
        type: "LIBRARY_ADD",
        metadata: { gameSlug: "baldur-s-gate-3", status: "PLAYING" },
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Demo password for all seeded users: Password123!");
  console.log("Admin: admin@vaultforge.dev / forgeadmin");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
