// Get the current user's UID (Assuming you've already initialized Firebase and the user is authenticated)
var userUID = "";

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      var uid = user.uid;
      userUID = uid
      console.log(user);

      console.log('User logged in')
      // Check if the current URL is not /admin
      if (window.location.pathname !== "/admin") {
        // Call the functions to render user balance and orders
        renderUserBalance(userUID);
        fetchAndRenderUserOrders(userUID);
        // Assuming you already have the user's UID stored in the userUID variable
        isAdminUser(userUID)
        .then((isAdmin) => {
          if (isAdmin) {
            console.log('User is an admin.');
            // Your logic for admin user
            navigateTo('/admin')
          } else {
            console.log('User is not an admin.');
            // Your logic for regular user
          }
        })
        .catch((error) => {
          console.error('Error checking admin status:', error);
        });

      }
    } else {
      // User is signed out
      // ...
      console.log('User not logged in');
      if (window.location.pathname !== "/admin") {
        // Call the functions to render user balance and orders
        navigateTo("../register")
      } else {
        navigateTo("/register")
      }
      
    }
  });

  function navigateTo(params) {
    window.location.href = params;
  }

  function logoutFirebase() {
    firebase.auth().signOut()
      .then(() => {
        // Sign-out successful.
        console.log("User logged out.");
        // Redirect the user to the desired page after logout (e.g., index.html)
        if (window.location.pathname !== "/admin") {
          // Call the functions to render user balance and orders
          navigateTo("../index.html")
        } else {
          navigateTo("/index.html")
        }
      })
      .catch((error) => {
        // An error happened.
        console.error("Error logging out:", error);
      });
  }