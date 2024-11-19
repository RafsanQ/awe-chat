CREATE TABLE "users" (
  "email" varchar PRIMARY KEY NOT NULL,
  "username" varchar NOT NULL,
  "password" varchar NOT NULL
);

CREATE TABLE "chat_accesses" (
  "chat_id" uuid NOT NULL,
  "user_email" varchar NOT NULL,
  "is_direct_message" bool NOT NULL DEFAULT true
);

CREATE TABLE "friend_connections" (
  "user_email_from" varchar NOT NULL,
  "user_email_to" varchar NOT NULL,
  "status" varchar NOT NULL
);

CREATE TABLE "chats" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "admin_email" varchar
);

CREATE TABLE "chat_lines" (
  "id" bigint PRIMARY KEY NOT NULL,
  "chat_id" uuid NOT NULL,
  "text" text NOT NULL,
  "written_by" varchar NOT NULL,
  "created_at" timestamp NOT NULL
);

CREATE INDEX ON "chat_accesses" ("user_email");

CREATE UNIQUE INDEX ON "friend_connections" ("user_email_from", "user_email_to");

CREATE INDEX ON "friend_connections" ("status");

CREATE INDEX ON "chat_lines" ("chat_id");

CREATE INDEX ON "chat_lines" ("written_by");

ALTER TABLE "chat_accesses" ADD FOREIGN KEY ("chat_id") REFERENCES "chats" ("id");

ALTER TABLE "chat_accesses" ADD FOREIGN KEY ("user_email") REFERENCES "users" ("email");

ALTER TABLE "friend_connections" ADD FOREIGN KEY ("user_email_from") REFERENCES "users" ("email");

ALTER TABLE "friend_connections" ADD FOREIGN KEY ("user_email_to") REFERENCES "users" ("email");

ALTER TABLE "chats" ADD FOREIGN KEY ("admin_email") REFERENCES "users" ("email");

ALTER TABLE "chat_lines" ADD FOREIGN KEY ("chat_id") REFERENCES "chats" ("id");

ALTER TABLE "chat_lines" ADD FOREIGN KEY ("written_by") REFERENCES "users" ("email");
