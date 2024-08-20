import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../providers/SocketProvider";

const Home = () => {
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");

  const navigate = useNavigate();
  const { socket } = useSocket();

  const joinRoom = () => {
    console.log("RoomId ", roomId, " email ", email);
    socket.emit("join-room", { roomId, email });
  };

  const handleRoomJoined = ({ roomId }) => {
    navigate(`/room/${roomId}`);
  };

  useEffect(() => {
    socket.on("joined-room", handleRoomJoined);

    return () => {
      socket.off("joined-room", handleRoomJoined);
    };
  }, []);

  return (
    <div
      style={{
        height: "250px",
        width: "250px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      <input
        name="Email"
        placeholder="placeholder@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      />
      <input
        name="RoomId"
        placeholder="Room Id"
        value={roomId}
        onChange={(e) => {
          setRoomId(e.target.value);
        }}
      />
      <button onClick={joinRoom}>Join Room</button>
    </div>
  );
};

export default Home;
