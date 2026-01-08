import type { Message } from "@langchain/langgraph-sdk";

export interface contentAgentState {
  messages: Array<any>; // 消息历史
  subtitle_text: string;
  core_topic: string;
  viewpoints: string;
  article: string;
  titles: string;
  warnings: string;
  review_result: string;
  [key: string]: any;
  comment: string;
  srt: string;
}

export const threadData = {
  contentAgent: {
    submit: (thread, input) => {
      const newMessages: Message[] = [...(thread.messages || [])];
      thread.submit({
        messages: newMessages,
        subtitle_text: "",
        core_topic: "",
        viewpoints: "",
        article: "",
        titles: "",
        warnings: "",
        review_result: "",
        srt: input.srt,
        comment: "",
      });
    },
    messages: () => {},
    updateEvent: (event: any) => {},
  },
  xiaohongshuAgent: {
    historyThreadData: undefined,
    submit(thread, input) {
      const newMessages: Message[] = [
        ...(thread.messages || []),
        {
          type: "human",
          content: input.content || "",
          id: Date.now().toString(),
        },
      ];
      if (this.historyThreadData) {
        thread.submit({
          ...this.historyThreadData,
          selected_topic: input.content,
        });
      } else {
        thread.submit({
          messages: newMessages,
          subtitle_text: "",
          selected_topic: input.content,
          viewpoints: "",
          article: "",
          titles: "",
          warnings: "",
          review_result: "",
          srt: input.srt,
          comment: "",
        });
      }
    },
    messages: () => {},
    updateEvent(event: any) {
      if (event.generate_topic) {
        this.historyThreadData = event.generate_topic;
      }
    },
  },
  comicsAgent: {
    submit: (thread, input) => {
      const newMessages: Message[] = [...(thread.messages || [])];
      thread.submit({
        messages: newMessages,
        description: input.content,
        outline: "",
      });
    },
  },
};
