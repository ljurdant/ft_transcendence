import '../../styles/Chat/Channels.css';
import TextField from '@mui/material/TextField';
import {Button, NativeSelect, Tooltip, ListItem, Autocomplete} from '@mui/material';
import Stack from '@mui/material/Stack';
import SettingsIcon from '@mui/icons-material/Settings';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Popper from '@mui/material/Popper';
import {useState, useEffect } from 'react'
import {Room, User} from 'interfaces'
import {socket} from 'App'
import { toastIt, toastThatError } from '../../App';
import {ButtonStyle} from './Channels';
import CloseIcon from '@mui/icons-material/Close';

export interface RoomUserDto {
    userId: number;
    roomId: number;
};

interface MuteUserDto {
	userId: number;
	roomId: number;
	date: Date;
};

function RoomUserMod(props : {currentUser: User, users: User[], room: Room, roomAdmins: User[]}) {

	let [roomUsers, setRoomUsers] = useState<User[]>([]);
	let [addUserClicked, setAddUserClicked] = useState<number>(0);
    let [kickUserClicked, setKickUserClicked] = useState<number>(0);
	let [addAdminClicked, setAddAdminClicked] = useState<number>(0);
	let [kickAdminClicked, setKickAdminClicked] = useState<number>(0);
	let [muteUserClicked, setMuteUserClicked] = useState<number>(0);
	let [passwordClicked, setPasswordClicked] = useState<boolean>(false);

	useEffect (() => {
		const handler = (data: User[]) => { setRoomUsers(data);};
		socket.on('get users', handler);
		return () => {
			socket.off('get users', handler);
		}
	}, [])

	function handleAddUserClick(room: Room) {
		socket.emit('get users', room.id);
		setAddUserClicked(1);
	}
	
    function handleKickUserClick(room: Room) {
        socket.emit('get users', room.id);
		setKickUserClicked(1);
    }

	function handleAddAdminClick(room: Room) {
		socket.emit('get users', room.id);
		setAddAdminClicked(1);
	}
	
	function handleKickAdminClick(room: Room) {
		socket.emit('get users', room.id);
		setKickAdminClicked(1);
	}
	
	function handleMuteUserClick(room: Room) {
		socket.emit('get users', room.id);
		setMuteUserClicked(1);
	}

	function handleUserSubmit(e: any, selectedUser: User | null) {
		if (selectedUser)
		{	
			const username = selectedUser?.username;
			let userId: any = props.users.find(user => user.username === username)?.id;
			const addUser: RoomUserDto = {userId: userId, roomId: props.room.id}
			socket.emit('add user to room', addUser);
			setAddUserClicked(0);
			toastIt(username + ' added to ' + props.room.name);
		}
	}

	function handleKickUserSubmit(e: any, selectedUser: User | null) {
		e.preventDefault();
		if (selectedUser)
		{	
			const username = selectedUser?.username;
			let userId: any = props.users.find(user => user.username === username)?.id;
			const removeUser: RoomUserDto = {userId: userId, roomId: props.room.id};
			socket.emit('remove user from room', removeUser);
			setKickUserClicked(0);
			toastIt(username + ' removed from ' + props.room.name);
		}
	}

	function handleAddAdminSubmit(e: any, selectedUser: User | null) {
		e.preventDefault();
		if (selectedUser)
		{	
			const username = selectedUser?.username;
			let userId: any = props.users.find(user => user.username === username)?.id;
			const removeUser: RoomUserDto = {userId: userId, roomId: props.room.id};
			socket.emit('add admin to room', removeUser);
			setAddAdminClicked(0);
			toastIt(username + ' given admin privileges ' + props.room.name);
		}
	}

	function handleKickAdminSubmit(e: any, selectedUser: User | null) {
		e.preventDefault();
		if (selectedUser)
		{	
			const username = selectedUser?.username;
					let userId: any = props.users.find(user => user.username === username)?.id;
					if (userId === props.room.ownerId)
						toastThatError('cannot remove admin privileges from owner');
					const removeAdmin: RoomUserDto = {userId: userId, roomId: props.room.id};
					socket.emit('remove admin from room', removeAdmin);
					setKickAdminClicked(0);
					toastIt(username + ' removed from administrators in ' + props.room.name);
		}
	}

	function handleMuteUserSubmit(e: any) {
		e.preventDefault();
		const username: string= e.target[0].value;
		const amount: number = parseInt(e.target[1].value);
		const scale: string = e.target[2].value;
		console.log("amount = ",amount)
		if (!e.target[1].value || amount <= 0 || (scale === 'minutes' && amount > 60) || (scale === 'hours' && amount > 24))
			toastThatError('bad time');
		else
		{
			if (props.users.find(user => user.username === username))
			{
				if (roomUsers.find(user => user.username === username))
				{
					let userId: any = props.users.find(user => user.username === username)?.id;
					if (userId === props.room.ownerId)
						toastThatError('cannot mute owner');
					else
					{
						let date: Date = new Date();
						if (scale=== 'minutes')
							date.setMinutes(date.getMinutes() + amount);
						else if (scale=== 'hours')
							date.setHours(date.getHours() + amount);
						else if (scale=== 'days')
							date.setDate(date.getDate() + amount);
						const muteUser: MuteUserDto = {userId: userId, roomId: props.room.id, date: date};
						socket.emit('add mute to room', muteUser);
						setMuteUserClicked(0);
						toastIt(username + ' muted in ' + props.room.name);
					}
				}
				else
				toastThatError('user not in room');
			}
			else
				toastThatError('username not found')
		}
	}


	function UserList(props:{users: User[], condition: Function}) {
		return (
			<Stack className="add-user-list">
				{props.users.map(item => (
					<div key={item.id}>
						{props.condition(item)?
							<div/>
							:
							<ListItem className="add-user-list-content" key={item.id}>
								{item.username}
							</ListItem>
						}
					</div>
				))}
			</Stack>
		);
	}

	function	UserModButton(props: {clickAction: Function, room:Room, title:string, clicked: number, handleSubmit: any, setClicked:Function, users: User[]}) {

		return (
			<div>
				<Button variant="contained" size="small" style={ButtonStyle} onClick={() => props.clickAction(props.room)}>{props.title}</Button>
				{props.clicked ?
					<Autocomplete
						options={props.users}
						getOptionLabel={(option: User) => option.username}
						style={{width: '80%'}}
						renderInput={(params) => <TextField {...params} label="username" variant="standard" size="small" color="warning" />}
						onChange={props.handleSubmit}
					/>
				:
				null
				}
			</div>
	);
	}



	function MuteUserButton(props: {clickAction: Function, room:Room, title:string, clicked: number, handleSubmit: React.FormEventHandler<HTMLFormElement>, setClicked:Function, users: User[], condition: Function})
	{
		return (
			<div>
			<Button variant="contained" size="small" style={ButtonStyle} onClick={() => props.clickAction(props.room)}>{props.title}</Button>
			{props.clicked ?
				<Stack spacing="0.6em">
					<form onSubmit={props.handleSubmit}>
						<Stack direction="row" >
							<TextField 
								type="text"
								label="username" 
								variant="standard"
								size="small"
								color="warning"
								style={{width: '80%'}}
							/>
						</Stack>
						<UserList users={props.users} condition={props.condition}/>
						<Stack direction="row" >
							<TextField
								type="number"
								label="amount"
								variant="standard"
								size="small"
								color="warning"
								style={{width: '50%'}}
							/>
							<NativeSelect>
								<option value="minutes">minutes</option>
								<option value="hours">hours</option>
								<option value="days">days</option>
							</NativeSelect>
						</Stack>
						<Button title="mute"  variant="contained" type="submit" style={{width:"40%", backgroundColor:"rgb(70, 195, 150)"}}>validate</Button>
						<Button title="cancel" variant="contained" style={{width:"40%", backgroundColor:"rgb(195, 60, 40)"}} onClick={() => props.setClicked(0)}>cancel</Button>
					</form>
				</Stack>
			:
			<div/>
			}
			</div>
		);
	}

	function handleNewPasswordSubmit(e: any) {
		e.preventDefault();

		let password:string = e.target[0].value;
		socket.emit('update password', {roomId: props.room.id, password: password})
		setPasswordClicked(false);
	}

	function PasswordMod(props: {setPasswordClicked: React.Dispatch<React.SetStateAction<boolean>>}) {
		return (
			<Button variant="contained" size="small" style={ButtonStyle} onClick={() => props.setPasswordClicked(true)}>Change Password</Button>
		)
	}


	

	return (
		<Stack spacing={0.6} >
			<UserModButton 
				clickAction={handleAddUserClick} 
				room={props.room} title="add user"
				clicked={addUserClicked} 
				handleSubmit={handleUserSubmit} 
				setClicked={setAddUserClicked} 
				users={props.users.filter(item => !roomUsers.find(user => user.username === item.username))}
			/>
			<UserModButton 
				clickAction={handleKickUserClick} 
				room={props.room} 
				title="kick user" 
				clicked={kickUserClicked} 
				handleSubmit={handleKickUserSubmit} 
				setClicked={setKickUserClicked} 
				users={props.users.filter(item => roomUsers.find(user => user.username === item.username) && item.id !== props.room.ownerId)} 
			/>
			{props.currentUser.id === props.room.ownerId?
			<UserModButton
				clickAction={handleAddAdminClick} 
				room={props.room} title="add admin" 
				clicked={addAdminClicked} 
				handleSubmit={handleAddAdminSubmit} 
				setClicked={setAddAdminClicked} 
				users={props.users.filter(item=> !props.roomAdmins.find(admin => admin.username === item.username) && roomUsers.find(user => user.id === item.id ))} 
			/>
			:
			null}
			{props.currentUser.id === props.room.ownerId?
			<UserModButton 
				clickAction={handleKickAdminClick} 
				room={props.room} 
				title="kick admin" 
				clicked={kickAdminClicked} 
				handleSubmit={handleKickAdminSubmit} 
				setClicked={setKickAdminClicked} 
				users={props.roomAdmins.filter( item => item.id !== props.room.ownerId)} 
			/>
			:null}
			<MuteUserButton
				clickAction={handleMuteUserClick}
				room={props.room}
				title="mute user"
				clicked={muteUserClicked}
				handleSubmit={handleMuteUserSubmit}
				setClicked={setMuteUserClicked}
				users={props.users}
				condition={(item:User) => {return(!(roomUsers.find(user => user.id === item.id) && item.id !== props.currentUser.id && item.id !== props.room.ownerId))}}
			/>
			{props.currentUser.id === props.room.ownerId?
				<div>
					<PasswordMod setPasswordClicked={setPasswordClicked}/>
					{passwordClicked?
							<Stack direction="row" >
							<form onSubmit={handleNewPasswordSubmit}>
							<TextField 
									type="text"
									label="new password"
									variant="standard"
									size="small"
									color="warning"
									style={{width: '80%'}}
								/>
							</form>
							<IconButton title="cancel" onClick={() => setPasswordClicked(false)} style={{color:"rgb(195, 60, 40)"}}><CloseIcon/></IconButton>
						</Stack>
					:null}
				</div>
				:null}
		</Stack>
	)
}

function SimplePopper(props : {user: User, users: User[], room: Room, roomAdmins: User[]}) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(anchorEl ? null : event.currentTarget);
	};
	
	const open = Boolean(anchorEl);
	const id = open ? 'simple-popper' : undefined;
	
	return (
		<div>
			<Tooltip title="Settings">
				<IconButton onClick={handleClick} color="error">
					<SettingsIcon/>
				</IconButton>
			</Tooltip>
			<Popper id={id} open={open} anchorEl={anchorEl}>
				<Box sx={{ border: 1, p: 1, bgcolor: 'rgb(140, 150, 220)' }}>
					<RoomUserMod currentUser={props.user} users={props.users} room={props.room} roomAdmins={props.roomAdmins}/>
				</Box>
			</Popper>
		</div>
	);
}

export default function RoomUserPopper(props : {currentUser: User, users: User[], room: Room, roomAdmins:User[]}) {

	  return (
		
		<Box sx={{display: 'flex', alignItems: 'center'}}>
			{props.roomAdmins.find(user => user.id === props.currentUser?.id)?
				<SimplePopper user={props.currentUser} users={props.users} room={props.room} roomAdmins={props.roomAdmins}/>
			:
				<div/>
			}
		</Box>
		
	  )
}