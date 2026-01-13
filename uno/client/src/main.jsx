import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'vite/modulepreload-polyfill'
import  { 
  createHashRouter,
  RouterProvider
} from 'react-router-dom'
import {Profile} from "./Profile"
import {Friends} from "./Friends"
import {Play} from "./Play"

const router =  createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/profile/:id",
        element: <Profile/>
      },
      {
        path: "/friends",
        element: <Friends/>
      },
      {
        path: "/play",
        element: <Play />
      }
    ]
  }
])


ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
