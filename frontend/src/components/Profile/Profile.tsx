import { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import StatsBoards from "./StatsBoards";
import Typography from "@mui/material/Typography";
import { User } from "interfaces";
import { PlayerBarStyle } from "../../styles/tsxStyles/Profile";
import "./../../styles/Other/SkillBar.css";
import { PlayerAvatar } from "../Avatars";
import { useNavigate, useParams } from "react-router-dom";
import { IconButton, LinearProgress, Tooltip, Backdrop, Alert, Button, ButtonGroup } from "@mui/material";
import { client, toastIt } from "App";
import { socket } from "App";
import BlockIcon from '@mui/icons-material/Block';
import { useAuth } from "components/AuthProvider";
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import DeleteIcon from '@mui/icons-material/Delete';



const OverallBoxStyle = {
  paddingTop: "4vh",
  display: "flex",
  justifyContent: "center",
};

function SkillBar(props: { progression: number }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress
          sx={{ height: "20px", borderRadius: "20px" }}
          variant="determinate"
          value={props.progression}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="white">{`${Math.round(
          props.progression
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

function BlockUserButton(props: { user: User })
{
  let [showBackdrop, setShowBackdrop] = useState<boolean>(false);
  let auth = useAuth();
  let [blocked, setBlocked] = useState<User[]>([]);


  function    blockUser() {
    socket.emit('add blocked', {userId: auth.user.id, blockedId: props.user.id} );
    setShowBackdrop(false);
  }

  function    unblockUser() {
    socket.emit('remove blocked', {userId: auth.user.id, blockedId: props.user.id} );
  }

  useEffect(() => {
    socket.emit('get blocked', auth.user.id);
  }, [auth.user.id])

  useEffect(() => {
    const handler = (data: User[]) => {setBlocked(data);};
    socket.on('get blocked', handler);
    return () => {
        socket.off('get blocked');
      }
  }, [])


  if (auth.user.id === props.user.id)
    return (null);
  else if (blocked.some(user => user.id === props.user.id))
  {  
    return (
      <Tooltip title="Unblock">
        <IconButton onClick={unblockUser} size="small">
          <BlockIcon />
        </IconButton>
      </Tooltip>
    );
  }
  else
  {
    return (
      <div>
        <Tooltip title="Block user">
          <IconButton color='error' onClick={() => setShowBackdrop(true)} size="small">
              <BlockIcon/>
          </IconButton>
        </Tooltip>
        <Backdrop
          open={showBackdrop}
          >
          <Stack alignItems="center">
              <Alert severity="warning">
                  Are you sure you want to block {props.user.username}?
              </Alert>
              <ButtonGroup>
                  <Button variant="contained" color="success" onClick={blockUser}>
                      Yes
                  </Button>
                  <Button variant="contained" color="error" onClick={() => setShowBackdrop(false)}>
                      No
                  </Button>
              </ButtonGroup>
          </Stack>
        </Backdrop>
      </div>
    )
  }
}

function AddFriendButton (props: { user: User }) {
  interface FriendUserDto {
    userId: number;
    friendId: number;
  }

  let [friends, setFriends] = useState<User[]>([]);

  let auth = useAuth();
  
  const getFriends = (data: User[]) => {
    setFriends(data);
  };
  useEffect(() => {
    if (props.user.id !== 0) {
      socket.emit("get friends", props.user.id);
      }
    }, [props.user.id]);

  useEffect(() => {
    socket.on('get friends', getFriends);
    return () => {
      socket.off('get friends');
    }
  }
  , []);


  function addFriend() {
    const friendUser: FriendUserDto = {
      userId: auth.user.id,
      friendId: props.user.id,
    };
    socket.emit("add friend", friendUser);
    toastIt(props.user.username + " added to your friends list")
  }

  function removeFriend() {
    socket.emit(
      "remove friend",
      { userId: auth.user.id, friendId: props.user.id });
  }

  if (auth.user.id === props.user.id)
    return (null);
  else if (friends.some(user => user.id === props.user.id))
    return (
      <Tooltip title="Remove friend" >
        <IconButton color="error" size="small" onClick={removeFriend}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    )
  else {
    return (
      <Tooltip title="Add friend" >
        <IconButton color="success" size="small" onClick={addFriend}>
          <VolunteerActivismIcon />
        </IconButton>
      </Tooltip>
    )
  }
}

function PlayerInfoBand(props: { user: User }) {


  return (
    <Box sx={PlayerBarStyle}>
      <Stack>
        <Stack direction="row" spacing={35} >
          <Stack direction="row" >
            <PlayerAvatar
              image={
                process.env.REACT_APP_BACK_URL +
                "/avatars/" +
                props.user.id +
                ".png"
              }
            />
            <Stack direction="column">
              <BlockUserButton user={props.user}/>
              <AddFriendButton user={props.user}/>
            </Stack>
          </Stack>
          <Stack spacing={1} >
            <Typography variant="h5">{props.user.username}</Typography>
            <Typography variant="h6">
              Level {Math.trunc(props.user.level)}
            </Typography>
          </Stack>
        </Stack>
        <SkillBar progression={Math.trunc(props.user.level * 100) % 100} />
      </Stack>
    </Box>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState<User>(null!);
  let params = useParams();
  let navigate = useNavigate();


  useEffect(() => {
    async function getProfile() {
      try {
        const requestURL = params.id ? "/users/" + params.id : "/users/me";
        const response = await client.get(requestURL);
        setProfile(response.data);
      } catch {
        navigate("/login");
      }
    }
    getProfile();
  }, [params]);

  return (
    <Box sx={OverallBoxStyle}>
      {profile ? (
        <Stack spacing={4}>
          <PlayerInfoBand user={profile} />
          <StatsBoards user={profile} />{" "}
        </Stack>
      ) : (
        <div />
      )}
    </Box>
  );
}
