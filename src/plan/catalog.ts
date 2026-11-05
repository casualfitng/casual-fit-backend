export type ExerciseSeed = {
  slug: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  instructions: string[];
  mistakes: string[];
  alternativeSlugs: string[];
};

export type Prescription = {
  slug: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds?: number;
  repUnit?: "reps" | "seconds" | "minutes";
};

export type ProgrammeSeed = {
  slug: string;
  name: string;
  goal: string;
  location: "gym" | "home";
  description: string;
  sessions: { title: string; exercises: Prescription[] }[];
};

const move = (
  slug: string,
  name: string,
  primaryMuscles: string[],
  equipment: string[],
  difficulty: ExerciseSeed["difficulty"],
  instructions: string[],
  mistakes: string[],
  alternativeSlugs: string[] = [],
  secondaryMuscles: string[] = [],
): ExerciseSeed => ({
  slug,
  name,
  primaryMuscles,
  secondaryMuscles,
  equipment,
  difficulty,
  instructions,
  mistakes,
  alternativeSlugs,
});

export const exerciseSeeds: ExerciseSeed[] = [
  move("barbell-bench-press", "Barbell bench press", ["Chest"], ["barbell", "bench"], "intermediate", ["Lie on the bench with your eyes under the bar.", "Lower the bar to your mid-chest with your forearms vertical.", "Press up until your arms are straight."], ["Bouncing the bar off the chest", "Flaring the elbows straight out"], ["push-up", "incline-dumbbell-press"], ["Triceps", "Shoulders"]),
  move("incline-dumbbell-press", "Incline dumbbell press", ["Chest"], ["dumbbells", "bench"], "intermediate", ["Set the bench to a shallow incline.", "Lower the dumbbells until your elbows are near the bench.", "Press up without clanking the weights."], ["Sitting the bench too upright", "Arching the lower back"], ["barbell-bench-press"]),
  move("cable-fly", "Cable fly", ["Chest"], ["cable"], "intermediate", ["Set the cables around shoulder height.", "Bring your hands together in a wide arc.", "Keep a soft bend in the elbows."], ["Turning it into a press", "Shrugging the shoulders"], ["push-up"]),
  move("tricep-pushdown", "Tricep pushdown", ["Triceps"], ["cable"], "beginner", ["Pin your elbows to your sides.", "Straighten your arms.", "Return until your forearms are just above parallel."], ["Swinging the torso", "Letting the elbows drift forward"], ["chair-dip", "overhead-tricep-extension"]),
  move("overhead-tricep-extension", "Overhead tricep extension", ["Triceps"], ["dumbbells"], "intermediate", ["Hold one dumbbell overhead.", "Lower it behind your head.", "Extend without flaring the ribs."], ["Flaring the elbows wide", "Arching the lower back"], ["tricep-pushdown"]),
  move("lat-pulldown", "Lat pulldown", ["Back"], ["cable"], "beginner", ["Grip just outside shoulder width.", "Pull the bar to your upper chest.", "Control it back up."], ["Leaning back to swing", "Pulling behind the neck"], ["push-up"]),
  move("barbell-row", "Barbell row", ["Back"], ["barbell"], "intermediate", ["Hinge until your torso is near parallel.", "Pull the bar to your lower ribs.", "Lower it under control."], ["Jerking with the lower back", "Standing too upright"], ["seated-cable-row", "superman"]),
  move("seated-cable-row", "Seated cable row", ["Back"], ["cable"], "beginner", ["Sit tall with a soft knee bend.", "Pull the handle to your ribs.", "Reach forward without rounding hard."], ["Using momentum", "Shrugging the shoulders"], ["barbell-row"]),
  move("dumbbell-curl", "Dumbbell curl", ["Biceps"], ["dumbbells"], "beginner", ["Keep your elbows under your shoulders.", "Curl without swinging.", "Lower for a full second."], ["Swinging the hips", "Elbows drifting forward"], ["hammer-curl"]),
  move("hammer-curl", "Hammer curl", ["Biceps"], ["dumbbells"], "beginner", ["Keep your palms facing each other.", "Curl with still elbows.", "Squeeze at the top."], ["Swinging", "Bending the wrists"], ["dumbbell-curl"], ["Forearms"]),
  move("barbell-squat", "Barbell squat", ["Quads"], ["barbell"], "intermediate", ["Set the bar on your upper back.", "Sit down between your hips and knees.", "Stand by driving through your feet."], ["Knees collapsing inward", "Rounding the lower back"], ["goblet-squat", "bodyweight-squat"], ["Glutes"]),
  move("goblet-squat", "Goblet squat", ["Quads"], ["dumbbells"], "beginner", ["Hold a dumbbell at your chest.", "Squat until your hips are at least knee height.", "Keep your chest up as you stand."], ["Heels lifting", "Knees caving in"], ["bodyweight-squat", "barbell-squat"], ["Glutes"]),
  move("romanian-deadlift", "Romanian deadlift", ["Hamstrings"], ["barbell"], "intermediate", ["Start standing with the bar at your thighs.", "Push your hips back with a soft knee bend.", "Stop when you feel a hamstring stretch, then stand tall."], ["Rounding the back", "Bending the knees into a squat"], ["glute-bridge"], ["Glutes"]),
  move("leg-press", "Leg press", ["Quads"], ["machine"], "beginner", ["Place your feet about shoulder width.", "Lower until your knees are near a right angle.", "Press without locking hard."], ["Letting the lower back peel off the pad", "Knees collapsing"], ["barbell-squat", "bodyweight-squat"]),
  move("leg-curl", "Leg curl", ["Hamstrings"], ["machine"], "beginner", ["Lie or sit so the pad is above your heels.", "Curl your heels toward you.", "Lower slowly."], ["Lifting the hips", "Using a partial range"], ["glute-bridge"]),
  move("hip-thrust", "Hip thrust", ["Glutes"], ["barbell", "bench"], "intermediate", ["Set your upper back on a bench.", "Drive through your heels until your hips are level.", "Pause, then lower."], ["Overarching the lower back", "Pushing through the toes"], ["glute-bridge"]),
  move("bulgarian-split-squat", "Bulgarian split squat", ["Quads"], ["dumbbells", "bench"], "intermediate", ["Rest one foot on a bench behind you.", "Lower the front knee with a tall chest.", "Drive through the front foot."], ["Front heel lifting", "Knee shooting far past the toes"], ["reverse-lunge"], ["Glutes"]),
  move("hip-abduction", "Hip abduction", ["Glutes"], ["machine"], "beginner", ["Sit tall in the machine.", "Press your knees out.", "Return without slamming the weight."], ["Leaning forward", "Using a tiny range"], ["glute-bridge"]),
  move("dumbbell-shoulder-press", "Dumbbell shoulder press", ["Shoulders"], ["dumbbells"], "beginner", ["Start with the dumbbells at shoulder height.", "Press up without leaning back.", "Lower to the start."], ["Arching the lower back", "Pressing the weights forward"], ["pike-push-up"]),
  move("lateral-raise", "Lateral raise", ["Shoulders"], ["dumbbells"], "beginner", ["Raise the dumbbells out to shoulder height.", "Lead with your elbows.", "Lower slowly."], ["Swinging", "Shrugging"], ["pike-push-up"]),
  move("face-pull", "Face pull", ["Shoulders"], ["cable"], "beginner", ["Set the cable at face height.", "Pull toward your face with elbows high.", "Squeeze your shoulder blades."], ["Using a heavy swinging weight", "Letting the shoulders roll forward"], ["superman"], ["Back"]),
  move("plank", "Plank", ["Abs"], ["bodyweight"], "beginner", ["Set your forearms under your shoulders.", "Make a straight line from head to heels.", "Brace and breathe."], ["Hips sagging", "Holding the breath"], ["dead-bug"]),
  move("hanging-knee-raise", "Hanging knee raise", ["Abs"], ["pull-up bar"], "intermediate", ["Hang from a bar.", "Lift your knees toward your chest.", "Lower without swinging."], ["Swinging the body", "Only bending the hips a little"], ["dead-bug"]),
  move("walking-lunge", "Walking lunge", ["Quads"], ["dumbbells"], "beginner", ["Step forward and lower the back knee.", "Keep your torso tall.", "Drive through the front foot into the next step."], ["Front knee collapsing", "Short choppy steps"], ["reverse-lunge"], ["Glutes"]),
  move("bodyweight-squat", "Bodyweight squat", ["Quads"], ["bodyweight"], "beginner", ["Stand with feet about shoulder width.", "Sit your hips down and back.", "Stand tall."], ["Knees caving in", "Heels rising"], ["goblet-squat"], ["Glutes"]),
  move("push-up", "Push-up", ["Chest"], ["bodyweight"], "beginner", ["Hands under your shoulders.", "Lower your chest toward the floor.", "Press back to a straight body line."], ["Hips sagging", "Flaring the elbows"], ["barbell-bench-press", "diamond-push-up"], ["Triceps"]),
  move("glute-bridge", "Glute bridge", ["Glutes"], ["bodyweight"], "beginner", ["Lie on your back with knees bent.", "Drive through your heels until your hips lift.", "Lower with control."], ["Pushing through the toes", "Overarching the back"], ["hip-thrust"], ["Hamstrings"]),
  move("reverse-lunge", "Reverse lunge", ["Quads"], ["bodyweight"], "beginner", ["Step one foot backward.", "Lower until both knees are near right angles.", "Push back to standing."], ["Front heel lifting", "Torso falling forward"], ["walking-lunge"], ["Glutes"]),
  move("dead-bug", "Dead bug", ["Abs"], ["bodyweight"], "beginner", ["Lie on your back with arms and knees up.", "Reach the opposite arm and leg away.", "Keep your lower back gently on the floor."], ["Arching the back", "Moving too fast"], ["plank"]),
  move("pike-push-up", "Pike push-up", ["Shoulders"], ["bodyweight"], "intermediate", ["Start in a pike with hips high.", "Bend your elbows and lower your head.", "Press back up."], ["Letting the hips drop", "Hands too narrow"], ["dumbbell-shoulder-press"]),
  move("chair-dip", "Chair dip", ["Triceps"], ["bench"], "beginner", ["Hands on a sturdy chair behind you.", "Bend your elbows to lower.", "Press back up."], ["Shoulders shrugging to the ears", "Using a rolling chair"], ["tricep-pushdown"]),
  move("superman", "Superman", ["Back"], ["bodyweight"], "beginner", ["Lie face down with arms forward.", "Lift your chest and legs a small amount.", "Lower slowly."], ["Jerking the lift", "Holding the breath"], ["barbell-row"]),
  move("diamond-push-up", "Diamond push-up", ["Triceps"], ["bodyweight"], "intermediate", ["Place your hands close under your chest.", "Lower with elbows tracking back.", "Press up."], ["Flaring the elbows", "Sagging the hips"], ["push-up", "tricep-pushdown"], ["Chest"]),
  move("brisk-walk", "Brisk walk", ["Cardio"], ["bodyweight"], "beginner", ["Walk at a pace where talking is slightly hard.", "Keep an even stride.", "Stop if you feel pain, not just effort."], ["Starting too fast", "Holding the breath"], []),
];

const gym = (slug: string, sets: number, repsMin: number, repsMax: number, restSeconds = 90): Prescription => ({
  slug,
  sets,
  repsMin,
  repsMax,
  restSeconds,
});

const hold = (slug: string, sets: number, seconds: number): Prescription => ({
  slug,
  sets,
  repsMin: seconds,
  repsMax: seconds,
  restSeconds: 45,
  repUnit: "seconds",
});

const minutes = (slug: string, amount: number): Prescription => ({
  slug,
  sets: 1,
  repsMin: amount,
  repsMax: amount,
  restSeconds: 0,
  repUnit: "minutes",
});

export const programmeSeeds: ProgrammeSeed[] = [
  {
    slug: "beginner-gym",
    name: "Beginner full body",
    goal: "beginner",
    location: "gym",
    description: "Three full-body sessions for someone new to the gym.",
    sessions: [
      { title: "Full body A", exercises: [gym("goblet-squat", 3, 10, 10), gym("barbell-bench-press", 3, 8, 10, 120), gym("lat-pulldown", 3, 10, 10), gym("dumbbell-shoulder-press", 2, 10, 10), gym("leg-curl", 2, 12, 12), hold("plank", 3, 30)] },
      { title: "Full body B", exercises: [gym("leg-press", 3, 10, 12), gym("seated-cable-row", 3, 10, 12), gym("incline-dumbbell-press", 3, 10, 10), gym("romanian-deadlift", 3, 8, 10), gym("dumbbell-curl", 2, 12, 12), hold("dead-bug", 3, 8)] },
      { title: "Full body C", exercises: [gym("goblet-squat", 3, 10, 10), gym("lat-pulldown", 3, 10, 12), gym("dumbbell-shoulder-press", 3, 8, 10), gym("glute-bridge", 3, 12, 12), gym("tricep-pushdown", 2, 12, 12), hold("plank", 3, 30)] },
    ],
  },
  {
    slug: "beginner-home",
    name: "Beginner full body at home",
    goal: "beginner",
    location: "home",
    description: "Three full-body sessions with no gym machines.",
    sessions: [
      { title: "Full body A", exercises: [gym("bodyweight-squat", 3, 10, 12, 60), gym("push-up", 3, 6, 12, 60), gym("glute-bridge", 3, 12, 15, 45), gym("reverse-lunge", 2, 8, 10, 60), hold("dead-bug", 3, 8), hold("plank", 3, 20)] },
      { title: "Full body B", exercises: [gym("reverse-lunge", 3, 8, 10, 60), gym("pike-push-up", 3, 6, 10, 60), gym("superman", 3, 10, 12, 45), gym("glute-bridge", 3, 12, 15, 45), hold("dead-bug", 3, 8)] },
      { title: "Full body C", exercises: [gym("bodyweight-squat", 3, 12, 15, 60), gym("diamond-push-up", 3, 6, 10, 60), gym("glute-bridge", 3, 12, 15, 45), hold("plank", 3, 30), minutes("brisk-walk", 10)] },
    ],
  },
  {
    slug: "muscle-gym",
    name: "Muscle building",
    goal: "muscle",
    location: "gym",
    description: "A six-session week for building muscle.",
    sessions: [
      { title: "Chest + triceps", exercises: [gym("barbell-bench-press", 4, 8, 10, 120), gym("incline-dumbbell-press", 3, 10, 12), gym("cable-fly", 3, 12, 15), gym("tricep-pushdown", 3, 10, 12), gym("overhead-tricep-extension", 3, 10, 12)] },
      { title: "Back + biceps", exercises: [gym("barbell-row", 4, 8, 10, 120), gym("lat-pulldown", 3, 10, 12), gym("seated-cable-row", 3, 10, 12), gym("dumbbell-curl", 3, 10, 12), gym("hammer-curl", 3, 10, 12)] },
      { title: "Legs", exercises: [gym("barbell-squat", 4, 6, 10, 150), gym("romanian-deadlift", 3, 8, 10, 120), gym("leg-press", 3, 10, 12), gym("leg-curl", 3, 10, 12), gym("walking-lunge", 2, 10, 12)] },
      { title: "Shoulders + abs", exercises: [gym("dumbbell-shoulder-press", 4, 8, 10), gym("lateral-raise", 3, 12, 15, 60), gym("face-pull", 3, 12, 15, 60), hold("plank", 3, 40), gym("hanging-knee-raise", 3, 8, 12)] },
      { title: "Chest + back", exercises: [gym("incline-dumbbell-press", 3, 8, 12), gym("lat-pulldown", 3, 8, 12), gym("cable-fly", 3, 12, 15), gym("seated-cable-row", 3, 10, 12)] },
      { title: "Legs + arms", exercises: [gym("goblet-squat", 3, 10, 12), gym("romanian-deadlift", 3, 8, 10), gym("dumbbell-curl", 3, 10, 12), gym("tricep-pushdown", 3, 10, 12)] },
    ],
  },
  {
    slug: "muscle-home",
    name: "Muscle building at home",
    goal: "muscle",
    location: "home",
    description: "A home muscle week using your body and a chair.",
    sessions: [
      { title: "Push", exercises: [gym("push-up", 4, 6, 15, 75), gym("pike-push-up", 3, 6, 12, 75), gym("diamond-push-up", 3, 6, 12, 75), gym("chair-dip", 3, 8, 12, 75)] },
      { title: "Lower body", exercises: [gym("bodyweight-squat", 4, 12, 20, 60), gym("reverse-lunge", 3, 8, 12, 60), gym("glute-bridge", 4, 12, 20, 45), hold("plank", 3, 30)] },
      { title: "Pull + core", exercises: [gym("superman", 4, 10, 15, 45), hold("dead-bug", 3, 10), hold("plank", 3, 30)] },
    ],
  },
  {
    slug: "strength-gym",
    name: "Strength",
    goal: "strength",
    location: "gym",
    description: "Heavier sets on the main lifts.",
    sessions: [
      { title: "Squat", exercises: [gym("barbell-squat", 5, 3, 5, 180), gym("leg-press", 3, 6, 8, 120), gym("leg-curl", 3, 8, 10)] },
      { title: "Bench", exercises: [gym("barbell-bench-press", 5, 3, 5, 180), gym("incline-dumbbell-press", 3, 6, 8, 120), gym("tricep-pushdown", 3, 8, 10)] },
      { title: "Hinge + row", exercises: [gym("romanian-deadlift", 4, 4, 6, 150), gym("barbell-row", 4, 5, 8, 120), gym("lat-pulldown", 3, 6, 10)] },
      { title: "Upper", exercises: [gym("dumbbell-shoulder-press", 4, 5, 8, 120), gym("seated-cable-row", 4, 6, 8), gym("barbell-bench-press", 3, 5, 8, 120)] },
      { title: "Lower", exercises: [gym("barbell-squat", 4, 4, 6, 150), gym("hip-thrust", 3, 6, 8, 120), gym("walking-lunge", 2, 8, 10)] },
    ],
  },
  {
    slug: "strength-home",
    name: "Strength at home",
    goal: "strength",
    location: "home",
    description: "Harder bodyweight sets when a barbell is not available.",
    sessions: [
      { title: "Legs", exercises: [gym("bodyweight-squat", 5, 12, 20, 75), gym("reverse-lunge", 4, 8, 12, 75), gym("glute-bridge", 4, 12, 20, 60)] },
      { title: "Push", exercises: [gym("push-up", 5, 8, 15, 75), gym("pike-push-up", 4, 6, 12, 75), gym("chair-dip", 3, 8, 12, 75)] },
      { title: "Core + back", exercises: [gym("superman", 4, 12, 15, 45), hold("plank", 4, 30), hold("dead-bug", 3, 10)] },
    ],
  },
  {
    slug: "fat-loss-gym",
    name: "Fat loss",
    goal: "fat-loss",
    location: "gym",
    description: "Lifting plus short cardio. Muscle work stays in the plan.",
    sessions: [
      { title: "Upper + cardio", exercises: [gym("barbell-bench-press", 3, 8, 12), gym("lat-pulldown", 3, 10, 12), gym("dumbbell-shoulder-press", 3, 8, 12), minutes("brisk-walk", 15)] },
      { title: "Lower", exercises: [gym("goblet-squat", 3, 10, 12), gym("romanian-deadlift", 3, 8, 12), gym("walking-lunge", 3, 10, 12), gym("leg-curl", 3, 12, 15)] },
      { title: "Cardio + core", exercises: [minutes("brisk-walk", 20), hold("plank", 3, 30), hold("dead-bug", 3, 10)] },
      { title: "Upper", exercises: [gym("incline-dumbbell-press", 3, 10, 12), gym("seated-cable-row", 3, 10, 12), gym("lateral-raise", 3, 12, 15, 60), gym("tricep-pushdown", 2, 12, 15)] },
      { title: "Lower + cardio", exercises: [gym("leg-press", 3, 10, 15), gym("hip-thrust", 3, 10, 12), minutes("brisk-walk", 12)] },
      { title: "Full body", exercises: [gym("goblet-squat", 3, 10, 12), gym("push-up", 3, 8, 15, 60), gym("lat-pulldown", 3, 10, 12), hold("plank", 3, 30)] },
    ],
  },
  {
    slug: "fat-loss-home",
    name: "Fat loss at home",
    goal: "fat-loss",
    location: "home",
    description: "Home strength work plus walking.",
    sessions: [
      { title: "Full body + walk", exercises: [gym("bodyweight-squat", 3, 12, 15, 45), gym("push-up", 3, 8, 15, 45), gym("glute-bridge", 3, 12, 15, 45), minutes("brisk-walk", 15)] },
      { title: "Lower", exercises: [gym("reverse-lunge", 3, 8, 12, 45), gym("glute-bridge", 3, 15, 20, 45), hold("plank", 3, 30)] },
      { title: "Walk + core", exercises: [minutes("brisk-walk", 20), hold("dead-bug", 3, 8), hold("plank", 3, 20)] },
    ],
  },
  {
    slug: "glutes-gym",
    name: "Glutes and lower body",
    goal: "glutes",
    location: "gym",
    description: "Lower-body emphasis. Available to every user.",
    sessions: [
      { title: "Glutes + hamstrings", exercises: [gym("hip-thrust", 4, 8, 12, 120), gym("romanian-deadlift", 3, 8, 10), gym("leg-curl", 3, 10, 15), gym("walking-lunge", 3, 10, 12)] },
      { title: "Upper body", exercises: [gym("lat-pulldown", 3, 8, 12), gym("barbell-bench-press", 3, 8, 10, 120), gym("seated-cable-row", 3, 10, 12), gym("dumbbell-shoulder-press", 2, 10, 12)] },
      { title: "Quads + glutes", exercises: [gym("barbell-squat", 4, 6, 10, 150), gym("bulgarian-split-squat", 3, 8, 10), gym("leg-press", 3, 10, 12), gym("hip-abduction", 3, 12, 15, 45)] },
      { title: "Glutes + hamstrings", exercises: [gym("hip-thrust", 4, 8, 12), gym("romanian-deadlift", 3, 8, 12), gym("glute-bridge", 3, 12, 15, 45)] },
      { title: "Full body + core", exercises: [gym("goblet-squat", 3, 10, 12), gym("lat-pulldown", 3, 10, 12), gym("hip-thrust", 3, 10, 12), hold("plank", 3, 30)] },
    ],
  },
  {
    slug: "glutes-home",
    name: "Glutes and lower body at home",
    goal: "glutes",
    location: "home",
    description: "Glute and leg work without a gym.",
    sessions: [
      { title: "Glutes", exercises: [gym("glute-bridge", 4, 12, 20, 45), gym("reverse-lunge", 3, 8, 12, 60), gym("bodyweight-squat", 3, 12, 20, 45)] },
      { title: "Upper", exercises: [gym("push-up", 3, 8, 15, 60), gym("pike-push-up", 3, 6, 12, 60), gym("superman", 3, 10, 15, 45)] },
      { title: "Quads + glutes", exercises: [gym("reverse-lunge", 4, 8, 12, 60), gym("bodyweight-squat", 3, 15, 20, 45), gym("glute-bridge", 3, 15, 20, 45), hold("plank", 3, 30)] },
    ],
  },
  {
    slug: "ppl-gym",
    name: "Push pull legs",
    goal: "ppl",
    location: "gym",
    description: "Push, pull, and legs, repeated across your training days.",
    sessions: [
      { title: "Push", exercises: [gym("barbell-bench-press", 4, 6, 10, 120), gym("dumbbell-shoulder-press", 3, 8, 12), gym("incline-dumbbell-press", 3, 8, 12), gym("lateral-raise", 3, 12, 15, 60), gym("tricep-pushdown", 3, 10, 12)] },
      { title: "Pull", exercises: [gym("barbell-row", 4, 6, 10, 120), gym("lat-pulldown", 3, 8, 12), gym("seated-cable-row", 3, 10, 12), gym("face-pull", 3, 12, 15, 60), gym("dumbbell-curl", 3, 10, 12)] },
      { title: "Legs", exercises: [gym("barbell-squat", 4, 6, 10, 150), gym("romanian-deadlift", 3, 8, 10, 120), gym("leg-press", 3, 10, 12), gym("leg-curl", 3, 10, 12), hold("plank", 3, 30)] },
    ],
  },
  {
    slug: "ppl-home",
    name: "Push pull legs at home",
    goal: "ppl",
    location: "home",
    description: "The same split with home exercises.",
    sessions: [
      { title: "Push", exercises: [gym("push-up", 4, 8, 15, 60), gym("pike-push-up", 3, 6, 12, 60), gym("chair-dip", 3, 8, 12, 60), gym("diamond-push-up", 3, 6, 12, 60)] },
      { title: "Pull", exercises: [gym("superman", 4, 12, 15, 45), hold("dead-bug", 3, 8), hold("plank", 3, 30)] },
      { title: "Legs", exercises: [gym("bodyweight-squat", 4, 12, 20, 60), gym("reverse-lunge", 3, 8, 12, 60), gym("glute-bridge", 4, 12, 20, 45)] },
    ],
  },
  {
    slug: "bro-gym",
    name: "Bro split",
    goal: "bro",
    location: "gym",
    description: "One main muscle group each session.",
    sessions: [
      { title: "Chest", exercises: [gym("barbell-bench-press", 4, 6, 10, 120), gym("incline-dumbbell-press", 3, 8, 12), gym("cable-fly", 3, 12, 15)] },
      { title: "Back", exercises: [gym("barbell-row", 4, 6, 10, 120), gym("lat-pulldown", 3, 8, 12), gym("seated-cable-row", 3, 10, 12)] },
      { title: "Shoulders", exercises: [gym("dumbbell-shoulder-press", 4, 8, 10), gym("lateral-raise", 4, 12, 15, 60), gym("face-pull", 3, 12, 15, 60)] },
      { title: "Arms", exercises: [gym("dumbbell-curl", 4, 8, 12), gym("hammer-curl", 3, 10, 12), gym("tricep-pushdown", 4, 10, 12), gym("overhead-tricep-extension", 3, 10, 12)] },
      { title: "Legs", exercises: [gym("barbell-squat", 4, 6, 10, 150), gym("romanian-deadlift", 3, 8, 10), gym("leg-press", 3, 10, 12), gym("leg-curl", 3, 12, 15)] },
      { title: "Full body", exercises: [gym("goblet-squat", 3, 10, 12), gym("lat-pulldown", 3, 10, 12), gym("push-up", 3, 10, 15, 60), minutes("brisk-walk", 10)] },
    ],
  },
  {
    slug: "bro-home",
    name: "Bro split at home",
    goal: "bro",
    location: "home",
    description: "A simple home split by movement.",
    sessions: [
      { title: "Push", exercises: [gym("push-up", 4, 8, 15, 60), gym("pike-push-up", 3, 6, 12, 60), gym("chair-dip", 3, 8, 12, 60)] },
      { title: "Back + core", exercises: [gym("superman", 4, 12, 15, 45), hold("dead-bug", 3, 8), hold("plank", 3, 30)] },
      { title: "Legs", exercises: [gym("bodyweight-squat", 4, 12, 20, 60), gym("reverse-lunge", 3, 10, 12, 60), gym("glute-bridge", 4, 15, 20, 45)] },
    ],
  },
];

export function chooseProgrammeSlug(profile: {
  experience: string | null;
  location: string | null;
  goals: string[];
}) {
  const place = profile.location === "home" ? "home" : "gym";
  if (profile.experience === "beginner") return `beginner-${place}`;
  if (profile.goals.includes("lose_fat") || profile.goals.includes("improve_endurance") || profile.goals.includes("improve_fitness")) {
    return `fat-loss-${place}`;
  }
  if (profile.goals.includes("build_strength")) return `strength-${place}`;
  if (profile.goals.includes("improve_body_shape")) return `glutes-${place}`;
  return `muscle-${place}`;
}
