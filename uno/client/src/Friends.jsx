import { useState, useEffect, useRef } from "react"
import * as cookie from "cookie"
import Request from "./Request"

export function Friends() {
  const [reqID, setReqID] = useState("")
  const [friendList, setFriendList] = useState([])
  const [pendingList, setPendingList] = useState([])
  const [requestList, setRequestList] = useState([])
  const [firstNames, setFirstNames] = useState({})
  const keyVal = useRef(0)
  const [newName, setNewName] = useState(false)
  const [personalId, setPersonalId] = useState("")
  
  async function getUser() {
    const res = await fetch('/profile/', {
      credentials: "same-origin",
    })
    const body = await res.json();
    return body.user.id
  }

  async function sendFriendRequest(e) {
    e.preventDefault();
    const res = await fetch('/friends/', {
      method: "POST",
      credentials: "same-origin",
      body: JSON.stringify({
        reqID
      }),
      headers: {
        "X-CSRFToken": cookie.parse(document.cookie).csrftoken
      }
    })
    let status = await res.json()
    console.log(status)
    setNewName(true)
    return status
  }

  async function acceptRequest(reqID) {
    const res = await fetch("/friends/update/", {
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify({ reqID }),
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": cookie.parse(document.cookie).csrftoken
        }
    });
    let wait = await res
    setNewName(true)
  }

  async function deleteRequest(reqID) {
    console.log(reqID)
    const res = await fetch("/friends/delete/", {
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify({ reqID }),
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": cookie.parse(document.cookie).csrftoken
        }
    });
    let wait = await res
    setNewName(true)
  }

  async function getFriends() {
    const sentRes = await fetch('/friends/', {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "myRequest": "true"
      }
    })
    const recRes = await fetch('/friends/', {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "myRequest": "false"
      }
    })
    const sentBod = await sentRes.json()
    const recBod = await recRes.json()
    console.log(recBod)
    return [sentBod.friendSent, recBod.friendReq]
  }

  async function getFirstName(id) {
      const res = await fetch('/profile/get', {
        credentials: "same-origin",
        headers: {
          "id": id
        }
      })
      const body = await res.json();
      return body.user.first_name
    }

  async function loadList() {
    let lists = await getFriends()
    let id = await getUser()
    let names = {}
    let pen = []
    let fri = []
    let req = []
    for (let i = 0; i < lists[0].length; i++) {
      if (lists[0][i].status == "Pending") {
        pen.push(lists[0][i])
      }
      else if ((lists[0][i].status == "Accepted")) {
        fri.push(lists[0][i])
      }
      let firstName = await getFirstName(lists[0][i].toUser)
      names[lists[0][i].toUser] = firstName
    }
    for (let i = 0; i < lists[1].length; i++) {
      if (lists[1][i].status == "Pending") {
        req.push(lists[1][i])
      }
      else if ((lists[1][i].status == "Accepted")) {
        fri.push(lists[1][i])
      }
      let firstName = await getFirstName(lists[1][i].fromUser)
      names[lists[1][i].fromUser] = firstName
    }
    setPersonalId(id)
    setFirstNames(names)
    setFriendList(fri)
    setRequestList(req)
    setPendingList(pen)
  }

  useEffect(() => {
    loadList()
    setNewName(false)
  }, [newName])

  return (
    <>
        <h1>
            Friends
        </h1>
        <h2> Add Friend by ID: </h2>
        <form id="addFriend"onSubmit={ sendFriendRequest }>
          <input type="text" id="friendIdInput" value={ reqID } onChange={e => setReqID(e.target.value)}/>
          <button id="addFriendBut">+</button>
        </form>
        <h2> Friends
          <div className="reqList">
            { friendList.map( (req) => {
              keyVal.current += 1
              let keyID = "fren" + keyVal.current
              if (personalId == req.toUser) {
                return <Request key={keyID} firstName={firstNames[req.fromUser]} del={() => deleteRequest(req.id)}/>

              }
              return <Request key={keyID} firstName={firstNames[req.toUser]} del={() => deleteRequest(req.id)}/>
            })}
          </div>
        </h2>
        <h2> Pending 
          <div className="reqList">
            { pendingList.map( (req) => {
              keyVal.current += 1
              let keyID = "pend" + keyVal.current
              return <Request key={keyID} firstName={firstNames[req.toUser]} del={() => deleteRequest(req.id)} />
            })}
          </div>
        </h2>
        <h2> Requests
          <div className="reqList">
            { requestList.map( (req) => {
              keyVal.current += 1
              let keyID = "req" + keyVal.current
              return <Request key={keyID} firstName={firstNames[req.fromUser]} del={() => deleteRequest(req.id)} acc={() => acceptRequest(req.id)} rec={true}/>
            })}
          </div>
        </h2>
    </>
  )
}