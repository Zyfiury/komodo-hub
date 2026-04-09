import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/** Mirror src/lib/constants strings for seed (avoid TS path issues in prisma/). */
const OrgType = { FOUNDATION: "FOUNDATION", SCHOOL: "SCHOOL", COMMUNITY: "COMMUNITY" } as const;
const OrgStatus = { ACTIVE: "ACTIVE", ARCHIVED: "ARCHIVED", SUSPENDED: "SUSPENDED" } as const;
const UserRole = {
  FOUNDATION_ADMIN: "FOUNDATION_ADMIN",
  SCHOOL_ADMIN: "SCHOOL_ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  COMMUNITY_ADMIN: "COMMUNITY_ADMIN",
  COMMUNITY_MEMBER: "COMMUNITY_MEMBER",
} as const;
const UserStatus = { ACTIVE: "ACTIVE", INACTIVE: "INACTIVE" } as const;
const PublicationState = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  FLAGGED: "FLAGGED",
  REJECTED: "REJECTED",
} as const;
const SightingState = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
const CampaignStatus = { DRAFT: "DRAFT", PUBLISHED: "PUBLISHED", CLOSED: "CLOSED" } as const;
const SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  PAST_DUE: "PAST_DUE",
  CANCELLED: "CANCELLED",
  TRIAL: "TRIAL",
} as const;
const LibraryItemType = {
  ARTICLE: "ARTICLE",
  ESSAY: "ESSAY",
  REPORT: "REPORT",
  UPLOAD: "UPLOAD",
  CONTRIBUTION: "CONTRIBUTION",
} as const;
const LibraryAudience = { PUBLIC: "PUBLIC", SCHOOL_PUBLIC: "SCHOOL_PUBLIC", ORG_INTERNAL: "ORG_INTERNAL" } as const;
const SubmissionReviewState = { PENDING: "PENDING", REVIEWED: "REVIEWED", NEEDS_REVISION: "NEEDS_REVISION" } as const;

const prisma = new PrismaClient();

const DEV_PASSWORD = "KomodoHub!Dev2026";

function hash(plain: string) {
  return bcrypt.hashSync(plain, 12);
}

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.telemetryEvent.deleteMany();
  await prisma.message.deleteMany();
  await prisma.campaignParticipation.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.teacherNote.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.activityAssignment.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.programme.deleteMany();
  await prisma.accessCode.deleteMany();
  await prisma.libraryItem.deleteMany();
  await prisma.sightingReport.deleteMany();
  await prisma.species.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organisation.deleteMany();

  const foundation = await prisma.organisation.create({
    data: {
      name: "Komodo Conservation Foundation",
      slug: "komodo-foundation",
      type: OrgType.FOUNDATION,
      status: OrgStatus.ACTIVE,
      publicProfile: true,
      description: "National coordination for Komodo Hub conservation education.",
    },
  });

  const school = await prisma.organisation.create({
    data: {
      name: "Sekolah Alam Nusa Tenggara",
      slug: "sekolah-alam-demo",
      type: OrgType.SCHOOL,
      status: OrgStatus.ACTIVE,
      publicProfile: true,
      description: "Pilot school for Komodo Hub learning programmes.",
    },
  });

  const community = await prisma.organisation.create({
    data: {
      name: "Komunitas Penjaga Pulau",
      slug: "komunitas-konservasi",
      type: OrgType.COMMUNITY,
      status: OrgStatus.ACTIVE,
      publicProfile: true,
      description: "Community stewards reporting wildlife and publishing approved stories.",
    },
  });

  const pw = hash(DEV_PASSWORD);

  const foundationAdmin = await prisma.user.create({
    data: {
      email: "foundation.admin@komodohub.local",
      passwordHash: pw,
      name: "Foundation Admin",
      role: UserRole.FOUNDATION_ADMIN,
      status: UserStatus.ACTIVE,
      organisationId: foundation.id,
    },
  });

  const schoolAdmin = await prisma.user.create({
    data: {
      email: "school.admin@komodohub.local",
      passwordHash: pw,
      name: "School Admin",
      role: UserRole.SCHOOL_ADMIN,
      status: UserStatus.ACTIVE,
      organisationId: school.id,
    },
  });

  const teacher = await prisma.user.create({
    data: {
      email: "teacher@komodohub.local",
      passwordHash: pw,
      name: "Ibu Sari",
      role: UserRole.TEACHER,
      status: UserStatus.ACTIVE,
      organisationId: school.id,
    },
  });

  const student1 = await prisma.user.create({
    data: {
      email: "student1@komodohub.local",
      passwordHash: pw,
      name: "Andi",
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      organisationId: school.id,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: "student2@komodohub.local",
      passwordHash: pw,
      name: "Dewi",
      role: UserRole.STUDENT,
      status: UserStatus.ACTIVE,
      organisationId: school.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "community.admin@komodohub.local",
      passwordHash: pw,
      name: "Pak Made",
      role: UserRole.COMMUNITY_ADMIN,
      status: UserStatus.ACTIVE,
      organisationId: community.id,
    },
  });

  const member1 = await prisma.user.create({
    data: {
      email: "member1@komodohub.local",
      passwordHash: pw,
      name: "Ketut",
      role: UserRole.COMMUNITY_MEMBER,
      status: UserStatus.ACTIVE,
      organisationId: community.id,
    },
  });

  const member2 = await prisma.user.create({
    data: {
      email: "member2@komodohub.local",
      passwordHash: pw,
      name: "Nyoman",
      role: UserRole.COMMUNITY_MEMBER,
      status: UserStatus.ACTIVE,
      organisationId: community.id,
    },
  });

  const accessCode = await prisma.accessCode.create({
    data: {
      code: "SCHOOL-DEMO-2026",
      schoolOrganisationId: school.id,
      createdById: schoolAdmin.id,
      maxUses: 100,
      usedCount: 2,
    },
  });

  const speciesKomodo = await prisma.species.create({
    data: {
      name: "Komodo dragon",
      scientificName: "Varanus komodoensis",
      description: "The largest living lizard, endemic to Indonesian islands.",
      conservationNotes: "Vulnerable — protected under Indonesian law.",
      publicationState: PublicationState.APPROVED,
      reviewedById: foundationAdmin.id,
      reviewedAt: new Date(),
    },
  });

  await prisma.species.create({
    data: {
      name: "Flores hawk",
      scientificName: "Nisaetus floris",
      description: "Rare raptor of Flores and nearby islands.",
      publicationState: PublicationState.PENDING,
    },
  });

  await prisma.species.create({
    data: {
      name: "Sunda deer",
      scientificName: "Rusa timorensis",
      description: "Important prey species within Komodo National Park.",
      publicationState: PublicationState.APPROVED,
      reviewedById: foundationAdmin.id,
      reviewedAt: new Date(),
    },
  });

  const programme = await prisma.programme.create({
    data: {
      organisationId: school.id,
      ownerId: teacher.id,
      title: "Island ecology fundamentals",
      description: "Core programme for new secondary students.",
    },
  });

  const act1 = await prisma.activity.create({
    data: {
      programmeId: programme.id,
      title: "Habitat observation journal",
      description: "Document three micro-habitats near your school.",
      dueDate: new Date(Date.now() + 7 * 864e5),
    },
  });

  const act2 = await prisma.activity.create({
    data: {
      programmeId: programme.id,
      title: "Species fact sheet",
      description: "Choose one approved species and write a one-page fact sheet.",
      dueDate: new Date(Date.now() + 14 * 864e5),
    },
  });

  const asg1 = await prisma.activityAssignment.create({
    data: { activityId: act1.id, studentId: student1.id },
  });
  const asg2 = await prisma.activityAssignment.create({
    data: { activityId: act1.id, studentId: student2.id },
  });
  const asg3 = await prisma.activityAssignment.create({
    data: { activityId: act2.id, studentId: student1.id },
  });
  await prisma.activityAssignment.create({
    data: { activityId: act2.id, studentId: student2.id },
  });

  const sub1 = await prisma.submission.create({
    data: {
      assignmentId: asg1.id,
      studentId: student1.id,
      content: "I observed coastal scrub, mangrove edge, and dry monsoon forest.",
      reviewState: SubmissionReviewState.REVIEWED,
      teacherFeedback: "Excellent detail on plant layering. Add one animal sign next time.",
    },
  });

  await prisma.teacherNote.create({
    data: {
      submissionId: sub1.id,
      teacherId: teacher.id,
      body: "Reminder: cite field date on each entry.",
    },
  });

  await prisma.submission.create({
    data: {
      assignmentId: asg2.id,
      studentId: student2.id,
      content: "Draft: mangrove roots had mudskippers and crabs.",
      reviewState: SubmissionReviewState.PENDING,
    },
  });

  await prisma.submission.create({
    data: {
      assignmentId: asg3.id,
      studentId: student1.id,
      content: "Fact sheet draft for Varanus komodoensis.",
      reviewState: SubmissionReviewState.NEEDS_REVISION,
      teacherFeedback: "Add diet and range map reference.",
    },
  });

  await prisma.sightingReport.create({
    data: {
      reporterId: student1.id,
      organisationId: school.id,
      speciesId: speciesKomodo.id,
      observedAt: new Date(),
      locationLabel: "Coastal trail sector B (approximate)",
      description: "Adult individual basking near ranger post.",
      workflowState: SightingState.PENDING,
    },
  });

  await prisma.sightingReport.create({
    data: {
      reporterId: member1.id,
      organisationId: community.id,
      speciesFreeText: "Sea eagle (distant)",
      observedAt: new Date(Date.now() - 864e5),
      locationLabel: "North bay viewpoint",
      description: "Two individuals circling.",
      workflowState: SightingState.APPROVED,
      reviewedById: foundationAdmin.id,
      reviewedAt: new Date(),
      reviewNote: "Geolocation vague; approved for education use.",
    },
  });

  await prisma.libraryItem.create({
    data: {
      organisationId: school.id,
      authorId: teacher.id,
      type: LibraryItemType.ARTICLE,
      title: "How we run weekly field prep",
      body: "Checklist for teachers before taking students outdoors.",
      audience: LibraryAudience.SCHOOL_PUBLIC,
      state: PublicationState.APPROVED,
      reviewedById: foundationAdmin.id,
      reviewedAt: new Date(),
    },
  });

  const libComm = await prisma.libraryItem.create({
    data: {
      organisationId: community.id,
      authorId: member1.id,
      type: LibraryItemType.CONTRIBUTION,
      title: "Cleaning the mangrove edge",
      body: "Community notes from last month’s shoreline activity.",
      audience: LibraryAudience.PUBLIC,
      state: PublicationState.APPROVED,
      reviewedById: foundationAdmin.id,
      reviewedAt: new Date(),
    },
  });

  await prisma.libraryItem.create({
    data: {
      organisationId: community.id,
      authorId: member2.id,
      type: LibraryItemType.ESSAY,
      title: "Draft: reef noise at night",
      body: "Work in progress — not for publication.",
      audience: LibraryAudience.PUBLIC,
      state: PublicationState.DRAFT,
    },
  });

  const campaign = await prisma.campaign.create({
    data: {
      title: "Plastic-free shoreline month",
      slug: "plastic-free-shoreline",
      summary: "Schools and communities reduce single-use plastics during April.",
      body: "Join coordinated clean-ups and report wildlife along the way.",
      status: CampaignStatus.PUBLISHED,
      isPublic: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 864e5),
      createdById: foundationAdmin.id,
    },
  });

  await prisma.campaignParticipation.create({
    data: { campaignId: campaign.id, organisationId: school.id },
  });
  await prisma.campaignParticipation.create({
    data: { campaignId: campaign.id, organisationId: community.id },
  });

  await prisma.subscription.create({
    data: {
      organisationId: school.id,
      status: SubscriptionStatus.ACTIVE,
      planLabel: "school_standard",
      renewsAt: new Date(Date.now() + 365 * 864e5),
    },
  });

  await prisma.subscription.create({
    data: {
      organisationId: community.id,
      status: SubscriptionStatus.TRIAL,
      planLabel: "community_starter",
    },
  });

  await prisma.telemetryEvent.createMany({
    data: [
      { type: "page.view", payload: JSON.stringify({ path: "/library" }), organisationId: null },
      { type: "dashboard.open", payload: JSON.stringify({ role: "TEACHER" }), organisationId: school.id, userId: teacher.id },
      { type: "submission.created", payload: JSON.stringify({ count: 1 }), organisationId: school.id, userId: student1.id },
      { type: "moderation.item_approved", payload: JSON.stringify({ kind: "library" }), organisationId: foundation.id, userId: foundationAdmin.id },
    ],
  });

  await prisma.message.create({
    data: {
      organisationId: school.id,
      fromUserId: teacher.id,
      toUserId: student1.id,
      body: "Please upload your revised journal by Friday.",
    },
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: foundationAdmin.id,
        action: "species.approve",
        targetType: "Species",
        targetId: speciesKomodo.id,
        metadata: JSON.stringify({ state: PublicationState.APPROVED }),
      },
      {
        actorId: foundationAdmin.id,
        action: "library.approve",
        targetType: "LibraryItem",
        targetId: libComm.id,
        metadata: JSON.stringify({ title: libComm.title }),
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Organisations:", foundation.slug, school.slug, community.slug);
  console.log("Student access code (demo):", accessCode.code);
  console.log("All seeded users share password:", DEV_PASSWORD);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
