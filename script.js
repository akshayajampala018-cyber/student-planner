const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "studymate-tasks";
const NOTE_KEY = "studymate-focus";
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let currentFilter = "all";

$("today").textContent = new Date().toLocaleDateString(undefined, {
  weekday: "long", year: "numeric", month: "long", day: "numeric"
});
$("focusNote").value = localStorage.getItem(NOTE_KEY) || "";

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  render();
}
function render() {
  const completed = tasks.filter(task => task.completed).length;
  const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  $("totalTasks").textContent = tasks.length;
  $("completedTasks").textContent = completed;
  $("progressText").textContent = percent + "%";
  $("taskCount").textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;

  const visible = tasks.filter(task =>
    currentFilter === "all" ||
    (currentFilter === "pending" && !task.completed) ||
    (currentFilter === "completed" && task.completed)
  );
  $("taskList").innerHTML = "";
  $("emptyState").style.display = visible.length ? "none" : "block";

  visible.forEach(task => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "done" : ""}`;
    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = task.completed;
    check.setAttribute("aria-label", `Mark ${task.title} completed`);
    check.addEventListener("change", () => {
      tasks = tasks.map(item => item.id === task.id ? {...item, completed: check.checked} : item);
      saveTasks();
    });

    const main = document.createElement("div");
    main.className = "task-main";
    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.title;
    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.textContent = task.due
      ? `${task.subject} · Due ${new Date(task.due + "T00:00:00").toLocaleDateString()}`
      : task.subject;
    main.append(title, meta);

    const del = document.createElement("button");
    del.className = "delete";
    del.type = "button";
    del.textContent = "×";
    del.setAttribute("aria-label", `Delete ${task.title}`);
    del.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
    });
    li.append(check, main, del);
    $("taskList").appendChild(li);
  });
}

$("taskForm").addEventListener("submit", event => {
  event.preventDefault();
  const title = $("taskInput").value.trim();
  if (!title) return;
  tasks.unshift({
    id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
    title,
    subject: $("subjectInput").value,
    due: $("dueInput").value,
    completed: false
  });
  $("taskForm").reset();
  saveTasks();
});
document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
    render();
  });
});
$("saveNote").addEventListener("click", () => {
  localStorage.setItem(NOTE_KEY, $("focusNote").value);
  $("noteStatus").textContent = "Your focus note has been saved.";
});
render();
