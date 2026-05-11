# Notification System Design

## Stage 1

### a) REST API contract

#### 1) List notifications
- Method: GET
- Path: /notifications
- Headers: Authorization: Bearer <token>
- Query params:
  - limit: number
  - page: number
  - notification_type: "Event" | "Result" | "Placement"
- Response JSON schema:
  - {
    "notifications": [
      {
        "ID": "uuid",
        "Type": "Event" | "Result" | "Placement",
        "Message": "string",
        "Timestamp": "YYYY-MM-DD HH:mm:ss"
      }
    ]
  }

#### 2) Mark one notification as read
- Method: PATCH
- Path: /notifications/:id/read
- Headers: Authorization: Bearer <token>
- Request body:
  - { "read": true }
- Response JSON schema:
  - { "ID": "uuid", "read": true }

#### 3) Mark all notifications as read
- Method: PATCH
- Path: /notifications/read-all
- Headers: Authorization: Bearer <token>
- Request body: {}
- Response JSON schema:
  - { "updated": number }

#### 4) Get unread count
- Method: GET
- Path: /notifications/unread-count
- Headers: Authorization: Bearer <token>
- Response JSON schema:
  - { "count": number }

### b) Real-time notification mechanism

Chosen approach: Server-Sent Events (SSE)

Justification:
- One-way server push fits notifications well
- Simpler than WebSocket for this use case
- Native browser support with EventSource
- Works over HTTP/2 and is easy to scale

Connection flow:
1) Client opens EventSource connection to /notifications/stream
2) Server pushes new notification events
3) Client updates UI and unread count in real time
