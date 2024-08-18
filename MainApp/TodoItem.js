import React from 'react';

/*
    Generates item in task list
*/
function TodoItem({ task, deleteTask, toggleCompleted }) {

    function handleChange() {
        toggleCompleted(task.id);
    }
    
    return (
        <div className="todo-item">
        <input 
            type="checkbox"
            checked={task.done}
            onChange={handleChange}
        />
        <p>{task.done ? <del>{task.text}</del> : task.text}</p>
        <button onClick={() => deleteTask(task.id)}>X</button>
        </div>
    );
}
export default TodoItem;