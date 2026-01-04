/**
 * API 请求服务
 */

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:8000"
  : "http://localhost:8123";

export interface Conversation {
  id: string;
  filename: string;
  size: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 获取所有对话列表
 */
export async function getConversations(): Promise<Conversation[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations`);
    const result: ApiResponse<Conversation[]> = await response.json();
    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.error || "Failed to fetch conversations");
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
}

/**
 * 获取单个对话详情
 */
export async function getConversation(conversationId: string): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/conversations/${conversationId}`
    );
    const result: ApiResponse<any> = await response.json();
    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.error || "Failed to fetch conversation");
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw error;
  }
}

/**
 * 删除对话
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/conversations/${conversationId}`,
      { method: "DELETE" }
    );
    const result: ApiResponse<null> = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to delete conversation");
    }
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
}

/**
 * 健康检查
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const result = await response.json();
    return result.status === "ok";
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
}

/**
 * 获取字幕文件列表
 */
export async function getSrtList(): Promise<Array<{ filename: string; path?: string }>> {
  try {
    console.log(`🔄 Fetching SRT list from: ${API_BASE_URL}/api/getSrtList`);
    const response = await fetch(`${API_BASE_URL}/api/getSrtList`);
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result: ApiResponse<Array<{ filename: string; path?: string }>> = await response.json();
    
    console.log("Response data:", result);
    
    if (result.success && result.data) {
      console.log(`✓ Successfully fetched ${result.data.length} SRT files`);
      return result.data;
    }
    
    throw new Error(result.error || "Failed to fetch SRT list");
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error fetching SRT list: ${errorMsg}`);
    throw error;
  }
}

/**
 * 上传 SRT 文件
 */
export async function uploadSrt(file: File): Promise<{ filename: string; data: boolean }> {
  try {
    console.log(`📤 Uploading file: ${file.name}`);
    
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch(`${API_BASE_URL}/api/uploadSrt`, {
      method: "POST",
      body: formData,
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result: ApiResponse<{ filename: string; data: boolean }> = await response.json();
    
    console.log("Upload response:", result);
    
    if (result.success && result.data) {
      console.log(`✓ Successfully uploaded: ${result.data.filename}`);
      return result.data;
    }
    
    throw new Error(result.error || "Failed to upload SRT file");
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error uploading SRT file: ${errorMsg}`);
    throw error;
  }
}
