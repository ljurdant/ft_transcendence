import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import background from "../images/Background.png"

export default function BaseLayout() {
  return (
    <Box sx={{ minWidth : '570px' , minHeight: "100vh", backgroundImage: `url(${background})`, backgroundSize: 'cover' }}>
      <Outlet />
    </Box>
  );
}
