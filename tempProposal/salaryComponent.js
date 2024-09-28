const api = global();
const token = localStorage.getItem('authToken');

let salaryStructureId; // Define salaryStructureId in global scope
let SalarayStructureDesignantion;
let proposalId
const urlParams = new URLSearchParams(window.location.search);
salaryStructureId = urlParams.get('id'); // Retrieve the ID from the URL
SalarayStructureDesignantion = urlParams.get('designation'); // Change to 'designation' to match your URL parameter
proposalId=urlParams.get('proposalId');

// Set the salaryStructureId in the hidden input (if you have one)
document.getElementById('salaryStructureId').value = salaryStructureId; 

// Update the h2 element with the designation
document.querySelector('h2').textContent = `SALARY STRUCTURE FOR ${SalarayStructureDesignantion}`;

console.log(salaryStructureId);
console.log(SalarayStructureDesignantion);
console.log(proposalId);
// Fetch clients and handle form submission
document.addEventListener("DOMContentLoaded", function () {
    // Fetch clients from backend and populate the dropdown
    fetch(`${api}/salaryhead`, { headers: { 'Authorization': `${token}` } })
        .then(response => response.json())
        .then(data => {
            const salarySelection = document.getElementById("salaryHead");
            data.forEach(salaryhead => {
                const option = document.createElement("option");
                option.value = salaryhead.id;
                option.textContent = salaryhead.salaryHeadName;
                salarySelection.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error fetching salary heads:", error);
            document.getElementById("error-message").textContent = "Failed to load salary heads. Please try again.";
        });
        

    // Handle visibility of the formula input
        const computationDropdown = document.getElementById("computation");
        const formulaContainer = document.getElementById("openPopup");
        const persentageContainer = document.getElementById("persentage");
        const amountContainer=document.getElementById("amount");
        function toggleFormulaVisibility() {
        if (computationDropdown.value === "formula") {
            formulaContainer.disabled = false; // Show the formula input
            persentageContainer.disabled=false;
            amountContainer.disabled=true;
            persentageContainer.focus();
            formulaContainer.focus();
        } else {
            formulaContainer.disabled= true; // Hide the formula input
            persentageContainer.disabled=true;
            amountContainer.disabled=false;
            amountContainer.focus();
            persentageContainer.value="";
            formulaContainer.value="";
        }
    }

    // Initial toggle on page load
    toggleFormulaVisibility();

    // Add event listener to toggle on change
    computationDropdown.addEventListener("change", toggleFormulaVisibility);

    // Handle form submission
    document.getElementById("storeForm").addEventListener("submit", function (event) {
        event.preventDefault();
        const salaryHead = parseInt(document.getElementById("salaryHead").value); // Get selected salary head ID
        const computation = computationDropdown.value;
        const percentage = parseInt(document.getElementById("persentage").value);
        const formula = document.getElementById("formula").value;
        const amount = parseInt(document.getElementById("amount").value);
        const monthlyYearly = document.getElementById("monthlyYearly").value;
        
        const proposalData = {
            salaryStructure: {
                id: salaryStructureId
            },
            head: {
                id: salaryHead
            },
            consumptionType: computation,
            percentage: percentage,
            formula: formula,
            amount: amount,
            monthlyOrYearly: monthlyYearly,
        };

        console.log("Form data:", proposalData);

        fetch(`${api}/temp-component/new`, {
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
            url: `${api}/temp-component/salary-structureId/${salaryStructureId}`,
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
            { data: "head.salaryHeadName" },
            { data: "consumptionType" },
            { data: "percentage" },
            { data: "formula" },
            { data: "amount" },
            { data: "monthlyOrYearly" },
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
        lengthChange: false,
        pageLength: 30,
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
        if (confirm("Are you sure you want to delete this entry?")) {
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
                .catch((error) => console.error("Error deleting entry:", error));
        }
    };

    // Handle export to Excel
    document.getElementById("exportButton").addEventListener("click", function () {
        exportToExcel();
    });

    window.exportToExcel = function() {
        const url = `${api}/temp-component/excel/proposal/${proposalId}/designation/${salaryStructureId}`;
        window.location.href = url;
    }
    
});
