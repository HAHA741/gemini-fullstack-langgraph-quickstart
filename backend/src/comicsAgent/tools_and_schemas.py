from typing import List
from pydantic import BaseModel, Field


class StoryboardStruct(BaseModel):
    text: str = Field(
        description=(
            "Short text shown in this panel, such as narration or dialogue. "
            "Keep it concise. Leave empty if no text is needed."
        )
    )
    description: str = Field(
        description=(
            "A brief summary of what this panel represents in the story. "
            "Used as a high-level explanation, not for drawing details."
        )
    )
    scene: str = Field(
        description=(
            "The environment or setting where this panel takes place. "
            "Describe only the necessary background elements."
        )
    )
    action: str = Field(
        description=(
            "The single main action performed by the character in this panel. "
            "Focus on one clear, observable action."
        )
    )
    expression: str = Field(
        description=(
            "The primary facial expression or emotional state of the character in this panel. "
            "Use one dominant emotion only."
        )
    )
    details: str = Field(
        description=(
            "Additional visual details that help clarify the panel, such as props, posture, "
            "or small environmental elements. Do not repeat action or scene."
        )
    )
class StoryboardResult(BaseModel):
    panels: List[StoryboardStruct] = Field(
        description=(
            "An ordered list of storyboard panels. "
            "Each panel represents one distinct moment in the story. "
            "Panels must follow the story sequence and together fully cover the story, "
            "without adding or omitting events."
        )
    )