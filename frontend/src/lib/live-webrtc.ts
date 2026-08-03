"use client";

import * as React from "react";
import type { LiveParticipant, LiveSignal } from "./live-socket";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export interface RemoteVideo {
  userId: string;
  name: string;
  role: string;
  stream: MediaStream | null;
  connected: boolean;
}

interface Options {
  enabled: boolean;
  myUserId: string | null;
  participants: LiveParticipant[];
  sendSignal: (target: string, data: { type: string; payload: unknown }) => void;
  onSignal: (cb: (s: LiveSignal) => void) => () => void;
}

export function useLiveWebRTC({ enabled, myUserId, participants, sendSignal, onSignal }: Options) {
  const peersRef = React.useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = React.useRef<MediaStream | null>(null);
  const remoteVideosRef = React.useRef<Map<string, RemoteVideo>>(new Map());
  const streamRetriesRef = React.useRef(0);

  const [localStream, setLocalStream] = React.useState<MediaStream | null>(null);
  const [remoteVideos, setRemoteVideos] = React.useState<RemoteVideo[]>([]);
  const [videoOn, setVideoOn] = React.useState(true);
  const [micOn, setMicOn] = React.useState(true);

  const myUserIdRef = React.useRef(myUserId);
  myUserIdRef.current = myUserId;

  const flushRemote = React.useCallback(() => {
    setRemoteVideos(Array.from(remoteVideosRef.current.values()));
  }, []);

  const ensureLocalStream = React.useCallback(async (): Promise<MediaStream | null> => {
    if (localStreamRef.current) return localStreamRef.current;
    if (!navigator.mediaDevices?.getUserMedia) return null;
    if (streamRetriesRef.current > 2) return null;
    streamRetriesRef.current += 1;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch {
      return null;
    }
  }, []);

  const addLocalTracks = React.useCallback((pc: RTCPeerConnection) => {
    const stream = localStreamRef.current;
    if (!stream) return;
    for (const track of stream.getTracks()) {
      try {
        pc.addTrack(track, stream);
      } catch {
        // track already added
      }
    }
  }, []);

  const createPeer = React.useCallback(
    (userId: string): RTCPeerConnection => {
      const existing = peersRef.current.get(userId);
      if (existing) return existing;
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          sendSignal(userId, { type: "ice", payload: e.candidate.toJSON() });
        }
      };

      pc.ontrack = (e) => {
        const remote = remoteVideosRef.current.get(userId);
        const stream = e.streams[0] ?? e.streams[0];
        if (remote) {
          remote.stream = stream;
          flushRemote();
        }
      };

      pc.onconnectionstatechange = () => {
        const remote = remoteVideosRef.current.get(userId);
        if (remote) {
          remote.connected = pc.connectionState === "connected";
          flushRemote();
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
          const remote = remoteVideosRef.current.get(userId);
          if (remote) {
            remote.connected = true;
            flushRemote();
          }
        }
      };

      addLocalTracks(pc);
      peersRef.current.set(userId, pc);
      return pc;
    },
    [sendSignal, addLocalTracks, flushRemote]
  );

  const offerToPeer = React.useCallback(
    async (userId: string) => {
      const pc = createPeer(userId);
      await ensureLocalStream();
      addLocalTracks(pc);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal(userId, { type: "offer", payload: pc.localDescription });
      } catch {
        // ignore negotiation errors
      }
    },
    [createPeer, ensureLocalStream, addLocalTracks, sendSignal]
  );

  const handleSignal = React.useCallback(
    async (signal: LiveSignal) => {
      const fromUserId = signal.from.userId;
      if (fromUserId === myUserIdRef.current) return;
      const data = signal.data;

      if (data.type === "offer") {
        const pc = createPeer(fromUserId);
        try {
          await pc.setRemoteDescription(data.payload as RTCSessionDescriptionInit);
          await ensureLocalStream();
          addLocalTracks(pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal(fromUserId, { type: "answer", payload: pc.localDescription });
        } catch {
          // ignore
        }
      } else if (data.type === "answer") {
        const pc = peersRef.current.get(fromUserId);
        if (pc) {
          try {
            await pc.setRemoteDescription(data.payload as RTCSessionDescriptionInit);
          } catch {
            // ignore
          }
        }
      } else if (data.type === "ice") {
        const pc = peersRef.current.get(fromUserId);
        if (pc) {
          try {
            await pc.addIceCandidate(data.payload as RTCIceCandidateInit);
          } catch {
            // candidate already added
          }
        }
      }
    },
    [createPeer, ensureLocalStream, addLocalTracks, sendSignal]
  );

  const syncPeers = React.useCallback(
    (list: LiveParticipant[]) => {
      const me = myUserIdRef.current;
      if (!me) return;
      const seen = new Set<string>();
      for (const p of list) {
        if (p.userId === me) continue;
        seen.add(p.userId);
        if (!remoteVideosRef.current.has(p.userId)) {
          remoteVideosRef.current.set(p.userId, {
            userId: p.userId,
            name: p.name,
            role: p.role,
            stream: null,
            connected: false,
          });
        }
        if (!peersRef.current.has(p.userId)) {
          createPeer(p.userId);
          if (me < p.userId) {
            offerToPeer(p.userId);
          }
        }
      }
      for (const userId of Array.from(remoteVideosRef.current.keys())) {
        if (userId === me) continue;
        if (!seen.has(userId)) {
          remoteVideosRef.current.delete(userId);
          const pc = peersRef.current.get(userId);
          if (pc) {
            try {
              pc.close();
            } catch {
              // ignore
            }
            peersRef.current.delete(userId);
          }
        }
      }
      flushRemote();
    },
    [createPeer, offerToPeer, flushRemote]
  );

  React.useEffect(() => {
    if (!enabled) return;
    const unsub = onSignal(handleSignal);
    return unsub;
  }, [enabled, onSignal, handleSignal]);

  React.useEffect(() => {
    if (enabled && myUserId) {
      syncPeers(participants);
    }
  }, [enabled, myUserId, participants, syncPeers]);

  React.useEffect(() => {
    const peers = peersRef.current;
    const streamRef = localStreamRef;
    const remotes = remoteVideosRef.current;
    return () => {
      for (const pc of peers.values()) {
        try {
          pc.close();
        } catch {
          // ignore
        }
      }
      peers.clear();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      remotes.clear();
    };
  }, []);

  const toggleCamera = React.useCallback(async () => {
    const stream = localStreamRef.current ?? (await ensureLocalStream());
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setVideoOn(stream.getVideoTracks().every((t) => t.enabled));
    // renegotiate in case new tracks were added late
    for (const userId of peersRef.current.keys()) {
      offerToPeer(userId);
    }
  }, [ensureLocalStream, offerToPeer]);

  const toggleMic = React.useCallback(async () => {
    const stream = localStreamRef.current ?? (await ensureLocalStream());
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setMicOn(stream.getAudioTracks().every((t) => t.enabled));
    for (const userId of peersRef.current.keys()) {
      offerToPeer(userId);
    }
  }, [ensureLocalStream, offerToPeer]);

  return { localStream, remoteVideos, videoOn, micOn, toggleCamera, toggleMic, ensureLocalStream };
}
