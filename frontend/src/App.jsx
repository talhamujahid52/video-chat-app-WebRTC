import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SocketProvider } from "./providers/SocketProvider";
import { PeerProvider } from "./providers/Peer";
import Home from "./pages/Home";
import Room from "./pages/Room";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/room/:abc",
    element: <Room />,
  },
]);

function App() {
  return (
    <>
      <SocketProvider>
        <PeerProvider>
          <RouterProvider router={router} />
        </PeerProvider>
      </SocketProvider>
    </>
  );
}

export default App;
