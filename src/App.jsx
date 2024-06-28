import { useState, useEffect } from "react"
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import Navbar from "./components/Navbar"

import { v4 as uuidv4 } from 'uuid';
import { MdHeight } from "react-icons/md";

function App() {
  const [todo, setTodo] = useState("")
  const [todos, setTodos] = useState([])
  const [showFinished, setshowFinished] = useState(true)

  useEffect(() => {
    let todoString = localStorage.getItem("todos");
    if (todoString) {
      let todos = JSON.parse(localStorage.getItem('todos'))
      setTodos(todos)
    }
  }, [])

  
  const saveToLS = (todos) => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }
  
  const toggleFininshed = (e) => {
    setshowFinished(!showFinished)
  }
    
  const handleEdit = (e, id) => {
    let t = todos.filter(i => i.id === id)
    setTodo(t[0].todo)
    let newTodos = todos.filter(item => {
      return item.id !== id
    });
    setTodos(newTodos); // set updated todo
    saveToLS(newTodos); // save updated todo to the local storage
    
  }
  
  const handleDelete = (e, id) => {
    let newTodos = todos.filter(item => {
      return item.id !== id
    });
    let con = confirm("Are you want to delete your TODO")
    if (con == true) {
      setTodos(newTodos); // set updated todo
      saveToLS(newTodos); // save updated todo to the local storage
    }
  }

  const handleAdd = () => {
    let newTodos = [...todos, { id: uuidv4(), todo, isCompleted: false }]
    setTodos(newTodos)
    setTodo("") // clear input field after adding todo
    saveToLS(newTodos); // save updated todo to local storage
  }
  
  const handleChange = (e) => {
    setTodo(e.target.value)
  }
  
  const handleCheckBox = (e) => {
    let id = e.target.name;
    let index = todos.findIndex(item => {
      return item.id === id;
    })
    let newTodos = [...todos];
    newTodos[index].isCompleted = !newTodos[index].isCompleted;
    setTodos(newTodos)
    saveToLS(newTodos);
  }

  return (
    <>
      <Navbar />
      <div className="mx-3 md:container  md:mx-auto my-5 rounded-xl bg-violet-100 p-4 min-h-full md:w-1/2 md:h[80%]" style={{height:"83vh"}}>
        <h1 className="font-bold text-center text-2xl">Manage you todos</h1>
        <div className="addTode my-5 flex flex-col gap-4 ">
          <h2 className="text-lg font-bold">Add a todo</h2>
          <div className="flex gap-2">
            <input onChange={handleChange} value={todo} type="text" className="w-full rounded-lg px-4 py-1 border-purple-700" />
            <button onClick={handleAdd} disabled={todo.length < 5} className="bg-violet-600 disabled:bg-purple-400 hover:bg-violet-950 p-3 py-1 text-white rounded-md text-sm font-bold">Save</button>
          </div>
        </div>
        <input className="mx-2" onChange={toggleFininshed} type="checkbox" checked={showFinished} />
        <label className="mx-2" htmlFor="show">Show finished</label>
        <div className="h-[1px] bg-black opacity-25 w-[90%] mx-auto my-2"></div>
        <h2 className="flex text-xl font-bold">your todos</h2>
        <div className="todos">
          {todos.length === 0 && <div className="m-5">No todos to display</div>}
          {todos.map(item => {
            return (showFinished || !item.isCompleted) && <div key={item.id} className="todo flex w-full my-3 justify-between">
              <div className="flex gap-5">
                <input name={item.id} onChange={handleCheckBox} type="checkbox" checked={item.isCompleted} />
                <div className={item.isCompleted ? "line-through" : ""}>{item.todo}</div>
              </div>
              <div className="buttons flex h-full">
                <button onClick={(e) => { handleEdit(e, item.id) }} className="bg-violet-600 hover:bg-violet-950 p-3 py-1 text-white rounded-md mx-2 text-sm font-bold"><FaEdit /></button>
                <button onClick={(e) => { handleDelete(e, item.id) }} className="bg-violet-600 hover:bg-violet-950 p-3 py-1 text-white rounded-md mx-2 text-sm font-bold"><RiDeleteBin6Line /></button>
              </div>
            </div>
          })}
        </div>
      </div>
      <div className="bg-slate-700 text-white py-2 font-bold text-xl text-center">By Harsh Yadav</div>
    </>
  )
}

export default App
