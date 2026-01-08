import styled from "styled-components";
import { Attachments, Sender } from "@ant-design/x";
import {
  Badge,
  Button,
  Divider,
  Dropdown,
  Flex,
  GetRef,
  MenuProps,
  message,
  Select,
} from "antd";
import {
  CloudUploadOutlined,
  DownOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { getSrtList, uploadSrt } from "@/lib/api";
import { useRequest } from "ahooks";
import { useEffect, useRef, useState } from "react";

interface SenderProps {
  onSubmit: (input: any) => void;
  prefix?: React.ReactNode;
  footer?: (actionNode: React.ReactNode) => React.ReactNode;
  autoSize?: {
    minRows?: number;
    maxRows?: number;
  };
}

const AISender = ({ onSubmit }: SenderProps) => {
  const { data: srtList, refresh } = useRequest(getSrtList);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [srt, setSrt] = useState("");

  const senderRef = useRef<GetRef<typeof Sender>>(null);
  const [isUploading, setIsUploading] = useState(false);
  const handleFileUpload = async ({ file }) => {
    // const file = e.target.files?.[0];
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
      refresh?.();
    } catch (error) {
      alert(
        `✗ 上传失败: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsUploading(false);
      // 重置文件输入
      //   if (e.target) {
      //     e.target.value = "";
      //   }
    }
  };

  useEffect(() => {
    // Clear all created object URLs when the component is unmounted
    return () => {
      items.forEach((item) => {
        if (item.url?.startsWith("blob:")) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, []);
  const senderHeader = (
    <Sender.Header
      title="Attachments"
      open={open}
      onOpenChange={setOpen}
      styles={{
        content: {
          padding: 0,
        },
      }}
    >
      <Attachments
        // Mock not real upload file
        beforeUpload={() => false}
        items={items}
        onChange={handleFileUpload}
        placeholder={(type) =>
          type === "drop"
            ? {
                title: "Drop file here",
              }
            : {
                icon: <CloudUploadOutlined />,
                title: "Upload files",
                description: "Click or drag files to this area to upload",
              }
        }
        getDropContainer={() => senderRef.current?.nativeElement}
      />
    </Sender.Header>
  );
  return (
    <SenderWrapper>
      <Sender
        header={senderHeader}
        onSubmit={(value) => {
          onSubmit({ content: value, srt: srt });
          message.success("发送成功");
          setText("");
        }}
        prefix={
          <Badge dot={items.length > 0 && !open}>
            <Button onClick={() => setOpen(!open)} icon={<LinkOutlined />} />
          </Badge>
        }
        footer={(actionNode) => {
          return (
            <Flex justify="space-between" align="center">
              <Select
                onChange={setSrt}
                placeholder="请选择知识源"
                options={srtList?.map((srt) => ({
                  label: srt.filename,
                  value: srt.filename,
                }))}
              ></Select>
              <Button
                type="primary"
                onClick={() => {
                  onSubmit({ content: "" });
                }}
              >
                构建主题
              </Button>
            </Flex>
          );
        }}
        autoSize={{ minRows: 3, maxRows: 6 }}
      />
    </SenderWrapper>
  );
};
export default AISender;

export const SenderWrapper = styled.div`
  border-radius: 16px;
  overflow: hidden;
  background-color: #f5f5f5;
`;
