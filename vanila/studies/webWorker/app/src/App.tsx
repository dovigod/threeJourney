import { useState, useEffect } from 'react';
import './App.css';
import styled from 'styled-components';
import axios, { AxiosResponse } from 'axios';

// app.tsx
const SERVER = 'http://localhost:8000';
function App() {
	const [responseMessage, setResponseMessage] = useState<string | null>();

	const fetchToServer = async () => {
		const response: AxiosResponse<string> | void = await axios
			.post(
				SERVER + '/credential',
				{
					ids: 'dovi-id',
					passwords: 'dovi-password'
				},
				{
					withCredentials: true,
					headers: {
						'dovi-header': '0123456789',
						Authorization: 'mybearer bearer-token-exampleee'
					}
				}
			)
			.catch((e) => {
				console.log(e);
			});

		setResponseMessage(response?.data);
	};
	return (
		<div className="App">
			<Button onClick={fetchToServer}>Fetch!!</Button>
			<h1>message : {responseMessage}</h1>
		</div>
	);
}

export default App;

const Button = styled.button`
	padding: 1rem;
`;
