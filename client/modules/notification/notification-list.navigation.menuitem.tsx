import { API_URL } from "@/config";
import { getCookie } from "cookies-next";

interface Props {
  userEmail: string;
}
export default function NotificationMenuList(props: Props) {
  // const getFriendRequestsResult = useSWR(
  //   `friend-requests?user_email${props.userEmail}`,
  //   fetcher
  // );

  return (
    <div>
      {/* {getFriendRequestsResult.error && (
        <div>Error {String(getFriendRequestsResult.error)}</div>
      )}
      {getFriendRequestsResult.isLoading && <div>Loading...</div>}
      {getFriendRequestsResult.data?.length ? (
        <ul>
          {getFriendRequestsResult.data.map((el) => (
            <li key={el.user_email}>
              {el.user_email} {el.username}
            </li>
          ))}
        </ul>
      ) : (
        <div>No Data</div>
      )} */}
    </div>
  );
}
