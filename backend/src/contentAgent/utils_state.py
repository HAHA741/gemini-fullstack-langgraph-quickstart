"""
状态持久化工具
用于将对话状态保存到文件
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict


class StatePersistence:
    """状态持久化管理类"""
    
    def __init__(self, output_dir: str = "outputs/conversations"):
        """
        初始化持久化管理器
        
        Args:
            output_dir: 输出目录，默认为 outputs/conversations
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def _serialize_state(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        序列化状态对象，处理非 JSON 序列化的对象
        
        Args:
            state: 原始状态字典
            
        Returns:
            可序列化的状态字典
        """
        serialized = {}
        for key, value in state.items():
            try:
                # 尝试直接序列化
                json.dumps(value)
                serialized[key] = value
            except (TypeError, ValueError):
                # 如果失败，转换为字符串
                if hasattr(value, '__dict__'):
                    # 如果是对象，尝试转换为字典
                    try:
                        serialized[key] = value.model_dump() if hasattr(value, 'model_dump') else str(value)
                    except:
                        serialized[key] = str(value)
                else:
                    serialized[key] = str(value)
        return serialized
    
    def save_state(self, state: Dict[str, Any], conversation_id: str = None,save_dir: str = None) -> str:
        """
        保存对话状态到文件
        
        Args:
            state: 对话状态字典
            conversation_id: 对话 ID，如果不提供则使用时间戳
            
        Returns:
            保存的文件路径
        """
        output_dir = Path(save_dir) if save_dir else self.output_dir
        output_dir.mkdir(parents=True, exist_ok=True)
        # 生成文件名
        if conversation_id is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]
            filename = f"conversation_{timestamp}.json"
        else:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"conversation_{conversation_id}_{timestamp}.json"
        
        filepath = output_dir / filename
        
        # 序列化状态
        serialized_state = self._serialize_state(state)
        
        # 添加元数据
        output_data = {
            "timestamp": datetime.now().isoformat(),
            "conversation_id": conversation_id,
            "state": serialized_state
        }
        
        # 保存到文件
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, ensure_ascii=False, indent=2)
            print(f"✓ 对话状态已保存: {filepath}")
            return str(filepath)
        except Exception as e:
            print(f"✗ 保存状态失败: {str(e)}")
            raise
    
    def get_latest_conversations(self, limit: int = 10) -> list:
        """
        获取最近的对话文件列表
        
        Args:
            limit: 返回的最大文件数
            
        Returns:
            文件路径列表
        """
        files = sorted(self.output_dir.glob("conversation_*.json"), 
                      key=lambda x: x.stat().st_mtime, reverse=True)
        return [str(f) for f in files[:limit]]
    
    def load_conversation(self, filepath: str) -> Dict[str, Any]:
        """
        加载保存的对话
        
        Args:
            filepath: 对话文件路径
            
        Returns:
            对话状态字典
        """
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return data
        except Exception as e:
            print(f"✗ 加载对话失败: {str(e)}")
            raise


# 全局实例
persistence = StatePersistence()
