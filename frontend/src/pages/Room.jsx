import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../providers/SocketProvider";
import { usePeer } from "../providers/Peer";

const Room = () => {
  const [remoteUser, setRemoteUser] = useState(null);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const { socket } = useSocket();
  const { peer, createOffer, createAnswer, setRemoteAnswer, sendStream } =
    usePeer();

  const handleNewUserJoined = async ({ email }) => {
    console.log(`A New User ${email} Joined the room`);
    setRemoteUser(email);
  };

  const handleCallButtonClick = async () => {
    // Run For Newly Joined User
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setStream(stream);
    const offer = await createOffer();
    socket.emit("call-user", { email: remoteUser, offer });
  };

  const handleIncomingCall = async ({ from, offer }) => {
    // Run For Newly Joined User
    console.log("Call Incoming from: ", from, " ", offer);
    setRemoteUser(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setStream(stream);
    const ans = await createAnswer(offer);
    socket.emit("call-accepted", { from, ans });
  };

  const handleCallAccepted = async ({ ans }) => {
    console.log("Call Accepted, ", ans);
    await setRemoteAnswer(ans);
    sendStream(stream);
  };

  const handleTrackEvent = (e) => {
    const remoteStream = e.streams;
    console.log("Got Tracks!!");
    setRemoteStream(remoteStream[0]);
  };

  const handleNegotiation = async () => {
    console.log("Handling Negotiations!!!!");
    const offer = await createOffer();
    socket.emit("negotiation-needed", { offer, to: remoteUser });
  };

  const handleIncomingNegotiation = async ({ from, offer }) => {
    console.log("handleIncomingNegotiation !!!!");
    const ans = await createAnswer(offer);
    socket.emit("negotiation-done", { to: from, ans });
  };

  const handleNegotiationFinal = async ({ from, ans }) => {
    console.log("handleNegotiationFinal !!!!");
    await setRemoteAnswer(ans);
  };

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegotiation);
    return () =>
      peer.removeEventListener("negotiationneeded", handleNegotiation);
  }, []);

  useEffect(() => {
    peer.addEventListener("track", handleTrackEvent);
    return () => {
      peer.removeEventListener("track", handleTrackEvent);
    };
  }, []);

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("call-incoming", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("negotiation-needed", handleIncomingNegotiation);
    socket.on("negotiation-final", handleNegotiationFinal);

    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("call-incoming", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("negotiation-needed", handleIncomingNegotiation);
      socket.off("negotiation-final", handleNegotiationFinal);
    };
  }, [socket, handleNewUserJoined, handleIncomingCall, handleCallAccepted]);

  return (
    <>
      {remoteUser ? <h1>You are connected</h1> : <h1>Room is Empty</h1>}
      {remoteUser && (
        <button onClick={handleCallButtonClick}>Call {remoteUser}</button>
      )}
      {stream && (
        <button
          onClick={() => {
            sendStream(stream);
          }}
        >
          send Stream
        </button>
      )}
      {stream && (
        <>
          <h3>Local Stream</h3>
          <ReactPlayer
            height={100}
            width={200}
            playing
            url={stream}
            muted
          ></ReactPlayer>
        </>
      )}
      {remoteStream && (
        <>
          <h3>Remote Stream</h3>
          <ReactPlayer
            height={100}
            width={200}
            playing
            url={remoteStream}
            muted
          ></ReactPlayer>
        </>
      )}
    </>
  );
};

export default Room;
