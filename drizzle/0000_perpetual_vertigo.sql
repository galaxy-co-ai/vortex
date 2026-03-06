CREATE TABLE "alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"event" text NOT NULL,
	"severity" text NOT NULL,
	"urgency" text NOT NULL,
	"headline" text,
	"description" text,
	"instruction" text,
	"polygon" geometry(Geometry, 4326),
	"onset" timestamp with time zone,
	"expires" timestamp with time zone,
	"sender" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"location" geometry(Point, 4326),
	"description" text,
	"media_urls" text[],
	"confidence_score" numeric,
	"verified" boolean DEFAULT false,
	"verified_by" text,
	"reported_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forecast_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"contest_date" date NOT NULL,
	"prediction_polygon" geometry(Polygon, 4326),
	"prediction_type" text NOT NULL,
	"score" numeric,
	"elo_delta" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "outlooks" (
	"id" serial PRIMARY KEY NOT NULL,
	"day" integer NOT NULL,
	"type" text NOT NULL,
	"risk_level" text,
	"probability" integer,
	"significant" boolean DEFAULT false,
	"polygon" geometry(Polygon, 4326),
	"issued_at" timestamp with time zone,
	"valid_start" timestamp with time zone,
	"valid_end" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spotter_positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"spotter_id" text NOT NULL,
	"location" geometry(Point, 4326),
	"elevation" numeric,
	"heading" numeric,
	"speed" numeric,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "storm_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"magnitude" numeric,
	"location" geometry(Point, 4326),
	"description" text,
	"source" text,
	"reported_at" timestamp with time zone,
	"ingested_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"achievement_key" text NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now(),
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"clerk_id" text PRIMARY KEY NOT NULL,
	"display_name" text,
	"location" geometry(Point, 4326),
	"role" text DEFAULT 'viewer',
	"xp" integer DEFAULT 0,
	"accuracy_rating" numeric,
	"reports_count" integer DEFAULT 0,
	"elo" integer DEFAULT 1200,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "watch_zones" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"polygon" geometry(Polygon, 4326),
	"alert_levels" text[],
	"wake_up" boolean DEFAULT false,
	"active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_user_id_user_profiles_clerk_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("clerk_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forecast_entries" ADD CONSTRAINT "forecast_entries_user_id_user_profiles_clerk_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("clerk_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_user_profiles_clerk_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("clerk_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_user_profiles_clerk_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("clerk_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_zones" ADD CONSTRAINT "watch_zones_user_id_user_profiles_clerk_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("clerk_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_alerts_event" ON "alerts" USING btree ("event");--> statement-breakpoint
CREATE INDEX "idx_alerts_expires" ON "alerts" USING btree ("expires");--> statement-breakpoint
CREATE INDEX "idx_community_reports_type" ON "community_reports" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_storm_reports_type" ON "storm_reports" USING btree ("type");