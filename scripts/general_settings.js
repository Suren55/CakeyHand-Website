$(document).ready(function(){

    var email;
    
    function retreive_personal_info(){

        firebase.auth().onAuthStateChanged(function(user){
            if(user){
                email = user.email.replace(/\./g, "+");
                var ref = firebase.firestore().collection("Users").doc(email);
                ref.get().then(function(doc){
                    var user_personal_info = doc.data();
                    $("#f-name").val(user_personal_info.firstName);
                    $("#l-name").val(user_personal_info.lastName);
                    if (user_personal_info.sex == 'male'){
                        $('#radio-male').prop('checked', true);
                    }
                    else{
                        $('#radio-female').prop('checked', true);
                    }
                    $("#age").val(user_personal_info.age);
                    $("#email").val(user_personal_info.email.replace('+', '.'));
                    $("#country").val(user_personal_info.country);
                    $("#state").val(user_personal_info.state);
                    $("#city").val(user_personal_info.city);
                    $("#postal-code").val(user_personal_info.postalCode);
                    $("#phone-number").val(user_personal_info.phoneNumber);
                }) 
            }
            else{
                console.log("not logged in");
            }
        })


    }
    
    $(".alert-success").hide();
    
    $(".close").click(function(){
        $(".alert-success").hide();
    })
 
    $(".save-changes-btn").click(function(){
        // get user's information and make a user object
        var user_info = {
            firstName: $('#f-name').val(),
            lastName: $('#l-name').val(),
            email: email,
            country: $('#country').val(),
            state: $("#state").val(),
            city: $("#city").val(),
            street: $("#street").val(),
            postalCode: $("#postal-code").val(),
            age: $('#age').val(),
            sex: $("input[name = 'gender']:checked").val(),
            phoneNumber: $('#phone-number').val(),
        }

        // create a path and put the student in DB
        var ref = firebase.firestore().collection("Users").doc(email);
        ref.set(user_info);

        $(".alert-success").show();

    })
    
    $(document).on("click", "#delete-btn", function(){
        $("#id01").css("display", "block");
    })

    $(document).on("click", ".close", function(){
        $("#id01").css("display", "none");
    })

    $(document).on("click", ".cancelbtn", function(){
        $("#id01").css("display", "none");
    })

    $(document).on("click", ".deletebtn", function(){
        $("#id01").css("display", "none");
        firebase.firestore().collection("AccountDeletionRequests").doc(email).set({deleteAccount: true});
    })

    $(window).on('load', retreive_personal_info ());

})
