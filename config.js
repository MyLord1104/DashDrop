const firebaseConfig = {
    apiKey: "AIzaSyBIXZhde8B6bGl8W1Ft-9JFRsUKQcdLkIk",
    authDomain: "delivery-99113.firebaseapp.com",
    databaseURL: "https://delivery-99113-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "delivery-99113",
    storageBucket: "delivery-99113.appspot.com",
    messagingSenderId: "838995598612",
    appId: "1:838995598612:web:c3f77aa1ac955ee9fab601"
  };

 firebase.InitializeAPP(firebaseConfig);

 var contactForm = firebase.database().ref('register')

document.getElementById('register') .addEventListener("submit",submitForm)

function submitForm(e){
    e.preventDefault();
  
    var first_name = getElementVal('first_name');
    var last_name = getElementVal('last_name');
    var email = getElementVal('email');
    var password = getElementVal('password');
    var phone = getElementVal('phone');
    var address = getElementVal('address');
   
    saveMessages(firstName,lastName,email,password,phone,address)
    
}

const saveMessages = (firstName,lastName,email,password,phone,address) =>
{
    var newContactForm = contactFormDB.push();
    newContactForm.set({
        first_name : first_name,
        last_name : last_name,
        email : email,
        password : password,
        phone : phone,
        address : address,
    })
}



const getElementVal =(id) => {
    return document.getElementById(id).value;
}