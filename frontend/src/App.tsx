import { Routes, Route, Navigate } from "react-router-dom";
import LogIn from "./routes/LogIn";
import TFAuth from "./routes/TFAuth";
import Profile from "./components/Profile/Profile";
import React, { useState, useEffect } from "react";
import { User } from "interfaces";
// import { socket } from "index";
import Chat from "./components/Chat/Chat";
import Settings from "./components/Settings/Settings";
import Game from "./routes/Game";
import { toast, ToastContainer } from "react-toastify";
import NotFound from "./routes/NotFound";
import AuthProvider, { useAuth } from "components/AuthProvider";
import axios from "axios";
import Layout from "./components/Layout";
import { CssBaseline } from "@mui/material";
import BaseLayout from "components/BaseLayout";
import io from "socket.io-client";


export const client = axios.create({
  baseURL: process.env.REACT_APP_BACK_URL,
  withCredentials: true,
});

export const socket = io(process.env.REACT_APP_BACK_URL || "", {
  autoConnect: false,
  withCredentials: true,
});

function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(null!);
  let auth = useAuth();

  // console.log("passed by useAuthStatus");
  useEffect(() => {
    async function getUser() {
      try {
        const response = await client.get("/users/me");
        // console.log("logged in");
        auth.signin(response.data, () => null);
        setIsAuthenticated(true);
      } catch {
        // console.log("not logged in");
        setIsAuthenticated(false);
      }
    }
    getUser();
  }, []);

  return isAuthenticated;
}

function RequireAuth({ children }: { children: JSX.Element }) {
  // console.log("passed by RequireAuth");
  const isAuthenticated = useAuthStatus();

  // console.log("isAuthenticated:", isAuthenticated);
  if (isAuthenticated === null) {
    // console.log("Loading");
    return <div />;
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export function toastThatError(message: string) {
  toast.error(message, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
  });
}

export function toastIt(message: string) {
  toast.success(message, {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
  });
}

export default function App() {
  let [users, setUsers] = useState<User[]>([]);
  let [statusMap, setStatusMap] = useState<Map<number, string>>(
    new Map<number, string>()
  );

  useEffect(() => {
    socket.on("exception", (data: any) => {
      toastThatError(data.message);
    });
    socket.on("new user", (usersData: User[]) => {
      setUsers(usersData);
    });
    return () => {
      socket.off("exception");
      socket.off("new user");
    };
  }, []);

  useEffect(() => {
    socket.on("new connection", (userId: number) => {
      setStatusMap(statusMap.set(userId, "online"));
    });
    socket.on("new disconnection", (userId: number) => {
      setStatusMap(statusMap.set(userId, "offline"));
    });
    socket.on("new gamer", (userId: number) => {
      setStatusMap(statusMap.set(userId, "in game"));
    });

    socket.on("quit-game", (userId: number) => {
      setStatusMap(statusMap.set(userId, "online"));
      socket.emit("remove gamer", userId);
    });
    socket.on("status map", (maps: { online: number[]; inGame: number[] }) => {
      maps.online.forEach((userId) => {
        setStatusMap(statusMap.set(userId, "online"));
      });
      maps.inGame.forEach((userId) => {
        setStatusMap(statusMap.set(userId, "in game"));
      });
    });
    return () => {
      socket.off("new connection");
      socket.off("new disconnection");
      socket.off("new gamer");
      socket.off("quit-game");
      socket.off("status map");
    };
  }, [statusMap, setStatusMap]);

  return (
    <React.Fragment>
      <AuthProvider>
        <CssBaseline />
        <ToastContainer />
        <Routes>
          <Route element={<BaseLayout />}>
            <Route path="/login" element={<LogIn />} />
            <Route path="/tfauth" element={<TFAuth />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Layout
                    users={users}
                    statusMap={statusMap}
                    setStatusMap={setStatusMap}
                  />
                </RequireAuth>
              }
            >
              <Route path="profile" element={<Profile  />} >
                <Route path=":id" element={<Profile />} />
              </Route>
              <Route
                path="chat"
                element={<Chat users={users} statusMap={statusMap} />}
              />
              <Route path="game" element={<Game />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </React.Fragment>
  );
}
