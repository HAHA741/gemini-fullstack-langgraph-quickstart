import http.client
import json
import os
import base64
from datetime import datetime

def save_response_and_images(prompt: str, root_folder: str = "outputs/comics") -> dict:
    """
    调用 Yunwu AI 生成内容，并将完整响应和图片保存到不同子文件夹。

    参数:
        prompt: 文本描述
        root_folder: 根文件夹

    返回:
        dict: API 返回的完整 JSON
    """
    # 1️⃣ 创建文件夹
    responses_folder = os.path.join(root_folder, "responses")
    images_folder = os.path.join(root_folder, "images")
    os.makedirs(responses_folder, exist_ok=True)
    os.makedirs(images_folder, exist_ok=True)

    # 2️⃣ 调用 API
    conn = http.client.HTTPSConnection("yunwu.ai")
    payload = json.dumps({
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]}
    })
    headers = {
        'Authorization': 'Bearer ' + os.getenv("YUNWU_API_KEY"),
        'Content-Type': 'application/json'
    }

    conn.request(
        "POST",
        "/v1beta/models/gemini-3-pro-image-preview:generateContent",
        payload,
        headers
    )
    res = conn.getresponse()
    data = res.read()
    result = json.loads(data.decode("utf-8"))

    # 3️⃣ 保存完整 JSON 响应
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    json_path = os.path.join(responses_folder, f"{timestamp}_response.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"完整响应已保存到 {json_path}")

    # 4️⃣ 保存图片
    saved_images = []
    candidates = result.get("candidates", [])
    for i, cand in enumerate(candidates):
        parts = cand.get("content", {}).get("parts", [])
        for j, part in enumerate(parts):
            if "inlineData" in part:
                try:
                    data_b64 = part["inlineData"]["data"]
                    mime = part["inlineData"].get("mimeType", "image/png")
                    ext = mime.split("/")[-1]  # png, jpeg 等
                    image_bytes = base64.b64decode(data_b64)
                    image_path = os.path.join(images_folder, f"{timestamp}_{i}_{j}.{ext}")
                    with open(image_path, "wb") as f:
                        f.write(image_bytes)
                    saved_images.append(image_path)
                    print(f"图片已保存到 {image_path}")
                    return {"images": saved_images}
                except Exception as e:
                    print(f"保存图片出错: {e}")

    if not saved_images:
        print("响应中没有找到图片数据")

    return {"images": saved_images}
# 测试
# save_response_and_images("Hi, can you create a 3d rendered image of a pig with wings and a top hat flying over a happy futuristic scifi city with lots of greenery?")
