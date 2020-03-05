document.getElementById("emailInput").onchange = function() {
    var input = document.getElementById("emailInput");
    if (/^.+@.+\..+/.test(input.value)){
        success(input)
    } else{
        error(input)
    }
};
document.getElementById("passwordInput").onchange = function() {
    var input = document.getElementById("passwordInput");
    passwordsSame(input, document.getElementById("confirmPasswordInput"))
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(input.value)){
        success(input)
    } else{
        error(input)
    }
};
document.getElementById("confirmPasswordInput").onchange = function() {
    passwordsSame(document.getElementById("passwordInput"), document.getElementById("confirmPasswordInput"))
    if (document.getElementById("confirmPasswordInput").value = ""){
        error(document.getElementById("confirmPasswordInput"))
    }
};

function passwordsSame(firstPasswordElement, confirmPasswordElement){
    if (firstPasswordElement.value != confirmPasswordElement.value){
        error(confirmPasswordElement);
    } else {
        success(confirmPasswordElement)
    }
}

function error(element){
    element.style.color = "red";
    element.style.outline =  "2px solid red";
}

function success(element){
    element.style.color = "green";
    element.style.outline =  "2px solid green";
}
