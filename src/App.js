import React, { useEffect, useState } from "react";
import { Button, Heading, Input, Box, VStack, Stack, HStack, InputGroup, InputLeftAddon, Table,
	Thead,
	Tbody,
	Tr,
	Th,
	TableCaption,
	TableContainer } from '@chakra-ui/react';
import { ratings } from './Components/ratingColors';
import bgimg from "./constants/im1.jpg";
import { type } from "@testing-library/user-event/dist/type";


function App() {
	//constants
	const problemLinkInitial = "https://codeforces.com/problemset/problem/";
	const userStatusApi = "https://codeforces.com/api/user.status?handle=";
	const userInfoApi = "https://codeforces.com/api/user.info?handles=";

	//useStates
	const [curUser, setCurUser] = useState("");
	const [userNameList, setUserNameList] = useState([]);
	const [userData, setUserData] = useState([]);
	const [userProblemList, setUserProblemList] = useState([]);
	const [intersection, setIntersection] = useState([]);
	const [info, setInfo] = useState([]);
	const [userRatingList, setUserRatingList] = useState([]);
	const [lowRating, setLowRating] = useState("");
	const [highRating, setHighRating] = useState("");

	const [filter, setFilter] = useState("Default");


	//Handlers
	function getUserName(event) {
		setCurUser(event.target.value);
	}


	//find intersection
	const getIntersection = (e) => {
		setFilter("Intersection");
		if (userData.length >= 2) {
			let temp = userData[0];
			for (var i = 1; i < userData.length; i++) {
				temp = (temp.filter(item1 => userData[i].some(item2 => item1.problem.name === item2.problem.name)));
			}
			temp.sort((a, b) => (a.problem.rating > b.problem.rating) ? 1 : -1);
			setInfo(temp);
		}
	}


	//find union
	const getUnion = (e) => {
		setFilter("Union");
		setInfo(userProblemList);
	}


	//finding list of filtered rating according to previous filter (union or intersection)
	const getFilteredList = () => {

		
		let temp = [];
		// console.log("filter is " + filter);
		var low = parseInt(lowRating, 10);
		var high = parseInt(highRating,10);
		if (lowRating === "") {
			low = 800;
			setLowRating("800");
		}
		if (highRating === "") {
			high = 3500;
			setHighRating(3500);
		}
		// console.log((low));
		// console.log((high));

		if (filter === "Intersection") {
			if (userData.length >= 2) {
				temp = userData[0];
				for (var i = 1; i < userData.length; i++) {
					console.log(typeof(userData[i][0].problem.rating));
					temp = (temp.filter(item1 => userData[i].some(item2 => item1.problem.name === item2.problem.name && item1.problem.rating >= low && item1.problem.rating <= high)));
				}
			}
		}
		else if(filter === "Union"){
			//union or default case
			for (var i = 0; i < userProblemList.length; i++) {
				var curRating = userProblemList[i].problem.rating;
				if (curRating >= low && curRating <= high) {
					temp.push({problem: userProblemList[i].problem, name: userProblemList[i].problem.name});
				}
			}
		}

		// console.log(temp);
		temp.sort((a, b) => (a.problem.rating > b.problem.rating) ? 1 : -1);
		setInfo(temp);
	}

	//set userlist problems for every user
	const getUserList = (username) => {
		console.log(username);
		let currUserIdx = 0;
		for (var i = 0; i < userRatingList.length; i++) {
			if (username === userRatingList[i].handle){
				currUserIdx = i;
			}
		}
		var low = parseInt(lowRating, 10);
		var high = parseInt(highRating,10);
		if (lowRating === "") {
			low = 800;
			// setLowRating("800");
		}
		if (highRating === "") {
			high = 3500;
			// setHighRating(3500);
		}
		let temp = userData[currUserIdx];
		for (var i = 0; i < userData[currUserIdx]; i++){
			if (userData[currUserIdx][i].problem.rating >= low && userData[currUserIdx][i].problem.rating <= high) {
				temp.push({ problem: userData[currUserIdx][i].problem, name: userData[currUserIdx][i].problem.name });
			}
		}
		setInfo(temp);
	}


	//collect data of user and store it
	const getUsers = async () => {
		const response = await fetch(userStatusApi + curUser);//Returns submissions of specified user.
		const submissionsOfUser = await response.json();

		//error handling if invalid username is entered
		if (response.status !== 200) {
			alert("Please enter a valid username");
			setCurUser("");
			return;
		}


		const responseOfUser = await fetch(userInfoApi + curUser);//Returns information about one or several users.
		const dataOfUser = await responseOfUser.json();
		console.log(dataOfUser);

		//setting this simultaneously as we will have same index of userName and his data
		//we are using 2 used states here as we can dynamically get index of user and access userdata
		setUserRatingList([...userRatingList, dataOfUser.result[0]]);
		setUserNameList([...userNameList, dataOfUser.result.handle]);


		var currentUserSubmissionsList = [];
		//in currentUsereSubmissionsList we can collecting all accepted solutions
		for (var i = 0; i < submissionsOfUser.result.length; i++) {
			const obj = submissionsOfUser.result[i];
			if (obj.verdict === "OK") {
				currentUserSubmissionsList.push({problem: obj.problem, name: obj.problem.name});
			}
		}

		var curUserData = [...new Map(currentUserSubmissionsList.map((item) => [item["name"], item])).values()];

		//sorting data according to raing
		curUserData.sort((a, b) => (a.problem.rating > b.problem.rating) ? 1 : -1);


		setUserData([...userData, curUserData]);
		setUserProblemList([...userProblemList, ...curUserData]);

		//setiing states
		setInfo(curUserData);
		setCurUser("");
	}


	useEffect(() => {
		if (userData.length >= 1){
			setIntersection(userData[0]);
		}
	}, [userData])
	
	return (
		<div style={{ backgroundImage: `url(${bgimg})` , height:"80000px"}}>
			<Box bg='transparent' alignItems='center'>
				<VStack pt={10} pb={125} px='auto' spacing={5} direction={['column', 'column', 'row']}>
					<Heading style={{ color : "white"}}>Problems Selector</Heading>
					<HStack>
							{userRatingList.map(item => (
								<Button colorScheme={(!item.rank ? "black" : (ratings[item.rank] || "red"))} onClick={() => getUserList(item.handle)}>
									{item.handle}
								</Button>
							))}
					</HStack>


					<HStack>
						<InputGroup w="80%" alignItems="center">
							<InputLeftAddon children="CF Handle" />
							<Input style={{color : "white"}} onChange={getUserName} value={curUser} placeholder={"tourist"}></Input>
						</InputGroup>
						<Button colorScheme="white" onClick={getUsers}>Add</Button>
					</HStack>
							

					<HStack>
						<Button onClick={getIntersection}>Intersection</Button>
						<Button onClick={getUnion}>Union</Button>
					</HStack>
							

					<Stack alignItems={"center"}>
						<InputGroup w="100%" alignItems="center">
							<InputLeftAddon children="Rating " />
							<Input placeholder="low" onChange={(e) => setLowRating(e.target.value)} style={{ color: "white" }} value={lowRating} htmlSize={5} ></Input>
							<Input placeholder="high" onChange={(e) => setHighRating(e.target.value)} style={{color : "white"}} value={highRating} htmlSize={5}></Input>
							<Button mx={5} colorScheme="white" onClick={getFilteredList}>Filter</Button>
						</InputGroup>
					</Stack>


					<TableContainer>
						<Table variant="simple">
							<TableCaption>Ratings</TableCaption>
							<Thead>
								<Tr >
									<Th style={{color : "white"}}>Sr. No</Th>
									<Th style={{color : "white"}}>Index</Th>
									<Th style={{color : "white"}}>Problem Name</Th>
									<Th isNumeric style={{color : "white"}}>Rating</Th>
									<Th style={{color : "white"}}>Link</Th>
								</Tr>
							</Thead>
							<Tbody >
								{
									info.map((item, idx) => (
										<Tr>
											<Th style={{color : "white"}}>{idx+1}</Th>
											<Th style={{color : "white"}}>{item.problem.index}</Th>
											<Th style={{color : "white"}}>{item.problem.name}</Th>
											<Th style={{color : "white"}}>{item.problem.rating || "NA"}</Th>
											<Th ><Button onClick={() => {
												window.open(problemLinkInitial + item.problem.contestId + "/" + item.problem.index);
											}}>Open</Button></Th>
										</Tr>
									))
								}
							</Tbody>
						</Table>
					</TableContainer>
				</VStack>
			</Box>
		</div>
  	);
}
export default App;

