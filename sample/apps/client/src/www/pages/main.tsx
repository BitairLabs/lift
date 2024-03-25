import '../assets/style.css'

import React from 'react'
import ReactDOM from 'react-dom'
import { helloWorld } from '#libs/common.js'

function Hello() {
  return <h1>{helloWorld()}</h1>
}

ReactDOM.render(<Hello />, document.getElementById('root'))
