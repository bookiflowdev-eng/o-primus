


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."match_repo_chunks"("query_embedding" "public"."vector", "match_threshold" double precision DEFAULT 0.75, "match_count" integer DEFAULT 5) RETURNS TABLE("id" "text", "repo_name" "text", "file_path" "text", "code_snippet" "text", "description" "text", "similarity" double precision)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id,
    rc.repo_name,
    rc.file_path,
    rc.code_snippet,
    rc.description,
    1 - (rc.embedding <=> query_embedding) AS similarity
  FROM public.repo_chunks rc
  WHERE 1 - (rc.embedding <=> query_embedding) > match_threshold
  ORDER BY rc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;


ALTER FUNCTION "public"."match_repo_chunks"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_repo_chunks"("query_embedding" "public"."vector", "match_count" integer DEFAULT 10, "match_threshold" double precision DEFAULT 0.70, "filter_category" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "text", "repo_name" "text", "category" "text", "file_path" "text", "code_snippet" "text", "description" "text", "similarity" double precision)
    LANGUAGE "sql" STABLE
    AS $$
  SELECT rc.id, rc.repo_name, rc.category, rc.file_path,
         rc.code_snippet, rc.description,
         1 - (rc.embedding <=> query_embedding) AS similarity
  FROM repo_chunks rc
  WHERE 1 - (rc.embedding <=> query_embedding) > match_threshold
    AND (filter_category IS NULL OR rc.category = filter_category)
  ORDER BY rc.embedding <=> query_embedding
  LIMIT match_count;
$$;


ALTER FUNCTION "public"."match_repo_chunks"("query_embedding" "public"."vector", "match_count" integer, "match_threshold" double precision, "filter_category" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."generation_outputs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "user_intent" "text" NOT NULL,
    "style" "text" DEFAULT 'minimal'::"text" NOT NULL,
    "intensity" "text" DEFAULT 'medium'::"text" NOT NULL,
    "include_three_d" boolean DEFAULT false NOT NULL,
    "files" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "validation_score" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "generation_outputs_intensity_check" CHECK (("intensity" = ANY (ARRAY['subtle'::"text", 'medium'::"text", 'aggressive'::"text"]))),
    CONSTRAINT "generation_outputs_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'generating'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."generation_outputs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."generations" (
    "id" "uuid" NOT NULL,
    "user_id" "text" DEFAULT 'anonymous'::"text" NOT NULL,
    "request" "jsonb" NOT NULL,
    "files" "jsonb",
    "validation_score" "jsonb",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "error_message" "text",
    "duration_ms" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "generations_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'generating'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."generations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "status" "text",
    "current_step" integer DEFAULT 0,
    "completed_steps" "text"[] DEFAULT '{}'::"text"[],
    "failed_steps" "jsonb" DEFAULT '[]'::"jsonb",
    "request" "jsonb" NOT NULL,
    "generated_files" "jsonb",
    "validation_score" "jsonb",
    "error" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "completed_at" timestamp without time zone,
    CONSTRAINT "jobs_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'domain-profiling'::"text", 'designing'::"text", 'content'::"text", 'animating'::"text", 'coding'::"text", 'validating'::"text", 'completed'::"text", 'failed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."repo_chunks" (
    "id" "text" DEFAULT ("gen_random_uuid"())::"text" NOT NULL,
    "repo_name" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "code_snippet" "text" NOT NULL,
    "description" "text" DEFAULT ''::"text" NOT NULL,
    "embedding" "public"."vector"(1536),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "category" "text" DEFAULT 'animation'::"text" NOT NULL,
    "char_count" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "repo_chunks_category_check" CHECK (("category" = ANY (ARRAY['animation'::"text", 'scroll'::"text", 'webgl'::"text", 'components'::"text", 'typography'::"text", 'architecture'::"text"])))
);


ALTER TABLE "public"."repo_chunks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_quotas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "plan_key" "text" DEFAULT 'starter'::"text" NOT NULL,
    "generations_used" integer DEFAULT 0 NOT NULL,
    "reset_at" timestamp with time zone DEFAULT ("now"() + '1 mon'::interval) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_quotas_plan_key_check" CHECK (("plan_key" = ANY (ARRAY['starter'::"text", 'pro'::"text", 'agency'::"text"])))
);


ALTER TABLE "public"."user_quotas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "text" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "avatar_url" "text" DEFAULT ''::"text" NOT NULL,
    "stripe_customer_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."generation_outputs"
    ADD CONSTRAINT "generation_outputs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."generations"
    ADD CONSTRAINT "generations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."repo_chunks"
    ADD CONSTRAINT "repo_chunks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_quotas"
    ADD CONSTRAINT "user_quotas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_quotas"
    ADD CONSTRAINT "user_quotas_user_id_unique" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_generation_outputs_user_id" ON "public"."generation_outputs" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_generations_created_at" ON "public"."generations" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_generations_status" ON "public"."generations" USING "btree" ("status");



CREATE INDEX "idx_generations_user_id" ON "public"."generations" USING "btree" ("user_id");



CREATE INDEX "idx_jobs_created_at" ON "public"."jobs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_jobs_status" ON "public"."jobs" USING "btree" ("status");



CREATE INDEX "idx_jobs_user_id" ON "public"."jobs" USING "btree" ("user_id");



CREATE INDEX "idx_jobs_user_status" ON "public"."jobs" USING "btree" ("user_id", "status");



CREATE INDEX "idx_repo_chunks_category" ON "public"."repo_chunks" USING "btree" ("category");



CREATE INDEX "idx_repo_chunks_embedding" ON "public"."repo_chunks" USING "hnsw" ("embedding" "public"."vector_cosine_ops") WITH ("m"='16', "ef_construction"='64');



CREATE UNIQUE INDEX "idx_repo_chunks_unique" ON "public"."repo_chunks" USING "btree" ("repo_name", "file_path", "char_count");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



ALTER TABLE ONLY "public"."generation_outputs"
    ADD CONSTRAINT "generation_outputs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_quotas"
    ADD CONSTRAINT "user_quotas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Service role full access" ON "public"."generations" USING (true) WITH CHECK (true);



ALTER TABLE "public"."generation_outputs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."generations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."jobs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "outputs_select_own" ON "public"."generation_outputs" FOR SELECT USING ((("auth"."uid"())::"text" = "user_id"));



CREATE POLICY "quotas_select_own" ON "public"."user_quotas" FOR SELECT USING ((("auth"."uid"())::"text" = "user_id"));



ALTER TABLE "public"."repo_chunks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "service_role_all" ON "public"."generation_outputs" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "service_role_all" ON "public"."repo_chunks" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "service_role_all" ON "public"."user_quotas" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "service_role_all" ON "public"."users" USING (("auth"."role"() = 'service_role'::"text"));



ALTER TABLE "public"."user_quotas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_select_own" ON "public"."users" FOR SELECT USING ((("auth"."uid"())::"text" = "id"));



CREATE POLICY "users_update_own" ON "public"."users" FOR UPDATE USING ((("auth"."uid"())::"text" = "id"));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."match_repo_chunks"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."match_repo_chunks"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_repo_chunks"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."match_repo_chunks"("query_embedding" "public"."vector", "match_count" integer, "match_threshold" double precision, "filter_category" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."match_repo_chunks"("query_embedding" "public"."vector", "match_count" integer, "match_threshold" double precision, "filter_category" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_repo_chunks"("query_embedding" "public"."vector", "match_count" integer, "match_threshold" double precision, "filter_category" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON TABLE "public"."generation_outputs" TO "anon";
GRANT ALL ON TABLE "public"."generation_outputs" TO "authenticated";
GRANT ALL ON TABLE "public"."generation_outputs" TO "service_role";



GRANT ALL ON TABLE "public"."generations" TO "anon";
GRANT ALL ON TABLE "public"."generations" TO "authenticated";
GRANT ALL ON TABLE "public"."generations" TO "service_role";



GRANT ALL ON TABLE "public"."jobs" TO "anon";
GRANT ALL ON TABLE "public"."jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."jobs" TO "service_role";



GRANT ALL ON TABLE "public"."repo_chunks" TO "anon";
GRANT ALL ON TABLE "public"."repo_chunks" TO "authenticated";
GRANT ALL ON TABLE "public"."repo_chunks" TO "service_role";



GRANT ALL ON TABLE "public"."user_quotas" TO "anon";
GRANT ALL ON TABLE "public"."user_quotas" TO "authenticated";
GRANT ALL ON TABLE "public"."user_quotas" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







