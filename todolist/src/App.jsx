import { useState, useEffect } from "react"
import { RiDeleteBin6Line, RiCheckboxCircleFill, RiCheckboxBlankCircleLine } from "react-icons/ri";
import { FaEdit, FaSave, FaSearch, FaFilter, FaSort } from "react-icons/fa";
import { MdPending, MdDone, MdClear } from "react-icons/md";
import { BsCheckCircle, BsCircle } from "react-icons/bs";
import Navbar from "./components/Navbar"
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [todo, setTodo] = useState("")
  const [todos, setTodos] = useState([])
  const [showFinished, setShowFinished] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all") // all, completed, pending
  const [sortBy, setSortBy] = useState("default") // default, date, completed
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState("")
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 })
  const [category, setCategory] = useState("personal") // personal, work, shopping, other
  const [priority, setPriority] = useState("medium") // high, medium, low
  const [dueDate, setDueDate] = useState("")
  const [categories] = useState(["personal", "work", "shopping", "other"])
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  // Load todos from localStorage
  useEffect(() => {
    let todoString = localStorage.getItem("todos");
    if (todoString) {
      let todos = JSON.parse(todoString)
      setTodos(todos)
    }
  }, [])

  // Update stats whenever todos change
  useEffect(() => {
    const completed = todos.filter(todo => todo.isCompleted).length
    setStats({
      total: todos.length,
      completed: completed,
      pending: todos.length - completed
    })
  }, [todos])

  const saveToLS = (todos) => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }

  const toggleFinished = () => {
    setShowFinished(!showFinished)
  }

  const handleEdit = (id) => {
    const todoToEdit = todos.find(item => item.id === id)
    setEditingId(id)
    setEditText(todoToEdit.todo)
    setCategory(todoToEdit.category || "personal")
    setPriority(todoToEdit.priority || "medium")
    setDueDate(todoToEdit.dueDate || "")
  }

  const handleUpdate = (id) => {
    if (editText.length < 5) return
    
    let updatedTodos = todos.map(item => {
      if (item.id === id) {
        return {
          ...item,
          todo: editText,
          category: category,
          priority: priority,
          dueDate: dueDate,
          updatedAt: new Date().toISOString()
        }
      }
      return item
    })
    
    setTodos(updatedTodos)
    saveToLS(updatedTodos)
    setEditingId(null)
    setEditText("")
    setCategory("personal")
    setPriority("medium")
    setDueDate("")
  }

  const handleDelete = (id) => {
    setDeleteId(id)
    setShowConfirmDelete(true)
  }

  const confirmDelete = () => {
    let newTodos = todos.filter(item => item.id !== deleteId)
    setTodos(newTodos)
    saveToLS(newTodos)
    setShowConfirmDelete(false)
    setDeleteId(null)
  }

  const cancelDelete = () => {
    setShowConfirmDelete(false)
    setDeleteId(null)
  }

  const handleAdd = () => {
    if (todo.length < 5) return
    
    const newTodo = {
      id: uuidv4(),
      todo,
      isCompleted: false,
      category,
      priority,
      dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    let newTodos = [...todos, newTodo]
    setTodos(newTodos)
    setTodo("")
    setCategory("personal")
    setPriority("medium")
    setDueDate("")
    saveToLS(newTodos)
  }

  const handleChange = (e) => {
    setTodo(e.target.value)
  }

  const handleCheckBox = (id) => {
    let newTodos = todos.map(item => {
      if (item.id === id) {
        return { ...item, isCompleted: !item.isCompleted }
      }
      return item
    })
    setTodos(newTodos)
    saveToLS(newTodos)
  }

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete all todos?")) {
      setTodos([])
      saveToLS([])
    }
  }

  // Filter and search todos
  const getFilteredTodos = () => {
    let filtered = [...todos]

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(todo => 
        todo.todo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply filter
    if (filter === "completed") {
      filtered = filtered.filter(todo => todo.isCompleted)
    } else if (filter === "pending") {
      filtered = filtered.filter(todo => !todo.isCompleted)
    }

    // Apply sorting
    if (sortBy === "completed") {
      filtered.sort((a, b) => (a.isCompleted === b.isCompleted) ? 0 : a.isCompleted ? 1 : -1)
    } else if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    return filtered
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "high": return "text-red-600 border-red-200 bg-red-50"
      case "medium": return "text-yellow-600 border-yellow-200 bg-yellow-50"
      case "low": return "text-green-600 border-green-200 bg-green-50"
      default: return "text-gray-600 border-gray-200 bg-gray-50"
    }
  }

  const getCategoryColor = (category) => {
    switch(category) {
      case "work": return "bg-blue-100 text-blue-800"
      case "personal": return "bg-purple-100 text-purple-800"
      case "shopping": return "bg-green-100 text-green-800"
      case "other": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredTodos = getFilteredTodos()

  return (
    <>
      <Navbar />
      
      {/* Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this todo?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-3 md:container md:mx-auto my-5 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 p-6 min-h-full md:w-1/2 shadow-lg">
        <h1 className="font-bold text-center text-3xl text-purple-800 mb-6">✨ Manage Your Todos ✨</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
        </div>

        {/* Add Todo Section */}
        <div className="addTodo my-5 bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-bold text-purple-800 mb-3">Add New Todo</h2>
          <div className="flex flex-col gap-3">
            <input
              onChange={handleChange}
              value={todo}
              type="text"
              placeholder="Enter your todo (min 5 characters)"
              className="w-full rounded-lg px-4 py-2 border-2 border-purple-200 focus:border-purple-600 focus:outline-none"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-lg px-3 py-2 border-2 border-purple-200 focus:border-purple-600 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
              
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="rounded-lg px-3 py-2 border-2 border-purple-200 focus:border-purple-600 focus:outline-none"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-lg px-3 py-2 border-2 border-purple-200 focus:border-purple-600 focus:outline-none"
              />
            </div>
            
            <button
              onClick={handleAdd}
              disabled={todo.length < 5}
              className="bg-gradient-to-r from-purple-600 to-violet-600 disabled:from-purple-300 disabled:to-violet-300 hover:from-purple-700 hover:to-violet-700 p-3 text-white rounded-md font-bold transition-all duration-300 transform hover:scale-105"
            >
              <FaSave className="inline mr-2" /> Add Todo
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search todos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
              />
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
            >
              <option value="default">Default</option>
              <option value="date">By Date</option>
              <option value="completed">By Status</option>
            </select>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center">
              <input
                className="mx-2 w-4 h-4 accent-purple-600"
                onChange={toggleFinished}
                type="checkbox"
                checked={showFinished}
              />
              <label className="text-gray-700">Show finished todos</label>
            </div>
            
            {todos.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-red-600 hover:text-red-800 text-sm font-semibold"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent my-4"></div>
        
        <h2 className="text-xl font-bold text-purple-800 mb-3">Your Todos ({filteredTodos.length})</h2>
        
        {/* Todos List */}
        <div className="todos space-y-3 max-h-96 overflow-y-auto pr-2">
          {filteredTodos.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
              {searchTerm ? "No matching todos found" : "No todos to display"}
            </div>
          )}
          
          {filteredTodos.map(item => {
            if (!showFinished && item.isCompleted) return null
            
            return (
              <div
                key={item.id}
                className={`todo bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 ${
                  item.isCompleted ? 'border-green-500' : 'border-purple-500'
                }`}
              >
                {editingId === item.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
                      autoFocus
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-3 py-2 border-2 border-purple-200 rounded-lg"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="px-3 py-2 border-2 border-purple-200 rounded-lg"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="px-3 py-2 border-2 border-purple-200 rounded-lg"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(item.id)}
                        disabled={editText.length < 5}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold disabled:bg-green-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3 flex-1">
                        <button
                          onClick={() => handleCheckBox(item.id)}
                          className="focus:outline-none"
                        >
                          {item.isCompleted ? (
                            <BsCheckCircle className="text-2xl text-green-500 hover:text-green-600" />
                          ) : (
                            <BsCircle className="text-2xl text-gray-400 hover:text-purple-500" />
                          )}
                        </button>
                        
                        <div className="flex-1">
                          <div className={`font-semibold ${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {item.todo}
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.category || 'other')}`}>
                              {item.category || 'other'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(item.priority || 'medium')}`}>
                              {item.priority || 'medium'} priority
                            </span>
                            {item.dueDate && (
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                Due: {new Date(item.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-all"
                          title="Edit"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-all"
                          title="Delete"
                        >
                          <RiDeleteBin6Line size={18} />
                        </button>
                      </div>
                    </div>
                    
                    {item.createdAt && (
                      <div className="text-xs text-gray-400 mt-2 ml-9">
                        Created: {new Date(item.createdAt).toLocaleString()}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      <footer className="bg-gradient-to-r from-purple-800 to-violet-800 text-white py-4 font-bold text-xl text-center mt-8 shadow-lg">
        Made with ❤️ by Harsh Yadav
      </footer>
    </>
  )
}

export default App