import { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import { IconButton, TextField, Tooltip, Autocomplete } from "@mui/material";
import { User } from "interfaces";
import { socket } from "App";
import { toastThatError, toastIt } from "../../App";
import "../../styles/Chat/Channels.css";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Games from "@mui/icons-material/Games";
import VisibilityIcon from '@mui/icons-material/Visibility';
import Avatar from '@mui/material/Avatar'
import DeleteIcon from '@mui/icons-material/Delete';
import {useNavigate} from 'react-router-dom'



interface FriendUserDto {
  userId: number;
  friendId: number;
}

let listItem = {
	paddingLeft: "0px",
	paddingRight: "0px",
	paddingTop: "4px",
	paddingBottom: "4px",
}

export function GameInviteButton(props: {user: User, otherUser: User | undefined, statusMap: Map<number, string>}) {
  let navigate = useNavigate();

  
  function inviteForGame(user: User | undefined) {
        socket.emit("invite for game", {
          userId: props.user.id,
          otherUserId: user?.id,
        });
  }
  function spectate(user: User | undefined) {
	navigate("/game");
    socket.emit("spectate game", user?.username);
  }

  if (props.otherUser === undefined) {
    return null;
  }
  else
  {
    if (props.statusMap.get(props.otherUser.id) === "online")
    {
      return (
        <Tooltip title="Invite for a match">
          <IconButton size="small" onClick={() => inviteForGame(props.otherUser)}>
            <Games />
          </IconButton>
        </Tooltip>
      );  
    }
    else if (props.statusMap.get(props.otherUser.id) === "in game")
    {
      return (
        <Tooltip title="Spectate">
          <IconButton size="small" onClick={() => spectate(props.otherUser)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      );
    }
    else return null;
  }

}

export default function FriendBar(props: {
  user: User;
  users: User[];
  statusMap: Map<number, string>;
  setStatusMap: React.Dispatch<React.SetStateAction<Map<number, string>>>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  let [addFriendClicked, setAddFriendClicked] = useState<boolean>(false);
  let [friends, setFriends] = useState<User[]>([]);

  const getFriends = (data: User[]) => {
    setFriends(data);
  };

  useEffect(() => {
    if (props.user.id !== 0) {
      socket.emit("get friends", props.user.id,);
    }
  }, [props.user.id]);

  useEffect(() => {
    socket.on('get friends', getFriends);
    return () => {
      socket.off('get friends');
    }
  }
  , []);

  useEffect(() => {
    socket.on("new connection", () =>
      socket.emit("get friends", props.user.id, getFriends)
    );
    socket.on("new disconnection", () =>
      socket.emit("get friends", props.user.id, getFriends)
  );
    return () => {
      socket.off("new connection");
      socket.off("new disconnection");
    };
  }, [props.user.id]);

  function closeFriendBar() {
    props.setOpen(false);
  }

  function addFriendClick() {
    setAddFriendClicked(true);
  }

  function addFriendSubmit(e: any) {
    e.preventDefault();
    const username: string = e.target[0].value;
    if (props.users.find((user) => user.username === username)) {
      // console.log("user exists");
      if (friends.find((user) => user.username === username))
        toastThatError("this user is already your friend");
      else {
        let friendId: any = props.users.find(
          (user) => user.username === username
        )?.id;
        const friendUser: FriendUserDto = {
          userId: props.user.id,
          friendId: friendId,
        };
        socket.emit("add friend", friendUser);
        setAddFriendClicked(false);
        toastIt(username + " added to your friends list");
      }
    } else toastThatError("username doesn't exist");
  }

  function removeFriend(user: User) {
    socket.emit(
      "remove friend",
      { userId: props.user.id, friendId: user.id } );
    }



  return (
      <Drawer
        anchor="left"
        open={props.open}
        onClose={closeFriendBar}
        PaperProps={{
          sx: {
            width: "15vw",
			minWidth: "100px",
            paddingLeft: "1%",
            paddingRight: "2%",
            paddingTop: "1.5%",
            backgroundColor: "rgb(172, 180, 235)",

          },
        }}
      >
        <Button
          onClick={addFriendClick}
          variant="contained"
          style={{
            backgroundColor: "rgb(150, 100, 200)",
            width: "13vw",
            border: "2px solid black",
            borderRadius: "5%",
          }}
        >
          Add Friend
        </Button>
        {addFriendClicked ? (
          <Stack component="form" onSubmit={addFriendSubmit} spacing={1}>
            <Autocomplete
              id="search..."
              options={props.users.filter(item => item.id !== props.user.id && !friends.find(friend => friend.id === item.id))}
              getOptionLabel={(option: any) => option?.username }
              renderInput={(params: any) => <TextField {...params} label="search..." />}
              sx={{ width: '15vw' }}
            />
            <Button
              variant="contained"
              type="submit"
              style={{
                backgroundColor: "rgb(70, 195, 150)",
                width: "13vw",
                border: "2px solid black",
                borderRadius: "5%",
              }}
            >
              Add
            </Button>
            <Button
              variant="contained"
              onClick={() => setAddFriendClicked(false)}
              style={{
                backgroundColor: "rgb(195, 60, 40)",
                width: "13vw",
                border: "2px solid black",
                borderRadius: "5%",
              }}
            >
              Cancel
            </Button>
          </Stack>
        ) : (
          <div />
        )}
        <List>
          {friends.map((item) => (
            <div key={item.id}>
              <ListItem sx={listItem}>
				<Avatar   sx={{ width: 35, height: 35 }} src={process.env.REACT_APP_BACK_URL + "/avatars/"+item.id.toString()+".png"}/>
					<ListItemText
            primary={item.username}
            secondary={props.statusMap.get(item.id) ? props.statusMap.get(item.id) : "offline"}
            sx={{overflow: "hidden"}}
            title={item.username}
					/>
                <GameInviteButton user={props.user} otherUser={item} statusMap={props.statusMap} />
                <IconButton 
					size="small"
					color="error"
					onClick={() => removeFriend(item)}
					title="remove friend"
                >
                  <DeleteIcon/>
                </IconButton>
              </ListItem>
            </div>
          ))}
        </List>
      </Drawer>
  );
}
