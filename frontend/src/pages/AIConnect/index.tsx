import { useStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import styled from "styled-components";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ChatMessagesView } from "@/components/ChatMessagesView";
import { threadData } from "../Main/common";
const AIConnect = () => {
  const { assistantId } = useParams<{ assistantId: string }>();
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const thread = useStream({
    apiUrl: import.meta.env.DEV
      ? "http://localhost:2024"
      : "http://localhost:8123",
    assistantId: assistantId as string,
    onError: (error: any) => {
      setError(error?.message || "");
    },
  });
  const handleSubmit = useCallback(
    (input: any) => {
      if (!assistantId) return;
      return (
        threadData?.[assistantId] &&
        threadData[assistantId].submit(thread, input)
      );
    },
    [thread, assistantId]
  );
  const handleCancel = useCallback(() => {
    thread.stop();
  }, [thread]);

  if (error) {
    return (
      <div className="flex h-screen bg-neutral-800 text-neutral-100 font-sans antialiased">
        <main className="h-full w-full max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex flex-col items-center justify-center gap-4">
              <h1 className="text-2xl text-red-400 font-bold">Error</h1>
              <p className="text-red-400">{JSON.stringify(error)}</p>
              <Button
                variant="destructive"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <Wrapper>
      <Main>
        <ChatMessagesView
          messages={thread.messages}
          // messages={[{type: "human", content: "hello"}]}
          isLoading={thread.isLoading}
          scrollAreaRef={scrollAreaRef}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          liveActivityEvents={[]}
          historicalActivities={{}}
        />
        {/* {thread.messages.length === 0 ? (
          <WelcomeScreen
            handleSubmit={handleSubmit}
            isLoading={thread.isLoading}
            onCancel={handleCancel}
          />
        ) : (
          <ChatMessagesView
            messages={thread.messages}
            isLoading={thread.isLoading}
            scrollAreaRef={scrollAreaRef}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            liveActivityEvents={[]}
            historicalActivities={{}}
          />
        )} */}
      </Main>
    </Wrapper>
  );
};

export default AIConnect;

export const Wrapper = styled.div`
  display: flex;
  height: 100vh;

  background-color: #262626; /* neutral-800 */
  color: #f5f5f5; /* neutral-100 */

  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;
export const Main = styled.main`
  height: 100%;
  width: 100%;
  max-width: 56rem; /* max-w-4xl = 896px */

  margin-left: auto;
  margin-right: auto;
`;
