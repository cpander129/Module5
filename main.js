let assignmentButton = document.getElementById("new");
let newAssignment = document.getElementById("assignment");
let list = document.querySelector("div");
let pageToken = '';

//Load google API
gapi.load("client", loadClient);


gapi.load("client", loadClient);
function loadClient() {
    gapi.client.setApiKey("AIzaSyC9aNiBl0ICQxsJFhR7uZp6X_ij3X_JtKg");
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function () {
                console.log("GAPI client loaded for API");
            },
            function (err) {
                console.error("Error loading GAPI client for API", err);
            });
}
//Create an empty array in local storage to store assignments if it doesn't exist yet
if (localStorage.getItem('assignmentArray') === null) {
    localStorage.setItem('assignmentArray', JSON.stringify([]));
}

console.log(JSON.parse(localStorage.getItem('assignmentArray')));

// Add a new assignment to list when the new button is pressed
assignmentButton.addEventListener('click', addAssignment);

function addAssignment() {
    //Create an assignment object
    let assignment = {
        name: newAssignment.value,
        completed: false
    };
    //Add assignment to memory
    //Retrieve assignment array from memory
    let assignmentArray = JSON.parse(localStorage.getItem('assignmentArray'));
    //Add assignment object to array
    assignmentArray.push(assignment);
    //Restore array to localStorage
    localStorage.setItem('assignmentArray', JSON.stringify(assignmentArray));
    addAssignmentToList(assignment);
}

function addAssignmentToList(task) {

    // Create div to hold checkbox, text and delete button
    let div = document.createElement("div");
    div.setAttribute("class", "todo");
    // Add checkbox to div
    let check = document.createElement("input");
    check.setAttribute("type", "checkbox");
    check.setAttribute("id", "done");
    check.onchange = done;
    check.checked = task.completed;
    div.appendChild(check);

    // Create assignment 'p' node
    let para = document.createElement("p");
    // Add text to assignment node from input box
    para.appendChild(document.createTextNode(task.name))
    // If the assigment has already been done cross out assignment
    if (task.completed) {
        para.style.textDecoration = 'line-through';
    }
    // Add assignment node to div
    div.appendChild(para);
    // Create and add delete button to div
    let dlt = document.createElement("button");
    dlt.setAttribute("id", "delete");
    dlt.setAttribute("type", "button");
    dlt.setAttribute("class", "btn btn-danger")
    dlt.appendChild(document.createTextNode("Delete"));
    // Add delete funtionality to button
    dlt.onclick = deleteItem;
    div.appendChild(dlt);
    // Create and add search button to div
    let youtube = document.createElement('button');
    youtube.setAttribute('id', 'youtube');
    youtube.setAttribute('type', 'button');
    youtube.setAttribute('class', 'btn-info');
    youtube.appendChild(document.createTextNode('Get Help'));
    // Add youtube search function to button
    youtube.addEventListener('click', execute);
    div.appendChild(youtube);
    // Add whole div to list
    list.appendChild(div);
}

// Function to change style of list item and move it to the bottom
function done(e) {
    //Retrieve assignment array from memory
    let assignmentArray = JSON.parse(localStorage.getItem('assignmentArray'));
    let p = e.target.nextElementSibling;
    // If checkbox is checked put a line through the text and play ding
    if (e.target.checked) {
        // Put a line through the text 
        p.style.textDecoration = "line-through";
        // Play ding sound
        document.getElementById("ding").play();
        // Move whole item to bottom of list.
        let div = e.target.parentElement;
        list.appendChild(div);
    } else {
        // remove line from the text
        p.style.textDecoration = "none"
    }
    /*
     * Set value completed of assignment object to the value of the checkbox
     * Extra function needed(?) to find index of object inside the array based on name value of object
     */
    assignmentArray[findAssignmentIndex(assignmentArray, p.textContent)].completed = e.target.checked;
    //Restore array to localStorage
    localStorage.setItem('assignmentArray', JSON.stringify(assignmentArray));
}

// Function to remove list item
function deleteItem(e) {
    // Delete list item
    let div = e.target.parentElement;
    let item = div.children[1].textContent;
    div.remove();
    /*
     * Remove assignment from local storage
     * Extra function needed(?) to find index of object inside the array based on name value of object
     */
    //Retrieve assignment array from memory
    let assignmentArray = JSON.parse(localStorage.getItem('assignmentArray'));
    // Get index of assignment 
    let index = findAssignmentIndex(assignmentArray, item);
    assignmentArray.splice(index, 1);
    //Restore array to localStorage
    localStorage.setItem('assignmentArray', JSON.stringify(assignmentArray));
}

function findAssignmentIndex(assignmentArray, assignment) {
    for (let i = 0; i < assignmentArray.length; i++) {
        if (assignmentArray[i].name == assignment) {
            return i;
        }
    }
    return -1;
}

//Add assignments to page from memory
//Retrieve assignment array from memory
let assignmentArray = JSON.parse(localStorage.getItem('assignmentArray'));
for (let i = 0; i < assignmentArray.length; i++) {
    addAssignmentToList(assignmentArray[i]);
}
//Restore array to localStorage
localStorage.setItem('assignmentArray', JSON.stringify(assignmentArray));

function execute(e) {
    /*
     * Set the search string to the assignment text. 
     * By going up one level to get to the div,
     * and then picking the second child of the div which is the <p> tag
     */
    const searchString = e.target.parentElement.children[1].textContent;
    const maxresult = 50;
    const orderby = 'relevance';
 
    var arr_search = {
        "part": 'snippet',
        "type": 'video',
        "order": orderby,
        "maxResults": maxresult,
        "q": searchString
    };
 
    if (pageToken != '') {
        arr_search.pageToken = pageToken;
    }
    return gapi.client.youtube.search.list(arr_search)
    .then(function(response) {
        // Handle the results here (response.result has the parsed body).
        const listItems = response.result.items;
        if (listItems) {
            let output = '<h4>Videos</h4><ul>';
 
            listItems.forEach(item => {
                const videoId = item.id.videoId;
                const videoTitle = item.snippet.title;
                output += `
                    <li><a data-fancybox href="https://www.youtube.com/watch?v=${videoId}"><img src="http://i3.ytimg.com/vi/${videoId}/hqdefault.jpg" /></a><p>${videoTitle}</p></li>
                `;
            });
            output += '</ul>';
 
            if (response.result.prevPageToken) {
                output += `<br><a class="paginate" href="#" data-id="${response.result.prevPageToken}" onclick="paginate(event, this)">Prev</a>`;
            }
 
            if (response.result.nextPageToken) {
                output += `<a href="#" class="paginate" data-id="${response.result.nextPageToken}" onclick="paginate(event, this)">Next</a>`;
            }
 
            // Output list
            videoList.innerHTML = output;
        }
    },
    function(err) { console.error("Execute error", err); });
}

// Move right or left in youtube search
function paginate(e, obj) {
    e.preventDefault();
    pageToken = obj.getAttribute('data-id');
    execute();
}
