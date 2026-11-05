import { ConflictException, Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { and, asc, eq } from "drizzle-orm";
import { DbService } from "../db/db.service";
import {
  exercises,
  programmeDays,
  programmeExercises,
  programmes,
  profiles,
  userPlanDays,
  userPlanExercises,
  userPlans,
  users,
} from "../db/schema";
import { chooseProgrammeSlug, exerciseSeeds, programmeSeeds } from "./catalog";

const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

@Injectable()
export class PlanService implements OnModuleInit {
  constructor(
    private readonly dbService: DbService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seed();
    const adminEmail = this.config.get<string>("ADMIN_EMAIL")?.trim().toLowerCase();
    if (!adminEmail) return;
    await this.dbService.db.update(users).set({ role: "admin" }).where(eq(users.email, adminEmail));
  }

  async listProgrammes() {
    return this.dbService.db.select().from(programmes).orderBy(asc(programmes.name));
  }

  async getExercise(id: string) {
    const [exercise] = await this.dbService.db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
    if (!exercise) throw new NotFoundException("Exercise not found.");
    const alternatives = exercise.alternativeSlugs.length
      ? await this.dbService.db.select({ id: exercises.id, name: exercises.name, slug: exercises.slug }).from(exercises)
      : [];
    return {
      ...exercise,
      alternatives: alternatives.filter((item) => exercise.alternativeSlugs.includes(item.slug)),
    };
  }

  async listExercises() {
    return this.dbService.db.select().from(exercises).orderBy(asc(exercises.name));
  }

  async getPlan(userId: string) {
    await this.assignIfMissing(userId);
    const [plan] = await this.dbService.db
      .select()
      .from(userPlans)
      .where(and(eq(userPlans.userId, userId), eq(userPlans.active, true)))
      .limit(1);
    if (!plan) throw new NotFoundException("No plan yet.");

    const days = await this.dbService.db
      .select()
      .from(userPlanDays)
      .where(eq(userPlanDays.planId, plan.id))
      .orderBy(asc(userPlanDays.position));

    const detailed = [];
    for (const day of days) {
      const rows = await this.dbService.db
        .select({
          id: exercises.id,
          name: exercises.name,
          primaryMuscles: exercises.primaryMuscles,
          demoUrl: exercises.demoUrl,
          sets: userPlanExercises.sets,
          repsMin: userPlanExercises.repsMin,
          repsMax: userPlanExercises.repsMax,
          restSeconds: userPlanExercises.restSeconds,
          repUnit: userPlanExercises.repUnit,
          position: userPlanExercises.position,
        })
        .from(userPlanExercises)
        .innerJoin(exercises, eq(exercises.id, userPlanExercises.exerciseId))
        .where(eq(userPlanExercises.dayId, day.id))
        .orderBy(asc(userPlanExercises.position));
      detailed.push({ ...day, exercises: rows, minutes: estimateMinutes(rows) });
    }

    return { id: plan.id, name: plan.name, days: detailed };
  }

  async assignIfMissing(userId: string) {
    const [existing] = await this.dbService.db
      .select({ id: userPlans.id })
      .from(userPlans)
      .where(and(eq(userPlans.userId, userId), eq(userPlans.active, true)))
      .limit(1);
    if (existing) return;
    const profile = await this.profileFor(userId);
    if (!profile?.onboardingComplete) return;
    await this.assignSlug(userId, chooseProgrammeSlug(profile));
  }

  async assignSlug(userId: string, slug: string) {
    const [programme] = await this.dbService.db.select().from(programmes).where(eq(programmes.slug, slug)).limit(1);
    if (!programme) throw new NotFoundException("Programme not found.");
    const profile = await this.profileFor(userId);
    if (!profile) throw new NotFoundException("Profile not found.");

    const sessions = await this.dbService.db
      .select()
      .from(programmeDays)
      .where(eq(programmeDays.programmeId, programme.id))
      .orderBy(asc(programmeDays.position));

    const sessionExercises = new Map<string, (typeof programmeExercises.$inferSelect)[]>();
    for (const session of sessions) {
      const rows = await this.dbService.db
        .select()
        .from(programmeExercises)
        .where(eq(programmeExercises.dayId, session.id))
        .orderBy(asc(programmeExercises.position));
      sessionExercises.set(session.id, rows);
    }

    await this.dbService.db.update(userPlans).set({ active: false }).where(eq(userPlans.userId, userId));
    const [plan] = await this.dbService.db
      .insert(userPlans)
      .values({ userId, programmeId: programme.id, name: programme.name, active: true })
      .returning();

    const training = weekdays.filter((day) => profile.trainingDays.includes(day));
    let sessionIndex = 0;
    for (const [position, weekday] of weekdays.entries()) {
      const trains = training.includes(weekday) && sessions.length > 0;
      const session = trains ? sessions[sessionIndex % sessions.length] : undefined;
      if (trains) sessionIndex += 1;
      const [day] = await this.dbService.db
        .insert(userPlanDays)
        .values({
          planId: plan.id,
          weekday,
          title: session?.title ?? "Rest",
          isRest: !session,
          position,
        })
        .returning();
      if (!session) continue;
      const rows = sessionExercises.get(session.id) ?? [];
      if (rows.length === 0) continue;
      await this.dbService.db.insert(userPlanExercises).values(
        rows.map((row) => ({
          dayId: day.id,
          exerciseId: row.exerciseId,
          position: row.position,
          sets: row.sets,
          repsMin: row.repsMin,
          repsMax: row.repsMax,
          restSeconds: row.restSeconds,
          repUnit: row.repUnit,
        })),
      );
    }

    return this.getPlan(userId);
  }

  async createExercise(input: {
    name: string;
    difficulty: string;
    primaryMuscles: string[];
    equipment: string[];
    instructions: string[];
    mistakes: string[];
  }) {
    const slug = input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const [created] = await this.dbService.db
      .insert(exercises)
      .values({
        slug,
        name: input.name.trim(),
        difficulty: input.difficulty,
        primaryMuscles: input.primaryMuscles,
        secondaryMuscles: [],
        equipment: input.equipment,
        instructions: input.instructions,
        mistakes: input.mistakes,
        alternativeSlugs: [],
      })
      .returning();
    return created;
  }

  async updateExercise(id: string, input: { name: string; instructions: string[]; mistakes: string[] }) {
    const [updated] = await this.dbService.db
      .update(exercises)
      .set({ name: input.name.trim(), instructions: input.instructions, mistakes: input.mistakes })
      .where(eq(exercises.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Exercise not found.");
    return updated;
  }

  async deleteExercise(id: string) {
    try {
      const [deleted] = await this.dbService.db.delete(exercises).where(eq(exercises.id, id)).returning();
      if (!deleted) throw new NotFoundException("Exercise not found.");
      return { ok: true };
    } catch (error) {
      const code = (error as { code?: string; cause?: { code?: string } }).code ?? (error as { cause?: { code?: string } }).cause?.code;
      if (code === "23503") throw new ConflictException("That exercise is used in a programme.");
      throw error;
    }
  }

  async renameProgramme(id: string, name: string) {
    const [updated] = await this.dbService.db.update(programmes).set({ name: name.trim() }).where(eq(programmes.id, id)).returning();
    if (!updated) throw new NotFoundException("Programme not found.");
    return updated;
  }

  private async profileFor(userId: string) {
    const [profile] = await this.dbService.db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    return profile;
  }

  private async seed() {
    const [existing] = await this.dbService.db.select({ id: exercises.id }).from(exercises).limit(1);
    if (existing) return;

    const ids = new Map<string, string>();
    for (const exercise of exerciseSeeds) {
      const [row] = await this.dbService.db.insert(exercises).values(exercise).returning({ id: exercises.id, slug: exercises.slug });
      ids.set(row.slug, row.id);
    }

    for (const programme of programmeSeeds) {
      const [saved] = await this.dbService.db
        .insert(programmes)
        .values({
          slug: programme.slug,
          name: programme.name,
          goal: programme.goal,
          location: programme.location,
          description: programme.description,
        })
        .returning();
      for (const [position, session] of programme.sessions.entries()) {
        const [day] = await this.dbService.db
          .insert(programmeDays)
          .values({ programmeId: saved.id, position, title: session.title })
          .returning();
        await this.dbService.db.insert(programmeExercises).values(
          session.exercises.map((item, index) => ({
            dayId: day.id,
            exerciseId: ids.get(item.slug) ?? missing(item.slug),
            position: index,
            sets: item.sets,
            repsMin: item.repsMin,
            repsMax: item.repsMax,
            restSeconds: item.restSeconds ?? 90,
            repUnit: item.repUnit ?? "reps",
          })),
        );
      }
    }
  }
}

function missing(slug: string): never {
  throw new Error(`Missing exercise slug ${slug}`);
}

function estimateMinutes(rows: { sets: number; restSeconds: number }[]) {
  const seconds = rows.reduce((sum, row) => sum + row.sets * (row.restSeconds + 40), 0);
  return Math.max(15, Math.round(seconds / 60));
}
