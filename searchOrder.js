// Add event listener to the form submission
document.getElementById('searchForm').addEventListener('submit', handleSearch);

// Function to handle form submission
async function handleSearch(event) {
  event.preventDefault();
  
  // Get the command ID entered by the user
  const commandID = document.getElementById('commandID').value.trim();

  try {
    console.log(commandID);
    // Fetch data from the database based on the command ID
    const snapshot = await firebase.database().ref('orders').child(commandID).once('value');
    const orderData = snapshot.val();

    // Display the data in the Bootstrap modal
    displayResultModal(orderData);
  } catch (error) {
    console.error('Error fetching data:', error);
    // Show an error message or handle the case when data couldn't be fetched
  }
}

// Function to display the result in the Bootstrap modal
function displayResultModal(orderDetails) {
  const modalTitle = document.getElementById('resultModalLabel');
  const modalBody = document.getElementById('modalBody');

  // Clear existing modal body content
  modalBody.innerHTML = '';

  if (orderDetails) {
    // Define the keys you want to display in the modal and their corresponding display names
    const keyDisplayNames = {
        customerName: 'Customer Name',
        date: 'Date',
        packageWeight: 'Package Weight',
        receiverCountry: 'Receiver Country',
        receiverName: 'Receiver Name',
        receivingMethod: 'Receiving Method',
        senderCountry: 'Sender Country',
        senderName: 'Sender Name',
        sendingMethod: 'Sending Method',
        status: 'Status'
      };
  
      // Define the keys you want to show in the modal
      const keysToShow = ['customerName', 'senderCountry', 'senderName', 'sendingMethod', 'receiverCountry', 'receiverName', 'receivingMethod', 'date', 'packageWeight', 'status'];
  
      // Create and append elements for each order detail in the modal body
      for (const key of keysToShow) {
        const value = key === 'date' ? convertTimestampToDateTime(orderDetails[key]) : orderDetails[key];
        const displayName = keyDisplayNames[key];
        const detailElement = document.createElement('p');
        detailElement.innerText = `${displayName}: ${value}`;
        modalBody.appendChild(detailElement);
      }
  } else {
    // Show a message when the command ID is not found
    const errorMessageElement = document.createElement('p');
    errorMessageElement.innerText = 'Command ID not found.';
    modalBody.appendChild(errorMessageElement);
  }

  // Show the Bootstrap modal
  const modal = new bootstrap.Modal(document.getElementById('resultModal'));
  modal.show();
}

function convertTimestampToDateTime(timestamp) {
    const dateObject = new Date(timestamp);
    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const dateStr = dateObject.toLocaleDateString(undefined, dateOptions);
    const timeStr = dateObject.toLocaleTimeString(undefined, timeOptions);
    return `${dateStr} ${timeStr}`;
  }
  

