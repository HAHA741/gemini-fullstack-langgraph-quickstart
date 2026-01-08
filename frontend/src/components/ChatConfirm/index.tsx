import styled from "styled-components";
import { Button } from "../ui/button";
import { useState } from "react";

interface ChatConfirmProps {
  topics: string[];
  onConfirm: (topic: string) => void;
}
const ChatConfirm = ({ topics, onConfirm }: ChatConfirmProps) => {
  const [cTopic, setCTopic] = useState("");
  return (
    <Container>
      <Wrapper>
        {topics?.map((topic, index) => (
          <div
            className={`item ${cTopic == topic ? "active" : ""}`}
            key={index}
            onClick={() => setCTopic(topic)}
          >
            {topic}
          </div>
        ))}
      </Wrapper>

      <Footer>
        <Button
          style={{ width: "100%" }}
          disabled={!cTopic}
          onClick={() => onConfirm(cTopic)}
        >
          确认
        </Button>
      </Footer>
    </Container>
  );
};

export default ChatConfirm;

const Container = styled.div`
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 360px;
  overflow-y: auto;
  gap: 12px;
  padding: 16px;

  color: #1f2937; /* 更接近正文黑 */

  .item {
    padding: 12px 14px;
    border-radius: 8px;
    background: #f7f7f8;
    cursor: pointer;
    line-height: 1.5;
    font-size: 14px;
    transition: all 0.2s ease;

    &:hover {
      background: #ededee;
    }
  }

  .item.active {
    background: #111827;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const Footer = styled.div`
  position: sticky;
  bottom: 0;

  padding: 12px 16px;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;

  display: flex;
  justify-content: flex-end;
`;
