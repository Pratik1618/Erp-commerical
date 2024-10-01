const api = global();
const token = localStorage.getItem('authToken');

let salaryStructureId;
let salaryStructureDesignation;
let proposalId;
let designationId;

const urlParams = new URLSearchParams(window.location.search);
salaryStructureId = urlParams.get('id');
salaryStructureDesignation = urlParams.get('designation');
designationId = urlParams.get('designantionId');
proposalId = urlParams.get('proposalId');

document.getElementById('salaryStructureId').value = salaryStructureId;
document.querySelector('h2').textContent = `SALARY COMPONENTS FOR ${salaryStructureDesignation}`;

// Fetch clients and handle form submission on DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
    fetchSalaryHeads();
    toggleFormulaVisibility();

    // Fetch CTC based on proposal and designation
    fetchCTC(proposalId, designationId);

    // Form submission handler
    document.getElementById("storeForm").addEventListener("submit", handleFormSubmit);

    // Initialize DataTable
    initializeDataTable();

    // Event listeners for export and delete functionality
    document.getElementById("exportButton").addEventListener("click", exportToExcel);
});

// Fetch salary heads from the backend
function fetchSalaryHeads() {
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
}

// Fetch CTC based on proposal ID and designation ID
function fetchCTC(proposalId, designationId) {
    fetch(`${api}/temp-component/getctc/proposal/${proposalId}/designation/${designationId}`, {
        headers: { 'Authorization': `${token}` }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        if (data.ctc !== undefined && !isNaN(data.ctc)) {
            document.getElementById("ctc").value = parseFloat(data.ctc).toFixed(2);
            document.getElementById("deduction").value = parseFloat(data.deduction).toFixed(2);
            document.getElementById("net").value = parseFloat(data.net).toFixed(2);
            document.getElementById("staturyDeduction").value = parseFloat(data.staturyDeduction).toFixed(2);
            document.getElementById("gross").value = parseFloat(data.gross).toFixed(2);

        } else {
            document.getElementById("ctc").value = '';
            document.getElementById("deduction").value = '';
            document.getElementById("net").value = '';
            document.getElementById("staturyDeduction").value = '';
            document.getElementById("gross").value = '';
            console.error("Monthly pay is undefined or not a number.");
        }
    })
    .catch(error => {
        console.error("Error fetching monthly pay:", error);
        document.getElementById("error-message").textContent = "Failed to load monthly pay. Please try again.";
    });
}

// Handle visibility of formula input based on selection
function toggleFormulaVisibility() {
    const computationDropdown = document.getElementById("computation");
    const formulaContainer = document.getElementById("formula");
    const percentageContainer = document.getElementById("persentage");
    const amountContainer = document.getElementById("amount");

    const toggle = () => {
        const isFormula = computationDropdown.value === "formula";
        formulaContainer.disabled = !isFormula;
        percentageContainer.disabled = !isFormula;
        amountContainer.disabled = isFormula;

        if (isFormula) {
            percentageContainer.focus();
        } else {
            amountContainer.focus();
        }
    };

    toggle();
    computationDropdown.addEventListener("change", toggle);
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    const salaryHead = parseInt(document.getElementById("salaryHead").value);
    const computation = document.getElementById("computation").value;
    const percentage = parseInt(document.getElementById("persentage").value);
    const formula = document.getElementById("formula").value;
    const amount = parseInt(document.getElementById("amount").value);
    const monthlyYearly = document.getElementById("monthlyYearly").value;

    const proposalData = {
        salaryStructure: { id: salaryStructureId },
        head: { id: salaryHead },
        consumptionType: computation,
        percentage,
        formula,
        amount,
        monthlyOrYearly: monthlyYearly,
    };

    fetch(`${api}/temp-component/new`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': `${token}`
        },
        body: JSON.stringify(proposalData),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => { throw new Error(error.message || "Unknown error") });
        }
        return response.json();
    })
    .then(result => {
        console.log("Success:", result);
        displaySuccess("Data saved successfully!");
        document.getElementById("storeForm").reset();
        $('#salaryComponentTable').DataTable().ajax.reload();
        fetchCTC(proposalId, designationId);
    })
    .catch(error => {
        console.error("Error submitting form:", error);
        displayError(error.message || "Error saving data. Please try again.");
    });
}

// Initialize DataTable
function initializeDataTable() {
    $("#salaryComponentTable").DataTable({
        ajax: {
            url: `${api}/temp-component/salary-structureId/${salaryStructureId}`,
            dataSrc: "",
            headers: { 'Authorization': `${token}` },
        },
        columns: [
            {
                data: null,
                render: (data, type, row, meta) => meta.row + 1,
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
                render: (data, type, row) => `
                    <button class="delete" onclick="deleteEntry(${row.id})">Delete</button>
                `,
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
            paginate: { previous: "Previous", next: "Next" },
        },
    });
}

// Handle delete operation
window.deleteEntry = function (id) {
    if (confirm("Are you sure you want to delete this entry?")) {
        fetch(`${api}/city/delete/${id}`, {
            method: "DELETE",
            headers: { 'Authorization': `${token}` },
        })
        .then(response => {
            if (response.ok) {
                $('#salaryComponentTable').DataTable().ajax.reload();
            } else {
                return response.text().then(text => Promise.reject(text));
            }
        })
        .catch(error => console.error("Error deleting entry:", error));
    }
};

// Handle export to Excel
function exportToExcel() {
    const url = `${api}/temp-component/excel/proposal/${proposalId}/designation/${designationId}`;
    window.location.href = url;
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
    setTimeout(() => { successMessageElement.textContent = ""; }, 3000); // Clear after 3 seconds
}
