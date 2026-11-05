import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { DbService } from "../db/db.service";
import {
  exercises,
  userPlanDays,
  userPlanExercises,
  userPlans,
  workoutSessionExercises,
  workoutSessions,
  workoutSets,
} from "../db/schema";
import type { SkipExerciseDto, StartWorkoutDto, SyncWorkoutDto, UpdateSetDto } from "./dto";

export type WorkoutSetView = {
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  completed: boolean;
};

export type WorkoutExerciseView = {
  id: string;
  exerciseId: string;
  name: string;
  primaryMuscles: string[];
  demoUrl: string | null;
  position: number;
  targetSets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  repUnit: string;
  skipped: boolean;
  skipReason: string | null;
  suggestedWeightKg: number | null;
  sets: WorkoutSetView[];
};

export type WorkoutSessionView = {
  id: string;
  clientId: string | null;
  planDayId: string | null;
  weekday: string;
  title: string;
  gymMode: boolean;
  status: "in_progress" | "completed" | "abandoned";
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number | null;
  totalSets: number;
  completedSets: number;
  totalVolumeKg: number;
  exercises: WorkoutExerciseView[];
};

@Injectable()
export class WorkoutService {
  constructor(private readonly dbService: DbService) {}

  async start(userId: string, body: StartWorkoutDto) {
    if (body.clientId) {
      const [existing] = await this.dbService.db
        .select()
        .from(workoutSessions)
        .where(and(eq(workoutSessions.clientId, body.clientId), eq(workoutSessions.userId, userId)))
        .limit(1);
      if (existing) return this.getSession(userId, existing.id);
    }

    const active = await this.findActiveSession(userId);
    if (active) return this.getSession(userId, active.id);

    const [day] = await this.dbService.db
      .select({
        id: userPlanDays.id,
        weekday: userPlanDays.weekday,
        title: userPlanDays.title,
        isRest: userPlanDays.isRest,
        planId: userPlanDays.planId,
      })
      .from(userPlanDays)
      .innerJoin(userPlans, eq(userPlans.id, userPlanDays.planId))
      .where(and(eq(userPlanDays.id, body.planDayId), eq(userPlans.userId, userId), eq(userPlans.active, true)))
      .limit(1);

    if (!day) throw new NotFoundException("Training day not found.");
    if (day.isRest) throw new BadRequestException("Today is a rest day.");

    const planRows = await this.dbService.db
      .select({
        exerciseId: userPlanExercises.exerciseId,
        position: userPlanExercises.position,
        sets: userPlanExercises.sets,
        repsMin: userPlanExercises.repsMin,
        repsMax: userPlanExercises.repsMax,
        restSeconds: userPlanExercises.restSeconds,
        repUnit: userPlanExercises.repUnit,
      })
      .from(userPlanExercises)
      .where(eq(userPlanExercises.dayId, day.id))
      .orderBy(asc(userPlanExercises.position));

    if (!planRows.length) throw new BadRequestException("This day has no exercises.");

    const [session] = await this.dbService.db
      .insert(workoutSessions)
      .values({
        userId,
        planDayId: day.id,
        clientId: body.clientId ?? null,
        weekday: day.weekday,
        title: day.title,
      })
      .returning();

    for (const row of planRows) {
      const suggested = await this.suggestWeightKg(userId, row.exerciseId);
      const [entry] = await this.dbService.db
        .insert(workoutSessionExercises)
        .values({
          sessionId: session.id,
          exerciseId: row.exerciseId,
          position: row.position,
          targetSets: row.sets,
          repsMin: row.repsMin,
          repsMax: row.repsMax,
          restSeconds: row.restSeconds,
          repUnit: row.repUnit,
          suggestedWeightKg: suggested,
        })
        .returning();

      await this.dbService.db.insert(workoutSets).values(
        Array.from({ length: row.sets }, (_, index) => ({
          sessionExerciseId: entry.id,
          setNumber: index + 1,
          weightKg: suggested,
          reps: row.repsMax,
        })),
      );
    }

    return this.getSession(userId, session.id);
  }

  async getActive(userId: string) {
    const active = await this.findActiveSession(userId);
    if (!active) return null;
    return this.getSession(userId, active.id);
  }

  async listHistory(userId: string, limit = 20) {
    const rows = await this.dbService.db
      .select()
      .from(workoutSessions)
      .where(and(eq(workoutSessions.userId, userId), eq(workoutSessions.status, "completed")))
      .orderBy(desc(workoutSessions.completedAt))
      .limit(limit);

    const summaries = [];
    for (const row of rows) {
      const detail = await this.getSession(userId, row.id);
      summaries.push({
        id: detail.id,
        title: detail.title,
        weekday: detail.weekday,
        completedAt: detail.completedAt,
        durationSeconds: detail.durationSeconds,
        totalSets: detail.completedSets,
        totalVolumeKg: detail.totalVolumeKg,
      });
    }
    return summaries;
  }

  async getSession(userId: string, sessionId: string): Promise<WorkoutSessionView> {
    const [session] = await this.dbService.db
      .select()
      .from(workoutSessions)
      .where(and(eq(workoutSessions.id, sessionId), eq(workoutSessions.userId, userId)))
      .limit(1);
    if (!session) throw new NotFoundException("Workout not found.");

    const entries = await this.dbService.db
      .select({
        id: workoutSessionExercises.id,
        exerciseId: workoutSessionExercises.exerciseId,
        position: workoutSessionExercises.position,
        targetSets: workoutSessionExercises.targetSets,
        repsMin: workoutSessionExercises.repsMin,
        repsMax: workoutSessionExercises.repsMax,
        restSeconds: workoutSessionExercises.restSeconds,
        repUnit: workoutSessionExercises.repUnit,
        skipped: workoutSessionExercises.skipped,
        skipReason: workoutSessionExercises.skipReason,
        suggestedWeightKg: workoutSessionExercises.suggestedWeightKg,
        name: exercises.name,
        primaryMuscles: exercises.primaryMuscles,
        demoUrl: exercises.demoUrl,
      })
      .from(workoutSessionExercises)
      .innerJoin(exercises, eq(exercises.id, workoutSessionExercises.exerciseId))
      .where(eq(workoutSessionExercises.sessionId, session.id))
      .orderBy(asc(workoutSessionExercises.position));

    const entryIds = entries.map((item) => item.id);
    const setRows = entryIds.length
      ? await this.dbService.db
          .select()
          .from(workoutSets)
          .where(inArray(workoutSets.sessionExerciseId, entryIds))
          .orderBy(asc(workoutSets.setNumber))
      : [];

    const setsByEntry = new Map<string, WorkoutSetView[]>();
    for (const set of setRows) {
      const list = setsByEntry.get(set.sessionExerciseId) ?? [];
      list.push({
        setNumber: set.setNumber,
        weightKg: set.weightKg,
        reps: set.reps,
        completed: set.completed,
      });
      setsByEntry.set(set.sessionExerciseId, list);
    }

    const exercisesView: WorkoutExerciseView[] = entries.map((entry) => ({
      id: entry.id,
      exerciseId: entry.exerciseId,
      name: entry.name,
      primaryMuscles: entry.primaryMuscles,
      demoUrl: entry.demoUrl,
      position: entry.position,
      targetSets: entry.targetSets,
      repsMin: entry.repsMin,
      repsMax: entry.repsMax,
      restSeconds: entry.restSeconds,
      repUnit: entry.repUnit,
      skipped: entry.skipped,
      skipReason: entry.skipReason,
      suggestedWeightKg: entry.suggestedWeightKg,
      sets: setsByEntry.get(entry.id) ?? [],
    }));

    const totals = this.totals(exercisesView);
    return {
      id: session.id,
      clientId: session.clientId,
      planDayId: session.planDayId,
      weekday: session.weekday,
      title: session.title,
      gymMode: session.gymMode,
      status: session.status,
      startedAt: session.startedAt.toISOString(),
      completedAt: session.completedAt?.toISOString() ?? null,
      durationSeconds: session.durationSeconds,
      totalSets: totals.totalSets,
      completedSets: totals.completedSets,
      totalVolumeKg: totals.totalVolumeKg,
      exercises: exercisesView,
    };
  }

  async updateSession(userId: string, sessionId: string, gymMode?: boolean) {
    await this.requireInProgress(userId, sessionId);
    if (gymMode === undefined) return this.getSession(userId, sessionId);
    await this.dbService.db
      .update(workoutSessions)
      .set({ gymMode })
      .where(and(eq(workoutSessions.id, sessionId), eq(workoutSessions.userId, userId)));
    return this.getSession(userId, sessionId);
  }

  async updateSet(
    userId: string,
    sessionId: string,
    sessionExerciseId: string,
    setNumber: number,
    body: UpdateSetDto,
  ) {
    await this.requireInProgress(userId, sessionId);
    const [entry] = await this.dbService.db
      .select({ id: workoutSessionExercises.id })
      .from(workoutSessionExercises)
      .where(
        and(
          eq(workoutSessionExercises.id, sessionExerciseId),
          eq(workoutSessionExercises.sessionId, sessionId),
        ),
      )
      .limit(1);
    if (!entry) throw new NotFoundException("Exercise not found in this workout.");

    const [set] = await this.dbService.db
      .select()
      .from(workoutSets)
      .where(
        and(eq(workoutSets.sessionExerciseId, sessionExerciseId), eq(workoutSets.setNumber, setNumber)),
      )
      .limit(1);
    if (!set) throw new NotFoundException("Set not found.");

    const completed = body.completed ?? set.completed;
    await this.dbService.db
      .update(workoutSets)
      .set({
        weightKg: body.weightKg === undefined ? set.weightKg : body.weightKg,
        reps: body.reps === undefined ? set.reps : body.reps,
        completed,
        completedAt: completed ? new Date() : null,
      })
      .where(eq(workoutSets.id, set.id));

    return this.getSession(userId, sessionId);
  }

  async skipExercise(
    userId: string,
    sessionId: string,
    sessionExerciseId: string,
    body: SkipExerciseDto,
  ) {
    await this.requireInProgress(userId, sessionId);
    const [entry] = await this.dbService.db
      .select()
      .from(workoutSessionExercises)
      .where(
        and(
          eq(workoutSessionExercises.id, sessionExerciseId),
          eq(workoutSessionExercises.sessionId, sessionId),
        ),
      )
      .limit(1);
    if (!entry) throw new NotFoundException("Exercise not found in this workout.");

    if (body.replaceExerciseId) {
      const [replacement] = await this.dbService.db
        .select({ id: exercises.id })
        .from(exercises)
        .where(eq(exercises.id, body.replaceExerciseId))
        .limit(1);
      if (!replacement) throw new NotFoundException("Replacement exercise not found.");

      const suggested = await this.suggestWeightKg(userId, body.replaceExerciseId);
      await this.dbService.db
        .update(workoutSessionExercises)
        .set({
          exerciseId: body.replaceExerciseId,
          skipped: false,
          skipReason: body.reason,
          suggestedWeightKg: suggested,
        })
        .where(eq(workoutSessionExercises.id, sessionExerciseId));

      await this.dbService.db.delete(workoutSets).where(eq(workoutSets.sessionExerciseId, sessionExerciseId));
      await this.dbService.db.insert(workoutSets).values(
        Array.from({ length: entry.targetSets }, (_, index) => ({
          sessionExerciseId,
          setNumber: index + 1,
          weightKg: suggested,
          reps: entry.repsMax,
        })),
      );
    } else {
      await this.dbService.db
        .update(workoutSessionExercises)
        .set({ skipped: true, skipReason: body.reason })
        .where(eq(workoutSessionExercises.id, sessionExerciseId));
    }

    return this.getSession(userId, sessionId);
  }

  async complete(userId: string, sessionId: string) {
    const session = await this.requireInProgress(userId, sessionId);
    const detail = await this.getSession(userId, sessionId);
    const durationSeconds = Math.max(
      1,
      Math.round((Date.now() - session.startedAt.getTime()) / 1000),
    );
    await this.dbService.db
      .update(workoutSessions)
      .set({
        status: "completed",
        completedAt: new Date(),
        durationSeconds,
      })
      .where(eq(workoutSessions.id, sessionId));

    return {
      ...detail,
      status: "completed" as const,
      completedAt: new Date().toISOString(),
      durationSeconds,
    };
  }

  async abandon(userId: string, sessionId: string) {
    await this.requireInProgress(userId, sessionId);
    await this.dbService.db
      .update(workoutSessions)
      .set({ status: "abandoned", completedAt: new Date() })
      .where(eq(workoutSessions.id, sessionId));
    return { ok: true };
  }

  async sync(userId: string, body: SyncWorkoutDto) {
    const [existing] = await this.dbService.db
      .select()
      .from(workoutSessions)
      .where(and(eq(workoutSessions.clientId, body.clientId), eq(workoutSessions.userId, userId)))
      .limit(1);

    if (existing && existing.status === "completed") {
      return this.getSession(userId, existing.id);
    }

    if (existing) {
      await this.dbService.db
        .update(workoutSessions)
        .set({
          gymMode: body.gymMode,
          status: body.status,
          completedAt: body.completedAt ? new Date(body.completedAt) : null,
          durationSeconds: body.durationSeconds ?? null,
        })
        .where(eq(workoutSessions.id, existing.id));
      await this.replaceExercises(existing.id, body.exercises);
      return this.getSession(userId, existing.id);
    }

    const active = await this.findActiveSession(userId);
    if (active && !body.clientId) {
      throw new ConflictException("You already have a workout in progress.");
    }

    const [session] = await this.dbService.db
      .insert(workoutSessions)
      .values({
        userId,
        planDayId: body.planDayId,
        clientId: body.clientId,
        weekday: body.weekday,
        title: body.title,
        gymMode: body.gymMode,
        status: body.status,
        startedAt: new Date(body.startedAt),
        completedAt: body.completedAt ? new Date(body.completedAt) : null,
        durationSeconds: body.durationSeconds ?? null,
      })
      .returning();

    await this.replaceExercises(session.id, body.exercises);
    return this.getSession(userId, session.id);
  }

  private async replaceExercises(
    sessionId: string,
    items: SyncWorkoutDto["exercises"],
  ) {
    const entries = await this.dbService.db
      .select({ id: workoutSessionExercises.id })
      .from(workoutSessionExercises)
      .where(eq(workoutSessionExercises.sessionId, sessionId));
    if (entries.length) {
      await this.dbService.db
        .delete(workoutSessionExercises)
        .where(eq(workoutSessionExercises.sessionId, sessionId));
    }

    for (const item of items) {
      const [entry] = await this.dbService.db
        .insert(workoutSessionExercises)
        .values({
          sessionId,
          exerciseId: item.exerciseId,
          position: item.position,
          targetSets: item.targetSets,
          repsMin: item.repsMin,
          repsMax: item.repsMax,
          restSeconds: item.restSeconds,
          repUnit: item.repUnit,
          skipped: item.skipped,
          skipReason: item.skipReason ?? null,
        })
        .returning();

      if (item.sets.length) {
        await this.dbService.db.insert(workoutSets).values(
          item.sets.map((set) => ({
            sessionExerciseId: entry.id,
            setNumber: set.setNumber,
            weightKg: set.weightKg ?? null,
            reps: set.reps ?? null,
            completed: set.completed,
            completedAt: set.completed ? new Date() : null,
          })),
        );
      }
    }
  }

  private totals(exercisesView: WorkoutExerciseView[]) {
    let totalSets = 0;
    let completedSets = 0;
    let totalVolumeKg = 0;
    for (const exercise of exercisesView) {
      if (exercise.skipped) continue;
      for (const set of exercise.sets) {
        totalSets += 1;
        if (set.completed) {
          completedSets += 1;
          if (set.weightKg != null && set.reps != null) {
            totalVolumeKg += set.weightKg * set.reps;
          }
        }
      }
    }
    return { totalSets, completedSets, totalVolumeKg: Math.round(totalVolumeKg) };
  }

  private async suggestWeightKg(userId: string, exerciseId: string) {
    const rows = await this.dbService.db
      .select({ weightKg: workoutSets.weightKg })
      .from(workoutSets)
      .innerJoin(workoutSessionExercises, eq(workoutSessionExercises.id, workoutSets.sessionExerciseId))
      .innerJoin(workoutSessions, eq(workoutSessions.id, workoutSessionExercises.sessionId))
      .where(
        and(
          eq(workoutSessions.userId, userId),
          eq(workoutSessionExercises.exerciseId, exerciseId),
          eq(workoutSets.completed, true),
        ),
      )
      .orderBy(desc(workoutSets.completedAt))
      .limit(1);
    return rows[0]?.weightKg ?? null;
  }

  private async findActiveSession(userId: string) {
    const [active] = await this.dbService.db
      .select()
      .from(workoutSessions)
      .where(and(eq(workoutSessions.userId, userId), eq(workoutSessions.status, "in_progress")))
      .orderBy(desc(workoutSessions.startedAt))
      .limit(1);
    return active ?? null;
  }

  private async requireInProgress(userId: string, sessionId: string) {
    const [session] = await this.dbService.db
      .select()
      .from(workoutSessions)
      .where(and(eq(workoutSessions.id, sessionId), eq(workoutSessions.userId, userId)))
      .limit(1);
    if (!session) throw new NotFoundException("Workout not found.");
    if (session.status !== "in_progress") {
      throw new BadRequestException("This workout is already finished.");
    }
    return session;
  }
}
