import React, { useState, useRef } from 'react'
import './App.css'

import firebase from 'firebase/app'
import 'firebase/auth';
import 'firebase/firestore'

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore'

const firebaseConfig = {
  // your config
}

firebase.initializeApp( firebaseConfig )

const auth = firebase.auth()
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth)
  return (
    <div className="App">
      {user ? <Chat /> : <SignIn />}
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="signIn" onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button id="signOut" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function Chat() {
    const dummy = useRef();
  
    const messagesRef = firestore.collection('messages');
    const messagesOrdered = messagesRef.orderBy('createdAt')
    const [messages] = useCollectionData(messagesOrdered, { idField: 'id' })
  
    const [formValue, setFormValue] = useState('')
  
    const sendMessage = async (e) => {
      e.preventDefault();
  
      const { uid } = auth.currentUser;
  
      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid
      })
  
      setFormValue('')
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    }
  
    return (
      <div className='container'>
        <div className='header'>
          <p id='logo'>Nord Chat</p>
          <p id='uid'>uid: {auth.currentUser.uid}</p>
          <SignOut />
        </div>
        <div className='openedRoom'>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
          <span ref={dummy}></span>
        </div>
        <form className='chatBar' onSubmit={sendMessage}>
          <input value={formValue} type='text' placeholder='Type a message' rows='1' onChange={(e) => setFormValue(e.target.value)}></input>
          <button id='send' type='submit' disabled={!formValue}>Send</button>
        </form>
      </div>
    )
  }
  
  function ChatMessage(props) {
  
    const { text, uid } = props.message;
  
    const Class = uid === auth.currentUser.uid ? 'sent' : 'received'
  
    return (
      <>
        <div className={`${Class} message`}>
          <p style={{ margin: 0 }}>{text}</p>
        </div>
      </>
    )
  }

export default App;
