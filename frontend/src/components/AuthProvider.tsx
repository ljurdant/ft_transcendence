import { socket } from "App";
import { User } from "interfaces";
import React, { useState } from "react";

interface AuthContextType {
  user: User;
  imageId: number;
  signin: (user: User, callback: VoidFunction) => void;
  update: (user: User) => void;
  signout: (callback: VoidFunction) => void;
  updateAvatar: () => void;
}

let AuthContext = React.createContext<AuthContextType>(null!);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  let [user, setUser] = useState<User>(null!);
  let [imageId, setImageId] = useState<number>(1);

  let updateAvatar = () => {
    setImageId(imageId + 1);
    // console.loglog("image id is now", imageId);
    socket.emit('new user', user.id)

  };

  let signin = (user: User, callback: VoidFunction) => {
    // console.loglog("auth.signin called");
    socket.connect();
    socket.emit('new connection', user.id);
    setUser(user);
    callback();
  };

  let update = (user: User) => {
    // console.loglog("auth.signin called");
    setUser(user);
    socket.emit('new user', user.id)
  };

  let signout = (callback: VoidFunction) => {
    setUser(null!);
    socket.disconnect();
    callback();
  };

  let value = { user, imageId, signin, update, signout, updateAvatar };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}
