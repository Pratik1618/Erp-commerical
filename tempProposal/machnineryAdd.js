api=global();
token = localStorage.getItem('authToken');

let stateId; // Define stateId in global scope

const urlParams = new URLSearchParams(window.location.search);
        stateId = urlParams.get('id'); // Retrieve the ID from the URL
        document.getElementById('stateId').value = stateId; // Set the stateId in the hidden input

        console.log(stateId);

        document.addEventListener("DOMContentLoaded", function () {
            // Fetch zones from backend and populate the dropdown
            fetch(`${api}/machinery;`,{ headers: {'Authorization': `${token}`} }) // Replace with your actual API endpoint
              .then((response) => response.json())
              .then((data) => {
                const machnierySelect = document.getElementById("machnineryName");
                data.forEach((machinery) => {
                  const option = document.createElement("option");
                  option.value = machinery.id;
                  option.textContent = machinery.machineryName;
                  machnierySelect.appendChild(option);
                });
              })
              .catch((error) => {
                console.error("Error fetching zones:", error);
                document.getElementById("error-messageerror-message").textContent =
                  "Failed to load Materail. Please try again.";
              });
          
          
          // Handle form submission
          document
            .getElementById("storeForm")
            .addEventListener("submit", function (event) {
              event.preventDefault();
              const machnineryName = parseInt(document.getElementById("machnineryName").value);
              const quantity=parseInt(document.getElementById("quantity").value);
              const rate = parseFloat(document.getElementById("rate").value); // Get selected client ID
              const charges=document.getElementById("charges").value;
              const fixvalue=parseFloat(document.getElementById("fix-value").value)
              const percentage=parseFloat(document.getElementById("percentage").value)
              const storeData = {
                tempProposal:{
                  id:stateId
                },
                machinery: {
                  id: machnineryName,
                },
                quantity: quantity,
                rate:rate,
                chargesType:charges,
                fixvalue:fixvalue,
                percentage:percentage
              };
          
              console.log("Form data:", storeData);
          
              fetch(`${api}/temp-machinery/new`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  'Authorization': `${token}`
                },
                body: JSON.stringify(storeData),
              })
                .then((response) => {
                  if (!response.ok) {
                    // Check if response status is not OK
                    return response.json().then((error) => {
                      throw new Error(error.message || "Unknown error");
                    });
                  }
                  return response.json();
                })
                .then((result) => {
                  console.log("Success:", result);
                  displaySuccess("Data saved successfully!");
                  document.getElementById("storeForm").reset();
                })
                .catch((error) => {
                  console.error("Error submitting form:", error);
                  displayError(error.message || "Error saving data. Please try again.");
                });
            });
          
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
          }
          
          
            const table = $("#materail").DataTable({
              ajax: {
                url: `${api}/temp-machinery/proposalId/${stateId}`, // Replace with your API endpoint
                dataSrc: "",
                headers: {
                  'Authorization': `${token}`
                } 
              },
              columns: [
                {
                  data: null,
                  render: function (data, type, row, meta) {
                    return meta.row + 1; // Increment by 1 to display the serial number starting from 1
                  },
                  title: "SR No",
                },
                { data: "machinery.machineryName" },
                { data: "quantity" },
                { data: "rate" },
                { data: "chargesType" },
                { data: "fixvalue" },
                { data: "percentage" },
                { data: "totalAmount" },
                { data: "rent" },
                {
                  data: null,
                  render: function (data, type, row) {
                    return `
                                  <button class="edit" onclick="window.location.href='editState.html?id=${row.id}'">Edit</button>
                                  <button class = "delete" onclick="deleteStore(${row.id})">Delete</button>
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
                paginate: {
                  previous: "Previous",
                  next: "Next",
                },
              },
            });
          
            // Handle delete client operation
            window.deleteStore = function (id) {
              if (confirm("Are you sure you want to delete this client?")) {
                fetch(`${api}/state/delete/${id}`, {
                  method: "DELETE",
                  headers: {
                    'Authorization': `${token}`
                  } 
                })
                  .then((response) => {
                    if (response.ok) {
                      return response.text(); // or response.json() if you expect JSON
                    } else {
                      return response.text().then((text) => Promise.reject(text));
                    }
                  })
                  .then(() => {
                    table.ajax.reload(); // Refresh the table data
                  })
                  .catch((error) => console.error("Error deleting client:", error));
              }
            };
          
            document
              .getElementById("exportButton")
              .addEventListener("click", function () {
                exportToExcel();
              });
          
              window.exportToExcel = function(){
                const url = `${api}state/excel`
                window.location.href = url;
              }
          
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