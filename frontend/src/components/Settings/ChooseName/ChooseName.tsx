import { useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { ModalChooseName } from "../../../styles/tsxStyles/Settings/Name";
import { IconStyle } from "../../../styles/tsxStyles/AppBar/PongMenu";
import { client, toastThatError } from "../../../App";
import { useAuth } from "components/AuthProvider";
import React from "react";

function NameInput(props: { username: string; setter: any; setOpen: any }) {
  const [value, setValue] = useState<string>("");

  let auth = useAuth();

  function closeModal() {
    props.setOpen(false);
  }

  function handleSubmit(e: any) {
    PatchRequest();
  }

  async function PatchRequest() {
    try {
      await client.patch("/users/me", { username: value });
      // console.log("Changing name success : ", props.username);
      props.setOpen(false);
    } catch {
      toastThatError("invalid username");
    }
    try {
      const response = await client.get("/users/me");
      auth.update(response.data);
    } catch {
      // console.log("Appbar get request failed : ");
    }
  }

  return (
    <div>
      <Stack spacing={4}>
        <TextField
          variant="standard"
          label="New username"
          error={value.length !== 0 && /^[\w]{2,16}$/.test(value) === false}
          helperText={
            "Your username may only contain letters, digits or underscore, and must be at least 2 characters long."
          }
          inputProps={{ maxLength: 16 }}
          onChange={(e) => setValue(e.target.value)}
          style={{ width: "85%", justifyContent: "center" }}
        />
        <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="success"
            disabled={/^[\w]{2,16}$/.test(value) === false}
          >
            Ok I'm done!
          </Button>
          <Button onClick={closeModal} variant="contained" color="error">
            Nope!
          </Button>
        </Stack>
      </Stack>
    </div>
  );
}

export default function ChooseName() {
  const [new_username, setNewUsername] = useState("");
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button
        onClick={handleOpen}
        variant="contained"
        color="secondary"
        // style={ButtonModalStyle}
      >
        <DriveFileRenameOutlineIcon sx={IconStyle} />
        Choose Name
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={ModalChooseName}>
          <Stack spacing={3}>
            <NameInput
              username={new_username}
              setter={setNewUsername}
              setOpen={setOpen}
            />
          </Stack>
        </Box>
      </Modal>
    </React.Fragment>
  );
}
