const api = global();
const token = localStorage.getItem('authToken');

let proposalId; // Define stateId in global scope

const urlParams = new URLSearchParams(window.location.search);
proposalId = urlParams.get('id'); // Retrieve the ID from the URL
document.getElementById('proposalId').value = proposalId; // Set the stateId in the hidden input

console.log(proposalId);
// Fetch clients and handle form submission
document.addEventListener("DOMContentLoaded", function () {

    // Fetch clients from backend and populate the dropdown
    fetch(`${api}/temp-designation/`, { headers: { 'Authorization': `${token}` } })
        .then(response => response.json())
        .then(data => {
            const designationSelect = document.getElementById("designantionName");
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

    // Event listener to fetch sites when a client is selected


    // Handle form submission
    document.getElementById("storeForm").addEventListener("submit", function (event) {
        event.preventDefault();
        const designantionName = parseInt(document.getElementById("designantionName").value); // Get selected client ID


        const proposalData = {
            tempProposal: {
                id: proposalId
            },
            tempDesignation: {
                id: designantionName
            }
        };

        console.log("Form data:", proposalData);

        fetch(`${api}/temp-salary/new`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `${token}`
            },
            body: JSON.stringify(proposalData),
        })
            .then((response) => {
                if (!response.ok) {
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
                table.ajax.reload(); // Refresh the table data
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
    

    console.log("Proposal ID:", proposalId);
    // Initialize DataTable
    const table = $("#CityTable").DataTable({
        ajax: {
            url: `${api}/temp-salary/proposal/${proposalId}`,
            dataSrc: "",
            headers: {
                'Authorization': `${token}`
            },
        },
        columns: [
            {
                data: null,
                render: function (data, type, row, meta) {
                    return meta.row + 1; // Serial number starting from 1
                },
                title: "SR No",
            },
            { data: "tempDesignation.designationName" },
            {
                data: null,
                render: function (data, type, row) {
                    const id = row.id;
                    const designationName = encodeURIComponent(row.tempDesignation.designationName);

                    return `
                        <button class="edit" onclick="window.location.href='salaryComponent.html?id=${id}&designation=${designationName}&proposalId=${proposalId}'">Add Component</button>
                      `;
                },
            },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                            <button class="delete" onclick="deleteCity(${row.id})">Delete</button>
                        `;
                },
            },
        ],
        searching: true,
        paging: true,
        info: true,
        pageLength: 5, // Number of entries per page
        lengthMenu: [5, 10, 25, 50, 100,200,300,400,500], // Options for page length    
        language: {
            search: "Search:",
            info: "Showing _START_ to _END_ of _TOTAL_ entries",
            paginate: {
                previous: "Previous",
                next: "Next",
            },
        },
    });

    // Handle delete operation
    window.deleteCity = function (id) {
        if (confirm("Are you sure you want to delete this city?")) {
            fetch(`${api}/city/delete/${id}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `${token}`
                },
            })
                .then((response) => {
                    if (response.ok) {
                        return response.text();
                    } else {
                        return response.text().then((text) => Promise.reject(text));
                    }
                })
                .then(() => {
                    table.ajax.reload(); // Refresh the table data
                })
                .catch((error) => console.error("Error deleting city:", error));
        }
    };

    // Handle export to Excel
    document.getElementById("exportButton").addEventListener("click", function () {
        exportToExcel();
    });

    window.exportToExcel = function () {
        const url = `${api}/city/excel?token=${encodeURIComponent(token)}`;
        window.location.href = url;
    }
});
