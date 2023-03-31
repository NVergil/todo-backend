require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
// const morgan = require("morgan");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
// app.use(morgan("dev"));

let todos;
// console.log(process.env.MONGODB_URI);
// DB
async function main() {
  try {
    const url = process.env.MONGODB_URI;
  
    await mongoose.connect(url);
  
    const noteSchema = new mongoose.Schema({
      description: String,
    });
  
    todos = mongoose.model("todos", noteSchema);
  } catch (err) {
    console.error(err);
  }
}

main().catch(console.error);

app.get("/", (req, res) => {
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
  res.send("My first server solo on Express.js");
});

// Obtener todas las tareas

app.get("/todos", async (req, res) => {
  if (!todos) {
    // manejar el caso en que todos es undefined
    res.status(404).send("No data on database")
  } else {
    const todoList = await todos.find();
    if (!todoList) {
      return;
    }
    res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
    res.json(todoList);
  }
});

// Agregar una tarea
app.post("/todos", async (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ error: "Descripción inválida" });
  } else {
    const newNote = await todos.create({ description });
    res.json(newNote);
    // if (todos.length > 0) {
    //   const lastItem = () => todos.slice(-1)[0];
    //   const todo = { id: lastItem().id + 1, description: description };
    //   todos.push(todo);
    //   return res.json(todo);
    // } else {
    //   const todo = { id: todos.length + 1, description: description };
    //   todos.push(todo);
    //   return res.json(todo);
    // }
  }
});

// Eliminar una tarea
app.delete("/todos/:id", async (req, res) => {
  const _id = req.params.id;
  await todos.deleteOne({ _id });
  res.json({ message: `Tarea con id ${_id} eliminada` });
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

module.exports = app;
