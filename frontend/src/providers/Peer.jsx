import React, { useMemo, useEffect, useState } from "react";
const PeerContext = React.createContext(null);

export const usePeer = () => {
  return React.useContext(PeerContext);
};

export const PeerProvider = (props) => {
  const peer = useMemo(
    () =>
      new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      }),
    []
  );
  const [remoteStream, setRemoteStream] = useState(null);

  const createOffer = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(new RTCSessionDescription(offer));
    return offer;
  };

  const createAnswer = async (offer) => {
    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(new RTCSessionDescription(answer));
    return answer;
  };

  const setRemoteAnswer = async (ans) => {
    await peer.setRemoteDescription(ans);
  };

  const sendStream = (stream) => {
    const tracks = stream.getTracks();
    for (const track of tracks) {
      peer.addTrack(track, stream);
    }
  };

  // const handleTrackEvent = (e) => {
  //   console.log("Handle Track Event");
  //   const streams = e.streams;
  //   setRemoteStream(streams[0]);
  // };

  // useEffect(() => {
  //   peer.addEventListener("track", handleTrackEvent);
  //   return () => {
  //     peer.removeEventListener("track", handleTrackEvent);
  //   };
  // }, [peer, handleTrackEvent]);

  return (
    <PeerContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setRemoteAnswer,
        sendStream,
      }}
    >
      {props.children}
    </PeerContext.Provider>
  );
};
