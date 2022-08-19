import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import FaceIcon from "@mui/icons-material/Face";
import Modal from "@mui/material/Modal";
import { ModalChooseAvatar } from "../../../styles/tsxStyles/Settings/Avatar";
import { IconStyle } from "../../../styles/tsxStyles/AppBar/PongMenu";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { useState } from "react";
import Button from "@mui/material/Button";
import { client, toastThatError } from "../../../App";
import { useAuth } from "components/AuthProvider";
import React from "react";
import { Typography } from "@mui/material";

function UploadButton(props: { setOpen: any }) {
  const [selectedFile, setSelectedFile] = useState<any>();
  let auth = useAuth();

  const changeHandler = (event: any) => {
    if (
      event.target.files[0].size < 1048577 
      && event.target.files[0].size !== 0
      && /^image/.test(event.target.files[0].type)
    ) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
				if (event.target.files[0].size >= 1048577)
					toastThatError('The image you try to upload is too big!');
				else if (event.target.files[0].size === 0)
					toastThatError('The file you try to upload is empty!');
				else
					toastThatError("Invalid file.")
    }
  };

  async function handleSubmit() {
    const formData = new FormData();
    formData.append("avatar", selectedFile);

    try {
      await client.put("/users/upload-avatar", formData)
      // console.loglog("Put avatar request success");
      auth.updateAvatar();
      props.setOpen(false);
    } catch {
      toastThatError("Avatar upload failed");
    }
  }

  function closeModal() {
    props.setOpen(false);
  }

  return (
    <div>
      <Button
        component="label"
        variant="contained"
        startIcon={<PhotoCamera />}
        color="secondary"
      >
        Upload
        <input hidden accept="image/*" type="file" onChange={changeHandler} />
      </Button>
      {selectedFile ? (
        <Stack spacing={2} sx={{ margin: "20px" }}>
          <Typography variant="body2">Filename: {selectedFile.name}</Typography>
          <Typography variant="body2">Filetype: {selectedFile.type}</Typography>
          <Typography variant="body2">
            Size: {Math.round(selectedFile.size / 1024)}KB
          </Typography>
        </Stack>
      ) : (
        <Stack spacing={2} sx={{ margin: "20px" }}>
          <Typography variant="body2">No file selected yet</Typography>
        </Stack>
      )}

      <Stack direction="row" spacing={3}>
        <Button
          onClick={() => {
            handleSubmit();
          }}
          variant="contained"
          color="success"
          disabled={!selectedFile}
        >
          Let's go
        </Button>
        <Button variant="contained" color="error" onClick={closeModal}>
          Change my mind!
        </Button>
      </Stack>
    </div>
  );
}

export default function ChooseAvatar() {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button onClick={handleOpen} variant="contained" color="secondary">
        <FaceIcon sx={IconStyle} />
        Choose avatar
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={ModalChooseAvatar}>
          <UploadButton setOpen={setOpen} />
        </Box>
      </Modal>
    </React.Fragment>
  );
}
