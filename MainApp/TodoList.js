import React, { useState, useContext, useEffect } from "react";
import SettingsContext from "./SettingsContext";
import TodoBackButton from "./TodoBackButton";
import axios from "axios";

function TodoList() {
    const todoListInfo = useContext(SettingsContext);
    const [inputVal, setInputVal] = useState('');
    const [todos, setTodos] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:4000/todos', {withCredentials:true})
            .then(response => {
                setTodos(response.data);
            })
            .catch(error => {
                console.error('Error fetching todos:', error);
            });
    }, []);

    function addTodo(e) {
        e.preventDefault();
        axios.put('http://localhost:4000/todos', {text:inputVal}, {withCredentials:true})
            .then(response => {
                setTodos([...todos, response.data]);
                setInputVal('');
            })
            .catch(error => {
                console.error('Error adding todo:', error);
            });
    }

    function updateTodo(todo) {
        const data = { done: !todo.done };
        axios.post(`http://localhost:4000/todos/${todo._id}`, data, { withCredentials: true })
            .then(() => {
                const newTodos = todos.map(t => {
                    if (t._id === todo._id) {
                        t.done = !t.done;
                    }
                    return t;
                });
                setTodos([...newTodos]);
            })
            .catch(error => {
                console.error('Error updating todo:', error);
            });
    }

    function deleteTodo(todoId) {
        axios.delete(`http://localhost:4000/todos/${todoId}`, { withCredentials: true })
            .then(() => {
                const newTodos = todos.filter(t => t._id !== todoId);
                setTodos(newTodos);
            })
            .catch(error => {
                console.error('Error deleting todo:', error);
            });
    }

    return (
        <div>
            <form onSubmit={e => addTodo(e)}>
                <input 
                    placeholder={'Enter task'} 
                    value={inputVal} 
                    onChange={e => setInputVal(e.target.value)}
                />
            </form>
            <ul>
                {todos.map((todo, index) => (
                    <li key={index}>
                        <input 
                            type={'checkbox'} 
                            checked={todo.done}
                            onClick={() => updateTodo(todo)}
                        />
                        {todo.done ? <del>{todo.text}</del> : todo.text}
                        <button onClick={() => deleteTodo(todo._id)}>X</button>
                    </li>
                ))}
            </ul>
            <div style={{marginTop:'20px'}}>
                <TodoBackButton onClick={() => todoListInfo.setShowTodoList(false)} />
            </div>
        </div>
    );
}

export default TodoList;
