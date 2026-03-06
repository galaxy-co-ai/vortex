import {
  pgTable,
  text,
  serial,
  integer,
  decimal,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
  customType,
} from "drizzle-orm/pg-core";

// PostGIS geometry type
const geometry = customType<{
  data: string;
  driverParam: string;
}>({
  dataType() {
    return "geometry(Geometry, 4326)";
  },
});

const point = customType<{
  data: string;
  driverParam: string;
}>({
  dataType() {
    return "geometry(Point, 4326)";
  },
});

const polygon = customType<{
  data: string;
  driverParam: string;
}>({
  dataType() {
    return "geometry(Polygon, 4326)";
  },
});

// ── NWS Alerts ──────────────────────────────────────────────
export const alerts = pgTable(
  "alerts",
  {
    id: text("id").primaryKey(), // NWS alert ID
    event: text("event").notNull(),
    severity: text("severity").notNull(),
    urgency: text("urgency").notNull(),
    headline: text("headline"),
    description: text("description"),
    instruction: text("instruction"),
    polygon: geometry("polygon"),
    onset: timestamp("onset", { withTimezone: true }),
    expires: timestamp("expires", { withTimezone: true }),
    sender: text("sender"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_alerts_event").on(table.event),
    index("idx_alerts_expires").on(table.expires),
  ]
);

// ── Storm Reports (LSR) ────────────────────────────────────
export const stormReports = pgTable(
  "storm_reports",
  {
    id: serial("id").primaryKey(),
    type: text("type").notNull(),
    magnitude: decimal("magnitude"),
    location: point("location"),
    description: text("description"),
    source: text("source"),
    reportedAt: timestamp("reported_at", { withTimezone: true }),
    ingestedAt: timestamp("ingested_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_storm_reports_type").on(table.type)]
);

// ── SPC Outlooks ────────────────────────────────────────────
export const outlooks = pgTable("outlooks", {
  id: serial("id").primaryKey(),
  day: integer("day").notNull(),
  type: text("type").notNull(),
  riskLevel: text("risk_level"),
  probability: integer("probability"),
  significant: boolean("significant").default(false),
  polygon: polygon("polygon"),
  issuedAt: timestamp("issued_at", { withTimezone: true }),
  validStart: timestamp("valid_start", { withTimezone: true }),
  validEnd: timestamp("valid_end", { withTimezone: true }),
});

// ── User Profiles (extends Clerk) ───────────────────────────
export const userProfiles = pgTable("user_profiles", {
  clerkId: text("clerk_id").primaryKey(),
  displayName: text("display_name"),
  location: point("location"),
  role: text("role").default("viewer"),
  xp: integer("xp").default(0),
  accuracyRating: decimal("accuracy_rating"),
  reportsCount: integer("reports_count").default(0),
  elo: integer("elo").default(1200),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ── Watch Zones (user-drawn alert polygons) ─────────────────
export const watchZones = pgTable("watch_zones", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userProfiles.clerkId),
  name: text("name").notNull(),
  polygon: polygon("polygon"),
  alertLevels: text("alert_levels").array(),
  wakeUp: boolean("wake_up").default(false),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ── Community Reports (user-submitted) ──────────────────────
export const communityReports = pgTable(
  "community_reports",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => userProfiles.clerkId),
    type: text("type").notNull(),
    location: point("location"),
    description: text("description"),
    mediaUrls: text("media_urls").array(),
    confidenceScore: decimal("confidence_score"),
    verified: boolean("verified").default(false),
    verifiedBy: text("verified_by"),
    reportedAt: timestamp("reported_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_community_reports_type").on(table.type)]
);

// ── Achievements ────────────────────────────────────────────
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userProfiles.clerkId),
  achievementKey: text("achievement_key").notNull(),
  earnedAt: timestamp("earned_at", { withTimezone: true }).defaultNow(),
  metadata: jsonb("metadata"),
});

// ── Forecast Contests ───────────────────────────────────────
export const forecastEntries = pgTable("forecast_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userProfiles.clerkId),
  contestDate: date("contest_date").notNull(),
  predictionPolygon: polygon("prediction_polygon"),
  predictionType: text("prediction_type").notNull(),
  score: decimal("score"),
  eloDelta: integer("elo_delta"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ── Spotter Positions (ingested from Spotter Network) ───────
export const spotterPositions = pgTable("spotter_positions", {
  id: serial("id").primaryKey(),
  spotterId: text("spotter_id").notNull(),
  location: point("location"),
  elevation: decimal("elevation"),
  heading: decimal("heading"),
  speed: decimal("speed"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ── Push Subscriptions ──────────────────────────────────────
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userProfiles.clerkId),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
