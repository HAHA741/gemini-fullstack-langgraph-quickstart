from typing import TypedDict, List, Annotated, Optional,Dict
from pydantic import BaseModel
from langgraph.graph import add_messages

# 消息对象示例
class AIMessage(TypedDict):
    type: str
    content: str
    id: str

class CharacterInfo(TypedDict, total=False):  # total=False 表示字段可选
    name: str
    appearance: str
    personality: str

class ComicInfo(TypedDict, total=False):
    type: str
    style: str
    color_scheme: str
    character: CharacterInfo
    background_style: str

class PanelInfo(BaseModel):
    description: str = ""   # 面板描述
    scene: str = ""         # 场景/环境
    action: str = ""        # 动作
    expression: str = ""    # 表情/情绪
    details: str = ""       # 额外细节
    text: str = ""          # 对话或文字

class OverallState(TypedDict, total=False):
    description: str
    outline: str
    messages: Annotated[List[Dict], add_messages]  # 正确 reducer
    storyBoard: List[PanelInfo]  # 列表追加 reducer
    comicInfo: ComicInfo  # TypedDict 或字典
    images: List[str]
