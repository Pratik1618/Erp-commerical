const api = global();
const token = localStorage.getItem('authToken');

// Fetch clients and handle form submission
document.addEventListener("DOMContentLoaded", function () {
    const clientSelect = document.getElementById("clientName"); // Corrected from "clintName" to "clientName"
    const siteSelect = document.getElementById("siteName");

    // Fetch clients from backend and populate the dropdown
    fetch(`${api}/temp-client`, {
        headers: { 'Authorization': `${token}` }
    })
        .then(response => response.json())
        .then(data => {
            data.forEach(client => {
                const option = document.createElement("option");
                option.value = client.id;
                option.textContent = client.clientName;
                clientSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error fetching clients:", error);
            document.getElementById("error-message").textContent =
                "Failed to load clients. Please try again.";
        });

    // Event listener to fetch sites when a client is selected
    clientSelect.addEventListener("change", function () {
        const clientId = this.value;

        if (clientId) {
            fetch(`${api}/temp-site/client/${clientId}`, { headers: { 'Authorization': `${token}` } })
                .then(response => response.json())
                .then(data => {
                    siteSelect.innerHTML = '<option value="">Select a Site</option>'; // Reset the site dropdown

                    if (Array.isArray(data)) {
                        data.forEach(site => {
                            const option = document.createElement("option");
                            option.value = site.id; // Corrected from "site.id" to match variable name
                            option.textContent = site.siteName; // Corrected from "site.siteName"
                            siteSelect.appendChild(option);
                        });
                    } else {
                        console.error("Expected an array of sites");
                    }
                })
                .catch(error => {
                    console.error("Error fetching sites:", error);
                    document.getElementById("error-message").textContent =
                        "Failed to load sites. Please try again later.";
                });
        } else {
            siteSelect.innerHTML = '<option value="">Select a Site</option>'; // Reset if no client selected
        }
    });

    // Handle form submission
    document.getElementById("storeForm").addEventListener("submit", function (event) {
        event.preventDefault();
        const clientName = parseInt(clientSelect.value); // Get selected client ID
        const siteName = parseInt(siteSelect.value); // Get selected site ID
        const surveyId = parseInt(document.getElementById("survayId").value); // Corrected to "survayId"

        const proposalData = {
            client: { id: clientName },
            site: { id: siteName },
            surveyId: surveyId
        };

        console.log("Form data:", proposalData);

        fetch(`${api}/temp-proposal/new`, {
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

    // Initialize DataTable
        const table = $("#CityTable").DataTable({
            ajax: {
                url: `${api}/temp-proposal/`,
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
                { data: "client.clientName" },
                { data: "site.siteName" },
                { data: "surveyId" },
                {
                    data: null,
                    render: function (data, type, row) {
                        return `
                            <button class="edit" onclick="window.location.href='salaryStructure.html?id=${row.id}'">Salary</button>
                        `;
                    },
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return `
                            <button class="edit" onclick="window.location.href='manpower.html?id=${row.id}'">ManPower</button>
                        `;
                    },
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return `
                            <button class="edit" onclick="window.location.href='machnineryAdd.html?id=${row.id}'">Machniery</button>

                        `;
                    },
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return `
                           <button class="edit" onclick="window.location.href='materail.html?id=${row.id}'">Material</button>
                          `;
                    },
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        return `
                            <button class="edit" onclick="window.location.href='gstManagemt.html?id=${row.id}'">GST & Mgmt Fee</button>
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

    window.exportToExcel = function() {
        const url = `${api}/city/excel?token=${encodeURIComponent(token)}`;
        window.location.href = url;
    }
});
