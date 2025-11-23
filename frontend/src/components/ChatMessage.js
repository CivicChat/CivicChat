export default function ChatMessage({ sender, text }) {
  return (
    <div className={`chat-message ${sender}`}>
      <p>{text}</p>
    </div>
  );
}
