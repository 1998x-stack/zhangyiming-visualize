#!/usr/bin/env python3
"""Generate tags and keywords for each quote in the JSONL file using DashScope API."""

import json
import os
import time
from dashscope import Generation
from http import HTTPStatus

INPUT_FILE = "zhangyiming_weibo.jsonl"
OUTPUT_FILE = "zhangyiming_weibo_tagged.jsonl"
BATCH_SIZE = 5

SYSTEM_PROMPT = """你是一个中文内容标签专家。请为给定的语录生成3-5个精准的标签（tags）和2-3个关键词（keywords）。

要求：
- tags: 3-5个，描述主题领域（如：自我认知、沟通技巧、延迟满足、心态管理）
- keywords: 2-3个，提取内容中的核心概念词（如：委屈、坦诚、耐心）
- 所有标签和关键词都使用中文
- 标签要具体，不要太宽泛（避免"人生"、"思考"这类泛词）
- 返回纯JSON格式，不要其他文字

返回格式示例：
{"tags": ["自我认知", "情绪管理"], "keywords": ["有利", "委屈"]}"""


def generate_tags(content: str, max_retries: int = 3) -> dict:
    """Generate tags for a single quote using DashScope API."""
    for attempt in range(max_retries):
        try:
            response = Generation.call(
                model="qwen-turbo",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"语录：{content}"}
                ],
                result_format="message",
                temperature=0.3,
            )

            if response.status_code == HTTPStatus.OK:
                text = response.output.choices[0].message.content.strip()
                # Clean up markdown code blocks if present
                if text.startswith("```"):
                    text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
                return json.loads(text)
            else:
                print(f"  API error: {response.code} - {response.message}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
        except json.JSONDecodeError:
            print(f"  JSON parse error on attempt {attempt + 1}")
            if attempt < max_retries - 1:
                time.sleep(1)
        except Exception as e:
            print(f"  Exception on attempt {attempt + 1}: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)

    return {"tags": [], "keywords": []}


def main():
    # Read existing entries
    entries = []
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                entries.append(json.loads(line))

    print(f"Loaded {len(entries)} entries from {INPUT_FILE}")

    # Process entries
    processed = 0
    for i, entry in enumerate(entries):
        # Skip if already tagged
        if "tags" in entry and entry["tags"]:
            processed += 1
            continue

        content = entry["content"]
        print(f"[{i+1}/{len(entries)}] Generating tags for: {content[:40]}...")

        result = generate_tags(content)
        entry["tags"] = result.get("tags", [])
        entry["keywords"] = result.get("keywords", [])

        processed += 1

        # Rate limiting: small delay between batches
        if processed % BATCH_SIZE == 0:
            print(f"  ... processed {processed}/{len(entries)}, sleeping 1s")
            time.sleep(1)

    # Write output
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for entry in entries:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    print(f"\nDone! Wrote {len(entries)} entries to {OUTPUT_FILE}")

    # Print tag statistics
    all_tags = {}
    all_keywords = {}
    for entry in entries:
        for tag in entry.get("tags", []):
            all_tags[tag] = all_tags.get(tag, 0) + 1
        for kw in entry.get("keywords", []):
            all_keywords[kw] = all_keywords.get(kw, 0) + 1

    print(f"\nTop 20 tags:")
    for tag, count in sorted(all_tags.items(), key=lambda x: -x[1])[:20]:
        print(f"  {tag}: {count}")

    print(f"\nTop 20 keywords:")
    for kw, count in sorted(all_keywords.items(), key=lambda x: -x[1])[:20]:
        print(f"  {kw}: {count}")


if __name__ == "__main__":
    main()
