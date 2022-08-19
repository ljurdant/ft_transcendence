import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { client, toastThatError } from "App";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";

const BoxStyle = {
  backgroundColor: "rgb(130, 150, 240, 0.96)",
  border: "3px solid black",
  padding: "40px",

  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
};

const TitleStyle = {
  color: "rgb(255, 150, 55)",
  textShadow: "1px 1px 2px black",
};

export default function TFAuth() {
  const [pinInput, setPininput] = useState<string>("");
  let navigate = useNavigate();

  async function handleSubmit() {
    try {
      const response = await client.post("/auth/google-authenticator", { value: pinInput });
      // console.log("Pin Post request success :");
      if (response.data === true) {
        navigate("/game");
      } else {
        toastThatError("Ho no! That Pin is not valid! :/");
      }
    } catch {
      // console.log("Pin Post request failed.");
      toastThatError("Ho no! That Pin is not valid! :/");
    }
  }

  return (
    <Box sx={BoxStyle}>
      <Stack spacing={2}>
        <Typography variant="h4" style={TitleStyle}>
          Hey, insert your Pin!
        </Typography>
        <TextField
          onInput={(e: any) => setPininput(e.target.value)}
          inputProps={{ maxLength: 6 }}
        />
        <Button
          disabled={/^[\d]{6}$/.test(pinInput) === false}
          variant="contained"
          onClick={handleSubmit}
        >
          Send
        </Button>
      </Stack>
    </Box>
  );
}
