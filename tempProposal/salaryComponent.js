const api = global();
const token = localStorage.getItem('authToken');

let salaryStructureId; // Define salaryStructureId in global scope
let SalarayStructureDesignantion;
let proposalId
let designantionId;
const urlParams = new URLSearchParams(window.location.search);
salaryStructureId = urlParams.get('id'); // Retrieve the ID from the URL
SalarayStructureDesignantion = urlParams.get('designation'); // Change to 'designation' to match your URL parameter
designantionId=urlParams.get('designantionId');
proposalId=urlParams.get('proposalId');
console.log('designantionId '+designantionId);
// Set the salaryStructureId in the hidden input (if you have one)
document.getElementById('salaryStructureId').value = salaryStructureId; 

// Update the h2 element with the designation
document.querySelector('h2').textContent = `SALARY COMPONENTS FOR ${SalarayStructureDesignantion}`;

console.log(salaryStructureId);
console.log(SalarayStructureDesignantion);
console.log(proposalId);
// Fetch clients and handle form submission
const select =document.getElementById('salaryHead');
const computation=document.getElementById("computation").value;
const persentage=document.getElementById("persentage").value;
const formula=document.getElementById("formula").value;
const selectedText = select.options[select.selectedIndex].text;
if (selectedText === "PF"&&computation==="formula") {
    persentage=12;
    formula="BASIC+DA"
    
  }
document.addEventListener("DOMContentLoaded", function () {
    function CalculatedSalaray(){
    fetch(`${api}/temp-component/getctc/proposal/${proposalId}/designation/${designantionId}`, {
        headers: { 'Authorization': `${token}` }
      })
        .then(response => response.json())
        .then(data => {
          console.log(data); // Log the response for debugging
    
          // Assuming the response is a single value (e.g., 3000.0)
          if (data.ctc !== undefined && !isNaN(data.ctc)) {
            document.getElementById("gross").value = parseFloat(data.gross).toFixed(2); // Set value if valid deduction
            document.getElementById("deduction").value = parseFloat(data.deduction).toFixed(2); // Set value if valid deduction
            document.getElementById("net").value = parseFloat(data.net).toFixed(2); // Set value if valid deduction
            document.getElementById("staturyDeduction").value = parseFloat(data.staturyDeduction).toFixed(2); // Set value if valid
            document.getElementById("ctc").value = parseFloat(data.ctc).toFixed(2); // Set value if valid
          } else {
            document.getElementById("gross").value ='';
            document.getElementById("deduction").value ='';
            document.getElementById("net").value = '';
            document.getElementById("staturyDeduction").value = '';
            document.getElementById("ctc").value = ''; // Clear if invalid
            console.error("Monthly pay is undefined or not a number.");
          }
        })
        .catch(error => {
          console.error("Error fetching monthly pay:", error);
          document.getElementById("error-message").textContent = "Failed to load monthly pay. Please try again.";
        });
    }
    CalculatedSalaray();
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
                CalculatedSalaray();
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
        setTimeout(() => {
            successMessageElement.textContent = "";
        }, 3000); // 3000 milliseconds = 3 seconds
    }

    // Initialize DataTable
    const table = $("#salaryComponentTable").DataTable({
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
        const url = `${api}/temp-component/excel/proposal/${proposalId}/designation/${designantionId}`;
        window.location.href = url;
    }
    
});
