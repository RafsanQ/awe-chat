interface Props {
  chatId: string;
}

export default function ChatScreenComponent(props: Props) {
  return <h2>This is the Chat Page for chat id: {props.chatId}</h2>;
}
