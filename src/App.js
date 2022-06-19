import React, { useEffect, useState } from "react";
import { Button, Heading, Input, Text, useRadio } from '@chakra-ui/react';

import { Grid, GridItem } from '@chakra-ui/react'


function App() {
	//constants
	const str = "https://codeforces.com/problemset/problem/";

	//useStates
	const [curUser, setCurUser] = useState("");
	const [userNameList, setUserNameList] = useState([]);
	const [userData, setUserData] = useState([]);
	const [intersection, setIntersection] = useState([]);
	const [union, setUnion] = useState([]);
	const [info, setInfo] = useState([]);

	//Handlers
	function typing(event) {
		setCurUser(event.target.value);
	}


	const getIntersection = (e) => {
		console.log(userData.length);
		if (userData.length >= 2) {
			let temp = intersection;
			for (var i = 1; i < userData.length; i++) {
				temp = (temp.filter(item1 => userData[i].some(item2 => item1.problem.name === item2.problem.name)));
			}
			setInfo(temp);
		}
	}

	// const getUnion = (e) => {
		// if (userData.length >= 2) {
			// let temp = [];
			// temp.push(userData[0]);
			// for (var i = 1; i < userData.length; i++) {
				// temp = (userData[i].filter(item1 => temp.some(item2 => item1.problem.name !== item2.problem.name)));
			// }
			// setInfo(temp);
		// } else {
			// alert("Add more users");
		// }
	// }

	const getUsers = async () => {
		console.log(curUser);
		const response = await fetch("https://codeforces.com/api/user.status?handle=" + curUser);
		const data = await response.json();
		
		console.log((data.result));
		setInfo(data.result);
		setUserNameList([...userNameList, curUser]);
		setUserData([...userData, data.result]);
		setCurUser("");
	}
	useEffect(() => {
		if (userData.length >= 1){
			setIntersection(userData[0]);
			setUnion(userData[0]);
		}
	}, [userData])
	
	
	return (
		<div>
			<Heading>CodeForces Visualizr</Heading>
			<Grid templateColumns='repeat(10, 1fr)' gap={2} >{ userNameList.map(item => (
				<GridItem w='100%'><Text>{item}</Text></GridItem>
			))}</Grid>
			<Input onChange={typing}placeholder="enter username" value={curUser}></Input>
			<Button onClick={getUsers}>Add</Button>
			<Button onClick={getIntersection}>Intersection</Button>
			<Button onClick={getUnion}>Union</Button>
			<Text>{info.length}</Text>
			{
				info.map((item, ind) => (
					item.verdict === "OK" && <p key={ind}><a href={str + item.problem.contestId + "/" + item.problem.index}>{ item.problem.name + " " + item.problem.rating}</a></p>
				))
			}
		</div>
  	);
}
export default App;


//day2
//display rating wise problems
//union


//day3
//tag wala

