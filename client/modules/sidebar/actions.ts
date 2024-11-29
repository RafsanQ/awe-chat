"use server";
import { cookies } from "next/headers";

import { API_URL } from "@/config";
import { revalidateTag } from "next/cache";

export interface SearchedUser {
  email: string;
  username: string;
  is_friend: boolean;
}

export const searchUsers = async (searchString: string) => {
  const res = await fetch(
    `${API_URL}/users/search?user_email=${
      cookies().get("user_email")?.value
    }&search_string=${searchString}`,
    {
      method: "GET",
      headers: {
        Authorization: `${cookies().get("jwt")?.value}`,
        "Content-Type": "application/json"
      },
      cache: "force-cache",
      next: {
        tags: ["user-friends"]
      }
    }
  );

  if (res.ok) {
    const { users }: { users: SearchedUser[] } = await res.json();

    return { users, error: null };
  } else {
    return {
      users: [],
      error: {
        message: "Failed to fetch users. " + res.statusText,
        status: res.status
      }
    };
  }
};

export const sendFriendRequest = async (friendEmail: string) => {
  const res = await fetch(
    `${API_URL}/send-friend-request?user_email=${
      cookies().get("user_email")?.value
    }&friend_email=${friendEmail}`,
    {
      method: "GET",
      headers: {
        Authorization: `${cookies().get("jwt")?.value}`,
        "Content-Type": "application/json"
      }
    }
  );

  if (res.ok) {
    revalidateTag("user-friends");
    return { res: {}, error: null };
  } else {
    return {
      res: {},
      error: {
        message: "Failed to send Friend Request. " + res.statusText,
        status: res.status
      }
    };
  }
};
