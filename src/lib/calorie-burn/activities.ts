import type { ActivityDefinition, ActivityId } from "./types";

/** MET values adapted from the Compendium of Physical Activities (adults). */
export const CALORIE_ACTIVITIES: ActivityDefinition[] = [
  { id: "walking", met: 3.5, category: "cardio" },
  { id: "briskWalk", met: 4.3, category: "cardio" },
  { id: "jogging", met: 7.0, category: "cardio" },
  { id: "running", met: 9.8, category: "cardio" },
  { id: "cycling", met: 6.8, category: "cardio" },
  { id: "swimming", met: 5.8, category: "cardio" },
  { id: "elliptical", met: 5.0, category: "cardio" },
  { id: "jumpRope", met: 11.0, category: "cardio" },
  { id: "hiit", met: 8.0, category: "cardio" },
  { id: "stairs", met: 8.8, category: "cardio" },
  { id: "rowing", met: 7.0, category: "cardio" },
  { id: "strength", met: 3.5, category: "strength" },
  { id: "yoga", met: 2.5, category: "mindBody" },
  { id: "pilates", met: 3.0, category: "mindBody" },
  { id: "dance", met: 5.0, category: "mindBody" },
  { id: "hiking", met: 6.0, category: "sport" },
  { id: "soccer", met: 7.0, category: "sport" },
  { id: "basketball", met: 6.5, category: "sport" },
  { id: "tennis", met: 7.3, category: "sport" },
  { id: "housework", met: 3.3, category: "daily" },
];

const BY_ID = Object.fromEntries(
  CALORIE_ACTIVITIES.map((a) => [a.id, a]),
) as Record<ActivityId, ActivityDefinition>;

export function getActivity(id: ActivityId): ActivityDefinition | undefined {
  return BY_ID[id];
}

export const ACTIVITY_CATEGORY_ORDER: ActivityDefinition["category"][] = [
  "cardio",
  "strength",
  "mindBody",
  "sport",
  "daily",
];
