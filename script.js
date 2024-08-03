let customCategories = [];
let budgetChart;

function updateMode() {
  const mode = document.getElementById("mode").value;
  const defaultCategories = document.getElementById("default-categories");
  const manualCategories = document.getElementById("manual-categories");

  if (mode === "default") {
    defaultCategories.style.display = "block";
    manualCategories.style.display = "none";
  } else {
    defaultCategories.style.display = "none";
    manualCategories.style.display = "block";
  }
}

function openAddCategoryModal() {
  Swal.fire({
    title: "Add Category",
    html:
      '<input id="new-category" class="swal2-input" placeholder="Category name" style="width: 70%;">' +
      '<input id="new-percentage" type="number" class="swal2-input" placeholder="Percentage" min="0" max="100" style="width: 70%;">',
    focusConfirm: false,
    preConfirm: () => {
      const category = document.getElementById("new-category").value.trim();
      const percentage = parseFloat(
        document.getElementById("new-percentage").value
      );

      if (
        category &&
        !isNaN(percentage) &&
        percentage > 0 &&
        percentage <= 100
      ) {
        customCategories.push({ name: category, percentage });
        renderCategories();
      } else {
        Swal.showValidationMessage(
          "Please enter a valid category and percentage."
        );
      }
    },
  });
}

function renderCategories() {
  const categoryList = document.getElementById("category-list");
  categoryList.innerHTML = customCategories
    .map(
      (cat, index) =>
        `<tr>
            <td>${cat.name}</td>
            <td>${cat.percentage}%</td>
            <td>
                <button class="edit-button" onclick="editCategory(event, ${index})">Edit</button>
                <button class="delete-button" onclick="confirmDeleteCategory(event, ${index})">Delete</button>
            </td>
        </tr>`
    )
    .join("");
}

function editCategory(event, index) {
  event.preventDefault();
  const category = customCategories[index];

  Swal.fire({
    title: "Edit Category",
    html:
      `<input id="edit-category" class="swal2-input" placeholder="Category name" value="${category.name}" style="width: 70%;">` +
      `<input id="edit-percentage" type="number" class="swal2-input" placeholder="Percentage" min="0" max="100" value="${category.percentage}" style="width: 70%;">`,
    focusConfirm: false,
    preConfirm: () => {
      const newCategory = document.getElementById("edit-category").value.trim();
      const newPercentage = parseFloat(
        document.getElementById("edit-percentage").value
      );

      if (
        newCategory &&
        !isNaN(newPercentage) &&
        newPercentage > 0 &&
        newPercentage <= 100
      ) {
        customCategories[index] = {
          name: newCategory,
          percentage: newPercentage,
        };
        renderCategories();
        showToast("success", "Edit successful");
      } else {
        Swal.showValidationMessage(
          "Please enter a valid category and percentage."
        );
      }
    },
  });
}

function confirmDeleteCategory(event, index) {
  event.preventDefault();
  Swal.fire({
    title: "Are you sure?",
    text: "This will delete the category.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e57373",
    cancelButtonColor: "#5c6bc0",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      deleteCategory(index);
    }
  });
}

function deleteCategory(index) {
  customCategories.splice(index, 1);
  renderCategories();
  showToast("success", "Delete successful");
}

function calculateBudget() {
  const salary = parseFloat(document.getElementById("salary").value);
  const mode = document.getElementById("mode").value;

  if (isNaN(salary) || salary <= 0) {
    Swal.fire("Error", "Please enter a valid salary.", "error");
    return;
  }

  let resultsHtml = "";
  let chartData = [];
  let chartLabels = [];
  let totalUsed = 0;

  if (mode === "default") {
    const defaultAllocations = [
      { name: "Needs", percentage: 50 },
      { name: "Wants", percentage: 30 },
      { name: "Savings", percentage: 20 },
    ];

    defaultAllocations.forEach((cat) => {
      const amount = (salary * cat.percentage) / 100;
      resultsHtml += `<p>${cat.name}: ${amount.toFixed(2)}</p>`;
      chartData.push(amount);
      chartLabels.push(cat.name);
      totalUsed += amount;
    });
  } else {
    let totalPercentage = 0;
    customCategories.forEach((cat) => {
      totalPercentage += cat.percentage;
      const amount = (salary * cat.percentage) / 100;
      resultsHtml += `<p>${cat.name}: ${amount.toFixed(2)}</p>`;
      chartData.push(amount);
      chartLabels.push(cat.name);
      totalUsed += amount;
    });

    if (totalPercentage > 100) {
      Swal.fire(
        "Error",
        "Total percentage exceeds 100%. Please adjust your inputs.",
        "error"
      );
      return;
    }
  }

  const remainingBalance = salary - totalUsed;
  resultsHtml += `<p><strong>Remaining Balance: ${remainingBalance.toFixed(
    2
  )}</strong></p>`;

  document.getElementById("results").innerHTML = resultsHtml;
  renderChart(chartLabels, chartData);
}

function renderChart(labels, data) {
  const ctx = document.getElementById("budgetChart").getContext("2d");

  if (budgetChart) {
    budgetChart.destroy();
  }

  const colors = generateColors(labels.length);

  budgetChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#e0e0e0",
          },
        },
      },
    },
  });
}

function generateColors(numColors) {
  const colorPalette = [
    "#6a1b9a",
    "#8e44ad",
    "#9b59b6",
    "#ab47bc",
    "#ba68c8",
    "#d1c4e9",
    "#b39ddb",
    "#9e9e9e",
    "#757575",
    "#616161",
    "#424242",
    "#b71c1c",
    "#c62828",
    "#d32f2f",
    "#e53935",
  ];

  const generatedColors = [];
  for (let i = 0; i < numColors; i++) {
    generatedColors.push(colorPalette[i % colorPalette.length]);
  }

  return generatedColors;
}

function showToast(icon, title) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  Toast.fire({
    icon: icon,
    title: title,
  });
}

// Function to reset all inputs and categories
function resetAll() {
    // Clear custom categories
    customCategories = [];
    renderCategories();

    // Clear salary input
    document.getElementById('salary').value = '';

    // Clear results and chart
    document.getElementById('results').innerHTML = '';
    if (budgetChart) {
        budgetChart.destroy();
    }

    // Show a success message
    showToast('success', 'All data has been reset.');
}
document.getElementById('reset-button').addEventListener('click', resetAll);