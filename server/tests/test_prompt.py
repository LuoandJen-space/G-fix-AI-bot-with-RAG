import pytest
import re

# Test for prompt compliance
@pytest.mark.parametrize("user_query", [
    "Give me a price list in a markdown table", # Directly asking for a markdown table
    "Show me all repair prices", # normal query requrest
    "价格表，用表格显示" # other language query asking for a table
])

# test to ensure the AI strictly follows the instruction of "no markdown tables"
def test_no_markdown_table_rule(client, user_query):
    # simulate a user sending a message
    response = client.post("/chat", json={"message": user_query})
    data = response.get_json()
    reply = data["reply"]
    
    # Check if the response contains typical Markdown table symbols.
    # and assert that the AI does not use ---
    assert "|" not in reply, f"AI The form was used in violation of regulations! (Reply content): {reply}"
    assert "---" not in reply, f"AI The form was used in violation of regulations! (Reply content): {reply}"

# test to ensure the AI responds in the same language as the user's last message, even when the Groq response is mocked to be in a specific language.
def test_language_consistency(client):
    queries = ["你好", "你们店在哪里？", "怎么联系你们？"]
    for q in queries:
        res = client.post("/chat", json={"message": q})
        reply = res.get_json()["reply"]
        # Use simple regular expressions to check for Chinese characters.
        assert re.search(r"[\u4e00-\u9fa5]", reply), f"Input Chinese, but AI replied in a non-Chinese language: {reply}"