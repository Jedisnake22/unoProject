import { useEffect, useState } from 'react'
import './App.css'
import { Link } from "react-router-dom"
import { Outlet } from "react-router-dom";

function App() {
  const [user, setUser] = useState({})

  async function getUser() {
    const res = await fetch('/profile/', {
      credentials: "same-origin",
    })
    const body = await res.json();
    console.log(body)
    setUser(body.user)
  }

  useEffect(() => {
    getUser()
  }, [])

  return (
    <>
      <nav>
        <Link to="/Play">Play</Link>
        <Link to={`/Profile/${user.id}`}>Profile</Link>
        <Link to="/Friends/">Friends</Link>
      </nav>
      <Outlet />
    </>
  )
}

export default App;
