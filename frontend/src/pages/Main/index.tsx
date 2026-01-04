import styled from "styled-components";
import { useNavigate } from "react-router-dom";

/** ===== 写死的智能体数据 ===== */
const agents = [
  {
    id: "contentAgent",
    name: "公众号创作助手",
    type: "内容 / 营销",
    description: "根据内容源，总结并生成公众号文章。",
    tags: ["文案", "公众号"],
    rating: 5,
  },
  {
    id: "xiaohongshuAgent",
    name: "小红书智能体",
    type: "内容 / 营销",
    description: "帮助你生成、重构和优化代码，提高开发效率。",
    tags: ["小红书", "文案"],
    rating: 5,
  },
  {
    id: "data",
    name: "数据分析助手",
    type: "数据 / BI",
    description: "用于数据分析、报表生成和业务洞察。",
    tags: ["分析", "报表", "趋势"],
    rating: 4,
  },
  {
    id: "service",
    name: "客服问答智能体",
    type: "客服 / 电商",
    description: "自动回复客户问题，适合电商与服务型场景。",
    tags: ["客服", "自动回复", "售后"],
    rating: 4,
  },
];

/** ===== 页面组件 ===== */
const Main = () => {
  const navigate = useNavigate();

  return (
    <Wrapper>
      <Header>
        <Title>选择一个智能体</Title>
        <SubTitle>点击卡片进入对应智能体工作台</SubTitle>
      </Header>

      <CardGrid>
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            onClick={() => navigate(`/chat/${agent.id}`)}
          >
            <CardHeader>
              <CardTitle>{agent.name}</CardTitle>
              <CardType>{agent.type}</CardType>
            </CardHeader>

            <CardDesc>{agent.description}</CardDesc>

            <TagList>
              {agent.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </TagList>

            <Rating>
              {"★".repeat(agent.rating)}
              {"☆".repeat(5 - agent.rating)}
            </Rating>
          </AgentCard>
        ))}
      </CardGrid>
    </Wrapper>
  );
};

/** ===== styled-components ===== */

const Wrapper = styled.div`
  min-height: 100vh;
  padding: 40px 48px;
  background: linear-gradient(180deg, #f5f7fb, #eef1f6);
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  margin: 0;
`;

const SubTitle = styled.p`
  margin-top: 8px;
  color: #666;
`;

/** 一行四个 */
const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
`;

/** 卡片整体 */
const AgentCard = styled.div`
  min-height: 260px;
  padding: 24px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-6px) scale(1.02);
    border-color: #1677ff;
    box-shadow: 0 12px 36px rgba(22, 119, 255, 0.2);
  }
`;

const CardHeader = styled.div`
  margin-bottom: 12px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const CardType = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #1677ff;
`;

const CardDesc = styled.p`
  flex: 1;
  margin: 12px 0;
  font-size: 14px;
  color: #555;
  line-height: 1.6;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const Tag = styled.span`
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 12px;
  background: #f0f4ff;
  color: #3458eb;
`;

const Rating = styled.div`
  font-size: 14px;
  color: #faad14;
  text-align: right;
`;

export default Main;
