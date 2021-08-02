$(document).ready(function(){

    // create message for correct first name input
    var $correct_fName_para = $("<p>", {id: "correct-fName-input", "class": "correct-input"});
    var $correct_icon = $("<i>", {"class": "fa fa-check-circle"});
    $correct_fName_para.append($correct_icon);
    $correct_fName_para.append("First name looks good");
    
    // create message for wrong first name input
    var $wrong_fName_para = $("<p>", {id: "wrong-fName-input", "class": "wrong-input"});
    var $wrong_icon = $("<i>", {"class": "fa fa-times-circle"});
    $wrong_fName_para.append($wrong_icon);
    $wrong_fName_para.append("No way you don't have a first name");
    
    // create message for correct last name input
    var $correct_lName_para = $("<p>", {id: "correct-lName-input", "class": "correct-input"});
    var $correct_icon = $("<i>", {"class": "fa fa-check-circle"});
    $correct_lName_para.append($correct_icon);
    $correct_lName_para.append("Last name looks good");
    
    // create message for wrong last name input
    var $wrong_lName_para = $("<p>", {id: "wrong-lName-input", "class": "wrong-input"});
    var $wrong_icon = $("<i>", {"class": "fa fa-times-circle"});
    $wrong_lName_para.append($wrong_icon);
    $wrong_lName_para.append("No way you don't have a last name");
    
    // create message for correct email input
    var $correct_email = $("<p>", {id: "correct-email", "class": "correct-input"});
    var $correct_icon = $("<i>", {"class": "fa fa-check-circle"});
    $correct_email.append($correct_icon);
    $correct_email.append("Email looks good");
    
    // create message for pending email input
    var $pending_email = $("<p>", {id: "pending-email"});
    var $pending_icon = $("<i>", {"class": "fa fa-clock-o"});
    $pending_email.append($pending_icon);
    $pending_email.append("Email will be checked upon clicking the button below");
    
    // create message for valid password
    var $valid_pass = $("<p>", {id: "valid-pass", "class": "correct-input"});
    var $correct_icon = $("<i>", {"class": "fa fa-check-circle"});
    $valid_pass.append($correct_icon);
    $valid_pass.append("Password looks good");
    
    // create message for invalid password 
    var $invalid_pass = $("<p>", {id: "invalid-pass", "class": "wrong-input"});
    var $wrong_icon = $("<i>", {"class": "fa fa-times-circle"});
    $invalid_pass.append($wrong_icon);
    $invalid_pass.append("Password must be at least 8 characters long");
    
    // Get DOM elements
    const txt_fname = $("#f-name");
    const txt_lname = $("#l-name");
    const txt_email = $('#user-reg-email'); 
    const txt_password = $('#user-reg-pass');
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    
    // Start of all function declarations 

    function checkForEmptyFirstName(f_name){
        if (f_name == ''){
            return true;
        }
        else{
            return false;
        }
    }

    function checkForEmptyLastName(l_name){
        if (l_name == ''){
            return true;
        }
        else{
            return false;
        }
    }

    function passwordIsValid(password){
        if (password.length < 8){
            return false;
        }
        else{
            return true;
        }
    }

    function resetForm(){
        // reset the form and remove all alert message paragraphs
        $(".modal-body input").val("");
        $(".modal-body p").remove();
    }

    function signupAuth(){
        // Get email and pass
        const email = txt_email.val();
        const pass = txt_password.val();
        firebase.auth().createUserWithEmailAndPassword(email, pass).then(function(){
            $("#pending-email").empty();
            $("#email-form-elem").append($correct_email);
            sendVerificationEmail();
        }).catch(function(error) {
            $("#pending-email").empty();
            $("#pending-email").append($("<i>", {"class": "fa fa-times-circle"}));
            $("#pending-email").append(error.message);
            $("#pending-email").css({"color": "#FD7762"});
        });
    }

    function sendVerificationEmail(){
        var $alert_box_success = $("<div>", {"class":"alert alert-success"});
        $alert_box_success.append("Success! A verification email is sent to you. Follow the instrcutions in the email to complete the registration.");
        
        var user = firebase.auth().currentUser;
        user.sendEmailVerification().then(function() {
            if($("#message-box-reg .alert-danger").length != 0){
                $("#message-box-reg .alert-danger").remove();
                $("#message-box-reg").prepend($alert_box_success);
            }
            else{
                $("#message-box-reg").prepend($alert_box_success);
            }
            // add the user to the database regardless of the email confirmation
            addUserToDatabase();
            // reset the registration form
            resetForm();
        }).catch(function(error) {
          console.log(error);
          firebase.firestore().collection("ErrorLogs").document(user.email).collection("SendEmailVerificationErrorLogs").doc().set(error);
        });
    }
    
    function resendEmailVerification(){
        var $alert_box_success = $("<div>", {"class":"alert alert-success"});
        $alert_box_success.append("Success! A verification email is sent to you. Follow the instrcutions in the email to complete the registration.");
        
        var user = firebase.auth().currentUser;
        user.sendEmailVerification().then(function() {
            $("#message-box-signin .alert").remove();
            $("#message-box-signin").prepend($alert_box_success);
        })
    }
    
    function resetPassword(){
        var email = $("#user-signin-email").val();
        var $alert_box; 
        if (email === ""){
            $alert_box = $("<div>", {"class":"alert alert-info"});
            $alert_box.append("Please, provide only your Email below and click on 'Forgot Password' again. You will get a password reset link to your email");
            if ( $("#message-box-signin .alert").length !=0 ){
                $("#message-box-signin .alert").remove();
            }
            if ( $("#modal-footer-signin .btn-warning").length !=0 ){
                $("#modal-footer-signin .btn-warning").remove();
            }
            $("#message-box-signin").prepend($alert_box);
            }
        else{
            firebase.auth().sendPasswordResetEmail(email).then(function(){
                $alert_box = $("<div>", {"class":"alert alert-info"});
                $alert_box.append("Please, check your Email. We sent a password reset link to your email");
                if ( $("#message-box-signin .alert").length !=0 ){
                    $("#message-box-signin .alert").remove();
                }
                if ( $("#modal-footer-signin .btn-warning").length !=0 ){
                    $("#modal-footer-signin .btn-warning").remove();
                }
                $("#message-box-signin").prepend($alert_box);
            }).catch(function(e){
                $alert_box = $("<div>", {"class":"alert alert-danger"});
                $alert_box.append(e.message);
                if ( $("#message-box-signin .alert").length !=0 ){
                    $("#message-box-signin .alert").remove();
                }
                if ( $("#modal-footer-signin .btn-warning").length !=0 ){
                    $("#modal-footer-signin .btn-warning").remove();
                }
                $("#message-box-signin").prepend($alert_box);
            });
        }
    }

    // put the user in the database
    function addUserToDatabase(){
        var email = txt_email.val().replace(/\./g, "+");        
        var date = new Date();
        var registrationDate = months[date.getMonth()] + " " + date.getDate() + ', ' + date.getFullYear();

        var user = {
            firstName: $('#f-name').val(),
            lastName: $('#l-name').val(),
            email: email,
            regDate: registrationDate,
            country: "",
            state: "",
            city: "",
            postalCode: "",
        }

        var db = firebase.firestore();
        db.collection("Users").doc(email).set(user)
            .then(function() {
                console.log("Document successfully written!");
            })
            .catch(function(error) {
                console.error("Error writing document: ", error);
            });
        }
            
    function signIn(){
        var txt_email = $("#user-signin-email");
        var txt_pass = $("#user-signin-pass");
        
        var $alert_box_error = $("<div>", {"class":"alert alert-danger"});
        var $alert_box_email_not_verified = $("<div>", {"class":"alert alert-warning"});
        var $resend_email_verification_btn = $("<button>", {id:"resend-link-btn", "class":"btn btn-warning"}).html("Resend");
        
        const email = txt_email.val(); 
        const pass = txt_pass.val();
        
        // sign the user in
        const promise = firebase.auth().signInWithEmailAndPassword(email, pass);
        // if auth is successful, check if the email has been verified
        promise.then(function(user){
            firebase.auth().onAuthStateChanged(function(user) {
                if (user.emailVerified) {
                    location.reload();
                }
                else{
                    if ($("#message-box-signin .alert").length !=0 ){
                        $("#message-box-signin .alert").remove();
                        $("#modal-footer-signin .btn-warning").remove();
                    }
                    $alert_box_email_not_verified.append("You have not verified your email yet. Please, do so to sign in or click Resend button below to receive  a new link.");
                    $("#message-box-signin").prepend($alert_box_email_not_verified);
                    $("#modal-footer-signin").append($resend_email_verification_btn);
                }
            });
        // if there is an error during the auth, alert the error message
        }).catch(function(e){
            if ( $("#message-box-signin .alert").length !=0 ){
                $("#message-box-signin .alert").remove();
            }
            if ( $("#modal-footer-signin .btn-warning").length !=0 ){
                $("#modal-footer-signin .btn-warning").remove();
            }
            $alert_box_error.append(e.message);
            $("#message-box-signin").prepend($alert_box_error);
        }); 
    }
    // End of all function declarations
    
    
    // Start of main content
    $('#f-name').on('input', function(){
        if (checkForEmptyFirstName(txt_fname.val()) && ($("#wrong-fName-input").length == 0) ){
            if ($("#correct-fName-input").length != 0){
                $("#correct-fName-input").remove();
                $("#f-name-form-elem").append($wrong_fName_para);
            }
            else{
                $("#f-name-form-elem").append($alert_wrong_para);
            }
        }
        else{
            if($("#wrong-fName-input").length != 0){
                $("#wrong-fName-input").remove();
                $("#f-name-form-elem").append($correct_fName_para);
            }
            else{
                $("#f-name-form-elem").append($correct_fName_para);
            }
        }
    })
    
    $('#l-name').on('input', function(){
        if (checkForEmptyLastName(txt_lname.val()) && ($(".wrong-lName-input").length == 0) ){
            if ($("#correct-lName-input").length != 0){
                $("#correct-lName-input").remove();
                $("#l-name-form-elem").append($wrong_lName_para);
            }
            else{
                $("#l-name-form-elem").append($wrong_lName_para);
            }
        }
        else{
            if($("#wrong-lName-input").length != 0){
                $("#wrong-lName-input").remove();
                $("#l-name-form-elem").append($correct_lName_para);
            }
            else{
                $("#l-name-form-elem").append($correct_lName_para);
            }
        }
    })
    
    $('#user-reg-email').on('input', function(){
        if ($("#pending-email").length != 0){
            $("#pending-email").empty();
            $("#pending-email").append($pending_icon);
            $("#pending-email").append("Email will be checked upon clicking the button below");
            $("#pending-email").css({"color": "#FFA300"});
        }
        else{
            $("#email-form-elem").append($pending_email);
        }
    })
    
    $('#user-reg-pass').on('input', function(){
        if (passwordIsValid(txt_password.val())){
            if ($("#invalid-pass").length != 0){
                $("#invalid-pass").remove();
                $("#password-form-elem").append($valid_pass);
            }
            else{
                $("#password-form-elem").append($valid_pass);
            }
        }
        else{
            if($("#valid-pass").length != 0){
                $("#valid-pass").remove();
                $("#password-form-elem").append($invalid_pass);
            }
            else{
                $("#password-form-elem").append($invalid_pass);
            }
        }
    })
    
    $('#signup-btn').click(function(){
        if ($("#correct-fName-input").length !=0 && $("#correct-lName-input").length != 0 && $("#valid-pass").length !=0){
            signupAuth();
        }
        else{
            if ($(".alert-danger").length != 0){
                $(".alert-danger").html($alert_box);
            }
            else{
                var $alert_box = $("<div>", {"class":"alert alert-danger"});
                $alert_box.append("Please, fill in all fields properly")
                $("#message-box-reg").prepend($alert_box);
            }
        } 
    })
    
    $(document).on("click", "#signin-btn", function(){
        signIn();
    })

    $(document).keypress(function(event){
        if(event.keyCode === 13){
            $("#signin-btn").click();
        }
    })

    $(document).keypress(function(event){
        if(event.keyCode === 13){
            $("#signup-btn").click();
        }
    })
    
    $(document).on("click", "#signout-btn", function(){
        firebase.auth().signOut().then(function() {
            window.location.replace("https://cakeyhand.com");
        }).catch(function(error) {
          console.log(error);
        });
    })
    
    $("#modal-footer-signin").on("click", "#forgot-btn", function(){
        resetPassword();
    })
        
    $("#modal-footer-signin").on("click", "#resend-link-btn", function(){
        resendEmailVerification();
    })

    $('#signin-btn-secondary').click(function() {
        $('#registration').one('hidden.bs.modal', function() {
            $('#signin').modal('show'); 
        }).modal('hide');
    });
    
    $('#register-btn-secondary').click(function() {
        $('#signin').one('hidden.bs.modal', function() {
            $('#registration').modal('show'); 
        }).modal('hide');
    });
    
})
