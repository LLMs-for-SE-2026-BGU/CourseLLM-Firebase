# Feature Design:
A microservice that handle perssisent memory for each student.
Will use mem0 - https://mem0.ai/ as core logic
docs: https://docs.mem0.ai/api-reference

mem0 will act as a a "cache" for the syntesized memories
Postgress will save the full conversations

Relevant research paper:
https://github.com/Elvin-Yiming-Du/Survey_Memory_in_AI

Context engineering:
https://rlancemartin.github.io/2025/06/23/context_engineering/


## Basic Task:
A conversation with a student is ongoing
Persist the conversation into a database
Extract “key information” about the conversation (summarize) and store the inferred information about the student.


# Basic Functionality:
* **Get Conversation (With Pagination):** Gets  single page s of specific conversation
Input:
    - ChatID
    - Page (default 1)
output:
    - a single page (containing x messages) of messages from the chat (1 = neweset one, N = oldest) 

* **Get Conversations Of User:** Gets conversation titles + ID of a speicfic user.
Input:
    - userID
Output:
    - list of (title, ID) for all the conversations of the user

**Save Message:** Adds Message to the DB. Should have maybe a new conversation option, in case its the first message.
input: 
    - ChatID
    - Msg plain text

output:
    - Boolean, weather the operation was a success or a failure

* **Register:** Saves a new user (a companion function to the user saving guys).
Input: 
    - user ID created by the user login guys
    
Output:
    - Boolean, weather the operation was a success or a failure

# Basic Functionality:
* **Get Context:** UserId, ConvoId and Query. And returns the context to send to the LLM.
* **Save Context:** 
* **Save Context:** 


## Data Model
### Users
- Role
- Name
- userID
- User Info 

### Chats
- userID
- chatID
- Title

### Message
- chatID (also act as sequantial number)
- content (including date, sender)