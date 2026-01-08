import type React from "react";
import type { Message } from "@langchain/langgraph-sdk";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Copy, CopyCheck } from "lucide-react";
import { InputForm } from "@/components/InputForm";
import { Button } from "@/components/ui/button";
import { useState, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  ActivityTimeline,
  ProcessedEvent,
} from "@/components/ActivityTimeline"; // Assuming ActivityTimeline is in the same dir or adjust path
import ChatConfirm from "./ChatConfirm";
import "./css/nice-orange.css";

// Markdown component props type from former ReportView
type MdComponentProps = {
  className?: string;
  children?: ReactNode;
  [key: string]: any;
};

// Markdown components (from former ReportView.tsx)
const mdComponents = {
  h1: ({ className, children, ...props }: MdComponentProps) => (
    <h1 className={cn("text-2xl font-bold mt-4 mb-2", className)} {...props}>
      {children}
    </h1>
  ),
  h2: ({ className, children, ...props }: MdComponentProps) => (
    <h2 className={cn("text-xl font-bold mt-3 mb-2", className)} {...props}>
      {children}
    </h2>
  ),
  h3: ({ className, children, ...props }: MdComponentProps) => (
    <h3 className={cn("text-lg font-bold mt-3 mb-1", className)} {...props}>
      {children}
    </h3>
  ),
  p: ({ className, children, ...props }: MdComponentProps) => (
    <p className={cn("mb-3 leading-7", className)} {...props}>
      {children}
    </p>
  ),
  a: ({ className, children, href, ...props }: MdComponentProps) => (
    <Badge className="text-xs mx-0.5">
      <a
        className={cn("text-blue-400 hover:text-blue-300 text-xs", className)}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    </Badge>
  ),
  ul: ({ className, children, ...props }: MdComponentProps) => (
    <ul className={cn("list-disc pl-6 mb-3", className)} {...props}>
      {children}
    </ul>
  ),
  ol: ({ className, children, ...props }: MdComponentProps) => (
    <ol className={cn("list-decimal pl-6 mb-3", className)} {...props}>
      {children}
    </ol>
  ),
  li: ({ className, children, ...props }: MdComponentProps) => (
    <li className={cn("mb-1", className)} {...props}>
      {children}
    </li>
  ),
  blockquote: ({ className, children, ...props }: MdComponentProps) => (
    <blockquote
      className={cn(
        "border-l-4 border-neutral-600 pl-4 italic my-3 text-sm",
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }: MdComponentProps) => (
    <code
      className={cn(
        "bg-neutral-900 rounded px-1 py-0.5 font-mono text-xs",
        className
      )}
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ className, children, ...props }: MdComponentProps) => (
    <pre
      className={cn(
        "bg-neutral-900 p-3 rounded-lg overflow-x-auto font-mono text-xs my-3",
        className
      )}
      {...props}
    >
      {children}
    </pre>
  ),
  hr: ({ className, ...props }: MdComponentProps) => (
    <hr className={cn("border-neutral-600 my-4", className)} {...props} />
  ),
  table: ({ className, children, ...props }: MdComponentProps) => (
    <div className="my-3 overflow-x-auto">
      <table className={cn("border-collapse w-full", className)} {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ className, children, ...props }: MdComponentProps) => (
    <th
      className={cn(
        "border border-neutral-600 px-3 py-2 text-left font-bold",
        className
      )}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ className, children, ...props }: MdComponentProps) => (
    <td
      className={cn("border border-neutral-600 px-3 py-2", className)}
      {...props}
    >
      {children}
    </td>
  ),
};

// Props for HumanMessageBubble
interface HumanMessageBubbleProps {
  message: Message;
  mdComponents: typeof mdComponents;
}

// HumanMessageBubble Component
const HumanMessageBubble: React.FC<HumanMessageBubbleProps> = ({
  message,
  mdComponents,
}) => {
  return (
    <div
      id="nice"
      className={`text-white rounded-3xl break-words min-h-7 bg-neutral-700 max-w-[100%] sm:max-w-[90%] px-4 pt-3 rounded-br-lg`}
    >
      <ReactMarkdown>
        {/* {
          "# 为什么你花大价钱装修，家却总像出租屋？问题出在这五个“假精致”上\n\n装修，本是为了让家更美、更舒适。但很多人发现，明明预算没少花，效果图也好看，可装完的家，总透着一股挥之不去的“廉价感”。\n\n问题出在哪里？\n\n很多时候，恰恰出在我们为了追求“高级感”，而盲目选择的一些“假精致”元素上。它们看似时髦、显贵，实则经不起推敲，是拉低你家颜值的隐形杀手。\n\n今天，我们就来拆解这五个最常见的“假精致”陷阱，看看你家踩中了几个。\n\n## 陷阱一：被“重复感”毁掉的地面\n\n你有没有觉得，家里的瓷砖或地板，单看一片很美，铺满整个空间后，却显得呆板、生硬，甚至有点“假”？\n\n**问题真正的核心，不在于材质本身，而在于“版型”太少。**\n\n所谓版型，就是同一款瓷砖或地板，为了模仿天然材质的随机纹理，而设计出的不同花纹样式。版型越多，铺贴后的效果就越自然、越接近真实石材或木材。\n\n想象一下爵士白瓷砖：版型丰富的铺出来，纹理流动自然，宛若天成；而版型只有两三种的铺出来，就像复制粘贴的图案，机械的重复感扑面而来，瞬间暴露了它的人造身份。\n\n所以，买瓷砖时，别只问价格和花色，一定要问一句：“这款有几个版型？”通常，6-12个版型是保证自然效果的基础。如果商家含糊其辞或版型过少，你就要警惕了。\n\n**如果对复杂的花纹没把握，一个更稳妥的选择是：回归最简单的纯色。** 纯色瓷砖风格百搭，不易过时，从根本上规避了花纹重复的尴尬。\n\n地板也是同理。千万别只看手里那一小块样板。一定要让商家展示铺开后的整体效果图或实物案例。好的地板，颜色色调统一（如一致的灰、米黄），同时版型丰富，才能避免出现杂乱或呆板的两极分化。\n\n说到这里，你可能迷信“纯实木”。但真相是，不必一味执着。在合适的价位下（例如每平米不低于百元），实木多层或优质的复合地板，完全能达到纹理自然、脚感舒适的效果，性价比往往更高。\n\n**地面是家的底色。底色一旦“假”了，整个空间的质感就打了对折。**\n\n## 陷阱二：“亮光”带来的不是高级，是廉价\n\n为什么酒店大堂用亮光大理石显得富丽堂皇，搬到家里却可能灾难现场？\n\n**因为“亮光”是一种极其挑剔的材质。它需要绝对完美的平整度、足够大的空间和精心设计的光源来衬托。**\n\n而我们普通人的住宅，恰恰很难满足这些条件。\n\n首先，是平整度问题。便宜的亮光瓷砖，烧制工艺不到位，铺贴后侧光一看，表面常有波浪般的起伏，边角也可能凹陷。这种不平整在亮光反射下会被无限放大，反射出的光影扭曲变形，充满塑料感和廉价感。\n\n其次，是空间问题。普通住宅面积有限，地砖花纹选择也相对保守。亮光材质在狭小空间里，不仅无法营造开阔感，反而会造成无处不在的光源污染。灯光、窗户、甚至家具的倒影杂乱地反射在墙面、天花板上，让空间显得凌乱刺眼，完全背离了家应有的放松氛围。\n\n这个道理同样适用于柜门。廉价的亮光烤漆柜门，近看常有明显的颗粒感或水波纹。而要做出真正平整如镜的高品质亮光烤漆，成本又非常高，对普通装修来说性价比极低。\n\n更不用说烤漆玻璃柜门了，它几乎只适配极简风格的平板门，难以融入其他风格，而且极易留下指纹、显脏，锋利的边角也存在安全隐患。\n\n**所以，家庭装修的材质选择，有一个几乎不会出错的法则：选哑光，弃亮光。**\n\n哑光砖或柔光砖，能温柔地吸收和漫反射光线，不仅完美掩盖了平整度上的微小瑕疵，更能营造出温馨、自然、令人放松的居家氛围。它高级得不张扬，才是适合日常生活的质感。\n\n## 陷阱三：像“补丁”一样存在的失败灯具\n\n灯具是空间的点睛之笔，但点错了，就是“败笔”。\n\n一个最常见的错误是：**装饰性灯具选得太小。**\n\n无论是吸顶灯还是吊灯，过小的尺寸悬浮在天花板上，会像一块尴尬的“补丁”或一顶可怜的“小帽子”，非但无法提升美感，反而会衬得天花板空旷廉价。\n\n如果你对选灯毫无头绪，或者想严格控制预算，那么记住一个万能公式：**选简单、超薄、与天花板紧密贴合的平板吸顶灯，并且，尺寸宁大勿小。** 卧室建议直径50厘米以上，客厅则至少70厘米。这能保证基础照明的均匀和大气。\n\n当然，吸顶灯的装饰性天生较弱。如果你想要更好的装饰效果，吊灯是更好的选择。但切记，吊灯也不能小！它是家里唯一可以悬在半空的装饰品，本身就应该被欣赏。\n\n安装时，要留出足够的高度来展示它最美的部分：餐厅吊灯底部距地1.7米以上，客厅则建议2米以上。\n\n但这里有一个关键认知必须扭转：**吊灯的主要作用不是照明，而是装饰。**\n\n用吊灯作为主要光源，要么亮度不够，要么太亮伤眼。正确的做法是，依靠均匀分布的筒灯、射灯来提供整体照明，而让吊灯在合适的亮度下，散发氛围光，成为视觉焦点。\n\n灯具，其实是装修中性价比极高的氛围营造工具。当硬装比较简单时，完全可以在灯具上多花些心思，选择造型感更强的款式，并多搭配落地灯、台灯、壁灯。这些分散的光源，既能满足不同场景的照明需求，其本身也是绝佳的空间装饰品。\n\n## 陷阱四：对“艺术墙面”的误解\n\n提到艺术墙面，很多人会想到那些花纹繁复、凹凸不平的艺术漆。但那种墙面容易审美疲劳，且一旦破损极难修补，并不适合普通家庭。\n\n**我们所说的提升质感的“艺术墙面”，其实主要指两类：蛋壳光乳胶漆和雅金石（肌理漆）。**\n\n蛋壳光乳胶漆，表面有着细腻如蛋壳般的微弱光泽。它比普通乳胶漆更有质感，更易擦洗，防霉防潮性能也更好，还能让室内光线更柔和明亮。当然，造价也比普通漆稍高。\n\n而雅金石、微水泥这类肌理漆，则能营造出当下非常流行的高级、侘寂风。它近看有着丰富的肌理和细节，远看则色调统一，这种含蓄的层次感，比单纯的彩色墙面更耐看，也更有品味。不过，它的价格也最为昂贵。\n\n这两种材质，都是从“质感”和“肌理”的维度去提升墙面，而不是靠夸张的图案。它们带来的高级感，是低调而绵长的。\n\n## 陷阱五：被“定制”困住的审美与灵活度\n\n全屋定制似乎是现代装修的标配，但它可能是让你家沦为“样板间”的元凶。\n\n**大多数市面上的定制柜，正陷入“款式颜色千篇一律”的困境。** 无论是流行的灰色，还是经典的木纹爱格板，家家户户的柜子长得都差不多，缺乏个性和设计美感。\n\n而真正好看、有设计细节（如特殊的比例分割、精致的拉手、独特的材质拼接）的定制柜，价格往往高不可攀（每平米高达四五千元），远超普通人的预算。\n\n以餐边柜为例。花一两万做一个通顶的定制柜，得到的可能只是一个巨大的、方方正正的储物盒子。而用同样的预算，你可以买到设计感十足、颜值超高、用料扎实的全实木成品柜。更重要的是，**成品家具拥有无可替代的灵活性。**\n\n这引出了关于“家”的一个最重要理念：**家不是一次性的静态展览，而是一个应该持续生长、变化的生命体。**\n\n我们为什么觉得电视背景墙最没必要做？因为它用硬装固定了电视的位置和客厅的布局，断绝了未来调整的可能性。\n\n一个充满活力的家，需要你经常去“折腾”：随着季节更换装饰画和窗帘，根据生活习惯调整家具布局，添置一盏新的落地灯，移走一个不再需要的边几……\n\n**少做死板的定制柜，多买可移动的成品家具；不做复杂的背景墙，留白墙面用软装去填充。** 这样，你的家才能容纳生活的变化，随着你的阅历和喜好一起成长、焕新。\n\n**真正的“高级感”，从不在于堆砌昂贵的材料和复杂的造型。而在于对细节质感的把控，对空间尺度的理解，以及留给生活的那份可以自由呼吸的余地和弹性。**\n\n避开这五个“假精致”的陷阱，你的家，就已经赢在了高级感的起跑线上。"
        } */}
        {typeof message.content === "string"
          ? message.content
          : JSON.stringify(message.content)}
      </ReactMarkdown>
    </div>
  );
};

// Props for AiMessageBubble
interface AiMessageBubbleProps {
  message: Message;
  historicalActivity: ProcessedEvent[] | undefined;
  liveActivity: ProcessedEvent[] | undefined;
  isLastMessage: boolean;
  isOverallLoading: boolean;
  mdComponents: typeof mdComponents;
  handleCopy: (text: string, messageId: string) => void;
  copiedMessageId: string | null;
}

// AiMessageBubble Component
const AiMessageBubble: React.FC<AiMessageBubbleProps> = ({
  message,
  historicalActivity,
  liveActivity,
  isLastMessage,
  isOverallLoading,
  mdComponents,
  handleCopy,
  copiedMessageId,
}) => {
  // Determine which activity events to show and if it's for a live loading message
  const activityForThisBubble =
    isLastMessage && isOverallLoading ? liveActivity : historicalActivity;
  const isLiveActivityForThisBubble = isLastMessage && isOverallLoading;

  return (
    <div className={`relative break-words flex flex-col`}>
      {activityForThisBubble && activityForThisBubble.length > 0 && (
        <div className="mb-3 border-b border-neutral-700 pb-3 text-xs">
          <ActivityTimeline
            processedEvents={activityForThisBubble}
            isLoading={isLiveActivityForThisBubble}
          />
        </div>
      )}
      <ReactMarkdown components={mdComponents}>
        {typeof message.content === "string"
          ? message.content
          : JSON.stringify(message.content)}
      </ReactMarkdown>
      <Button
        variant="default"
        className={`cursor-pointer bg-neutral-700 border-neutral-600 text-neutral-300 self-end ${
          message.content.length > 0 ? "visible" : "hidden"
        }`}
        onClick={() =>
          handleCopy(
            typeof message.content === "string"
              ? message.content
              : JSON.stringify(message.content),
            message.id!
          )
        }
      >
        {copiedMessageId === message.id ? "Copied" : "Copy"}
        {copiedMessageId === message.id ? <CopyCheck /> : <Copy />}
      </Button>
    </div>
  );
};

interface ChatMessagesViewProps {
  messages: Message[];
  isLoading: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  onSubmit: (input: any) => void;
  onCancel: () => void;
  liveActivityEvents: ProcessedEvent[];
  historicalActivities: Record<string, ProcessedEvent[]>;
  changeAssistant?: (assistantId: string) => void;
}

export function ChatMessagesView({
  messages,
  isLoading,
  scrollAreaRef,
  onSubmit,
  onCancel,
  liveActivityEvents,
  historicalActivities,
  changeAssistant,
}: ChatMessagesViewProps) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const renderBubble = (message: Message, isLast: boolean) => {
    switch (message.type) {
      case "human":
        return (
          <HumanMessageBubble message={message} mdComponents={mdComponents} />
        );
      case "ai":
        try {
          const parsed = JSON.parse(message.content);
          if (parsed?.type == "select") {
            return (
              <ChatConfirm
                topics={parsed.topics}
                onConfirm={(topic: string) => {
                  onSubmit({
                    content: topic,
                  });
                }}
              />
            );
          }
        } catch (e) {
          console.log(e);
        }

        return (
          // <HumanMessageBubble message={message} mdComponents={mdComponents} />
          <AiMessageBubble
            message={message}
            historicalActivity={historicalActivities[message.id!]}
            liveActivity={liveActivityEvents}
            isLastMessage={isLast}
            isOverallLoading={isLoading}
            mdComponents={mdComponents}
            handleCopy={handleCopy}
            copiedMessageId={copiedMessageId}
          />
        );
    }
  };
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
        <div className="p-4 md:p-6 space-y-2 max-w-4xl mx-auto pt-16">
          {messages.map((message, index) => {
            const isLast = index === messages.length - 1;
            return (
              <div key={message.id || `msg-${index}`} className="space-y-3">
                <div
                  className={`flex items-start gap-3 ${
                    message.type === "human" ? "justify-end" : ""
                  }`}
                >
                  {/* <HumanMessageBubble
                    message={message}
                    mdComponents={mdComponents}
                  /> */}
                  {renderBubble(message, isLast)}
                  {/* {message.type === "human" ? (
                    <HumanMessageBubble
                      message={message}
                      mdComponents={mdComponents}
                    />
                  ) : (
                    <AiMessageBubble
                      message={message}
                      historicalActivity={historicalActivities[message.id!]}
                      liveActivity={liveActivityEvents} // Pass global live events
                      isLastMessage={isLast}
                      isOverallLoading={isLoading} // Pass global loading state
                      mdComponents={mdComponents}
                      handleCopy={handleCopy}
                      copiedMessageId={copiedMessageId}
                    />
                  )} */}
                </div>
              </div>
            );
          })}
          {isLoading &&
            (messages.length === 0 ||
              messages[messages.length - 1].type === "human") && (
              <div className="flex items-start gap-3 mt-3">
                {" "}
                {/* AI message row structure */}
                <div className="relative group max-w-[85%] md:max-w-[80%] rounded-xl p-3 shadow-sm break-words bg-neutral-800 text-neutral-100 rounded-bl-none w-full min-h-[56px]">
                  {liveActivityEvents.length > 0 ? (
                    <div className="text-xs">
                      <ActivityTimeline
                        processedEvents={liveActivityEvents}
                        isLoading={true}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-start h-full">
                      <Loader2 className="h-5 w-5 animate-spin text-neutral-400 mr-2" />
                      <span>Processing...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </ScrollArea>
      <InputForm
        onSubmit={onSubmit}
        changeAssistant={changeAssistant}
        isLoading={isLoading}
        onCancel={onCancel}
        hasHistory={messages.length > 0}
      />
    </div>
  );
}
