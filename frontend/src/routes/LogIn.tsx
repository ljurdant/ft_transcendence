import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import LoginIcon from "@mui/icons-material/Login";
import { Title } from "../styles/tsxStyles/LogIn";
import { Box, Typography } from "@mui/material";

const AuthAPI = process.env.REACT_APP_BACK_URL + "/auth";
const MockAuthAPI = process.env.REACT_APP_BACK_URL + "/auth/mock";

function LoginButton(props: { href: string; text: string }) {
  return (
    <Button
      variant="contained"
      startIcon={<LoginIcon />}
      size="large"
      color="secondary"
      href={props.href}
    >
      {props.text}
    </Button>
  );
}

export default function LogIn() {
  return (
    <Box display="flex" alignItems="center" flexDirection="column">
      <Typography variant="h1" sx={Title} align="center" gutterBottom>
        The Pongers Guide to the Galaxy
      </Typography>
      <Stack spacing={3} sx={{ marginTop: "3vw", maxWidth: "30vw" }}>
        <LoginButton href={AuthAPI} text="Login" />
        <LoginButton href={MockAuthAPI + "/1"} text="Mock Login 1" />
        <LoginButton href={MockAuthAPI + "/2"} text="Mock Login 2" />
      </Stack>
    </Box>
  );
}
