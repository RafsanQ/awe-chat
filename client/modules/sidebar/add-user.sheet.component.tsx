"use client";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import { PlusIcon, SearchIcon, UserPlus, UserCheck } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import AsyncButton from "../core/async-button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getProfileInfo, logout } from "@/modules/auth/util";
import UserSearchLoadingComponent from "./user-search-loading.component";
import { searchUsers, SearchedUser, sendFriendRequest } from "@/lib/actions";

const formSchema = z.object({
  searchString: z.string().min(4, {
    message: "Please enter at least 4 characters"
  })
});

export default function AddUserSheetComponent() {
  const userInfo = getProfileInfo();
  const searchBarForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchString: ""
    }
  });

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<SearchedUser[]>([]);

  if (!userInfo) {
    return;
  }

  const handleSearch = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { users, error } = await searchUsers(values.searchString);
      if (error) {
        if ([401, 403].includes(error.status)) {
          toast({
            variant: "destructive",
            title: "Invalid Credentials",
            description: "Invalid username or password",
            duration: 3000
          });
          logout();
        } else if (error.status === 400) {
          toast({
            variant: "destructive",
            title: "Bad Request",
            description: "Invalid search query",
            duration: 3000
          });
        } else {
          toast({
            variant: "destructive",
            title: "Oh no! Something went wrong",
            description: "The server ran into an error",
            duration: 3000
          });
        }
      } else if (users) {
        setData(users);
      }
    } catch (error) {
      setData([]);
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Could not connect to the server",
          description:
            error.message + ". Please check your internet connection",
          duration: 2000
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFriendRequest = async (friendEmail: string) => {
    setIsLoading(true);
    try {
      const { error } = await sendFriendRequest(friendEmail);
      if (error) {
        if ([401, 403].includes(error.status)) {
          toast({
            variant: "destructive",
            title: "Invalid Credentials",
            description: "Invalid username or password",
            duration: 3000
          });
          logout();
        } else if (error.status === 400) {
          toast({
            variant: "destructive",
            title: "Bad Request",
            description: "Invalid Parameters",
            duration: 3000
          });
        } else {
          toast({
            variant: "destructive",
            title: "Oh no! Something went wrong",
            description: "The server ran into an error",
            duration: 3000
          });
        }
      }
    } catch (error) {
      setData([]);
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Could not connect to the server",
          description:
            error.message + ". Please check your internet connection",
          duration: 2000
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger>
        <PlusIcon />
      </SheetTrigger>
      <SheetContent side={"left"}>
        <SheetHeader>
          <SheetTitle>Find New People</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <Form {...searchBarForm}>
          <form
            className="space-y-4"
            onSubmit={searchBarForm.handleSubmit(handleSearch)}
          >
            <div className="flex flex-row gap-1 justify-between">
              <FormField
                control={searchBarForm.control}
                name="searchString"
                render={({ field }) => (
                  <FormItem className="text-left flex-7 w-full">
                    <FormControl>
                      <Input
                        className="focus-visible:ring-0"
                        type="text"
                        placeholder="Search by username or email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AsyncButton
                className="flex-3"
                type="submit"
                isLoading={isLoading}
                onlyIcon
              >
                <SearchIcon />
              </AsyncButton>
            </div>
          </form>
        </Form>
        <ScrollArea className="h-screen rounded-md p-2">
          {isLoading ? (
            <UserSearchLoadingComponent />
          ) : data ? (
            <div>
              {data.map((userInfo) => (
                <div
                  key={userInfo.email}
                  className="flex items-center space-x-4 rounded-md border p-4"
                >
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium leading-none m-y-2">
                      {userInfo.username}
                    </p>
                    <p className="text-sm text-muted-foreground m-y-2">
                      {userInfo.email}
                    </p>
                  </div>
                  <AsyncButton
                    disabled={userInfo.is_friend}
                    variant="secondary"
                    isLoading={false}
                    onlyIcon
                    onClick={() => handleSendFriendRequest(userInfo.email)}
                  >
                    {userInfo.is_friend ? <UserCheck /> : <UserPlus />}
                  </AsyncButton>
                </div>
              ))}
            </div>
          ) : (
            <></>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
