/* src/App.js */
import React, { useEffect, useState } from 'react'
import { Amplify, API, graphqlOperation, Auth} from 'aws-amplify'
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
  const [isEditing, setIsEditing] = useState(false);
  const [updatedTodo1, setUpdatedTodo1] = useState({id:'', name:'', description:''});
  // Get the authenticated user's information, including the user ID
  const getUserId = async () => {
    const user = await Auth.currentAuthenticatedUser();
    return user.attributes.sub;
  };

  useEffect(() => {
    fetchTodos()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function fetchTodos() {
    try {
      const userId = await getUserId();
      const todoData = await API.graphql(graphqlOperation(listTodos,{
        filter:{
          userId:{
            eq:userId,
          },
        },
      }))
      const todos = todoData.data.listTodos.items
      setTodos(todos)
    } catch (err) { console.log('error fetching todos', err) }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return
      const userId = await getUserId();
      const todo = { ...formState, userId}
      setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, {input: todo}))
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }
  const handleOpenEditDialog = (id, name, description)=>{
    setUpdatedTodo1({id, name, description});
    setIsEditing(true);
  }
  const handleCloseEditDialog = () => {
    setIsEditing(false);
  };


  async function editTodo(id, updatedTodo){
    try {
      const input ={
        id,
        ...updatedTodo,
      }
      const updatedTodos= todos.map((todo)=>
      todo.id === id? {...todo, ...updatedTodo}: todo
    );
    setTodos(updatedTodos)
    await API.graphql(graphqlOperation(updateTodo,{input}))
      
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  const handleSaveEdit = async()=>{
    try {
      await editTodo(updatedTodo1.id,{name:updatedTodo1.name, description:updatedTodo1.description})
      handleCloseEditDialog();
    }catch(error){
      console.error("Error updating todo:", error);
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
      {/* <Heading level={1}>Hello </Heading> */}
      <View style={styles.title}>
        <Heading level={1}>Hello buddy 👋!</Heading>
        <Button style={styles.signOut} onClick={signOut}>Sign out</Button>
      </View>
      <Heading level={2} style={styles.h2}>Weekly Todos</Heading>
      <View style={styles.form}>

        <View>
          <TextField
            onChange={event => setInput('name', event.target.value)}
            style={styles.TextField}
            value={formState.name}
            placeholder="Name"
          />
          <TextField
            onChange={event => setInput('description', event.target.value)}
            style={styles.TextField}
            value={formState.description}
            placeholder="Description"
          />
          <button style={styles.button} onClick={addTodo}>Create Todo</button>
        </View>

        <View >
          {isEditing && (
            <View style={styles.update}>
              <Heading level={2} style={styles.titleEdit}>Edit Todo</Heading>
              <TextField
                style={styles.TextField}
                type="text"
                value={updatedTodo1.name}
                onChange={(e) => setUpdatedTodo1({ ...updatedTodo1, name: e.target.value })}
                placeholder="Enter new name"
              />
              <TextField
                style={styles.TextField}
                type="text"
                value={updatedTodo1.description}
                onChange={(e) => setUpdatedTodo1({ ...updatedTodo1, description: e.target.value })}
                placeholder="Enter new description"
              />
              <Button onClick={() => handleSaveEdit()} style={styles.edit}>Save</Button>
              <Button onClick={handleCloseEditDialog} style={styles.delete}>Cancel</Button>
            </View>
          )}

          {
            todos.map((todo, index) => (
              <View key={todo.id ? todo.id : index} style={styles.todo}>
                <View style={styles.todoItems}>
                <View style={styles.todoItems}>
                  <Text style={styles.todoNumber}>{index+1}.</Text>
                  <View >
                    <Text style={styles.todoName}>{todo.name}</Text>
                    <Text style={styles.todoDescription}>{todo.description}</Text>
                  </View>

                </View>

                <View>
                  <Button style={styles.edit} onClick={() => handleOpenEditDialog(todo.id, todo.name, todo.description)}>Edit</Button>
                  <Button style={styles.delete} onClick={()=>removeTodo(todo.id)}>Delete</Button>
                </View>

                </View>


              </View>
            ))
          }
        </View>


      </View>


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
  TextField: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18},
  todoName: { fontSize: 20, fontWeight: 'bold', paddingLeft:10 },
  todoDescription: { marginBottom: 0, paddingLeft:10  },
  button: { backgroundColor: '#22A699', color: 'white', borderRadius:10, fontSize: 18, padding: '12px', borderColor:'none' },
  signOut:{backgroundColor:'#F24C3D', color:'white', borderColor:'#F29727'},
  todoNumber:{paddingTop:5},
  text:{color:'white'},
  titleEdit:{marginTop:0},
  update:{marginBottom:20}
}

export default withAuthenticator(App)