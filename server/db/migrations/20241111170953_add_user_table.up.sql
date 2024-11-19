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
  "confirmed" bool NOT NULL DEFAULT false
);

CREATE TABLE "chats" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "admin_email" varchar
);

CREATE TABLE "messages" (
  "id" bigint PRIMARY KEY NOT NULL,
  "chat_id" uuid NOT NULL,
  "content" text NOT NULL,
  "sender_email" varchar NOT NULL,
  "created_at" timestamp NOT NULL
);

CREATE INDEX ON "chat_accesses" ("user_email");

CREATE UNIQUE INDEX ON "friend_connections" ("user_email_from", "user_email_to");

CREATE INDEX ON "messages" ("chat_id");

ALTER TABLE "chat_accesses" ADD FOREIGN KEY ("chat_id") REFERENCES "chats" ("id") ON DELETE CASCADE;

ALTER TABLE "chat_accesses" ADD FOREIGN KEY ("user_email") REFERENCES "users" ("email");

ALTER TABLE "friend_connections" ADD FOREIGN KEY ("user_email_from") REFERENCES "users" ("email") ON DELETE CASCADE;

ALTER TABLE "friend_connections" ADD FOREIGN KEY ("user_email_to") REFERENCES "users" ("email") ON DELETE CASCADE;

ALTER TABLE "chats" ADD FOREIGN KEY ("admin_email") REFERENCES "users" ("email");

ALTER TABLE "messages" ADD FOREIGN KEY ("chat_id") REFERENCES "chats" ("id") ON DELETE CASCADE;

ALTER TABLE "messages" ADD FOREIGN KEY ("sender_email") REFERENCES "users" ("email") ON DELETE CASCADE;
