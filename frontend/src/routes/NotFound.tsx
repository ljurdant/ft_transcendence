import { Box, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <Box sx={{paddingTop:"20vh", color: "white"}}>
      <Typography variant="h2"  textAlign={"center"} sx={{fontWeight: "bold"}}>404</Typography>
      <Typography variant="body1" textAlign={"center"} sx={{fontWeight: "bold"}}>Page not found</Typography>
    </Box>
  );
}
