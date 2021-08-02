$(document).ready(function(){

    var email;
    var db = firebase.firestore();

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            email = user.email.replace(/\./g, "+");
            retrieveUserFavorites(email);
        } else {
        // No user is signed in.
        }
    })

    // retrieves the number of products in the user's cart
    function retrieveUserFavorites(userEmail){
        var favorites_list = [];
        user_cart_ref = firebase.firestore().collection("Favorites").doc(userEmail);
        user_cart_ref.get().then(function(doc){
            if(doc.exists){
                favorites_list = Object.keys(doc.data());
                buildFavorites(favorites_list);
            }
            else{
                $('.items_container').remove();
            }
        })
    }

    function buildFavorites(favorites){
        
        var product_ref = firebase.firestore().collection('Products');
        product_ref.get().then(function(querySnapshot){
            querySnapshot.forEach(function(doc){
                var key = doc.id;
                for (var i = 0; i < favorites.length; i++){
                    if (key == favorites[i]){
                        var item_info = doc.data();

                        var item_name = item_info.name;
                        if(item_info.type == "b"){
                            item_price = item_info.price[0];
                        }
                        else{
                            item_price = item_info.price;
                        }
                        var dollar_amount = item_price.slice(0, -2);
                        var cents_amount = item_price.slice(-2);

                        var product_type = item_info.type;

                        var $card = $("<div class='card text-center'></div>");

                        var $card_img = $("<img class='card-img-top', alt='image'>").addClass(key);
                        if(product_type == "b"){
                            $card_img.attr("src", "../assets/images/cakes/cakes-b/220x250/" + key + ".jpg");
                        }
                        else if(product_type == "d"){
                            $card_img.attr("src", "../assets/images/desserts/220x250/" + key + ".jpg");
                        }
                        else if(product_type == "m"){
                            $card_img.attr("src", "../assets/images/macarons/220x250/" + key + ".jpg");
                        }
                        else if(product_type == "assortment"){
                            $card_img.attr("src", "../assets/images/assortment-boxes/220x250/" + key + ".jpg");
                        }

                        var $card_card_body = $("<div class='card-body'></div>");
                        
                        var $card_card_body_h5 = $("<h5 class='card-title'></h5>");
                        var $card_card_body_link = $("<a class='item-name'></a>").addClass(key);
                            $card_card_body_link.attr("href", "single.html");
                        $card_card_body_h5.html($card_card_body_link);
                        
                        var $card_card_body_p = $("<p class='card-text price'></p>");
                        var $card_card_body_trash_icon = $("<i class='fa fa-trash remove'></i>").addClass(key);

                        $card_card_body.append($card_card_body_h5, $card_card_body_p, $card_card_body_trash_icon);

                        $card.append($card_img, $card_card_body);
                        
                        $(".card-deck").append($card);

                        var item_names = $('.item-name');
                        var item_prices = $('.price');

                        item_names.eq(i).html(item_name);
                        item_prices.eq(i).html("$" + dollar_amount + cents_amount.sup() +  "<span class='currency'> CAD</span>");
                                                    
                        break;
                    }
                }
            });
        })
    }

    // save the clicked item's ID/name to use in singe.html page
    $(document).on('click', ".item-name", function(){
        var class_names = $(this).attr('class').split(" ");
        var product_name = class_names[1];
        localStorage.setItem('ItemID', product_name);
    })

    $(document).on("click", ".remove", function(){
        alert("hey");
        var class_names = $(this).attr('class').split(" ");
        var product_name = class_names[3];
        $(this).parent().parent().remove();

        // remove from DB
        var ref = db.collection("Favorites").doc(email);
        ref.update({ [product_name]: firebase.firestore.FieldValue.delete() });
    })

})

                 
