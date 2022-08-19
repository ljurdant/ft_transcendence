import { createRoot } from "react-dom/client";
import io from "socket.io-client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const root = createRoot(document.getElementById("root")!);

// export const socket = io(process.env.REACT_APP_BACK_URL || "", {
//   autoConnect: false, 
//   withCredentials: true,
// });


root.render(
  // <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  // </React.StrictMode>
);
