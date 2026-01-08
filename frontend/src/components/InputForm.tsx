import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  SquarePen,
  Brain,
  Send,
  StopCircle,
  Zap,
  Cpu,
  Upload,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useRequest } from "ahooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSrtList, uploadSrt } from "@/lib/api";

// Updated InputFormProps
interface InputFormProps {
  onSubmit: (input:any) => void;
  onCancel: () => void;
  isLoading: boolean;
  hasHistory: boolean;
  changeAssistant?: (assistantId: string) => void;
}

export const InputForm: React.FC<InputFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  hasHistory,
  changeAssistant,
}) => {
  const { data: srtList, refetch } = useRequest(getSrtList);
  const [internalInputValue, setInternalInputValue] = useState("");
  const [effort, setEffort] = useState("contentAgent");
  const [model, setModel] = useState("gemini-2.5-flash-preview-04-17");
  const [srt, setSrt] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  // useEffect(() => {
  //   // if (changeAssistant) {
  //     console.log("changeAssistant:", effort);
  //     changeAssistant(effort);
  //   // }
  // }, [effort]);

  const handleInternalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // if (!internalInputValue.trim()) return;
    onSubmit({content:internalInputValue,srt});
    setInternalInputValue("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.name.toLowerCase().endsWith(".srt")) {
      alert("只支持 .srt 文件");
      return;
    }

    setIsUploading(true);
    try {
      await uploadSrt(file);
      alert(`✓ 文件 ${file.name} 上传成功`);
      // 刷新文件列表
      refetch?.();
    } catch (error) {
      alert(
        `✗ 上传失败: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsUploading(false);
      // 重置文件输入
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  useEffect(() => {
    console.log("srt列表：", srtList);
  }, [srtList]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit with Ctrl+Enter (Windows/Linux) or Cmd+Enter (Mac)
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleInternalSubmit();
    }
  };
  const typeList = [
    { value: "contentAgent", label: "知识分析输出" },
    { value: "xiaohongshuAgent", label: "小红书文章输出" },
  ];

  const isSubmitDisabled = !internalInputValue.trim() || isLoading;

  return (
    <form
      onSubmit={handleInternalSubmit}
      className={`flex flex-col gap-2 p-3 pb-4`}
    >
      <div
        className={`flex flex-row items-center justify-between text-white rounded-3xl rounded-bl-sm ${
          hasHistory ? "rounded-br-sm" : ""
        } break-words min-h-7 bg-neutral-700 px-4 pt-3 `}
      >
        <Textarea
          value={internalInputValue}
          onChange={(e) => setInternalInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="特殊解析要求"
          className={`w-full text-neutral-100 placeholder-neutral-500 resize-none border-0 focus:outline-none focus:ring-0 outline-none focus-visible:ring-0 shadow-none
                        md:text-base  min-h-[56px] max-h-[200px]`}
          rows={1}
        />
        <div className="-mt-3">
          <Button
            onClick={handleInternalSubmit}
            type="submit"
            variant="ghost"
            className={`text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 p-2 cursor-pointer rounded-full transition-all duration-200 text-base`}
            // disabled={isSubmitDisabled}
          >
            开始解析
            <Send className="h-5 w-5" />
          </Button>
          {/* {isLoading ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 cursor-pointer rounded-full transition-all duration-200"
              onClick={onCancel}
            >
              <StopCircle className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="ghost"
              className={`${
                isSubmitDisabled
                  ? "text-neutral-500"
                  : "text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
              } p-2 cursor-pointer rounded-full transition-all duration-200 text-base`}
              disabled={isSubmitDisabled}
            >
              Search
              <Send className="h-5 w-5" />
            </Button>
          )} */}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-row gap-2">

          {/* <div className="flex flex-row gap-2 bg-neutral-700 border-neutral-600 text-neutral-300 focus:ring-neutral-500 rounded-xl rounded-t-sm pl-2  max-w-[100%] sm:max-w-[90%]">
            <div className="flex flex-row items-center text-sm ml-2">
              <Cpu className="h-4 w-4 mr-2" />
              Model
            </div>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-[150px] bg-transparent border-none cursor-pointer">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-700 border-neutral-600 text-neutral-300 cursor-pointer">
                <SelectItem
                  value="gemini-2.0-flash"
                  className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
                >
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-yellow-400" /> 2.0 Flash
                  </div>
                </SelectItem>
                <SelectItem
                  value="gemini-2.5-flash-preview-04-17"
                  className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
                >
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-orange-400" /> 2.5 Flash
                  </div>
                </SelectItem>
                <SelectItem
                  value="gemini-2.5-pro-preview-05-06"
                  className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
                >
                  <div className="flex items-center">
                    <Cpu className="h-4 w-4 mr-2 text-purple-400" /> 2.5 Pro
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          <div className="flex flex-row gap-2 bg-neutral-700 border-neutral-600 text-neutral-300 focus:ring-neutral-500 rounded-xl rounded-t-sm pl-2  max-w-[100%] sm:max-w-[90%]">
            <div className="flex flex-row items-center text-sm ml-2">
              <Cpu className="h-4 w-6 mr-2" />
              内容源：
            </div>
            <Select value={srt} onValueChange={setSrt}>
              <SelectContent className="bg-neutral-700 border-neutral-600 text-neutral-300 cursor-pointer">
                {srtList?.map((item) => (
                  <SelectItem key={item.filename} value={item.filename}>
                    {item.filename}
                  </SelectItem>
                ))}
              </SelectContent>

              <SelectTrigger className="w-[150px] bg-transparent border-none cursor-pointer">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              {/* <SelectContent className="bg-neutral-700 border-neutral-600 text-neutral-300 cursor-pointer">
                <SelectItem
                  value="gemini-2.0-flash"
                  className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
                >
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-yellow-400" /> 2.0 Flash
                  </div>
                </SelectItem>
                <SelectItem
                  value="gemini-2.5-flash-preview-04-17"
                  className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
                >
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-orange-400" /> 2.5 Flash
                  </div>
                </SelectItem>
                <SelectItem
                  value="gemini-2.5-pro-preview-05-06"
                  className="hover:bg-neutral-600 focus:bg-neutral-600 cursor-pointer"
                >
                  <div className="flex items-center">
                    <Cpu className="h-4 w-4 mr-2 text-purple-400" /> 2.5 Pro
                  </div>
                </SelectItem>
              </SelectContent> */}
            </Select>
          </div>
          <div className="flex flex-row gap-2 bg-neutral-700 border-neutral-600 text-neutral-300 focus:ring-neutral-500 rounded-xl rounded-t-sm">
            <label>
              <input
                type="file"
                accept=".srt"
                onChange={handleFileUpload}
                disabled={isUploading || isLoading}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                className={`text-sm ${
                  isUploading || isLoading
                    ? "text-neutral-500 cursor-not-allowed"
                    : "text-neutral-300 hover:text-blue-400 hover:bg-blue-500/10"
                } p-2 cursor-pointer rounded-xl transition-all duration-200`}
                disabled={isUploading || isLoading}
                onClick={(e) => {
                  e.preventDefault();
                  const input = (
                    e.currentTarget.parentElement as HTMLLabelElement
                  )?.querySelector("input[type='file']") as HTMLInputElement;
                  input?.click();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "上传中..." : "上传SRT"}
              </Button>
            </label>
          </div>
        </div>
        {hasHistory && (
          <Button
            className="bg-neutral-700 border-neutral-600 text-neutral-300 cursor-pointer rounded-xl rounded-t-sm pl-2 "
            variant="default"
            onClick={() => window.location.reload()}
          >
            <SquarePen size={16} />
            New Search
          </Button>
        )}
      </div>
    </form>
  );
};
