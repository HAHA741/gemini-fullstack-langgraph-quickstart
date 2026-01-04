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
    <>
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
        style={{width:"100%"}}
          onClick={() => {
            onConfirm(cTopic);
          }}
        >
          确认
        </Button>
      </Footer>
    </>
  );
};

export default ChatConfirm;

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 400px;
  overflow-y: auto;
  gap: 15px;
  padding-bottom: 50px;
  .item {
    border-radius: 5px;
    padding: 10px;
    background: #f5f5f5;
    cursor: pointer;
  }
  .item.active {
    color: #fff;
    background: rgba(0, 0, 0, 0.8);
  }
`;
const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 10px;
//   position: absolute;
//   bottom: 0;
  width: 100%;
`;
