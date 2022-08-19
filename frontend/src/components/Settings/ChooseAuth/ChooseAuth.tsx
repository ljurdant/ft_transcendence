import Stack from "@mui/material/Stack";
import Modal from "@mui/material/Modal";
import React, { useState } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import QRCode from "react-qr-code";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { ModalChooseAuth } from "../../../styles/tsxStyles/Settings/Auth";
import { useAuth } from "components/AuthProvider";
import { client } from "App";

function GenerateQRCode(props: { url: string }) {
  const [open, setOpen] = useState<boolean>(true);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={ModalChooseAuth}>
        <Stack spacing={1}>
          <QRCode value={props.url} />
          <Button onClick={handleClose} variant="contained" color="secondary">
            OK I flashed !
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

export default function ChooseAuth() {
  const [enabled, setEnabled] = useState(false);
  const [url, setUrl] = useState("");
  const [refresh, setRefresh] = useState(false);

  let auth = useAuth();

  async function patchTfa(option: boolean) {
    try {
      const response = await client.patch("/users/me", { tfa: option });
      if (option) {
        setUrl("otpauth://totp/transcendance_BoopBipBoop?secret=" + response.data);
      }
      auth.user.tfa = option;
      setEnabled(option);
      setRefresh(!refresh);
    } catch {
      // console.log("Setting tfa failed.");
    }
  }

  return (
    <React.Fragment>
      {auth.user.tfa === false ? (
        <Button
          startIcon={<VpnKeyIcon />}
          onClick={() => patchTfa(true)}
          variant="contained"
          color="secondary"
        >
          Activate Two Factor Authentication
        </Button>
      ) : (
        <Button
          startIcon={<VpnKeyIcon />}
          onClick={() => patchTfa(false)}
          variant="contained"
          color="secondary"
        >
          Deactivate Two Factor Authentication
        </Button>
      )}
      {enabled && <GenerateQRCode url={url} />}
    </React.Fragment>
  );
}
