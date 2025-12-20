from typing import (List,Optional,Literal)
from pydantic import BaseModel, Field


class InfoUnit(BaseModel):
    id: int = Field(description="信息单元的顺序编号，按字幕出现顺序递增")

    content: str = Field(
        default="未知",description="该信息单元的核心内容，接近原字幕但做最小书面化处理"
    )
#      "情节事件","人物行为","冲突转折","背景交代","观点结论","观点解释","举例说明", "推测假设"
    info_type: str= Field(default="未知",description="该信息在内容结构中的角色,如 情节事件,人物行为,冲突转折,背景交代,观点结论,观点解释,举例说明, 推测假设")
#   "叙事型",  "逻辑型"
    structure_type: str= Field(default="未知",description="理解该信息是否依赖时间顺序,如叙事型,逻辑型")
        # "时间推进","因果", "递进","对比","并列","无明确关系"
    relation_to_prev:str = Field(default="未知",description="与前一个信息单元的主要关系,如时间推进,因果, 递进,对比,并列,无明确关系")
#        "陈述","强调","反问","对比","否定","中性"
    expression_style: str = Field(default="未知",description="字幕中该内容的表达方式,如陈述,强调,反问,对比,否定,中性")
#        "解说者","引用他人","不明确"
    source_role: str = Field(default="未知",description="该信息的发出者角色,如解说者,引用他人,不明确")
#        "明确", "不明确"
    confidence: str = Field(default="未知",description="字幕中是否对该信息表达了确定性,如明确,不明确")

class ViewPointsStruct(BaseModel):
    core_topic: str = Field(
        description="视频的核心主题，一句话概括，不解释"
    )

    info_units: List[InfoUnit] = Field(
        default=[],description="按字幕顺序排列的信息单元列表"
    )

    narrative_ratio: Optional[float] = Field(
        description="叙事型信息单元占比，用于判断是否为影视解说",
        ge=0,
        le=1
    )

    logic_ratio: Optional[float] = Field(
        description="逻辑型信息单元占比，用于判断是否为知识分享",
        ge=0,
        le=1
    )


