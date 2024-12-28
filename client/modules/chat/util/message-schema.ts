import { z, ZodError } from "zod";

const messageSchema = z.object({
  id: z.string(),
  chat_id: z.string(),
  content: z.string().min(1).max(1000),
  sender_email: z.string().email(),
  created_at: z.string(),
  read_at: z.string().nullable(),
  is_removed: z.boolean()
});

export type MessageType = z.infer<typeof messageSchema>;

export const isValidMessage = (message: unknown): message is MessageType => {
  try {
    const res = messageSchema.safeParse(message);
    return res.success;
  } catch (e) {
    if (e instanceof ZodError) {
      console.log(e.issues);
    }
    return false;
  }
};
