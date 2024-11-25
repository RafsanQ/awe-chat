CREATE TABLE "users" (
  "email" varchar PRIMARY KEY NOT NULL,
  "username" varchar NOT NULL,
  "password" varchar NOT NULL
);

CREATE TABLE "chat_accesses" (
  "chat_id" uuid NOT NULL,
  "user_email" varchar NOT NULL,
  "last_message_time" timestamp NOT NULL DEFAULT (now()),
  "last_message_id" uuid
);

CREATE TABLE "friend_connections" (
  "user_email_from" varchar NOT NULL,
  "user_email_to" varchar NOT NULL,
  "confirmed" bool NOT NULL DEFAULT false
);

CREATE TABLE "chats" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "admin_email" varchar,
  "is_group_chat" bool NOT NULL DEFAULT false
);

CREATE TABLE "messages" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "chat_id" uuid NOT NULL,
  "content" text NOT NULL,
  "sender_email" varchar NOT NULL,
  "created_at" timestamp NOT NULL
);

CREATE INDEX ON "chat_accesses" ("user_email");

CREATE INDEX ON "chat_accesses" ("last_message_time");

CREATE UNIQUE INDEX ON "friend_connections" ("user_email_from", "user_email_to");

CREATE INDEX ON "messages" ("chat_id");

ALTER TABLE "chat_accesses" ADD FOREIGN KEY ("chat_id") REFERENCES "chats" ("id");

ALTER TABLE "chat_accesses" ADD FOREIGN KEY ("user_email") REFERENCES "users" ("email");

ALTER TABLE "chat_accesses" ADD FOREIGN KEY ("last_message_id") REFERENCES "messages" ("id");

ALTER TABLE "friend_connections" ADD FOREIGN KEY ("user_email_from") REFERENCES "users" ("email");

ALTER TABLE "friend_connections" ADD FOREIGN KEY ("user_email_to") REFERENCES "users" ("email");

ALTER TABLE "chats" ADD FOREIGN KEY ("admin_email") REFERENCES "users" ("email");

