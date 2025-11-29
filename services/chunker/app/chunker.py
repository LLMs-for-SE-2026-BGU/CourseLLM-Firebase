from typing import List, Dict, Any
import re


def chunk_markdown(markdown: str, max_chunk_size: int = 1000) -> List[Dict[str, Any]]:
    """Port of the repo's TypeScript chunker logic.

    Splits a Markdown string into chunks while tracking header path and
    avoiding headers inside fenced code blocks. If a buffered section
    exceeds `max_chunk_size`, it is split on paragraph boundaries.
    """
    lines = markdown.split('\n')
    chunks: List[Dict[str, Any]] = []

    header_stack: List[Dict[str, Any]] = []
    current_content: List[str] = []

    def flush_chunk():
        nonlocal current_content
        if not current_content:
            return
        full_content = '\n'.join(current_content).strip()
        if not full_content:
            current_content = []
            return

        current_header_path = [h['text'] for h in header_stack]

        if len(full_content) > max_chunk_size:
            # split by double newlines (paragraphs)
            paragraphs = re.split(r'\n\s*\n', full_content)
            temp_chunk = ''
            for paragraph in paragraphs:
                if temp_chunk and (len(temp_chunk) + 2 + len(paragraph)) > max_chunk_size:
                    chunks.append({'content': temp_chunk.strip(), 'header_path': list(current_header_path)})
                    temp_chunk = paragraph
                else:
                    temp_chunk = (temp_chunk + '\n\n' + paragraph) if temp_chunk else paragraph
            if temp_chunk.strip():
                chunks.append({'content': temp_chunk.strip(), 'header_path': list(current_header_path)})
        else:
            chunks.append({'content': full_content, 'header_path': list(current_header_path)})

        current_content = []

    in_code_block = False

    header_re = re.compile(r'^(#{1,6})\s+(.*)')

    for line in lines:
        if line.strip().startswith('```'):
            in_code_block = not in_code_block

        header_match = header_re.match(line)
        if header_match and not in_code_block:
            # flush existing content
            flush_chunk()

            level = len(header_match.group(1))
            text = header_match.group(2).strip()

            while header_stack and header_stack[-1]['level'] >= level:
                header_stack.pop()
            header_stack.append({'level': level, 'text': text})
        else:
            current_content.append(line)

    flush_chunk()
    return chunks
