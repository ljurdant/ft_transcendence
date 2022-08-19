import '../../styles/Chat/Channels.css';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import NativeSelect from '@mui/material/NativeSelect';
import InputLabel from '@mui/material/InputLabel';
import KeyIcon from '@mui/icons-material/Key';
import KeyOffIcon from '@mui/icons-material/KeyOff';
import ToggleButton from '@mui/material/ToggleButton';
import Dialog from '@mui/material/Dialog';
import { toastThatError } from '../../App';
import {useState, useEffect} from 'react'
import {Room, User} from 'interfaces'
import {socket} from 'App'
import RoomUserPopper from './RoomUserMod'
import FormControl from '@mui/material/FormControl'
import DirectMessaging from './DirectMessaging';
import {Tooltip, IconButton, Backdrop, Alert, ButtonGroup, Button} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

interface CreateRoomDto {
	name: string;
	userId: number;
	visibility: string;
	password: string;
}

export interface UserRoomDto {
    userId: number;
    roomId: number;
};

export const ButtonStyle = {
	border: '1px solid black',
	backgroundColor: 'rgb(235, 116, 30, 0.75)',
	overflow: 'hidden',
	width: '100%',
	minWidth: '72px',
}

function PasswordInput(props: {openPassword: boolean, setOpenPassword: React.Dispatch<React.SetStateAction<boolean>>, 
	room: Room, setCurrentRoom: React.Dispatch<React.SetStateAction<Room>>}) {
	
	const handleClose = () => {
		props.setOpenPassword(false);
	};

	function handlePasswordSubmit(e:any) {
		const submittedPassword = e.target[0].value;
		e.preventDefault();
		socket.emit('check password', {roomId: props.room.id, password: submittedPassword});
	}

	useEffect(() => {
		const handler = (data: any) => {
			if (data)
			{
				props.setCurrentRoom(props.room);
				socket.emit('get admins', props.room.id);
				socket.emit('get muted users', props.room.id);
				handleClose()
			}
			else
				toastThatError("wrong password");
		}
		socket.on('check password', handler);
		return () => {
			socket.off('check password');
		}
	}, [props.room, handleClose]);

	return(
		<Dialog open={props.openPassword}  onClose={handleClose}>
			<Box component="form" onSubmit={handlePasswordSubmit}>
				<TextField
					autoFocus
					margin="dense"
					id="password"
					label="password"
					type="password"
					fullWidth
					variant="standard"
				/>
			</Box>
		</Dialog>
	)
}

function LeaveRoomButton(props: {room: Room, user: User})
{
	let [open, setOpen] = useState<boolean>(false);

	function leaveRoom() {
		socket.emit('leave room', {userId:props.user.id, roomId: props.room.id});
		setOpen(false);
	}

	return (
		<div>
			<Tooltip title="leave room" placement="bottom">
				<IconButton  size="small" onClick={() => setOpen(true)}>
					<ExitToAppIcon/>
				</IconButton>
			</Tooltip>
			<Backdrop open={open}>
				<Stack alignItems="center">
					<Alert severity="warning">
						Are you sure you want to leave this room ({props.room.name})?
					</Alert>
					<ButtonGroup>
						<Button variant="contained" sx={{backgroundColor:"rgb(70, 195, 150)"}} onClick={leaveRoom}>
							Yes
						</Button>
						<Button variant="contained" sx={{background:"rgb(195, 60, 40)"}} onClick={() => setOpen(false)}>
							No
						</Button>
					</ButtonGroup>
				</Stack>
			</Backdrop>
		</div>
	)
}

function RoomList(props: {rooms: Room[], currentRoom: Room, setCurrentRoom: React.Dispatch<React.SetStateAction<Room>>, users: User[], user: User, visibility: string, roomAdmins:User[]}) {
	let [openPassword, setOpenPassword] = useState<boolean>(false);

	function handleRoomClick(room: Room) {
		if (room.password === "")
		{
			props.setCurrentRoom(room)
			socket.emit('get admins', room.id);
			socket.emit('get muted users', room.id);
		}
		else
			setOpenPassword(true);
	}

	let channelListItem = {
		paddingLeft:"0px",
		paddingRight:"0px",
		paddingTop:"4px",
		paddingBottom:"4px",
	}

	return (
		<List className="channel-list">
				{props.rooms.map(item => (
					<div key={item.id}>
						{item.visibility === props.visibility  && item.ownerId !== 0?
							<div>
								{ item.id !== props.currentRoom.id ?
								<ListItem title={item.name} className="channel-list-content" sx={channelListItem} button onClick={() => handleRoomClick(item)}>
										<ListItemText primary={item.name}/>
									<PasswordInput openPassword={openPassword} setOpenPassword={setOpenPassword} room={item} setCurrentRoom={props.setCurrentRoom}/>
								</ListItem>
								:
								<Stack direction="row">
									<ListItem title={item.name} button selected className="channel-list-content" sx={channelListItem}>
										<ListItemText primary={item.name} sx={{overflow: "hidden"}} />
										<RoomUserPopper currentUser={props.user} users={props.users} room={props.currentRoom} roomAdmins={props.roomAdmins}/>
										<LeaveRoomButton room={item} user={props.user}/>
									</ListItem>
								</Stack>
								}
								<Divider/>
							</div>
							:
							<div/>
						}
					</div>
				))}
		</List>
	)
}

function Channels(props : {user: User, users: User[], currentRoom: Room, setCurrentRoom: React.Dispatch<React.SetStateAction<Room>>, setCanWrite: React.Dispatch<React.SetStateAction<boolean>>, roomAdmins:User[], statusMap: Map<number, string>, blocked: User[]}) {

	let [addRoomClicked, setAddRoomClicked] = useState<number>(0);
	let [rooms, setRooms] = useState<Room[]>([]);
	let [publicRooms, setPublicRooms] = useState<Room[]>([]);
	let [showPassword, setShowPassword] = useState<number>(0);
	let [tab, setTab] = useState<string>('channels');

	async function handleRoomSubmit(e:any) {
		
		e.preventDefault();
		const room_name: string = e.target[0].value;
		const visibility: string = e.target[1].value;
		const password: string = e.target[3].value;
		
		const createRoomDto: CreateRoomDto = {name: room_name, userId: props.user.id, visibility: visibility, password: password}
		
		if (room_name && visibility)
			socket.emit('create room', createRoomDto);

		e.target[0].value = '';
		setAddRoomClicked(0);
	}


	useEffect(() => {
		if (rooms.find(item => item.id === props.currentRoom.id))
			props.setCanWrite(true);
		else
			props.setCanWrite(false);
	}, [props, rooms])

	useEffect(() => {
		const handler = () => {
				socket.emit('get rooms', props.user.id);
				socket.emit('get public rooms');
		};
		socket.on('add user to room', handler);
		return (() => {
			socket.off('add user to room', handler);
		})
	})

	useEffect(() => {
		const handler = (removeUserDto: UserRoomDto) => {
			if(removeUserDto.userId === props.user.id)
			{
				socket.emit('disconnect from room', removeUserDto.roomId);
				socket.emit('get rooms', props.user.id)
				socket.emit('get public rooms');
			};
		};
		socket.on('remove user from room', handler);
		return (() => {
			socket.off('remove user from room', handler);
		})
	})

	useEffect(() => {
		const handler = () => {
			socket.emit('get rooms', props.user.id)
			socket.emit('get public rooms');
			let objDiv = document.getElementById('channels');
            if (objDiv != null)
				objDiv.scrollTop = objDiv.scrollHeight;
		};
		socket.on('create room', handler);
		return ( () => {
			socket.off('create room', handler);
		})
	})

	useEffect(() => {
		const handler = () => {
			socket.emit('get rooms', props.user.id)
			let objDiv = document.getElementById('channels');
            if (objDiv != null)
				objDiv.scrollTop = objDiv.scrollHeight;
		};
		socket.on('create dm room', handler);
		return ( () => {
			socket.off('create dm room', handler);
		})
	})

	useEffect(() => {
		const handler = (rooms_list: Room[]) => {
			setRooms(rooms_list);
			rooms_list.forEach(room => {
				socket.emit('join room', room.id.toString());
			});
		};
		socket.on('get rooms', handler);
		return (() => {socket.off('get rooms', handler);})
	}, [])

	useEffect(() => {
		const handler = (rooms_list: Room[]) => {
			setPublicRooms(rooms_list);
			rooms_list.forEach(room => {
				socket.emit('join room', room.id.toString());
			});
		};
		socket.on('get public rooms', handler);
		return(() => {socket.off('get public rooms', handler)})
	}, [])

	function handlePasswordSelect() {
		if (showPassword)
			setShowPassword(0);
		else
			setShowPassword(1);
	}

	return (
		<div>
		<Stack className='channels' spacing={1} >
			<ButtonGroup>
				<Button variant="contained" size="small" style={ButtonStyle} onClick={() => setTab('channels')}>Channels</Button>
				<Button variant="contained" size="small" style={ButtonStyle} onClick={() => setTab('dms')}>DMs</Button>
			</ButtonGroup>
			{tab === 'channels'?
			<Stack justifyContent='space-between'>
				<Box>
					{addRoomClicked ?
							<Stack spacing={1}>
								<Stack component="form" onSubmit={handleRoomSubmit} spacing={1}>
									<TextField 
										id="roomName" 
										label="Room name" 
										variant="standard"
									/>
										<FormControl fullWidth>
											<InputLabel id="visibility-label">visibility</InputLabel>
											<NativeSelect
												defaultValue="private"
												inputProps={{
													name: 'visibility',
													id: 'uncontrolled-native',
												}}
												>
												<option value="private">private</option>
												<option value="public">public</option>
											</NativeSelect>
										</FormControl>
									<ToggleButton value={showPassword} onChange={handlePasswordSelect}>
										{showPassword?
											<KeyOffIcon/>
											:
											<KeyIcon/>
										}
									</ToggleButton>
									{showPassword?
										<TextField id="password" label="password" type="text" />
										:
										<div/>
									}
									<Button variant="contained" sx={{backgroundColor: 'rgb(70, 195, 150, 0.65)', border: '2px solid black'}} type="submit">Create</Button>
								</Stack>
									<Button variant="contained" sx={{backgroundColor: 'rgb(195, 60, 40, 0.65)', border: '2px solid black'}} onClick={() => setAddRoomClicked(0)}>Cancel</Button>
							</Stack>
						:
						<Button onClick={() => setAddRoomClicked(1)} variant='contained' color="warning" sx={ButtonStyle}>Create Room</Button>
					}
				</Box>
				<div >
					<RoomList rooms = {publicRooms} currentRoom = {props.currentRoom} setCurrentRoom = {props.setCurrentRoom} users = {props.users} user = {props.user} visibility = "public" roomAdmins={props.roomAdmins} />
					<RoomList rooms = {rooms} currentRoom = {props.currentRoom} setCurrentRoom = {props.setCurrentRoom} users = {props.users} user = {props.user} visibility="private" roomAdmins={props.roomAdmins} />
				</div>
			</Stack>
			:
			<DirectMessaging user={props.user} users={props.users} rooms={rooms} currentRoom={props.currentRoom} setCurrentRoom={props.setCurrentRoom} statusMap={props.statusMap} blocked={props.blocked}/>
			}
		</Stack>
		</div>
	);
}

export default Channels;