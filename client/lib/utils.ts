import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTimeDifferenceFromNow(givenTimeInput: Date) {
  const givenTime = dayjs(givenTimeInput);
  const timeBetween = dayjs().diff(givenTime);

  const differenceInSeconds = Math.ceil(timeBetween / 1000);

  const differenceInMinutes = Math.ceil(differenceInSeconds / 60);

  const differenceInHours = Math.ceil(differenceInMinutes / 60);

  const differenceInDays = Math.ceil(differenceInHours / 24);
  if (differenceInDays >= 7) return givenTime.format("DD MMM YYYY");
  if (differenceInDays > 1) return differenceInDays.toString() + " days ago";
  if (differenceInHours > 1) return differenceInHours.toString() + " hours ago";
  if (differenceInMinutes > 1)
    return differenceInMinutes.toString() + " min ago";
  return differenceInSeconds.toString() + " s ago";
}
