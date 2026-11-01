import crypto from 'node:crypto';
import { classroomManager } from './classroomManager.js';
import { getRoomIdForClassroom } from './livekitService.js';

const WS_MAGIC_STRING = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

/**
 * Encodes a text string into a WebSocket DataFrame (RFC 6455 unmasked frame sent from server to client).
 * @param {string} text
 * @returns {Buffer}
 */
function encodeWebSocketFrame(text) {
  const payload = Buffer.from(text, 'utf8');
  const length = payload.length;

  let header;
  if (length <= 125) {
    header = Buffer.alloc(2);
    header[0] = 0x81; // FIN + Opcode 1 (text)
    header[1] = length;
  } else if (length <= 65535) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(length), 2);
  }

  return Buffer.concat([header, payload]);
}

/**
 * Decodes WebSocket frames received from client.
 * Supports standard masked client frames.
 */
class FrameDecoder {
  constructor(socket, onMessage, onClose) {
    this.socket = socket;
    this.onMessage = onMessage;
    this.onClose = onClose;
    this.buffer = Buffer.alloc(0);

    socket.on('data', (chunk) => this.processData(chunk));
    socket.on('end', () => this.handleClose());
    socket.on('error', () => this.handleClose());
  }

  processData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    while (this.buffer.length >= 2) {
      const byte1 = this.buffer[0];
      const byte2 = this.buffer[1];

      const fin = (byte1 & 0x80) !== 0;
      const opcode = byte1 & 0x0f;
      const isMasked = (byte2 & 0x80) !== 0;
      let payloadLength = byte2 & 0x7f;
      let offset = 2;

      // Opcode 8: Connection Close
      if (opcode === 0x08) {
        this.handleClose();
        return;
      }

      // Opcode 9: Ping -> Respond with Pong (Opcode 10)
      if (opcode === 0x09) {
        this.socket.write(Buffer.from([0x8a, 0x00]));
        this.buffer = this.buffer.slice(2);
        continue;
      }

      if (payloadLength === 126) {
        if (this.buffer.length < 4) return;
        payloadLength = this.buffer.readUInt16BE(2);
        offset = 4;
      } else if (payloadLength === 127) {
        if (this.buffer.length < 10) return;
        payloadLength = Number(this.buffer.readBigUInt64BE(2));
        offset = 10;
      }

      let maskKey = null;
      if (isMasked) {
        if (this.buffer.length < offset + 4) return;
        maskKey = this.buffer.slice(offset, offset + 4);
        offset += 4;
      }

      if (this.buffer.length < offset + payloadLength) {
        return; // wait for remaining frame payload
      }

      const payload = this.buffer.slice(offset, offset + payloadLength);
      this.buffer = this.buffer.slice(offset + payloadLength);

      // Unmask payload if masked
      if (isMasked && maskKey) {
        for (let i = 0; i < payload.length; i++) {
          payload[i] ^= maskKey[i % 4];
        }
      }

      if (opcode === 0x01) {
        // Text frame
        const text = payload.toString('utf8');
        try {
          const parsed = JSON.parse(text);
          this.onMessage(parsed);
        } catch {
          // ignore malformed JSON
        }
      }
    }
  }

  handleClose() {
    if (this.closed) return;
    this.closed = true;
    try {
      this.socket.destroy();
    } catch {}
    this.onClose();
  }
}

class ClassroomWebSocketServer {
  constructor() {
    // socket -> client metadata
    this.clients = new Map();
    // roomId -> Set of sockets
    this.roomSockets = new Map();
  }

  /**
   * Attaches upgrade listener to existing Node HTTP server.
   * @param {import('http').Server} httpServer
   */
  attach(httpServer) {
    httpServer.on('upgrade', (req, socket, head) => {
      const pathname = req.url?.split('?')[0];

      if (pathname === '/ws' || pathname === '/ws/classroom') {
        this.handleUpgrade(req, socket, head);
      } else {
        socket.destroy();
      }
    });
  }

  handleUpgrade(req, socket, head) {
    const key = req.headers['sec-websocket-key'];
    if (!key) {
      socket.destroy();
      return;
    }

    const acceptKey = crypto
      .createHash('sha1')
      .update(key + WS_MAGIC_STRING)
      .digest('base64');

    const responseHeaders = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${acceptKey}`,
      '\r\n'
    ];

    socket.write(responseHeaders.join('\r\n'));

    // Initialize decoder
    new FrameDecoder(
      socket,
      (message) => this.handleClientMessage(socket, message),
      () => this.handleClientDisconnect(socket)
    );
  }

  send(socket, data) {
    try {
      if (!socket.destroyed && socket.writable) {
        const frame = encodeWebSocketFrame(JSON.stringify(data));
        socket.write(frame);
      }
    } catch (err) {
      // socket error
    }
  }

  /**
   * Broadcasts a message STRICTLY to clients subscribed to target roomId.
   * Enforces server-side classroom isolation!
   */
  broadcastToRoom(roomId, data, excludeSocket = null) {
    const sockets = this.roomSockets.get(roomId);
    if (!sockets) return;

    for (const s of sockets) {
      if (s !== excludeSocket) {
        this.send(s, data);
      }
    }
  }

  handleClientMessage(socket, msg) {
    const { type, payload } = msg;
    if (!type) return;

    switch (type) {
      case 'join_room': {
        const { classroomId, user } = payload;
        if (!classroomId || !user?.identity) return;

        const roomId = getRoomIdForClassroom(classroomId);

        // Remove from existing room if already joined
        const existing = this.clients.get(socket);
        if (existing?.roomId && existing.roomId !== roomId) {
          this.leaveCurrentRoom(socket);
        }

        // Add to room sockets
        if (!this.roomSockets.has(roomId)) {
          this.roomSockets.set(roomId, new Set());
        }
        this.roomSockets.get(roomId).add(socket);

        this.clients.set(socket, {
          roomId,
          classroomId,
          identity: user.identity,
          name: user.name,
          role: user.role || 'student'
        });

        // Register in classroomManager
        try {
          const roomState = classroomManager.joinRoom(classroomId, user);

          // Acknowledge join to current user with full room state
          this.send(socket, {
            type: 'room_joined',
            payload: {
              roomId,
              classroomId,
              audioIsolation: 'enforced',
              ...roomState
            }
          });

          // Broadcast participant arrival ONLY to the same room
          this.broadcastToRoom(
            roomId,
            {
              type: 'participant_joined',
              payload: {
                roomId,
                participant: roomState.participant
              }
            },
            socket
          );
        } catch (err) {
          this.send(socket, {
            type: 'error',
            payload: { message: err.message }
          });
        }
        break;
      }

      case 'leave_room': {
        this.leaveCurrentRoom(socket);
        break;
      }

      // WebRTC Peer-to-Peer Signaling (strictly room-isolated)
      case 'webrtc_signal': {
        const client = this.clients.get(socket);
        if (!client || !client.roomId) return;

        const { targetIdentity, signalType, signalData } = payload || {};

        // Find target socket within the SAME room
        const roomSockets = this.roomSockets.get(client.roomId);
        if (!roomSockets) return;

        for (const s of roomSockets) {
          const targetClient = this.clients.get(s);
          if (targetClient && targetClient.identity === targetIdentity) {
            this.send(s, {
              type: 'webrtc_signal',
              payload: {
                fromIdentity: client.identity,
                fromName: client.name,
                fromRole: client.role,
                signalType,
                signalData,
                roomId: client.roomId
              }
            });
            break;
          }
        }
        break;
      }

      // Media State Change (mic/camera toggle)
      case 'media_state_change': {
        const client = this.clients.get(socket);
        if (!client) return;

        const updated = classroomManager.updateMediaState(
          client.classroomId,
          client.identity,
          payload
        );

        if (updated) {
          this.broadcastToRoom(client.roomId, {
            type: 'media_state_updated',
            payload: {
              identity: client.identity,
              ...payload
            }
          });
        }
        break;
      }

      // Room-Isolated Chat
      case 'chat_message': {
        const client = this.clients.get(socket);
        if (!client) return;

        try {
          const newMsg = classroomManager.addMessage(client.classroomId, {
            sender: client.name,
            role: client.role,
            text: payload.text
          });

          this.broadcastToRoom(client.roomId, {
            type: 'chat_message',
            payload: newMsg
          });
        } catch (err) {
          this.send(socket, { type: 'error', payload: { message: err.message } });
        }
        break;
      }

      // Synchronized Whiteboard Drawing
      case 'whiteboard_draw': {
        const client = this.clients.get(socket);
        if (!client) return;

        try {
          const stroke = classroomManager.addWhiteboardStroke(client.classroomId, {
            ...payload,
            role: client.role,
            author: client.name
          });

          if (stroke) {
            this.broadcastToRoom(
              client.roomId,
              {
                type: 'whiteboard_draw',
                payload: stroke
              },
              socket
            );
          }
        } catch (err) {
          this.send(socket, { type: 'error', payload: { message: err.message } });
        }
        break;
      }

      case 'whiteboard_clear': {
        const client = this.clients.get(socket);
        if (!client || client.role !== 'teacher') return;

        classroomManager.clearWhiteboard(client.classroomId);
        this.broadcastToRoom(client.roomId, {
          type: 'whiteboard_clear',
          payload: { clearedBy: client.name }
        });
        break;
      }

      case 'whiteboard_lock': {
        const client = this.clients.get(socket);
        if (!client || client.role !== 'teacher') return;

        const isLocked = classroomManager.setWhiteboardLock(client.classroomId, payload.isLocked);
        this.broadcastToRoom(client.roomId, {
          type: 'whiteboard_lock_changed',
          payload: { isLocked, changedBy: client.name }
        });
        break;
      }

      // Hand Raising System
      case 'hand_raise': {
        const client = this.clients.get(socket);
        if (!client) return;

        try {
          const handInfo = classroomManager.raiseHand(client.classroomId, {
            identity: client.identity,
            name: client.name,
            rollNo: payload.rollNo
          });

          this.broadcastToRoom(client.roomId, {
            type: 'hand_raised',
            payload: handInfo
          });
        } catch (err) {
          this.send(socket, { type: 'error', payload: { message: err.message } });
        }
        break;
      }

      case 'hand_lower': {
        const client = this.clients.get(socket);
        if (!client) return;

        const studentId = payload?.identity || client.identity;
        classroomManager.lowerHand(client.classroomId, studentId);

        this.broadcastToRoom(client.roomId, {
          type: 'hand_lowered',
          payload: { identity: studentId }
        });
        break;
      }

      case 'hand_acknowledge': {
        const client = this.clients.get(socket);
        if (!client || client.role !== 'teacher') return;

        const acknowledged = classroomManager.acknowledgeHand(
          client.classroomId,
          payload.identity
        );

        if (acknowledged) {
          this.broadcastToRoom(client.roomId, {
            type: 'hand_acknowledged',
            payload: acknowledged
          });
        }
        break;
      }

      // Q&A System
      case 'question_ask': {
        const client = this.clients.get(socket);
        if (!client) return;

        try {
          const newQ = classroomManager.addQuestion(client.classroomId, {
            studentName: client.name,
            studentIdentity: client.identity,
            rollNo: payload.rollNo,
            question: payload.question
          });

          this.broadcastToRoom(client.roomId, {
            type: 'question_added',
            payload: newQ
          });
        } catch (err) {
          this.send(socket, { type: 'error', payload: { message: err.message } });
        }
        break;
      }

      case 'question_answer': {
        const client = this.clients.get(socket);
        if (!client || client.role !== 'teacher') return;

        try {
          const answeredQ = classroomManager.answerQuestion(
            client.classroomId,
            payload.questionId,
            payload.answer,
            client.name
          );

          this.broadcastToRoom(client.roomId, {
            type: 'question_answered',
            payload: answeredQ
          });
        } catch (err) {
          this.send(socket, { type: 'error', payload: { message: err.message } });
        }
        break;
      }

      // Teacher Class Session Controls
      case 'session_start': {
        const client = this.clients.get(socket);
        if (!client || client.role !== 'teacher') {
          this.send(socket, {
            type: 'error',
            payload: { message: 'Unauthorized: Only faculty can start a class session' }
          });
          return;
        }

        try {
          const cr = classroomManager.startSession(
            client.classroomId,
            client.identity,
            payload.subject,
            payload.topic
          );

          this.broadcastToRoom(client.roomId, {
            type: 'session_started',
            payload: {
              classroom: cr,
              startedBy: client.name
            }
          });
        } catch (err) {
          this.send(socket, { type: 'error', payload: { message: err.message } });
        }
        break;
      }

      case 'session_end': {
        const client = this.clients.get(socket);
        if (!client || client.role !== 'teacher') {
          this.send(socket, {
            type: 'error',
            payload: { message: 'Unauthorized: Only faculty can end a class session' }
          });
          return;
        }

        try {
          const result = classroomManager.endSession(client.classroomId, client.identity);

          this.broadcastToRoom(client.roomId, {
            type: 'session_ended',
            payload: {
              ...result,
              endedBy: client.name
            }
          });
        } catch (err) {
          this.send(socket, { type: 'error', payload: { message: err.message } });
        }
        break;
      }

      // Teacher Participant Moderation (Mute / Remove)
      case 'moderation_mute': {
        const client = this.clients.get(socket);
        if (!client || client.role !== 'teacher') return;

        const targetId = payload.identity;
        classroomManager.updateMediaState(client.classroomId, targetId, { isMuted: true });

        this.broadcastToRoom(client.roomId, {
          type: 'participant_muted_by_teacher',
          payload: { identity: targetId, mutedBy: client.name }
        });
        break;
      }

      case 'moderation_remove': {
        const client = this.clients.get(socket);
        if (!client || client.role !== 'teacher') return;

        const targetId = payload.identity;
        const roomSockets = this.roomSockets.get(client.roomId);
        if (roomSockets) {
          for (const s of roomSockets) {
            const targetClient = this.clients.get(s);
            if (targetClient && targetClient.identity === targetId) {
              this.send(s, {
                type: 'removed_from_class',
                payload: { reason: 'Removed by instructor' }
              });
              this.leaveCurrentRoom(s);
              break;
            }
          }
        }
        break;
      }
    }
  }

  leaveCurrentRoom(socket) {
    const client = this.clients.get(socket);
    if (!client) return;

    const { roomId, classroomId, identity, name } = client;

    // Remove from roomSockets
    const sockets = this.roomSockets.get(roomId);
    if (sockets) {
      sockets.delete(socket);
      if (sockets.size === 0) {
        this.roomSockets.delete(roomId);
      }
    }

    // Clean up manager
    const leftInfo = classroomManager.leaveRoom(classroomId, identity);

    this.clients.delete(socket);

    // Broadcast departure strictly to that room
    if (leftInfo) {
      this.broadcastToRoom(roomId, {
        type: 'participant_left',
        payload: {
          roomId,
          identity,
          name
        }
      });
    }
  }

  handleClientDisconnect(socket) {
    this.leaveCurrentRoom(socket);
  }
}

export const classroomWsServer = new ClassroomWebSocketServer();
