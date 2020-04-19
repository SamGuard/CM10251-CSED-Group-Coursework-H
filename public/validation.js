function checkUsername(usernameInputID, usernameErrorID) {
    var input = document.getElementById(usernameInputID);
    var errorElement = document.getElementById(usernameErrorID);
    if (input.value.length < 25 && input.value.length != 0){
        success(input,errorElement)
    } else{
        document.getElementById("usernameError").display = "";
        error(input,errorElement)
    }
};

function checkEmail(emailInputID, emailErrorID) {
    var input = document.getElementById(emailInputID);
    var errorElement = document.getElementById(emailErrorID);
    if (/^.+@.+\..+/.test(input.value)){
        success(input,errorElement)
    } else{
        error(input,errorElement)
    }
};

function checkPassword(passwordInputID, passwordErrorID) {
    var input = document.getElementById(passwordInputID);
    var errorElement = document.getElementById(passwordErrorID);
    passwordsSame(input, document.getElementById("confirmPasswordInput"))
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(input.value) && input.value.length >= 8){
        success(input,errorElement)
    } else{
        error(document.getElementById("confirmPasswordInput"),errorElement)
        error(input,errorElement)
    }
};


function passwordsSame(firstPasswordElement, confirmPasswordElement){
    var errorElement = document.getElementById("confirmPasswordError");
    if (firstPasswordElement.value != confirmPasswordElement.value || confirmPasswordElement.value == ""){
        error(confirmPasswordElement, errorElement);
    } else {
        success(confirmPasswordElement, errorElement)
    }
}

function canRegister(usernameInputID, emailInputID, passwordInputID, confirmPasswordInputID){
    inputs = [
        document.getElementById(usernameInputID),
        document.getElementById(emailInputID),
        document.getElementById(passwordInputID),
        document.getElementById(confirmPasswordInputID)
    ]
    for (var i = 0; i < inputs.length; i++) {
        if(inputs[i].style.color != "green"){
            return false;
        }
    }
    return true
}

function forceBeInt(element){
        element.value = element.value.match(/[0-9]+([\.,][0-9]*)?/g);
}

function error(element, errorElement){
    errorElement.style.display = "";
    element.style.color = "red";
    element.style.outline =  "2px solid red";
}

function success(element, errorElement){
    errorElement.style.display = "none";
    element.style.color = "green";
    element.style.outline =  "2px solid green";
}
