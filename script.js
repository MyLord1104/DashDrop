var currentBalance = ''
  // Function to update the balance in the HTML
  function updateBalanceDisplay(balance) {
    console.log(balance);
    const balanceElement = document.getElementById('balance');
    balanceElement.textContent = balance;
  }

  // Function to fetch and render the user's balance on page load
  async function renderUserBalance(userUID) {
    // Reference to the user's balance in the database
    const userRef = firebase.database().ref(`users/${userUID}/balance`);

    // Listen for changes in the user's balance
    userRef.on("value", (snapshot) => {
        const currentBalance = snapshot.val() || 0;

        // Update the balance in the HTML
        updateBalanceDisplay(currentBalance);
    }, (error) => {
        console.error("Error fetching balance:", error);
    });
    
  }


// Function to get the selected country from the dropdown menu
function getSelectedCountry(selectElementId) {
    const selectElement = document.getElementById(selectElementId);
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    return selectedOption.value;
}

// Function to handle form submission
async function handleFormSubmit(event) {
  event.preventDefault();

  console.log(userUID);

  // Fetch the user's current balance from the database
  const userRef = firebase.database().ref(`users/${userUID}`);
  const snapshot = await userRef.once("value");
  const userData = snapshot.val();
  const currentBalance = userData.balance || 0;

  // Get the selected delivery option
  const deliveryOption = document.getElementById('delivery-option').value;
  let deliveryFee = 0;
  let expectedDeliveryDate;

  // Determine the delivery fee and expected delivery date based on the selected option
  switch (deliveryOption) {
    case 'standard':
      deliveryFee = 10;
      expectedDeliveryDate = calculateExpectedDeliveryDate(7);
      break;
    case 'expedited':
      deliveryFee = 20;
      expectedDeliveryDate = calculateExpectedDeliveryDate(4);
      break;
    case 'express':
      deliveryFee = 30;
      expectedDeliveryDate = calculateExpectedDeliveryDate(2);
      break;
    default:
      console.error("Invalid delivery option selected.");
      return;
  }

  // Check if the balance is enough for the selected delivery option
  if (currentBalance >= deliveryFee) {
    // Proceed with adding the form data to the database
    // ...

    // For testing, log the updated balance
    const updatedBalance = currentBalance - deliveryFee;

    console.log("Updated Balance:", updatedBalance);
    const userRef = firebase.database().ref(`users/${userUID}`);
    await userRef.update({ balance: updatedBalance });

    // Rest of the code to save the form data and show success message
    // ...
    // Get the form values
    const senderName = document.getElementById('sender-name').value;
    const senderCountry = getSelectedCountry('sender-country');
    const receiverName = document.getElementById('receiver-name').value;
    const receiverCountry = getSelectedCountry('receiver-country');
    const packageWeight = document.getElementById('package-weight').value;
    const sendingMethod = document.querySelector('input[name="sending-method"]:checked').value;
    const receivingMethod = document.querySelector('input[name="receiving-method"]:checked').value;
    const status = "confirmed"
    const uid = userUID
    const customerName = `${userData.profile.firstName} ${userData.profile.lastName}`
    const date = Date.now()
    // Generate a new unique ID for the order
    const newOrderRef = firebase.database().ref(`/orders`).push();

    // Save the form values to the database under the new order ID
    await newOrderRef.set({
        senderName,
        senderCountry,
        receiverName,
        receiverCountry,
        packageWeight,
        sendingMethod,
        receivingMethod,
        status,
        uid,
        updatedBalance,
        customerName,
        date,
        deliveryOption,
        expectedDeliveryDate
    })
    .then(() => {
        // Success! Order data is saved to the database
        console.log("Order data saved successfully!");
        alert('Order successfully placed!')
        // You can redirect the user to the dashboard/home.html page here if needed
        // window.location.href = "../dashboard/home.html";
    })
    .catch((error) => {
        // Error occurred while saving the data
        console.error("Error saving order data:", error);
        alert("Error saving order data:", error)
    });

  } else {
    // Show a message indicating insufficient balance
    const balanceShort = deliveryFee - currentBalance;
    console.log(`Insufficient balance. You are ${balanceShort} euros short.`);
    alert(`Insufficient balance. You are ${balanceShort} euros short.`);
    // You can display a message to the user here
    // e.g., show a popup, display an error message on the form, etc.
    return;
  }
}




// Function to fetch and render user's orders on page load
function fetchAndRenderUserOrders(userUID) {
    // Get the currently authenticated user's UID
    const uid = firebase.auth().currentUser.uid;
    console.log(uid);
    const ordersRef = firebase.database().ref('orders');
    ordersRef.orderByChild('uid').equalTo(uid).on('value', (snapshot) => {
      const orders = snapshot.val();
      renderUserOrders(orders);
    });
  }

// Function to render user's orders in the table view
function renderUserOrders(orders) {
  // Create a new table element
  const table = document.createElement('table');
  table.classList.add('table', 'table-bordered');

  // Create the table header (thead) and table body (tbody) elements
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // Add the table header row
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = `
    <th scope="col">#</th>
    <th scope="col">Order ID</th>
    <th scope="col">Status</th>
    <th scope="col">Expected delivery date</th>
  `;
  thead.appendChild(headerRow);

  // Add the table rows for each order
  let rowNumber = 1;
  for (const orderId in orders) {
    const orderData = orders[orderId];

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${rowNumber}</td>
      <td><small><span class="badge rounded-pill text-bg-light">${orderId}</span></small></td>
      <td><span class="badge rounded-pill text-bg-primary">${orderData.status}</span></td>
      <td>${orderData.expectedDeliveryDate}</td>
    `;

    tbody.appendChild(row);
    rowNumber++;
  }

   // Append the header and body to the table
   table.appendChild(thead);
  table.appendChild(tbody);

  // Get the container where you want to add the table (e.g., a div with ID "orders-table-container")
  const tableContainer = document.getElementById('orders-table-container');

  // Clear the existing content in the container
  tableContainer.innerHTML = '';

  // Append the table to the container
  tableContainer.appendChild(table);

  // Initialize DataTables on the table
  $(document).ready(function() {
    const dataTable = $(table).DataTable({
      "order": [[3, "asc"]], // Column start from 0,1,2,3,4,& so on... | Sort by the fourth column (Expected Delivery Date) in ascending order by default
      "columnDefs": [
        { "orderable": false, "targets": 0 }, // Disable sorting for the first column (Serial Number)
      ]
    });

    // Update the serial numbers after the DataTable is initialized
    dataTable.on('order.dt search.dt', function () {
      dataTable.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
        cell.innerHTML = i + 1;
      });
    }).draw();
  });
}

 

  


// Attach form submission event listener
document.getElementById('shipping-form').addEventListener('submit', handleFormSubmit);


// Function to check if the user's UID exists in the admins node and is true
function isAdminUser(userUID) {
  const adminsRef = firebase.database().ref('admins');

  return adminsRef
    .child(userUID)
    .once('value')
    .then((snapshot) => {
      const isAdmin = snapshot.exists() && snapshot.val() === true;
      return isAdmin;
    })
    .catch((error) => {
      console.error('Error checking admin status:', error);
      return false;
    });
}

  // Function to calculate the expected delivery date based on the number of days for delivery
  function calculateExpectedDeliveryDate(days) {
    const today = new Date();
    const expectedDeliveryDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  
    const day = expectedDeliveryDate.getDate();
    const month = expectedDeliveryDate.getMonth() + 1;
    const year = expectedDeliveryDate.getFullYear();
  
    return `${day}-${month}-${year}`;
  }