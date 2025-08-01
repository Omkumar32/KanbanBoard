let draggedCard = null;
let rightClickedCard = null;
document.addEventListener("DOMContentLoaded", loadTasksFromLocalStorage);
function addTask(columnId) {
    const input = document.getElementById(`${columnId}-input`);
    const taskText = input.value.trim();
    if (taskText === "") {
        return;
    }

    const taskDate = new Date().toLocaleString();
    
    const taskELement = createTasksElement(taskText , taskDate);

    document.getElementById(`${columnId}-tasks`).appendChild(taskELement);
     updateTasksCount(columnId);
     saveTasks(columnId,taskText, taskDate);
    input.value = "";
    
}
function createTasksElement(taskText , taskDate) {
    const element = document.createElement("div");
    element.innerHTML = `<span>${taskText}</span><br><span class="task-date">${taskDate}</span>`;
    element.classList.add("card");
   // Element.setAttribute("draggable", "true");
   element.draggable = true;
   element.addEventListener("dragstart", dragStart);
   element.addEventListener("dragend", dragEnd);
   element.addEventListener("contextmenu", function(event) {
        event.preventDefault();
        rightClickedCard = this;
        showContextMenu(event.pageX, event.pageY);   
   });
    return element;
}
function dragStart() {
    this.classList.add("dragging");
    draggedCard = this;
}
function dragEnd() {
    this.classList.remove("dragging");
    //draggedCard = null;
    ["todo", "doing", "done"].forEach(columnId => {
        updateTasksCount(columnId);
        updataLocalStorage();
    });
}
const columns = document.querySelectorAll(".tasks");
columns.forEach((column ) => {
    column.addEventListener("dragover", dragOver);
    //column.addEventListener("drop", drop);
});
    
function dragOver(event) {
    event.preventDefault();
    const draggingCard = document.querySelector(".dragging");
   // this.appendChild(draggedCard);
   const afterElement = getDrageAfterElement(this, event.pageY);

   if(afterElement === null ){
    this.appendChild(draggedCard);

   }else {
    this.insertBefore(draggedCard, afterElement);
   }
}

function getDrageAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".card:not(.dragging)")];

    const result = draggableElements.reduce((closestElementUnderMouse, currentTask) => {
        const box = currentTask.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if(offset < 0 && offset > closestElementUnderMouse.offset) {
            return { offset: offset , element:currentTask};
        }else {
            return closestElementUnderMouse;
        }
    },
    {offset: Number.NEGATIVE_INFINITY }
);
return result.element;
}
   

const contextmenu = document.querySelector(".context-menu");
function showContextMenu(x, y) {                                            
    contextmenu.style.left = `${x}px`;
    contextmenu.style.top = `${y}px`;                                               
    contextmenu.style.display = "block";
}
document.addEventListener("click", () => {
    contextmenu.style.display = "none";
});

function editTask() {
   if(rightClickedCard !== null) {
        const newTaskText = prompt("Edit task -", rightClickedCard.textContent);
        if (newTaskText !== "") {
            rightClickedCard.textContent = newTaskText;
            updataLocalStorage();
        }
}
}
function deleteTask() {
    if(rightClickedCard !== null) {   
        const columnId = rightClickedCard.parentElement.id.replace("-tasks", "");                                             
        rightClickedCard.remove();
        updataLocalStorage();
        updateTasksCount(columnId);
    }
}
function updateTasksCount(columnId) {
    const count = document.querySelectorAll(`#${columnId}-tasks .card`).length;
    document.getElementById(`${columnId}-count`).textContent = count;
}

function saveTasks(columnId,taskText, taskDate) {
    const tasks = JSON.parse(localStorage.getItem("columnId")) || [];
    tasks.push({ text: taskText, date: taskDate });
    localStorage.setItem(columnId, JSON.stringify(tasks));
}

function loadTasksFromLocalStorage () {
    ["todo", "doing", "done"].forEach(columnId => {
        const tasks = JSON.parse(localStorage.getItem(columnId)) || [];
        tasks.forEach(({text, date}) => {
            const taskElement = createTasksElement(text, date);
            document.getElementById(`${columnId}-tasks`).appendChild(taskElement);
        });
        updateTasksCount(columnId);
})
}
function updataLocalStorage() {
    ["todo", "doing", "done"].forEach((columnId) => {
        const tasks = [];
        document.querySelectorAll(`#${columnId}-tasks .card`).forEach((card) => {
            const taskText = card.querySelector("span").textContent;
            const taskDate = card.querySelector("span").textContent;
            tasks.push({ text: taskText, date: taskDate });
        });
        localStorage.setItem(columnId, JSON.stringify(tasks));
    });
}

    


    
