// Import Firebase and Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, query, where, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtsgwSa0T_b9GMESx1Tjhb1n4hohkJyOU",
  authDomain: "tasktrace-v2.firebaseapp.com",
  projectId: "tasktrace-v2",
  storageBucket: "tasktrace-v2.appspot.com",
  messagingSenderId: "863318084099",
  appId: "1:863318084099:web:6a9abab8d8893caaf9dc36",
  measurementId: "G-59DHK1FJ88"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let currentUser = null;

// Check if user is authenticated on page load
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    // Retrieve user document from Firestore
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (userDoc.exists() && userDoc.data().role === 'admin') {
      enableBatchCreation();
    } else {
      // Redirect to login/signup page if user is not admin
      window.location.href = 'login_signup.html';
    }
  } else {
    // Redirect to login/signup page if no user is authenticated
    window.location.href = 'login_signup.html';
  }
});

// Enable batch creation button for admin users
function enableBatchCreation() {
  document.getElementById('createBatchButton').disabled = false;
}

// Event listener for Create Batch button
document.getElementById('createBatchButton').addEventListener('click', function () {
  document.getElementById('fileInput').click(); // Trigger file input click event
  showTableContainer(); // Show table container after selecting file
});

// Show table container
function showTableContainer() {
  const tableContainer = document.getElementById('tableContainer');
  if (tableContainer) {
    tableContainer.style.display = 'block';
  }
}

// Event listener for file input change
document.getElementById('fileInput').addEventListener('change', function (event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    populateTable(jsonData); // Populate table with data from Excel file
    document.getElementById('saveButton').style.display = 'block'; // Display save button
  };

  reader.readAsArrayBuffer(file);
});

// Event listener for Change Batch Name button
document.getElementById('changeBatchNameBtn').addEventListener('click', async function () {
  const batchNameDiv = document.getElementById('batchNameDisplay');
  const currentBatchName = batchNameDiv.textContent.replace('Batch Name: ', '');
  const inputField = document.createElement('input');
  inputField.type = 'text';
  inputField.value = currentBatchName;
  inputField.classList.add('batch-name-input');

  const submitButton = document.createElement('button');
  submitButton.textContent = 'Save';
  submitButton.classList.add('save-button');

  batchNameDiv.textContent = '';
  batchNameDiv.appendChild(inputField);
  batchNameDiv.appendChild(submitButton);

  // Event listener for Save button in batch name change input
  submitButton.addEventListener('click', async function () {
    const newBatchName = inputField.value.trim();

    if (newBatchName !== '') {
      // Check if the new batch name already exists in Firestore
      const batchQuery = await getDocs(query(collection(db, 'batches'), where('batchName', '==', newBatchName)));
      const existingBatch = batchQuery.docs.length > 0;

      if (existingBatch) {
        showMessage('Batch name already exists. Please choose a different name.', 'error');
        return;
      }

      // Update batch name in UI and Firestore
      batchNameDiv.textContent = `Batch Name: ${newBatchName}`;
      showMessage('Batch name changed successfully!', 'success');
      await updateBatchNameInFirestore(currentBatchName, newBatchName);
    } else {
      batchNameDiv.textContent = `Batch Name: ${currentBatchName}`;
      showMessage('Batch name cannot be empty!', 'error');
    }
  });
});

async function updateBatchNameInFirestore(oldBatchName, newBatchName) {
  try {
    const batchQuery = query(collection(db, 'batches'), where('batchName', '==', oldBatchName));
    const batchSnapshot = await getDocs(batchQuery);

    if (!batchSnapshot.empty) {
      batchSnapshot.forEach(async (doc) => {
        const batchRef = doc.ref;
        await updateDoc(batchRef, {
          batchName: newBatchName
        });
      });}
    // } else {
    //   console.error('Batch not found for:', oldBatchName);
    //   showMessage('Batch not found!', 'error');
    // }
  } catch (error) {
    console.error('Error updating batch name in Firestore:', error);
    showMessage('Error updating batch name: ' + error.message, 'error');
  }
}


// Event listener for Save button to save batch data to Firestore
document.getElementById('saveButton').addEventListener('click', async function () {
  const tableData = [];
  const tableBody = document.getElementById('tableBody').children;

  // Iterate through table rows to collect member data
  for (let i = 0; i < tableBody.length; i++) {
    const row = tableBody[i];
    const rowData = {
      id: row.children[0].textContent,
      name: row.children[1].textContent
    };
    tableData.push(rowData);
  }

  try {
    const batchName = document.getElementById('batchNameDisplay').textContent.replace('Batch Name: ', '');

    // Check if the batch name already exists in Firestore
    const batchQuery = await getDocs(query(collection(db, 'batches'), where('batchName', '==', batchName)));
    const existingBatch = batchQuery.docs.length > 0;

    if (existingBatch) {
      showMessage('Batch name already exists. Please choose a different name.', 'error');
      return;
    }

    // Add batch data to Firestore
    await addDoc(collection(db, 'batches'), {
      batchName: batchName,
      members: tableData,
      createdBy: currentUser.uid,
    });

    showMessage('Batch saved successfully!', 'success');
  } catch (error) {
    console.error('Error saving batch: ', error);
    showMessage('Error saving batch: ' + error.message, 'error');
  }
});


// Event listener for Delete Batch button
document.getElementById('deleteBatchBtn').addEventListener('click', async function () {
  const batchName = document.getElementById('batchNameDisplay').textContent.replace('Batch Name: ', '');

  try {
    // Query Firestore for batches with batchName and createdBy current user
    const batchQuery = await getDocs(query(collection(db, 'batches'),
      where('batchName', '==', batchName),
      where('createdBy', '==', currentUser.uid)
    ));

    const batchDocs = batchQuery.docs;
    if (batchDocs.length === 0) {
      showMessage('Batch not found!', 'error');
      return;
    }

    // Delete batch document(s) from Firestore
    for (const doc of batchDocs) {
      await deleteDoc(doc.ref);
    }

    showMessage('Batch deleted successfully!', 'success');
    clearTable();
    document.getElementById('batchNameDisplay').textContent = 'Batch Name: Not Set';
    // hideTableContainer();
  } catch (error) {
    console.error('Error deleting batch: ', error);
    showMessage('Error deleting batch: ' + error.message, 'error');
  }
});

// Hide table container
// function hideTableContainer() {
//   const tableContainer = document.getElementById('tableContainer');
//   if (tableContainer) {
//     tableContainer.style.display = 'none';
//   }
// }

// Populate table with data from Excel file
function populateTable(data) {
  console.trace('populatetable called');
  const tableBody = document.getElementById('tableBody');
  const tableHead = document.querySelector('.table_head');

  if (tableBody && tableHead) {
    tableBody.innerHTML = '';

    
      tableHead.style.display = 'table-header-group';

      data.forEach((row, index) => {
        if (index === 0) return;

        const tr = document.createElement('tr');

        const tdId = document.createElement('td');
        tdId.textContent = row[0];
        tr.appendChild(tdId);

        const tdName = document.createElement('td');
        tdName.textContent = row[1];
        tr.appendChild(tdName);

        const tdAction = document.createElement('td');

        const editButton = document.createElement('button');
        editButton.classList.add('edit');
        editButton.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>';
        editButton.addEventListener('click', () => updateMember(row[0], row[1]));
        tdAction.appendChild(editButton);

        const removeButton = document.createElement('button');
        removeButton.classList.add('remove');
        removeButton.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
        removeButton.addEventListener('click', () => removeMember(row[0]));
        tdAction.appendChild(removeButton);

        tr.appendChild(tdAction);
        tableBody.appendChild(tr);
      });

      document.getElementById('saveButton').style.display = 'block';
    }
  }




  async function updateMember(memberId, memberName) {
    const tableBody = document.getElementById('tableBody').children;
  
    // Find the row corresponding to the memberId
    const rowToUpdate = Array.from(tableBody).find(row => row.children[0].textContent === memberId.toString());
  
    if (!rowToUpdate) {
      showMessage('Member not found!', 'error');
      return;
    }
  
    // Create an input field for the new member name
    const nameCell = rowToUpdate.children[1]; // Assuming the name is in the second column
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = memberName;
    inputField.classList.add('member-name-input');
  
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Save';
    submitButton.classList.add('save-button');
  
    // Clear the existing content in the name cell and append the input field and submit button
    nameCell.innerHTML = '';
    nameCell.appendChild(inputField);
    nameCell.appendChild(submitButton);
  
    // Event listener for Save button in member name change input
    submitButton.addEventListener('click', async function () {
      const newMemberName = inputField.value.trim();
      if (newMemberName !== '') {
        nameCell.innerHTML = `${newMemberName}`;
  
        // Update member name in Firestore for the current batch
        const batchName = document.getElementById('batchNameDisplay').textContent.replace('Batch Name: ', '');
        await updateMemberInFirestore(batchName, memberId, newMemberName);
  
        showMessage('Member updated successfully!', 'success');
      } else {
        nameCell.innerHTML = `${memberName}`;
        showMessage('Member name cannot be empty!', 'error');
      }
    });
  }
  
  

async function updateMemberInFirestore(batchName, memberId, newMemberName) {
  try {
    const batchQuery = query(collection(db, 'batches'), where('batchName', '==', batchName));
    const batchSnapshot = await getDocs(batchQuery);

    if (!batchSnapshot.empty) {
      batchSnapshot.forEach(async (doc) => {
        const batchRef = doc.ref;
        const batchData = doc.data();

        // Update member in the 'members' array
        const updatedMembers = batchData.members.map(member => {
          if (member.id === memberId) {
            return { id: memberId, name: newMemberName };
          } else {
            return member;
          }
        });

        await updateDoc(batchRef, {
          members: updatedMembers
        });
      });
    } else {
      console.error('Batch not found for:', batchName);
      showMessage('Batch not found!', 'error');
    }
  } catch (error) {
    console.error('Error updating member in Firestore:', error);
    showMessage('Error updating member: ' + error.message, 'error');
  }
}

async function removeMember(memberId) {
  const tableBody = document.getElementById('tableBody');
  const rows = Array.from(tableBody.children);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.children[0].textContent === memberId.toString()) {
      tableBody.removeChild(row);

      // Remove member from Firestore for the current batch
      const batchName = document.getElementById('batchNameDisplay').textContent.replace('Batch Name: ', '');
      await removeMemberFromFirestore(batchName, memberId);

      showMessage('Member removed successfully!', 'success');
      break;
    }
  }
}

async function removeMemberFromFirestore(batchName, memberId) {
  try {
    const batchQuery = query(collection(db, 'batches'), where('batchName', '==', batchName));
    const batchSnapshot = await getDocs(batchQuery);

    if (!batchSnapshot.empty) {
      batchSnapshot.forEach(async (doc) => {
        const batchRef = doc.ref;
        const batchData = doc.data();

        // Filter out the member to be removed
        const updatedMembers = batchData.members.filter(member => member.id !== memberId);

        await updateDoc(batchRef, {
          members: updatedMembers
        });
      });
    } else {
      console.error('Batch not found for:', batchName);
      showMessage('Batch not found!', 'error');
    }
  } catch (error) {
    console.error('Error removing member from Firestore:', error);
    showMessage('Error removing member: ' + error.message, 'error');
  }
}


// Display message to user
function showMessage(message, type) {
  const messageDiv = document.getElementById('messageDiv');
  const messageText = document.getElementById('messageText');
  const closeMessageBtn = document.getElementById('closeMessageBtn');

  messageText.textContent = message;
  messageDiv.className = `messageDiv ${type}`;
  messageDiv.style.display = 'block';

  closeMessageBtn.addEventListener('click', function () {
    messageDiv.style.display = 'none';
  });
}

// Event listener for toggle icon
document.getElementById('toggleBatchList').addEventListener('click', function () {
  const batchListContainer = document.getElementById('batchListContainer');
  if (batchListContainer.style.display === 'none') {
    batchListContainer.style.display = 'block';
    populateBatchList(); // Populate batch list when toggled
  } else {
    batchListContainer.style.display = 'none';
  }
});
// Event listener for batch list items
document.getElementById('batchList').addEventListener('click', async function (event) {
  if (event.target.tagName === 'LI') {
    const batchName = event.target.textContent.trim();
    document.getElementById('batchNameDisplay').textContent = `Batch Name: ${batchName}`;
    await fetchBatchDetails(batchName); // Fetch and display batch details
  }
});


async function fetchBatchDetails(batchName) {
  console.trace('fetchBatchdetails called');
  
  try {
    const batchQuery = query(collection(db, 'batches'), where('batchName', '==', batchName));
    const batchSnapshot = await getDocs(batchQuery);

    if (!batchSnapshot.empty) {
      batchSnapshot.forEach(doc => {
        const batchData = doc.data();
        console.log(batchData)
        updateTable(batchData.members); // Update table with batch members
      });
    } else {
      showMessage('Batch not found!', 'error');
      clearTable(); // Clear table if batch not found
    }
  } catch (error) {
    showMessage('Error fetching batch details: ' + error.message, 'error');
    clearTable(); // Clear table on error
  }
}


// Function to clear the table
function clearTable() {
  console.trace('Clearing table...');

  const tableBody = document.getElementById('tableBody');
  const tableHead = document.querySelector('.table_head');
  
  if (tableBody && tableHead) {
    console.log('Elements found, clearing table...');

    // Clear table body using removeChild method
    while (tableBody.firstChild) {
      tableBody.removeChild(tableBody.firstChild);
    }

    // Hide table head
    tableHead.style.display = 'none';
  } else {
    console.log('One or more elements not found.');
  }
}




// Function to update the table with batch member details
function updateTable(members) {
  console.trace('updateTable called');
  const tableBody = document.getElementById('tableBody');
  const tableHead = document.querySelector('.table_head');

  clearTable(); // Clear table before updating

  if (tableBody && tableHead) {
    if (members.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="3" style="background-color: #ffffff;">No batches selected yet</td></tr>';
    } else {
      tableHead.style.display = 'table-header-group';
      members.forEach((member) => {
        const tr = document.createElement('tr');

        const tdId = document.createElement('td');
        tdId.textContent = member.id;
        tr.appendChild(tdId);

        const tdName = document.createElement('td');
        tdName.textContent = member.name;
        tr.appendChild(tdName);

        const tdAction = document.createElement('td');

        const editButton = document.createElement('button');
        editButton.classList.add('edit');
        editButton.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>';
        editButton.addEventListener('click', () => updateMember(member.id, member.name));
        tdAction.appendChild(editButton);

        const removeButton = document.createElement('button');
        removeButton.classList.add('remove');
        removeButton.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
        removeButton.addEventListener('click', () => removeMember(member.id));
        tdAction.appendChild(removeButton);

        tr.appendChild(tdAction);
        tableBody.appendChild(tr);
      });
    }
  }
}


// Event listener for batch selection (example scenario)
document.addEventListener('DOMContentLoaded', async () => {
  const batchList = document.getElementById('batchList');

  // Example event handler for batch selection
  batchList.addEventListener('click', async (event) => {
    if (event.target.tagName === 'LI') {
      const batchName = event.target.textContent.trim(); // Extract batch name from list item

      // Fetch and update batch details
      await fetchBatchDetails(batchName);
    }
  });
});





// Function to populate the batch list
async function populateBatchList() {
  const batchList = document.getElementById('batchList');
  batchList.innerHTML = '';

  try {
    // Fetch batches from Firestore
    const batchQuery = await getDocs(query(collection(db, 'batches'), where('createdBy', '==', currentUser.uid)));
    const batchDocs = batchQuery.docs;

    if (batchDocs.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No batches found';
      batchList.appendChild(li);
      return;
    }

    batchDocs.forEach((batchDoc) => {
      const batchData = batchDoc.data();
      const li = document.createElement('li');
      li.textContent = batchData.batchName;
      batchList.appendChild(li);
    });
  } catch (error) {
    console.error('Error fetching batches: ', error);
    const li = document.createElement('li');
    li.textContent = 'Error fetching batches';
    batchList.appendChild(li);
  }
}
