import React, { useEffect, useState } from "react";
import { Button, Heading, Input, Text, useRadio, Box, VStack, Stack, HStack, InputGroup, InputLeftAddon, Table,
	Thead,
	Tbody,
	Tfoot,
	Tr,
	Th,
	Td,
	TableCaption,
	TableContainer,Badge } from '@chakra-ui/react';
import { Grid, GridItem } from '@chakra-ui/react'
import { ratings } from './Components/ratingColors';
import bgimg from "./constants/im1.jpg";

function getWindowDimensions() {
	const { innerWidth: width, innerHeight: height } = window;
	return {
	  width,
	  height
	};
  }
  
function useWindowDimensions() {
	const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
  
	useEffect(() => {
	  function handleResize() {
		setWindowDimensions(getWindowDimensions());
	  }
  
	  window.addEventListener('resize', handleResize);
	  return () => window.removeEventListener('resize', handleResize);
	}, []);
  
	return windowDimensions;
}
  

function App() {
	//constants
	const str = "https://codeforces.com/problemset/problem/";

	//useStates
	const [curUser, setCurUser] = useState("");
	const [userNameList, setUserNameList] = useState([]);
	const [userData, setUserData] = useState([]);
	const [userProblemList, setUserProblemList] = useState([]);
	const [intersection, setIntersection] = useState([]);
	const [info, setInfo] = useState([]);
	const [userRatingList, setUserRatingList] = useState([]);
	const [rating, setRating] = useState(0);

	//Handlers
	function typing(event) {
		setCurUser(event.target.value);
	}

	const handleRatingChange = (e) => {
		setRating(e.target.value);
	}

	const getIntersection = (e) => {
		if (userData.length >= 2) {
			let temp = intersection;
			for (var i = 1; i < userData.length; i++) {
				temp = (temp.filter(item1 => userData[i].some(item2 => item1.problem.name === item2.problem.name)));
			}
			setInfo(temp);
		}
	}

	const getUnion = (e) => {
		setInfo(userProblemList);
	}

	const getRatedProblems = () => {
		let temp = [];
		for (var i = 0; i < userProblemList.length; i++) {
			if (userProblemList[i].problem.rating == rating) {
				temp.push(userProblemList[i]);
			}
		}
		console.log(temp);
		setInfo(temp);
	}

	const getUserList = (username) => {
		let currUserIdx = 0;
		for (var i = 0; i < userRatingList.length; i++) {
			if (username === userRatingList[i].handle){
				currUserIdx = i;
			}
		}
		setInfo(userData[currUserIdx]);
	}

	const getUsers = async () => {
		const response = await fetch("https://codeforces.com/api/user.status?handle=" + curUser);
		const data = await response.json();
		if(response.status !== 200) {
			alert("Please enter a valid username");
			setCurUser("");
			return;
		}
		const responseOfUser = await fetch("https://codeforces.com/api/user.info?handles=" + curUser);
		const dataOfUser = await responseOfUser.json();
		setUserRatingList([...userRatingList, dataOfUser.result[0]]);
		setUserNameList([...userNameList, dataOfUser.result.handle]);
		var tempList = [];
		for (var i = 0; i < data.result.length; i++) {
			const obj = data.result[i];
			if (obj.verdict === "OK") {
				tempList.push({problem: obj.problem, name: obj.problem.name});
			}
		}

		var tempList2 = [...new Map(tempList.map((item) => [item["name"], item])).values()];

		tempList2.sort((a, b) => (a.problem.rating > b.problem.rating) ? 1 : -1);
		setUserData([...userData, tempList2]);
		setInfo(tempList2);
		setUserProblemList([...userProblemList, ...tempList2]);
		setCurUser("");
	}

	const [windowHeight, setWindowHeight] = useState(window.innerHeight);

	useEffect(() => {
        const handleWindowResize = () => {
            setWindowHeight(window.innerHeight);
        };
        
        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        }
    }, []);

	useEffect(() => {
		if (userData.length >= 1){
			setIntersection(userData[0]);
		}
	}, [userData])
	
	// const { width, height } = useWindowDimensions();
	return (
		<div style={ { backgroundImage : `url(${bgimg})`, height: "80000px"} }>
		<Box bg='transparent' alignItems='center'>
			<VStack pt={10} pb={125} px='auto' spacing={5} direction={['column', 'column', 'row']}>
					<Heading style={{ color : "white"}}>CodeForces Visualizr</Heading>
				<HStack>{ userRatingList.map(item => (
						<Button colorScheme={ratings[item.rank] || "red"} onClick={() => getUserList(item.handle)}>
							{item.handle}
						</Button>
				))}</HStack>
			<HStack>
				<InputGroup w="80%" alignItems="center">
					<InputLeftAddon children="CF Handle" />
					<Input style={{color : "white"}} onChange={typing} value={curUser} placeholder={"tourist"}></Input>
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
					<Input placeholder="800" onChange={handleRatingChange} style={{color : "white"}} ></Input>
					<Button mx={5} colorScheme="white" onClick={getRatedProblems}>Filter</Button>
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
						{info.map((item, idx) => (
							<Tr>
								<Th style={{color : "white"}}>{idx+1}</Th>
								<Th style={{color : "white"}}>{item.problem.index}</Th>
								<Th style={{color : "white"}}>{item.problem.name}</Th>
								<Th style={{color : "white"}}>{item.problem.rating}</Th>
								<Th ><Button onClick={() => {
									window.open(str + item.problem.contestId + "/" + item.problem.index);
								}}>Open</Button></Th>
							</Tr>
						))}
					</Tbody>
				</Table>
			</TableContainer>
			</VStack>
		</Box>
		</div>
  	);
}
export default App;

