/* src/App.js */
import React, { useEffect, useState } from 'react'
import { Amplify, API, graphqlOperation } from 'aws-amplify'
import { createTodo, deleteTodo, updateTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'
import awsExports from "./aws-exports";
import { withAuthenticator, Button, Heading, Text, TextField, View } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
Amplify.configure(awsExports);

const initialState = { name: '', description: '' }

const App = ({ signOut, user }) => {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])

  useEffect(() => {
    fetchTodos()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos))
      const todos = todoData.data.listTodos.items
      setTodos(todos)
    } catch (err) { console.log('error fetching todos') }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return
      const todo = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, {input: todo}))
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  async function removeTodo(id){
    try {
      const input = {id}
      await API.graphql(graphqlOperation(deleteTodo, {input}))
      setTodos(todos.filter((todo)=>todo.id !== id))
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  return (
    <View style={styles.container}>
      {/* <Heading level={1}>Hello {user.username}</Heading> */}
      <div style={styles.title}>
        <Heading level={1}>Hello Joanita 👋!</Heading>
        <Button style={styles.signOut} onClick={signOut}>Sign out</Button>
      </div>
      <h2 style={styles.h2}>Weekly Todos</h2>
      <div style={styles.form}>

        <div>
          <TextField
            onChange={event => setInput('name', event.target.value)}
            style={styles.input}
            value={formState.name}
            placeholder="Name"
          />
          <TextField
            onChange={event => setInput('description', event.target.value)}
            style={styles.input}
            value={formState.description}
            placeholder="Description"
          />
          <button style={styles.button} onClick={addTodo}>Create Todo</button>
        </div>

        <div>
          {
            todos.map((todo, index) => (
              <View key={todo.id ? todo.id : index} style={styles.todo}>
                <div style={styles.todoItems}>
                <div style={styles.todoItems}>
                  <Text style={styles.todoNumber}>{index+1}.</Text>
                  <div >
                    <Text style={styles.todoName}>{todo.name}</Text>
                    <Text style={styles.todoDescription}>{todo.description}</Text>
                  </div>

                </div>

                <div>
                  <Button style={styles.edit}>Edit</Button>
                  <Button style={styles.delete} onClick={()=>removeTodo(todo.id)}>Delete</Button>
                </div>

                </div>


              </View>
            ))
          }
        </div>


      </div>


    </View>
  )
}

const styles = {
  // container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  container: {padding:50},
  title:{display:'flex',justifyContent: 'space-between', alignItems:'center'},
  h2:{display:'flex', justifyContent:'center', marginTop:50, marginBottom:25, fontSize:45},
  form:{display:'grid',  gridTemplateColumns: 'auto auto', columnGap:10 },
  todo: {  marginBottom: 15 },
  todoItems:{display:'flex',justifyContent: 'space-between', marginBottom:15,},
  edit:{width:100, marginRight:15, backgroundColor:'#F79327', color:'white'},
  delete:{marginLeft:15, backgroundColor:'#F24C3D', color:'white', width:100},
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18},
  todoName: { fontSize: 20, fontWeight: 'bold', paddingLeft:10 },
  todoDescription: { marginBottom: 0, paddingLeft:10  },
  button: { backgroundColor: '#22A699', color: 'white', borderRadius:10, fontSize: 18, padding: '12px', borderColor:'none' },
  signOut:{backgroundColor:'#F24C3D', color:'white', borderColor:'#F29727'},
  todoNumber:{paddingTop:5},
  text:{color:'white'}
}

export default withAuthenticator(App)