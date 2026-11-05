import { Injectable } from "@nestjs/common";
import { and, asc, desc, eq, gte } from "drizzle-orm";
import { DbService } from "../db/db.service";
import { profiles, weightLogs, workoutSessions } from "../db/schema";
import { PlanService } from "../plan/plan.service";
import type { LogWeightDto } from "./dto";

const weekdayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function startOfWeek(date: Date) {
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())), diff);
}

@Injectable()
export class ProgressService {
  constructor(
    private readonly dbService: DbService,
    private readonly plans: PlanService,
  ) {}

  async logWeight(userId: string, body: LogWeightDto) {
    const loggedOn = body.loggedOn ?? isoDate(new Date());
    const [existing] = await this.dbService.db
      .select({ id: weightLogs.id })
      .from(weightLogs)
      .where(and(eq(weightLogs.userId, userId), eq(weightLogs.loggedOn, loggedOn)))
      .limit(1);

    if (existing) {
      const [row] = await this.dbService.db
        .update(weightLogs)
        .set({ weightKg: body.weightKg })
        .where(eq(weightLogs.id, existing.id))
        .returning();
      return row;
    }

    const [row] = await this.dbService.db
      .insert(weightLogs)
      .values({ userId, weightKg: body.weightKg, loggedOn })
      .returning();
    return row;
  }

  async listWeights(userId: string, days = 90) {
    const since = isoDate(addDays(new Date(), -days));
    return this.dbService.db
      .select({
        id: weightLogs.id,
        weightKg: weightLogs.weightKg,
        loggedOn: weightLogs.loggedOn,
      })
      .from(weightLogs)
      .where(and(eq(weightLogs.userId, userId), gte(weightLogs.loggedOn, since)))
      .orderBy(asc(weightLogs.loggedOn));
  }

  async getSummary(userId: string) {
    const plan = await this.plans.getPlan(userId);
    const [profile] = await this.dbService.db
      .select({ weightKg: profiles.weightKg, goalWeightKg: profiles.goalWeightKg })
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    const weights = await this.listWeights(userId, 90);
    const latestLog = weights.at(-1) ?? null;
    const latestWeightKg = latestLog?.weightKg ?? profile?.weightKg ?? null;

    const completed = await this.dbService.db
      .select({
        completedAt: workoutSessions.completedAt,
        durationSeconds: workoutSessions.durationSeconds,
      })
      .from(workoutSessions)
      .where(and(eq(workoutSessions.userId, userId), eq(workoutSessions.status, "completed")))
      .orderBy(desc(workoutSessions.completedAt));

    const workoutDates = new Set<string>();
    for (const row of completed) {
      if (row.completedAt) workoutDates.add(isoDate(row.completedAt));
    }

    const restByWeekday = new Map(plan.days.map((day) => [day.weekday, day.isRest]));
    const streak = this.trainingStreak(workoutDates, restByWeekday);

    const weekStart = isoDate(startOfWeek(new Date()));
    let weekWorkouts = 0;
    let weekSeconds = 0;
    for (const row of completed) {
      if (!row.completedAt) continue;
      const day = isoDate(row.completedAt);
      if (day >= weekStart) {
        weekWorkouts += 1;
        weekSeconds += row.durationSeconds ?? 0;
      }
    }

    const trainingDaysThisWeek = plan.days.filter((day) => !day.isRest).length;

    return {
      streakDays: streak,
      latestWeightKg,
      goalWeightKg: profile?.goalWeightKg ?? null,
      weights,
      week: {
        workoutsCompleted: weekWorkouts,
        trainingDaysPlanned: trainingDaysThisWeek,
        minutesTrained: Math.round(weekSeconds / 60),
      },
    };
  }

  private trainingStreak(workoutDates: Set<string>, restByWeekday: Map<string, boolean>) {
    let cursor = new Date();
    const today = isoDate(cursor);
    const todayWeekday = weekdayNames[cursor.getUTCDay()];
    const todayRest = restByWeekday.get(todayWeekday) ?? true;
    const todayDone = workoutDates.has(today);

    if (!todayRest && !todayDone) {
      cursor = addDays(cursor, -1);
    }

    let streak = 0;
    for (let guard = 0; guard < 400; guard += 1) {
      const day = isoDate(cursor);
      const weekday = weekdayNames[cursor.getUTCDay()];
      const isRest = restByWeekday.get(weekday) ?? true;
      if (isRest || workoutDates.has(day)) {
        streak += 1;
        cursor = addDays(cursor, -1);
        continue;
      }
      break;
    }
    return streak;
  }
}
