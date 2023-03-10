const API = (() => {
  const URL = "http://localhost:3000/todos";

  const getTodos = () => {
    return fetch(URL).then((res) => res.json());
  };

  const createTodo = (newTodo) => {
    return fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo),
    }).then((res) => res.json());
  };

  const deleteTodo = (id) => {
    return fetch(URL + `/${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  };

  const updateTodo = (id, updateTodo) => {
    return fetch(URL + `/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updateTodo),
      headers: { "Content-Type": "application/json" },
    }).then((res) => res.json());
  };

  return {
    getTodos,
    createTodo,
    deleteTodo,
    updateTodo,
  };
})();

const Model = (() => {
  class State {
    #todos;
    #onChange;
    currentTodoId;
    constructor() {
      this.#todos = [];
    }
    get todos() {
      return this.#todos;
    }

    set todos(newTodos) {
      this.#todos = newTodos;
      this.#onChange?.();
    }
    subscribe(callback) {
      this.#onChange = callback;
    }
  }
  const { getTodos, createTodo, deleteTodo, updateTodo } = API;
  return {
    State,
    getTodos,
    createTodo,
    deleteTodo,
    updateTodo,
  };
})();

const View = (() => {
  const todolistEl = document.querySelector(".todo-list");
  const completelistEl = document.querySelector(".complete-todo-list");
  const submitBtnEl = document.querySelector(".submit-btn");
  const inputEl = document.querySelector(".todo-input");
  const editBox = document.querySelector(".edit-box");
  const editInput = document.querySelector(".edit-box input");
  const confirmEditBtn = document.querySelector(".confirm-btn");

  const renderTodos = (todos) => {
    let template = "";
    todos.forEach((todo) => {
      if (todo.isComplete) {
        let LiTemplate = `<li>
        <button class="btn-uncomplete" id="${todo.id}">pending</button><span>${todo.content}</span>
        <button class="delete-btn" id="${todo.id}">delete</button>
        <button class="btn-edit" id="${todo.id}">edit</button>
        
        </li>`;
        template += LiTemplate;
        completelistEl.innerHTML = template;
      }
      let LiTemplate = `<li><span>${todo.content}</span>
      <button class="delete-btn" id="${todo.id}">delete</button>
      <button class="btn-edit" id="${todo.id}">edit</button>
      <button class="btn-complete" id="${todo.id}">move</button>
      </li>`;
      template += LiTemplate;
    });
    if (todos.length === 0) {
      template = "<h4>no task to display!</h4>";
    }
    todolistEl.innerHTML = template;
  };

  const clearInput = () => {
    inputEl.value = "";
  };

  return {
    renderTodos,
    submitBtnEl,
    inputEl,
    clearInput,
    todolistEl,
    completelistEl,
    editBox,
    editInput,
    confirmEditBtn,
  };
})();

const Controller = ((view, model) => {
  const state = new model.State();
  let currentTodoId;

  const init = () => {
    model.getTodos().then((todos) => {
      todos.reverse();
      state.todos = todos;
    });
  };

  const handleSubmit = () => {
    view.submitBtnEl.addEventListener("click", (event) => {
      const inputValue = view.inputEl.value;
      console.log(inputValue);
      model.createTodo({ content: inputValue }).then((data) => {
        state.todos = [data, ...state.todos];
        view.clearInput();
      });
    });
  };

  const handleDelete = () => {
    view.todolistEl.addEventListener("click", (event) => {
      if (event.target.className === "delete-btn") {
        const id = event.target.id;
        model.deleteTodo(+id).then((date) => {
          state.todos = state.todos.filter((todo) => todo.id !== +id);
        });
      }
    });
  };

  const handleEdit = () => {
    view.todolistEl.addEventListener("click", (event) => {
      currentTodoId = event.target.id;
      if (event.target.className === "btn-edit") {
        view.editBox.style.display = "flex";
      }
    });
  };

  const handleSave = () => {
    view.todolistEl.addEventListener("click", (event) => {
      if (event.target.className === "delete-btn") {
        const id = event.target.id;
        model.deleteTodo(+id).then((date) => {
          state.todos = state.todos.filter((todo) => todo.id !== +id);
        });
      }
    });
    view.confirmEditBtn.addEventListener("click", (event) => {
      model
        .updateTodo(currentTodoId, { content: View.editInput.value })
        .then((data) => {
          state.todos = [data, ...state.todos];
          view.clearInput();
        });
    });
  };

  const handleComplete = () => {
    view.todolistEl.addEventListener("click", (event) => {
      if (event.target.className === "btn-complete") {
        const id = event.target.id;
        model.updateTodo(id, { isComplete: true }).then((data) => {
          state.todos = [data, ...state.todos];
        });
      }
    });
  };
  const handlePending = () => {
    view.completelistEl.addEventListener("click", (event) => {
      if (event.target.className === "btn-uncomplete") {
        const id = event.target.id;
        model.updateTodo(id, { isComplete: false }).then((data) => {
          state.todos = [data, ...state.todos];
        });
      }
    });
  };

  const bootstrap = () => {
    init();
    handleSubmit();
    handleDelete();
    handleEdit();
    handleSave();
    handleComplete();
    handlePending();
    state.subscribe(() => {
      view.renderTodos(state.todos);
    });
  };

  return {
    bootstrap,
  };
})(View, Model);

Controller.bootstrap();
