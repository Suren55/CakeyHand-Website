$(document).ready(function(){ 
    
    $("#top-header").load("../../components/top-header-navbar.html");
    $("#registration").load("../../components/registration-modal.html");
    $("#signin").load("../../components/signin-modal.html");
    $("#main-nav").load("../../components/main-menu-navbar.html");
    $("#footer-jumbotron").load("../../components/footer.html");

    $('#menu-cakes').addClass('kkk');
    $(".nav-link").addClass("k");
    
    let db = firebase.firestore();
    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user){
            var current_user = firebase.auth().currentUser;
            if(current_user.emailVerified){
                showWelcomeUserAndMyAccountDropDown();
                showShoppingCartIcon();
                hideSignInAndRegisterButtons();   
                welcomeUser(current_user);
                countCartItems(current_user);
            }
            else{
                console.log("user is not logged in");
            }
        } 
        else{
            $("#shopping-cart-nav-item").css("display", "none");
        }
    });

    function showWelcomeUserAndMyAccountDropDown(){
        $("#welcome-user").css("display", "inline-block");
        $("#my-account-dropdown").css("display", "inline-block");
    }

    function showShoppingCartIcon(){
        $("#shopping-cart-nav-item").css("display", "block");
    }

    function hideSignInAndRegisterButtons(){
        $("#sign-in-btn").css("display", "none");
        $("#register-btn").css("display", "none");
    }

    function changeTextFromMostPopularsToRecommendedForYou(){
        $("#most-populars-title").html("Recommended for you");
    }
    
    function welcomeUser(user){
        var email = user.email.replace(/\./g, "+");
        var doc_ref = db.collection("Users").doc(email);
        doc_ref.get().then(function(doc){
            if (doc.exists){
                var user_info = doc.data();
                $("#hi-user").html("Hi" + " " + user_info.firstName);
            } 
            else {
                console.log("No such document!");
            }
        }).catch(function(error){
            console.log("Error getting document:", error);
        });
    }
    
    function countCartItems(user){
        var email = user.email.replace(/\./g, "+");
        var doc_ref = db.collection("Cart").doc(email);
        doc_ref.onSnapshot(function(doc){
            var total_number_of_items = 0;
            if(doc.exists){
                var all_items = doc.data();
                var list_of_products = Object.values(all_items);
                for (var i = 0; i < list_of_products.length; i++){
                    var x = list_of_products[i];
                    for(var j = 0; j < x.length; j++){
                        total_number_of_items += parseInt(x[j]["quantity"]);
                    }
                }
            }
            $('#shopping-cart-items-number').html(total_number_of_items);
        })
    }

    function recoverProductName(name){
        product_name = "";
        product_name_elements = name.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);
        console.log(product_name_elements);
        for (var i = 0; i < product_name_elements.length; i++){
            product_name =  product_name + " " + (product_name_elements[i].charAt(0).toUpperCase() + product_name_elements[i].slice(1));
        }
        return product_name;
    }

    function showProductAddedToCartBottomSnackBar(name){
        var x = document.getElementById("snackbar-bottom");
        x.innerHTML = name + ' is added to your cart';
        x.className = "show";
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }

    function showProductAddedToFavoritesBottomSnackBar(name){
        var x = document.getElementById("snackbar-bottom");
        x.innerHTML = name + ' is added to your favorites';
        x.className = "show";
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }
        
    function addToCart(path, product_name, doc_exists, product_exists, type, cart_item){
        list_of_same_products = [];
        if(doc_exists && product_exists){
            var product_ref = db.collection("Products").doc(product_name);
                product_ref.get().then(function(doc){
                    var product_info = doc.data();
                    var product_min_qty = product_info["minQTY"];
                    var match_found = false;
                    var temp_obj;
                    path.get().then(function(doc){
                        var all_items = doc.data();
                        list_of_same_products = all_items[product_name];
                        localStorage.setItem(product_name, product_min_qty);
                        if(type == "b"){
                            for(var i = 0; i < list_of_same_products.length; i++){
                                if(
                                    (cart_item.size == list_of_same_products[i]["size"]) 
                                    && (cart_item.decorationSelected == list_of_same_products[i]["decorationSelected"]) 
                                    && cart_item.decorationText == list_of_same_products[i]["decorationText"]
                                    && cart_item.standardCandleIsSelected == list_of_same_products[i]["standardCandleIsSelected"]
                                    && cart_item.numberCandleIsSelected == list_of_same_products[i]["numberCandleIsSelected"]
                                    && cart_item.numberCandleNumber == list_of_same_products[i]["numberCandleNumber"]
                                    && cart_item.wishCardIsSelected == list_of_same_products[i]["wishCardIsSelected"]
                                    && cart_item.wishCardText == list_of_same_products[i]["wishCardText"]
                                    )
                                {
                                    var new_qty = (parseInt(list_of_same_products[i]["quantity"]) + parseInt(product_min_qty)).toString();
                                    match_found = true;
                                    temp_obj = {
                                        "quantity": new_qty,
                                        "size": cart_item.size,
                                        "decorationSelected": cart_item.decorationSelected,
                                        "decorationText": cart_item.decorationText,
                                        "standardCandleIsSelected": standardCandleIsSelected,
                                        "numberCandleIsSelected": numberCandleIsSelected,
                                        "numberCandleNumber": numberCandleNumber,
                                        "wishCardIsSelected": wishCardIsSelected,
                                        "wishCardText": wishCardText,
                                        "id": uniqueId(),
                                        "name": product_name,
                                    }
                                    // replace the old object with the new one with updated quantity
                                    list_of_same_products.splice(i, 1, temp_obj);
                                    break;
                                }
                            }
                            if(!match_found){
                                temp_obj = {
                                    "quantity": product_min_qty,
                                    "size": cart_item.size,
                                    "decorationSelected": cart_item.decorationSelected,
                                    "decorationText": cart_item.decorationText,
                                    "standardCandleIsSelected": standardCandleIsSelected,
                                    "numberCandleIsSelected": numberCandleIsSelected,
                                    "numberCandleNumber": numberCandleNumber,
                                    "wishCardIsSelected": wishCardIsSelected,
                                    "wishCardText": wishCardText,
                                    "id": uniqueId(),
                                    "name": product_name,
                                }
                                console.log(temp_obj);
                                list_of_same_products.push(temp_obj);
                            }
                        }
                        else if(type == "m"){
                            for(var i = 0; i < list_of_same_products.length; i++){
                                if(
                                    cart_item.macaronFlavors == list_of_same_products[i]["macaronFlavors"]
                                    && cart_item.standardCandleIsSelected == list_of_same_products[i]["standardCandleIsSelected"]
                                    && cart_item.numberCandleIsSelected == list_of_same_products[i]["numberCandleIsSelected"]
                                    && cart_item.numberCandleNumber == list_of_same_products[i]["numberCandleNumber"]
                                    && cart_item.wishCardIsSelected == list_of_same_products[i]["wishCardIsSelected"]
                                    && cart_item.wishCardText == list_of_same_products[i]["wishCardText"]
                                    )
                                {
                                    console.log(product_min_qty);
                                    var new_qty = (parseInt(list_of_same_products[i]["quantity"]) + parseInt(product_min_qty)).toString();
                                    match_found = true;
                                    temp_obj = {
                                        "quantity": new_qty,
                                        "macaronFlavors": macaronFlavors,
                                        "standardCandleIsSelected": standardCandleIsSelected,
                                        "numberCandleIsSelected": numberCandleIsSelected,
                                        "numberCandleNumber": numberCandleNumber,
                                        "wishCardIsSelected": wishCardIsSelected,
                                        "wishCardText": wishCardText,
                                        "id": uniqueId(),
                                        "name": product_name,
                                    }
                                    // replace the old object with the new one with updated quantity
                                    list_of_same_products.splice(i, 1, temp_obj);
                                    break;
                                }
                            }
                            if(!match_found){
                                temp_obj = {
                                    "quantity": product_min_qty,
                                    "macaronFlavors": macaronFlavors,
                                    "standardCandleIsSelected": standardCandleIsSelected,
                                    "numberCandleIsSelected": numberCandleIsSelected,
                                    "numberCandleNumber": numberCandleNumber,
                                    "wishCardIsSelected": wishCardIsSelected,
                                    "wishCardText": wishCardText,
                                    "id": uniqueId(),
                                    "name": product_name,
                                }
                                list_of_same_products.push(temp_obj);
                            }
                        }
                        else{
                            for(var i = 0; i < list_of_same_products.length; i++){
                                if(
                                    cart_item.standardCandleIsSelected == list_of_same_products[i]["standardCandleIsSelected"]
                                    && cart_item.numberCandleIsSelected == list_of_same_products[i]["numberCandleIsSelected"]
                                    && cart_item.numberCandleNumber == list_of_same_products[i]["numberCandleNumber"]
                                    && cart_item.wishCardIsSelected == list_of_same_products[i]["wishCardIsSelected"]
                                    && cart_item.wishCardText == list_of_same_products[i]["wishCardText"]
                                    )
                                {
                                    var new_qty = (parseInt(list_of_same_products[i]["quantity"]) + parseInt(product_min_qty)).toString();
                                    match_found = true;
                                    temp_obj = {
                                        "quantity": new_qty,
                                        "standardCandleIsSelected": standardCandleIsSelected,
                                        "numberCandleIsSelected": numberCandleIsSelected,
                                        "numberCandleNumber": numberCandleNumber,
                                        "wishCardIsSelected": wishCardIsSelected,
                                        "wishCardText": wishCardText,
                                        "id": uniqueId(),
                                        "name": product_name,
                                    }
                                    // replace the old object with the new one with updated quantity
                                    list_of_same_products.splice(i, 1, temp_obj);
                                    break;
                                }
                            }
                            if(!match_found){
                                temp_obj = {
                                    "quantity": product_min_qty,
                                    "standardCandleIsSelected": standardCandleIsSelected,
                                    "numberCandleIsSelected": numberCandleIsSelected,
                                    "numberCandleNumber": numberCandleNumber,
                                    "wishCardIsSelected": wishCardIsSelected,
                                    "wishCardText": wishCardText,
                                    "id": uniqueId(),
                                    "name": product_name,
                                }
                                list_of_same_products.push(temp_obj);
                            }
                        }

                        var single_item_obj = {
                            [product_name]: list_of_same_products
                        }
                        path.update(single_item_obj)
                    })
                })
        }
        else{
            var product_ref = db.collection("Products").doc(product_name);
            product_ref.get().then(function(doc){
                var product_info = doc.data();
                var product_min_qty = product_info["minQTY"];
                localStorage.setItem(product_name, product_min_qty);
                if(type == "b"){
                    var temp = {
                        "quantity": product_min_qty,
                        "size": cart_item.size,
                        "decorationSelected": cart_item.decorationSelected,
                        "decorationText": cart_item.decorationText,
                        "standardCandleIsSelected": standardCandleIsSelected,
                        "numberCandleIsSelected": numberCandleIsSelected,
                        "numberCandleNumber": numberCandleNumber,
                        "wishCardIsSelected": wishCardIsSelected,
                        "wishCardText": wishCardText,
                        "id": uniqueId(),
                        "name": product_name,
                    }
                }
                else if(type == "m"){
                    var temp = {
                        "quantity": product_min_qty,
                        "standardCandleIsSelected": standardCandleIsSelected,
                        "numberCandleIsSelected": numberCandleIsSelected,
                        "numberCandleNumber": numberCandleNumber,
                        "wishCardIsSelected": wishCardIsSelected,
                        "wishCardText": wishCardText,
                        "macaronFlavors": macaronFlavors,
                        "id": uniqueId(),
                        "name": product_name,
                    }
                }
                else{
                    var temp = {
                        "quantity": product_min_qty,
                        "standardCandleIsSelected": standardCandleIsSelected,
                        "numberCandleIsSelected": numberCandleIsSelected,
                        "numberCandleNumber": numberCandleNumber,
                        "wishCardIsSelected": wishCardIsSelected,
                        "wishCardText": wishCardText,
                        "id": uniqueId(),
                        "name": product_name,
                    }
                }
                list_of_same_products.push(temp);
                var single_item_obj = {
                    [product_name]: list_of_same_products
                }
                if(doc_exists){
                    // if something exists under the doc only update
                    if(Object.keys(doc.data()).length > 0){
                        console.log(single_item_obj);
                        path.update(single_item_obj);
                    }
                }
                // if doc does not exist create one and set the first product
                else{
                    path.set(single_item_obj);
                }
            })
        }
    }

    function uniqueId() {
        return Math.round(new Date().getTime() + (Math.random() * 100));
      }
    
    function addToFavorites(path, product_name, doc_exists, product_exists_in_favorites){
        var single_fav_item_obj = {
            [product_name]: ""
        }
        if(doc_exists){
            if(!product_exists_in_favorites){
                path.update(single_fav_item_obj);
            }
        }
        else{
            path.set(single_fav_item_obj)
        }
    }
        
    $(document).on("click", ".add-to-cart-btn", function(){
        var currentUser = firebase.auth().currentUser;
        // check if the user is logged in or not
        if (currentUser === null){
            alert("You have to sign in to add items to the cart");
        }
        else{
            var product_exists = false;
            var doc_exists = false;
            // get the class names of the clicked button and extract the name of the item 
            var class_names = $(this).attr('class').split(" ");
            if(class_names.length == 2){
                var product_name = class_names[1];
                console.log(product_name);
            }
            else{
                var product_name = class_names[3];
            }
            db.collection("Products").doc(product_name).get().then(function(doc){
                var product_type = doc.data()["type"];
                var name = doc.data()["name"];
                var email = currentUser.email.replace(/\./g, "+");
                var user_cart_ref = db.collection("Cart").doc(email);
                user_cart_ref.get().then(function(doc){
                    if(doc.exists){
                        doc_exists = true;
                        // check if the selected item is already in the cart and set the boolean accordingly
                        var all_items_in_cart = doc.data();
                        var cart_product_names = Object.keys(all_items_in_cart);
                        for(var i = 0; i < cart_product_names.length; i++){
                            if(cart_product_names[i] === product_name){
                                product_exists = true;
                                break;
                            }
                        }
                    }
                    var cartItemDetails = {
                        "size": selected_cake_size,
                        "decorationText": decorationText,
                        "decorationSelected": decorationSelected,
                        "standardCandleIsSelected": standardCandleIsSelected,
                        "numberCandleIsSelected": numberCandleIsSelected,
                        "numberCandleNumber": numberCandleNumber,
                        "wishCardIsSelected": wishCardIsSelected,
                        "wishCardText": wishCardText,
                        "flavors": macaronFlavors,
                    }
                    addToCart(user_cart_ref, product_name, doc_exists, product_exists, product_type, cartItemDetails);
                    showProductAddedToCartBottomSnackBar(name);
                })
            })
        }
    })

    $(document).on("click", ".banner-text-title", function(){
        var type = $(this).html();
        localStorage.setItem("productType", type);
        console.log(type);
    })

    $(document).on("click", ".heart-icon", function(){
        // get the email of the user
        var currentUser = firebase.auth().currentUser;
        if (currentUser === null){
            alert("You have to sign in to add this item to your list of favorites");
        }
        else{
            var product_exists_in_favorites = false;
            var doc_exists = false;
            // get the class names of the clicked button
            // extract the name of the item 
            var class_names = $(this).attr('class').split(" ");
            var product_name = class_names[3];

            var email = currentUser.email.replace(/\./g, "+");
            var user_favorites_ref = db.collection("Favorites").doc(email);
            user_favorites_ref.get().then(function(doc){
                if(doc.exists){
                    doc_exists = true;
                    // check if the selected item is already in the favorites and set the boolean accordingly
                    var all_items_in_favorites = doc.data();
                    var favorite_product_names = Object.keys(all_items_in_favorites);
                    for(var i = 0; i < favorite_product_names.length; i++){
                        if(favorite_product_names[i] === product_name){
                            product_exists_in_favorites = true;
                            break;
                        }
                    }
                }
                addToFavorites(user_cart_ref, product_name, doc_exists, product_exists_in_favorites);
                if(product_exists_in_favorites){
                    alert("It's already in your favorites");
                }
                else{
                    var recovered_name = recoverProductName(product_name);
                    showProductAddedToFavoritesBottomSnackBar(recovered_name);
                }
            })
        }
    })
        
    // save the clicked item's ID/name to use in singe.html page
    $(document).on('click', ".item-link", function(){
        var class_names = $(this).attr('class').split(" ");
        var product_name = class_names[1];
        localStorage.setItem('ItemID', product_name);
    })
    
})  