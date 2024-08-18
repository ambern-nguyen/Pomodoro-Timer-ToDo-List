import { useState, useContext } from "react";
import axios from "axios";
import UserContext from "./UserContext";
import { Navigate } from "react-router-dom";

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [redirect, setRedirect] = useState('');

    const user = useContext(UserContext);

    function registerUser(e) {
        e.preventDefault();

        const data = { email, password };
        axios.post('http://localhost:4000/register', data, { withCredentials: true })
            .then(response => {
                user.setEmail(response.data.email);
                setEmail('');
                setPassword('');
                setError('');
                setRedirect(true);
                
            })
            .catch(error => {
                if (error.response && error.response.data && error.response.data.error) {
                    setError(error.response.data.error);
                } else {
                    setError('An error occurred during registration. Please try again.');
                }
                console.error('Error during registration:', error);
            });
    }

    if (redirect) {
        return <Navigate to={'/'} />
    }

    return (
        <form action="" onSubmit={e => registerUser(e)}>
            {error && <div style={{color: 'red'}}>Username already in use.</div>}
            <input
                type="email"
                placeholder="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
            <br />
            <input
                type="password"
                placeholder="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <br />
            <button className={'login'} type="submit">Register</button>
        </form>
    );
}

export default Register;
