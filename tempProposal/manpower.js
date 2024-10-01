// Define global variables
const api = global();
const token = localStorage.getItem('authToken');
let stateId; // Define stateId in global scope

// Retrieve the ID from the URL and set it in the hidden input
const urlParams = new URLSearchParams(window.location.search);
stateId = urlParams.get('id');
document.getElementById('stateId').value = stateId; // Set the stateId in the hidden input
console.log(stateId);

// Function to fetch designations and populate the dropdown
function fetchDesignations() {
  fetch(`${api}/temp-designation/`, { headers: { 'Authorization': `${token}` } })
    .then(response => response.json())
    .then(data => {
      const designationSelect = document.getElementById("designantion");
      data.forEach(designation => {
        const option = document.createElement("option");
        option.value = designation.id;
        option.textContent = designation.designationName;
        designationSelect.appendChild(option);
      });
    })
    .catch(error => {
      console.error("Error fetching zones:", error);
      document.getElementById("error-message").textContent = "Failed to load Material. Please try again.";
    });
}

// Function to fetch monthly pay based on selected designation
function fetchMonthlyPay(selectedDesignationId) {
  fetch(`${api}/temp-component/getctc/proposal/${stateId}/designation/${selectedDesignationId}`, {
    headers: { 'Authorization': `${token}` }
  })
    .then(response => response.json())
    .then(data => {
      console.log(data); // Log the response for debugging

      // Assuming the response is a single value (e.g., 3000.0)
      if (data.ctc !== undefined && !isNaN(data.ctc)) {
        document.getElementById("monthyPay").value = parseFloat(data.ctc).toFixed(2); // Set value if valid
      } else {
        document.getElementById("monthyPay").value = ''; // Clear if invalid
        console.error("Monthly pay is undefined or not a number.");
      }
    })
    .catch(error => {
      console.error("Error fetching monthly pay:", error);
      document.getElementById("error-message").textContent = "Failed to load monthly pay. Please try again.";
    });
}

// Function to handle form submission
function handleFormSubmission() {
  document.getElementById("storeForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const storeData = {
      tempProposal: { id: stateId },
      designation: { id: parseInt(document.getElementById("designantion").value )},
      shift1:parseInt(document.getElementById("shift1").value),
      shift1StartTime:document.getElementById("shift1StartTime").value,
      shift1EndTime:document.getElementById("shift1EndTime").value,
      shift2:parseInt(document.getElementById("shift2").value),
      shift2StartTime:document.getElementById("shift2StartTime").value,
      shift2EndTime:document.getElementById("shift2EndTime").value,
      shift3:parseInt(document.getElementById("shift3").value),
      shift3StartTime:document.getElementById("shift3StartTime").value,
      shift3EndTime:document.getElementById("shift3EndTime").value,
      general:parseInt(document.getElementById("general").value),
      monthlyPay:parseFloat(document.getElementById("monthyPay").value),
    };

    console.log("Form data:", storeData);

    fetch(`${api}/temp-manpower/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `${token}`
      },
      body: JSON.stringify(storeData),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(error => {
            throw new Error(error.message || "Unknown error");
          });
        }
        return response.json();
      })
      .then(result => {
        console.log("Success:", result);
        displaySuccess("Data saved successfully!");
        document.getElementById("storeForm").reset();
      })
      .catch(error => {
        console.error("Error submitting form:", error);
        displayError(error.message || "Error saving data. Please try again.");
      });
  });
}

// Function to display error messages
function displayError(message) {
  const errorMessageElement = document.getElementById("error-message");
  const successMessageElement = document.getElementById("success-message");

  successMessageElement.textContent = ""; // Clear success message
  errorMessageElement.textContent = message;
}

// Function to display success messages
function displaySuccess(message) {
  const successMessageElement = document.getElementById("success-message");
  const errorMessageElement = document.getElementById("error-message");

  errorMessageElement.textContent = ""; // Clear error message
  successMessageElement.textContent = message;
  setTimeout(() => {
    successMessageElement.textContent = "";
}, 3000); 
}

// Function to initialize DataTable
function initializeDataTable() {
  const table = $("#manpowerTabel").DataTable({
    ajax: {
      url: `${api}/temp-manpower/proposalId/${stateId}`, // Replace with your API endpoint
      dataSrc: "",
      headers: { 'Authorization': `${token}` }
    },
    columns: [
      {
        data: null,
        render: function (data, type, row, meta) {
          return meta.row + 1; // Increment by 1 to display the serial number starting from 1
        },
        title: "SR No",
      },
      { data: "designation.designationName" },
      { data: "monthlyPay" },
      { data: "shift1" },
      { data: "shift1StartTime" },
      { data: "shift1EndTime" },
      { data: "shift2" },
      { data: "shift2StartTime" },
      { data: "shift2EndTime" },
      { data: "shift3" },
      { data: "shift3StartTime" },
      { data: "shift3EndTime" },
      {data:"general"},
      {
        data: null,
        render: function (data, type, row) {
          return `
            <button class="edit" onclick="window.location.href='editState.html?id=${row.id}'">Edit</button>
            <button class="delete" onclick="deleteStore(${row.id})">Delete</button>
          `;
        },
      },
    ],
    searching: true,
    paging: true,
    info: true,
    lengthChange: false,
    pageLength: 5,
    language: {
      search: "Search:",
      info: "Showing _START_ to _END_ of _TOTAL_ entries",
      paginate: { previous: "Previous", next: "Next" },
    },
  });
}

// Function to handle delete client operation
window.deleteStore = function (id) {
  if (confirm("Are you sure you want to delete this client?")) {
    fetch(`${api}/state/delete/${id}`, {
      method: "DELETE",
      headers: { 'Authorization': `${token}` }
    })
      .then(response => {
        if (response.ok) {
          return response.text(); // or response.json() if you expect JSON
        } else {
          return response.text().then(text => Promise.reject(text));
        }
      })
      .then(() => {
        table.ajax.reload(); // Refresh the table data
      })
      .catch(error => console.error("Error deleting client:", error));
  }
};

// Function to handle export to Excel
window.exportToExcel = function () {
  const url = `${api}/state/excel`;
  window.location.href = url;
};

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
  fetchDesignations();
  document.getElementById("designantion").addEventListener("change", function () {
    fetchMonthlyPay(this.value);
  });
  handleFormSubmission();

  document.getElementById("exportButton").addEventListener("click", function () {
    exportToExcel();
  });

  // Initialize DataTable
  initializeDataTable();

  // Optional: Style the search input field with CSS
  const customFilterStyle = `
    .custom-filter {
      float: right;
      margin-bottom: 20px;
    }
    .custom-filter input {
      width: 200px;
      padding: 5px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  `;
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = customFilterStyle;
  document.head.appendChild(styleSheet);
});
