
const taskForm = document.querySelector("#task-form");
const taskTitle = document.querySelector("#task-title");
const taskDescription = document.querySelector("#task-description");
const taskPriority = document.querySelector("#task-priority");
const taskCategory = document.querySelector("#task-category");
const taskDueDate = document.querySelector("#task-due-date");
const taskStatus = document.querySelector("#task-status");
const submitButton = document.querySelector("#submit-button");
const cancelButton = document.querySelector("#cancel-button");

const searchInput = document.querySelector("#search-tasks");
const filterStatus = document.querySelector("#filter-status");
const filterPriority = document.querySelector("#filter-priority");
const sortTasks = document.querySelector("#sort-tasks");
const clearAllButton = document.querySelector("#clear-all");

const taskList = document.querySelector("#task-list");

const totalTasks = document.querySelector("#total-tasks");
const pendingTasks = document.querySelector("#pending-tasks");
const progressTasks = document.querySelector("#progress-tasks");
const completedTasks = document.querySelector("#completed-tasks");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let editingId = null;

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getDueDateStatus(dueDate) {
    const today = new Date();
    const due = new Date(dueDate + "T00:00:00");

    today.setHours(0, 0, 0, 0);

    if (due < today) {
        return "Overdue";
    }

    if (due.getTime() === today.getTime()) {
        return "Due Today";
    }

    return "Upcoming";
}

function renderTasks() {
    taskList.innerHTML = "";

    const searchText = searchInput.value.trim().toLowerCase();
    const selectedStatus = filterStatus.value;
    const selectedPriority = filterPriority.value;
    const selectedSort = sortTasks.value;

    let filteredTasks = [...tasks];

    filteredTasks = filteredTasks.filter((task) => {
        return task.title.toLowerCase().includes(searchText);
    });

    if (selectedStatus !== "All") {
        filteredTasks = filteredTasks.filter((task) => {
            return task.status === selectedStatus;
        });
    }

    if (selectedPriority !== "All") {
        filteredTasks = filteredTasks.filter((task) => {
            return task.priority === selectedPriority;
        });
    }

    if (selectedSort === "newest") {
        filteredTasks.sort((a, b) => b.id - a.id);
    }

    if (selectedSort === "oldest") {
        filteredTasks.sort((a, b) => a.id - b.id);
    }

    if (selectedSort === "priority") {
        const priorityValues = {
            High: 3,
            Medium: 2,
            Low: 1
        };

        filteredTasks.sort((a, b) => {
            return priorityValues[b.priority] - priorityValues[a.priority];
        });
    }

    if (selectedSort === "due-date") {
        filteredTasks.sort((a, b) => {
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    }

    if (selectedSort === "alphabetical") {
        filteredTasks.sort((a, b) => {
            return a.title.localeCompare(b.title);
        });
    }

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <p class="empty-message">No tasks found.</p>
        `;
    }

    filteredTasks.forEach((task) => {
        const taskItem = document.createElement("div");

        taskItem.classList.add("task-item");

        const dueStatus = getDueDateStatus(task.dueDate);

        let dueClass = "upcoming";

        if (dueStatus === "Overdue") {
            dueClass = "overdue";
        }

        if (dueStatus === "Due Today") {
            dueClass = "due-today";
        }

        taskItem.innerHTML = `
            <h3>${task.title}</h3>

            <p>${task.description}</p>

            <p>
                <strong>Priority:</strong>
                ${task.priority}
            </p>

            <p>
                <strong>Category:</strong>
                ${task.category}
            </p>

            <p>
                <strong>Status:</strong>
                <span class="status">${task.status}</span>
            </p>

            <p>
                <strong>Due Date:</strong>
                ${task.dueDate}
            </p>

            <p class="due-date ${dueClass}">
                ${dueStatus}
            </p>

            <button
                class="edit-btn"
                data-id="${task.id}"
            >
                Edit
            </button>

            <button
                class="delete-btn"
                data-id="${task.id}"
            >
                Delete
            </button>
        `;

        taskList.appendChild(taskItem);

        const editButton = taskItem.querySelector(".edit-btn");
        const deleteButton = taskItem.querySelector(".delete-btn");

        editButton.addEventListener("click", () => {
            const id = Number(editButton.dataset.id);

            const taskToEdit = tasks.find((task) => {
                return task.id === id;
            });

            editingId = id;

            taskTitle.value = taskToEdit.title;
            taskDescription.value = taskToEdit.description;
            taskPriority.value = taskToEdit.priority;
            taskCategory.value = taskToEdit.category;
            taskDueDate.value = taskToEdit.dueDate;
            taskStatus.value = taskToEdit.status;

            submitButton.textContent = "Update Task";
            cancelButton.hidden = false;

            taskTitle.focus();
        });

        deleteButton.addEventListener("click", () => {
            const id = Number(deleteButton.dataset.id);

            tasks = tasks.filter((task) => {
                return task.id !== id;
            });

            if (editingId === id) {
                editingId = null;
                taskForm.reset();
                submitButton.textContent = "Add Task";
                cancelButton.hidden = true;
            }

            saveTasks();
            renderTasks();
            updateDashboard();
        });
    });

    updateDashboard();
}

function updateDashboard() {
    totalTasks.textContent = tasks.length;

    const pendingCount = tasks.filter((task) => {
        return task.status === "Pending";
    }).length;

    const progressCount = tasks.filter((task) => {
        return task.status === "In Progress";
    }).length;

    const completedCount = tasks.filter((task) => {
        return task.status === "Completed";
    }).length;

    pendingTasks.textContent = pendingCount;
    progressTasks.textContent = progressCount;
    completedTasks.textContent = completedCount;
}

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const priority = taskPriority.value;
    const category = taskCategory.value;
    const dueDate = taskDueDate.value;
    const status = taskStatus.value;

    if (title === "") {
        alert("Please enter a task title.");
        return;
    }

    if (description === "") {
        alert("Please enter a task description.");
        return;
    }

    if (dueDate === "") {
        alert("Please select a due date.");
        return;
    }

    if (editingId === null) {
        const task = {
            id: Date.now(),
            title: title,
            description: description,
            priority: priority,
            category: category,
            dueDate: dueDate,
            status: status
        };

        tasks.push(task);
    } else {
        const taskToUpdate = tasks.find((task) => {
            return task.id === editingId;
        });

        taskToUpdate.title = title;
        taskToUpdate.description = description;
        taskToUpdate.priority = priority;
        taskToUpdate.category = category;
        taskToUpdate.dueDate = dueDate;
        taskToUpdate.status = status;

        editingId = null;

        submitButton.textContent = "Add Task";
        cancelButton.hidden = true;
    }

    saveTasks();

    taskForm.reset();

    renderTasks();
});

cancelButton.addEventListener("click", () => {
    editingId = null;

    taskForm.reset();

    submitButton.textContent = "Add Task";
    cancelButton.hidden = true;
});

searchInput.addEventListener("input", () => {
    renderTasks();
});

filterStatus.addEventListener("change", () => {
    renderTasks();
});

filterPriority.addEventListener("change", () => {
    renderTasks();
});

sortTasks.addEventListener("change", () => {
    renderTasks();
});

clearAllButton.addEventListener("click", () => {
    if (tasks.length === 0) {
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to delete all tasks?"
    );

    if (!confirmed) {
        return;
    }

    tasks = [];
    editingId = null;

    localStorage.removeItem("tasks");

    taskForm.reset();

    submitButton.textContent = "Add Task";
    cancelButton.hidden = true;

    renderTasks();
});

renderTasks();
