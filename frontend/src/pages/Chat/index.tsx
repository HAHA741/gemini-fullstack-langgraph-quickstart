import { useStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";
import { useState, useEffect, useRef, useCallback } from "react";
import { ProcessedEvent } from "@/components/ActivityTimeline";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ChatMessagesView } from "@/components/ChatMessagesView";
import { Button } from "@/components/ui/button";
import { OverallState } from "@/config/defaults";
import BaseModel from "../../components/BaseModel";
import ChatConfirm from "../../components/ChatConfirm";
import { useParams } from "react-router-dom";
const Chat = () => {
  const { assistantId } = useParams<{ assistantId: string }>();
  const [processedEventsTimeline, setProcessedEventsTimeline] = useState<
    ProcessedEvent[]
  >([]);
  const [historicalActivities, setHistoricalActivities] = useState<any>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const hasFinalizeEventOccurredRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [historyThreadData, setHistoryThreadData] = useState<any>({});

  // 注意：删除了之前那个监听 assistantId 变化手动重置状态的 useEffect
  // 因为 key 的变化会自动重置组件内的所有 state

  const thread = useStream<OverallState>({
    apiUrl: import.meta.env.DEV
      ? "http://localhost:2024"
      : "http://localhost:8123",
    assistantId: assistantId, // 使用传入的 props
    messagesKey: "messages",
    onUpdateEvent: (event: any) => {
      console.log("Event:", event);
      let processedEvent: ProcessedEvent | null = null;
      if (event.save_state) {
        processedEvent = {
          title: "文章已保存",
          data: "",
        };
      } else if (event.generate_title) {
        processedEvent = {
          title: "已生成10个建议标题",
          data: event.generate_title?.titles || "",
        };
      } else if (event.generate_article) {
        processedEvent = {
          title: "已生成文章",
          data: event.generate_article?.article || "",
        };
      } else if (event.analyze_subtitle) {
        processedEvent = {
          title: "已生成总结知识点",
          data: event.analyze_subtitle?.viewpoints || "",
        };
      } else if (event.generate_topic) {
        setVisible(true);
        setTopics(event.generate_topic?.topics || []);
        setHistoryThreadData(event.generate_topic);
        console.log("ChatSession:", thread);
      }
      if (processedEvent) {
        setProcessedEventsTimeline((prevEvents) => [
          ...prevEvents,
          processedEvent!,
        ]);
      }
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [thread.messages]);

  useEffect(() => {
    console.log("消息流：", thread.messages);
    if (
      hasFinalizeEventOccurredRef.current &&
      !thread.isLoading &&
      thread.messages.length > 0
    ) {
      const lastMessage = thread.messages[thread.messages.length - 1];
      if (lastMessage && lastMessage.type === "ai" && lastMessage.id) {
        setHistoricalActivities((prev) => ({
          ...prev,
          [lastMessage.id!]: [...processedEventsTimeline],
        }));
      }
      hasFinalizeEventOccurredRef.current = false;
    }
  }, [thread.messages, thread.isLoading, processedEventsTimeline]);

  const handleSubmit = useCallback(
    (submittedInputValue: string, effort: string, srt: string) => {
      const newMessages: Message[] = [
        ...(thread.messages || []),
        {
          type: "human",
          content: submittedInputValue,
          id: Date.now().toString(),
        },
      ];
      thread.submit({
        description:submittedInputValue,
        messages: newMessages,
        subtitle_text: "",
        core_topic: "",
        viewpoints: "",
        article: "",
        titles: "",
        warnings: "",
        review_result: "",
        srt,
        effort,
      });
    },
    [thread]
  );

  const handleCancel = useCallback(() => {
    thread.stop();
    // window.location.reload(); // 不需要 reload 了，React 状态管理更好
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
    <>
      <div className="flex h-screen bg-neutral-800 text-neutral-100 font-sans antialiased">
        <main className="h-full w-full max-w-4xl mx-auto">
          {thread.messages.length === 0 ? (
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
              liveActivityEvents={processedEventsTimeline}
              historicalActivities={historicalActivities}
              // 将外层的 setter 传递给子组件
              changeAssistant={(val) => {
                console.log("切换助手：", val);
              }}
            />
          )}
          <BaseModel
            title="选择话题"
            visible={visible}
            onCancel={() => {
              setVisible(false);
            }}
          >
            <ChatConfirm
              topics={topics}
              onConfirm={(topic) => {
                setVisible(false);
                thread.submit({
                  ...historyThreadData,
                  selected_topic: topic,
                });
              }}
            />
          </BaseModel>
        </main>
      </div>
    </>
  );
};

export default Chat;
