import crypto from 'node:crypto';

/**
 * Base64-URL encode string or Buffer (RFC 7515 / RFC 7519)
 */
function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Normalizes a classroom identifier into a standard isolated LiveKit room name.
 * e.g. 'lh101' -> 'iiit-classroom-lh101'
 * @param {string} classroomId
 * @returns {string}
 */
export function getRoomIdForClassroom(classroomId) {
  const cleanId = String(classroomId).toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return cleanId.startsWith('iiit-classroom-') ? cleanId : `iiit-classroom-${cleanId}`;
}

/**
 * Generates a valid LiveKit Access Token (HS256 JWT) conforming to the LiveKit token specification.
 * Validates role-based room permissions (Teacher vs Student).
 *
 * @param {Object} options
 * @param {string} options.identity - Unique participant identity (e.g. 'user_aditya_102' or 'prof_sharma')
 * @param {string} options.name - Human-readable display name
 * @param {string} options.classroomId - Target classroom ID (e.g. 'lh101')
 * @param {string} options.role - 'teacher' | 'student' | 'ta'
 * @param {Object} [options.metadata] - Extra participant metadata (avatar, rollNumber, etc.)
 * @param {number} [options.ttlSeconds=21600] - Token expiration in seconds (default 6 hours)
 * @returns {Object} { token, roomId, roomName, identity, role, expiresAt, livekitUrl }
 */
export function generateLiveKitToken({
  identity,
  name,
  classroomId,
  role = 'student',
  metadata = {},
  ttlSeconds = 21600
}) {
  if (!identity || !classroomId) {
    throw new Error('identity and classroomId are required to generate LiveKit token');
  }

  const apiKey = process.env.LIVEKIT_API_KEY || 'iiit_bhopal_dev_key';
  const apiSecret = process.env.LIVEKIT_API_SECRET || 'iiit_bhopal_dev_secret_metaverse_2026';
  const livekitUrl = process.env.LIVEKIT_URL || 'ws://localhost:7880';

  const isTeacher = role === 'teacher' || role === 'ta';
  const roomId = getRoomIdForClassroom(classroomId);

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + ttlSeconds;

  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  // LiveKit video grant schema
  const videoGrants = {
    room: roomId,
    roomJoin: true,
    canPublish: true, // Teachers & students can speak/publish audio/video when permitted
    canSubscribe: true,
    canPublishData: true,
    roomAdmin: isTeacher,
    roomRecord: false
  };

  const payload = {
    iss: apiKey,
    sub: identity,
    name: name || identity,
    nbf: now - 5, // 5s clock skew tolerance
    exp: expiresAt,
    video: videoGrants,
    metadata: typeof metadata === 'string' ? metadata : JSON.stringify({
      ...metadata,
      role,
      joinedAt: new Date().toISOString(),
      institution: 'IIIT Bhopal'
    })
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(signatureInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const token = `${signatureInput}.${signature}`;

  return {
    token,
    roomId,
    roomName: roomId,
    identity,
    name: name || identity,
    role,
    expiresAt,
    livekitUrl,
    isFallback: !Boolean(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_URL),
    audioIsolationEnforced: true,
    videoGrants
  };
}

/**
 * Validates and decodes a LiveKit token.
 * Verifies HMAC-SHA256 signature and room grant.
 *
 * @param {string} token
 * @param {string} [expectedRoomId]
 * @returns {Object} Decoded payload
 */
export function verifyLiveKitToken(token, expectedRoomId = null) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token is missing or invalid');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const apiSecret = process.env.LIVEKIT_API_SECRET || 'iiit_bhopal_dev_secret_metaverse_2026';

  const expectedSignature = crypto
    .createHmac('sha256', apiSecret)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signatureB64 !== expectedSignature) {
    throw new Error('Invalid token signature');
  }

  const payloadJson = Buffer.from(payloadB64, 'base64').toString('utf8');
  const payload = JSON.parse(payloadJson);

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('Token has expired');
  }

  if (expectedRoomId) {
    const authorizedRoom = payload.video?.room;
    if (authorizedRoom !== expectedRoomId) {
      throw new Error(`Token unauthorized for room ${expectedRoomId}. Authorized room: ${authorizedRoom}`);
    }
  }

  return payload;
}
