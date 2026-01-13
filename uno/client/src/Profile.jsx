import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"

export function Profile() {
    const [stats, setStats] = useState({stats: {gamesWon: "", gamesPlayed: ""}})
    const [User, setUser] = useState({
      id: false,
      email: false,
      first_name: false,
      last_name: false
    })
    const params = useParams();

    async function getUser() {
      const res = await fetch('/profile/get', {
        credentials: "same-origin",
        headers: {
          "id": params.id
        }
      })
      const body = await res.json();
      return body;
    }

    async function getStats() {
      const res = await fetch('/stats/get', {
        credentials: "same-origin",
        headers: {
          "id": params.id
        }
      })
      const body = await res.json();
      return body;
    }

    async function logout() {
        const res = await fetch("/registration/logout/", {
          credentials: "same-origin", // include cookies!
        });
    
        if (res.ok) {
          // navigate away from the single page app!
          window.location = "/registration/sign_in/";
        } else {
          // handle logout failed!
        }
      }

    async function loadStats() {
      let stat = await getStats()
      let user = await getUser()
      setUser(user.user)
      setStats(stat)
    }

    useEffect(() => {
      loadStats()
    }, [])

    return (
        <div id="profile">
          <h1>
              Profile
          </h1>
          <div className="stat">
            ID: { User.id }
          </div>
          <div className="stat">
              { User.first_name } {User.last_name}
          </div>
          <div className="stat">
              { User.email }
          </div>
          <div className="stat">
            Games Won: { stats.stats.gamesWon }
          </div>
          <div className="stat">
            Games Played: { stats.stats.gamesPlayed }
          </div>
          <button id="logOutButton" onClick={logout}>Logout</button>
        </div>
    )
}
