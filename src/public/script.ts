import { Bugs, BugsArray, Update, WSMessage, ScrollPositionObject } from "../types.js"

import { bugInnerHtml, commentSectionInnerHtml, inputDivInnerHtml } from "./innerHTML.js";

const ws = new WebSocket("ws://localhost:8000/bugs");

ws.addEventListener("open", () => {
  // console.log("Connected to the server");
});

ws.addEventListener("message", (event) => {
  const parsed: WSMessage = JSON.parse(event.data)

  const body: Bugs = parsed.bugs;
  const type: string = parsed.type;
  const updateType: Update = parsed.updateType as Update;

  deleteBugs();
  drawBugs(body);
  commentButtonsListener(body);
  listenForUpdate(body, type, updateType);
  listenForNameSaved();
  listenForNameChange();
  getNameFromStorage();
  handleUpdateType(updateType);
  closeBugListener();
});

ws.addEventListener("close", event => {
  // console.log("Disconnected", event.code, event.reason)
});

ws.addEventListener('error', error => {
  console.error('WebSocket error:', error);
});

// for setting/getting the scrollPos of the comment block element
const manipulateScrollPos = manipulateScrollPosCommentBlock({});

function drawBugs(bugs: Bugs) {
  const mainCol = document.getElementById("main-col")
  let bugsSorted: BugsArray = sortBugs(structuredClone(bugs));
  let bugElements = Array.from(document.getElementsByClassName("bug"));
  console.log(bugElements);
  if (bugElements.length === 0) {
    for (let bug of bugsSorted) {
      // create a new bug
      let newBug = document.createElement("div");
      let id = Object.keys(bug)[0];
      newBug.id = id;
      newBug.className = "grid grid-cols-[110px_auto] grid-rows-[76px_40px_100px_1fr] w-lg h-64 rounded-3xl border border-white/20 bg-grey/3 mb-6 bug"
      newBug.innerHTML = bugInnerHtml;

      if (bug[+id].status === "closed") {
        const closeBugDiv = document.getElementById("close-bug-div");
        closeBugDiv?.remove();
      }

      mainCol?.appendChild(newBug);

      let commentButton = newBug.getElementsByClassName("comments")[0];
      commentButton.classList.add(id);

      let closeBugButton = newBug.getElementsByClassName("close-bug")[0];
      closeBugButton?.setAttribute("BugId", id);

      // configure status of the bug
      let statusLabel = newBug.getElementsByClassName("status-label")[0];
      let statusText = newBug.getElementsByClassName("status-text")[0];

      switch (bug[+id].status) {
        case "open":
          statusLabel.classList.add("bg-green-500");
          statusText.textContent = "Open";
          break;
        case "in-progress":
          statusLabel.classList.add("bg-yellow-500");
          statusText.textContent = "In-progress";
          break;
        case "closed":
          statusLabel.classList.add("bg-red-500");
          statusText.textContent = "Closed";
          const closeBugDiv = newBug.getElementsByClassName("close-bug-div")[0];
          closeBugDiv.remove();
          break;
      }

      let title = newBug.getElementsByClassName("title")[0];
      title.textContent = bug[+id].title;

      let author = newBug.getElementsByClassName("author")[0];
      author.textContent = bug[+id].author;

      let bugText = newBug.getElementsByClassName("bug-text")[0];
      bugText.textContent = bug[+id].description;

      let commentsCount = newBug.getElementsByClassName("comments-count")[0];
      commentsCount.textContent = bug[+id].comments.length.toString();
    }
  }
}

function deleteBugs() {
  let bugs = Array.from(document.getElementsByClassName("bug"));
  bugs.forEach(bug => bug.remove());
}

function drawCommentSection(bugId: number) {
  let commentSection = document.getElementById("comment-section");
  if (!commentSection) {
    let thirdCol = document.getElementById("third-col");
    commentSection = document.createElement("div");
    commentSection.id = "comment-section";
    commentSection.className = "w-80 sticky top-2 h-[460px] rounded-3xl border border-white/20 bg-grey/3 backdrop-blur-md flex flex-col";
    commentSection.innerHTML = commentSectionInnerHtml;
    commentSection.setAttribute("bugId", String(bugId))
    thirdCol?.appendChild(commentSection);
    listenForCloseCommentSection();
  }
}

function deleteCommentSection() {
  const commentSection = document.getElementById("comment-section");
  commentSection?.remove();
}

function commentButtonsListener(bugs: Bugs) {
  let commentButtons = Array.from(document.getElementsByClassName("comments"));
  let previouslyClickedButtonId: number | null = null;
  commentButtons.forEach(cb => {
    cb.addEventListener("click", () => {
      let commentSection = document.getElementById("comment-section");
      let id = Number(cb.classList[1]);
      previouslyClickedButtonId = Number(commentSection?.getAttribute("BugId"));
      if (!previouslyClickedButtonId || id !== previouslyClickedButtonId || !commentSection) {

        // save previous comment block's scrollPos
        if (previouslyClickedButtonId) {
          const commentBlockDiv = document.getElementById("comment-block") as HTMLElement;
          const scrollTop = commentBlockDiv.scrollTop;
          manipulateScrollPos.setScrollPos(previouslyClickedButtonId, scrollTop);
        }

        deleteCommentSection();
        drawCommentSection(id);
        commentSection = document.getElementById("comment-section");
        deleteInputDiv();
        deleteComments();
        drawComments(bugs, id);
        if (bugs[id].status !== "closed") {
          createInputDiv(commentSection, id);
        }
        let commentBugTitle = document.getElementById("comment-section-bug-title");
        if (commentBugTitle) {
          commentBugTitle.textContent = bugs[id].title;
        }
      }
    });
  });
}

function listenForUpdate(bugs: Bugs, type: string, updateType: Update) {
  if (type === "update") {
    if (updateType === "POST") {
      let commentSection = document.getElementById("comment-section");
      const inputDiv = document.getElementById("input-div");
      const id = Number(inputDiv?.getAttribute("bugId"));
      deleteInputDiv();
      deleteComments();
      drawComments(bugs, id);
      createInputDiv(commentSection, id);
    }
  }
}

function drawComments(bugs: Bugs, id: number) {
  let commentBlock = document.getElementById("comment-block") as HTMLElement;
  let bug = bugs[id];
  bug.comments.forEach(comment => {
    let commentDiv = document.createElement("div");
    commentDiv.className = "border border-white/10 rounded-xl p-3 comment";

    let author = document.createElement("h4");
    author.className = "text-xs text-white/40 font-semibold tracking-wide mb-1";
    author.textContent = comment.author;

    let message = document.createElement("p");
    message.className = "text-sm text-white/50 font-light";
    message.textContent = comment.message;
    
    commentDiv.appendChild(author);
    commentDiv.appendChild(message);
    commentBlock?.appendChild(commentDiv);
  });

  // to avoid jumps if the scrollTop is max
  const scrollTopToRestore = manipulateScrollPos.getScrollPos(id);
  if (scrollTopToRestore === commentBlock.scrollHeight) {
    commentBlock.scrollTop = commentBlock.scrollHeight;
  } else {
    commentBlock.scrollTop =  scrollTopToRestore;
  }
}

function deleteComments() {
  let comments = Array.from(document.getElementsByClassName("comment"));
  comments?.forEach(comment => {
    comment.remove();
  });
}

function createInputDiv(commentSection: HTMLElement | null, id: number) {
  let inputDiv = document.createElement("div");
  inputDiv.id = "input-div";
  inputDiv.className = "flex p-4 border-t border-white/10 h-18";
  inputDiv.setAttribute("bugId", `${id}`)
  inputDiv.innerHTML = inputDivInnerHtml;
  commentSection?.appendChild(inputDiv);
  // let input = document.getElementById("input");
  // input?.classList.add(String(id));
  uploadCommentListener();
}

function deleteInputDiv() {
  let inputDiv = document.getElementById("input-div");
  inputDiv?.remove();
}

function uploadCommentListener() {
  const uploadCommentButton = document.getElementById("upload-comment");

  uploadCommentButton?.addEventListener("click", async (event) => {

    const inputComment = document.getElementById("input-comment") as HTMLInputElement;
    if (!inputComment?.value) return;

    const inputDiv = document.getElementById("input-div");
    const id = Number(inputDiv?.getAttribute("bugId"));

    const name = localStorage.getItem("username");
    if (name) {
      const response = await fetch(`http://localhost:8000/bugs/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({
          author: name,
          message: inputComment.value
        }),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        const rawError = await response.text();
        try {
          const jsonError = JSON.parse(rawError);
          console.log("JSON Error:", jsonError);
        } catch {
          console.log("Plain Text Error:", rawError);
        }
      }
      inputComment.value = '';
    }
  });
}

function sortBugs(bugs: Bugs) {
  let newBugs: BugsArray = [];

  for (let id of Object.keys(bugs)) {
    if (bugs[+id].status === "open") {
      newBugs.push({ [+id]: bugs[+id] });
      delete bugs[+id];
    }
  }
  for (let id of Object.keys(bugs)) {
    if (bugs[+id].status === "in-progress") {
      newBugs.push({ [+id]: bugs[+id] });
      delete bugs[+id];
    }
  }
  for (let id of Object.keys(bugs)) {
    newBugs.push({ [+id]: bugs[+id] });
    delete bugs[+id];
  }
  return newBugs;
}

function listenForNameSaved() {
  const saveNameButton = document.getElementById("save-name") as HTMLButtonElement;
  saveNameButton?.addEventListener("click", () => {
    const nameInput = document.getElementById("name-input") as HTMLInputElement;
    localStorage.setItem("username", nameInput.value);
    saveNameButton.disabled = true;
    saveNameButton.classList.remove("cursor-pointer", "transition-colors", "duration-300", "ease-in-out", "hover:bg-white/5");
  });
}

function listenForNameChange() {
  const nameInput = document.getElementById("name-input") as HTMLInputElement;
  const saveNameButton = document.getElementById("save-name") as HTMLButtonElement;
  nameInput.addEventListener("change", () => {
    if (nameInput.value) {
      if (saveNameButton.disabled) {
        saveNameButton.disabled = false;
        saveNameButton.classList.add("cursor-pointer", "transition-colors", "duration-300", "ease-in-out", "hover:bg-white/5");
      }
    } else {
      if (!saveNameButton.disabled) {
        saveNameButton.disabled = true;
        saveNameButton.classList.remove("cursor-pointer", "transition-colors", "duration-300", "ease-in-out", "hover:bg-white/5");
      }
    }
  })
}

function getNameFromStorage() {
  const nameInput = document.getElementById("name-input") as HTMLInputElement;
  nameInput.value = localStorage.getItem("username") ?? '';
}

function handleUpdateType(updateType: Update) {
  if (updateType === "POST") {
    const commentBlockDiv = document.getElementById("comment-block");
    const commentSection = document.getElementById("comment-section");
    if (commentBlockDiv) {
      commentBlockDiv.scrollTop = commentBlockDiv.scrollHeight;
      const id = Number(commentSection?.getAttribute("BugId"));
      manipulateScrollPos.setScrollPos(id, commentBlockDiv.scrollTop);
    }
  }
}

function listenForCloseCommentSection() {
  const closeCommentSectionButton = document.getElementById("close-comment-section");
  closeCommentSectionButton?.addEventListener("click", () => {
  const commentSection = document.getElementById("comment-section");
  const commentBlockDiv = document.getElementById("comment-block") as HTMLElement;

  const scrollTop = commentBlockDiv.scrollTop;
  const id = Number(commentSection?.getAttribute("BugId"));
  manipulateScrollPos.setScrollPos(id, scrollTop);

  deleteCommentSection();
  });
}

function manipulateScrollPosCommentBlock(scrollPositions: ScrollPositionObject) {
  return {
    getScrollPos(id: number) {
      // console.log(`Getting id(${id}): `, scrollPositions);
      return scrollPositions[id];
    },

    setScrollPos(id: number, scrollPos: number) {
      scrollPositions[id] = scrollPos;
      // console.log(`Setting id(${id}): `, scrollPositions);
    }
  }
}

function closeBugListener() {
  const closeBugbuttons = Array.from(document.getElementsByClassName("close-bug"));

  closeBugbuttons.forEach(cbb => {
    cbb.addEventListener("click", async () => {
      const id = cbb.getAttribute("BugId");
      if (id) {
        const response = await fetch(`http://localhost:8000/bugs/${+id}/close`, {
          method: "PATCH"
        });
        if (!response.ok) {
          const rawError = await response.text();
          console.log(rawError);
        }

        const commentSection =  document.getElementById("comment-section");
        if (commentSection) {
          if (commentSection.getAttribute("BugId") === id) {
            deleteInputDiv();
          }
        }
      }
    });
  })
}

function incrementBugID(startID: number = 1) {
  return () => startID++;
}

const incrementID = incrementBugID(1);

function uploadBugListener() {
  const uploadBugButton = document.getElementById("upload-bug");

  uploadBugButton?.addEventListener("click", async () => {
    const titleInput = document.getElementById("title-input") as HTMLInputElement | null;
    const descriptionInput = document.getElementById("description-input") as HTMLInputElement | null;

    const title = titleInput?.value;
    const description = descriptionInput?.value;
    const name = localStorage.getItem("username");

    const id = incrementID();

    const body = JSON.stringify({
      author: name,
      title,
      description
    });

    if (title && description && name) {
      const response = await fetch(`http://localhost:8000/bugs/${id}`, {
        method: "PUT",
        body,
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        const rawError = await response.text();
        try {
          const jsonError = JSON.parse(rawError);
          console.log("JSON Error:", jsonError);
        } catch {
          console.log("Plain Text Error:", rawError);
        }
      } else {
        uploadBugButton.removeEventListener("click", () => {});
      }
      titleInput.value = '';
      descriptionInput.value = '';
    }
  })
}

uploadBugListener();
