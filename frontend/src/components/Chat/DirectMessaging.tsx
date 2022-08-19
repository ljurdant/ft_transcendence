
import { useState, useEffect } from 'react';
import { User, Room } from 'interfaces';
import TextField from '@mui/material/TextField';
import '../../styles/Chat/Channels.css';
import '../../styles/Chat/DirectMessaging.css'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { socket } from 'App';
import PersonIcon from '@mui/icons-material/Person';
import BlockIcon from '@mui/icons-material/Block';
import { Backdrop, ButtonGroup, IconButton, Button, Stack, Alert, Tooltip, Autocomplete } from '@mui/material';
import {Link} from 'react-router-dom';

import { GameInviteButton } from '../FriendBar/FriendBar';

interface CreateDMRoomDto {
    name: string;
    user1Id: number;
    user2Id: number;
}

export default function DirectMessaging(props: {user: User, users: User[], rooms: Room[], currentRoom: Room, setCurrentRoom: React.Dispatch<React.SetStateAction<Room>>, statusMap: Map<number, string>, blocked:User[]}) {

    useEffect(() => {
        const handler = () => {socket.emit('get blocked', props.user?.id)}
        socket.on('add blocked', handler);
        return () => {
            socket.off('add blocked', handler);
        }
    }, [props.user?.id])


    function    parseUser(roomName: string) {
        const user1Id:number = parseInt(roomName.split('-')[0]);
        const user2Id:number = parseInt(roomName.split('-')[1]);
        let   otherId:number;
        if (user1Id === props.user.id)
            otherId = user2Id;
        else
            otherId = user1Id;
        const otherUser = props.users.find(user => otherId === user.id);
        return otherUser;
    }

    function handleOnSubmit(e: any, selectedUser: User | null) {
        let roomName: string;
        e.preventDefault();
        if (selectedUser)
        {
            const submittedUsername: string = selectedUser?.username;
            let clickedUser:any = props.users.find(user => user.username === submittedUsername);
            if (clickedUser && clickedUser.id !== props.user.id)
            {
                if (clickedUser.id < props.user.id)
                    roomName = clickedUser.id.toString() + '-' + props.user.id.toString();
                else
                    roomName = props.user.id.toString() + '-' + clickedUser.id.toString();
                if (props.rooms.find(room => room.name === roomName))
                {
                    let room: any = props.rooms.find(room => room.name === roomName);
                    props.setCurrentRoom(room);
                }
                else
                {
                    const createDMRoomDto: CreateDMRoomDto = {name: roomName, user1Id: clickedUser.id, user2Id: props.user.id}
                    socket.emit('create dm room', createDMRoomDto)
                }
            }
        }
    }

	useEffect(() => {
		const handler = () => {
			socket.emit('get rooms', props.user.id)
			socket.emit('get public rooms');
		};
		socket.on('create room', handler);
		return ( () => {
			socket.off('create room', handler);
		})
	}, [props.user.id]);

	useEffect(() => {
		const handler = () => {
			socket.emit('get rooms', props.user.id)
		};
		socket.on('create dm room', handler);
		return ( () => {
			socket.off('create dm room', handler);
		})
	}, [props.user.id])
    
    
    function UserMod(props: {user: User, users: User[], room: Room,  statusMap: Map<number, string>, current: boolean}) {
        
        let [showBackdrop, setShowBackdrop] = useState<boolean>(false);
        
        function    blockUser(blockedId: number | undefined) {
            socket.emit('add blocked', {userId: props.user.id, blockedId: blockedId} );
            setShowBackdrop(false);
        }
        
        return (
            <div>
                <Stack justifyContent="space-between">
                    <ListItemText primary={parseUser(props.room.name)?.username}/>
                    {props.current ?
                    <Stack direction="row" >
                        <Tooltip title="Go to profile">
                            <IconButton size="small">
                                <Link to={"/profile/" + parseUser(props.room.name)?.id}><PersonIcon/></Link>
                            </IconButton>
                        </Tooltip>
                        <GameInviteButton user={props.user} otherUser={parseUser(props.room.name)} statusMap={props.statusMap}/>
                        <Tooltip title="Block user">
                            <IconButton color='error' onClick={() => setShowBackdrop(true)} size="small">
                                <BlockIcon/>
                            </IconButton>
                        </Tooltip>
                    </Stack>:null}
                </Stack>
                <Backdrop
                    open={showBackdrop}
                >
                    <Stack alignItems="center">
                        <Alert severity="warning">
                            Are you sure you want to block {parseUser(props.room.name)?.username}?
                        </Alert>
                        <ButtonGroup>
                            <Button variant="contained" color="success" onClick={() => blockUser(parseUser(props.room.name)?.id)}>
                                Yes
                            </Button>
                            <Button variant="contained" color="error" onClick={() => setShowBackdrop(false)}>
                                No
                            </Button>
                        </ButtonGroup>
                    </Stack>
                </Backdrop>
            </div>
        );
    }

    return (
        <div>
             <Autocomplete
              id="search..."
              onChange={handleOnSubmit}
              options={props.users.filter(item => item.id !== props.user.id && !props.blocked.find(user => user.id === item.id))}
              getOptionLabel={(option: any) => option?.username }
              renderInput={(params: any) => <TextField {...params} label="search..." />}
              sx={{ width: '15vw' }}
            />
            <List>
                {props.rooms.map(room => (
                    <div key={room.id}>
                        {props.blocked.find(user => parseUser(room.name)?.username === user.username) === undefined && room.ownerId === 0?
                            <div>
                                { room.id !== props.currentRoom.id ?

                                    <ListItem button className="MenuItem" onClick={() => props.setCurrentRoom(room) } sx={{ alignContent:"center" }} >
                                        <UserMod user={props.user} users={props.users} room={room}  statusMap={props.statusMap} current={false}/>
                                    </ListItem>
                                :
                                    <ListItem className="MenuItem" button selected  sx={{ alignContent:"center"}}>
                                        <UserMod user={props.user} users={props.users} room={room}  statusMap={props.statusMap} current={true}/>
                                    </ListItem>
                                }
                            </div>
                            :
                            <div/>
                        }
                    </div>
                ))}
            </List>
        </div>
    );
}