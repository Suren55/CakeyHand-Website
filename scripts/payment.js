$(document).ready(function(){
    var order_total = JSON.parse(localStorage.getItem('OrderTotal'));
    // need this array to get the actual name of the month through the index number returned  by getMonth() method
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    $('#pay_btn').click(function(event){
        
        // because the type of the button is "submit", it reloads the page after the click thinking that a form is being sent to the server
        // to prevent the reload the preventDefault is used, but only for now for testing purposes
        // it should be removed when the actual payment starts working
        event.preventDefault();
                
        // here we get the info which is available right away
        firebase.auth().onAuthStateChanged(function(user){
            if(user){
                var email = user.email.replace(/\./g, "+");
                var date = new Date();
                var date_day = date.getDate();
                var date_month = months[date.getMonth()];
                var date_year = date.getFullYear();
                
                // here we get the main content-info of the order which requires database calls
                // first, we get the references of item ids that are in the user's cart and we put them in a list
                var user_cart_ref = firebase.database().ref('Cart/' + email + '/items');
                user_cart_ref.once('value', function(snapshot){
                    var items_in_cart = snapshot.val();
                    var items_key_names = Object.keys(items_in_cart); // this is the list of item ids: ['item0', 'item1', etc]
                    var items_quantities = Object.values(items_in_cart);
                    
                    // now we go to the Items table with those item ids to retrieve their detailed information
                    var items_table_ref = firebase.database().ref('Items').orderByKey();
                    items_table_ref.once('value', function(snapshot){

                        // setting currently available info into the object which will be eventually pushed to the database
                        var order_info = {
                            user_email: email,
                            order_date_day: date_day,
                            order_date_month: date_month,
                            order_date_year: date_year,
                            order_total: order_total,
                            items: {},
                         };

                        // retreiving item (not order) specific data, such as name and price
                        snapshot.forEach(function(childsnaphsot){
                            var key = childsnaphsot.key;
                            for (var i = 0; i < items_key_names.length; i++){
                                if (key == items_key_names[i]){
                                    var myKey = items_key_names[i];
                                    item_info = childsnaphsot.val();
                                    order_info['items'][myKey] = {name: item_info.name, price: item_info.price, quantity: String(items_quantities[i]) };
                                    break;
                                }
                            }
                        })
                        alert("Your order is placed! Thank you for your purchase");
                        var orders_ref = firebase.database().ref("Orders");
                        orders_ref.push(order_info);
                    })
                }).then(function(){
                    var user_cart_ref = firebase.database().ref("Cart/" + email);
                    user_cart_ref.remove();
                })

            }
        })
    })
 
    var t = 0;
    $('.four_digit_box').on('input', function(){
        var invisible_fields = $('.custom-invisible');
        var text = $(this).val();
        if (text.length >= 4){
            invisible_fields.eq(t).html(text);
            $(this).next().focus();
            t++;
        }
        else{
            invisible_fields.eq(t).html(text);
        }

    })
    
    $('.card_holder_name').on('input', function(){
        var text = $(this).val();
        $('#card_holder_name_invisible').html(text);
    })
    
    $('.month_box').on('input', function(){
        var text = $(this).val();
        $('#expiration_date_month').html(text);
        if(text.length == 2){
            text = text + ' / ';
            $('#expiration_date_month').html(text);
            $('.year_box').focus();
        }
    })
    
    $('.year_box').on('input', function(){
        var text = $(this).val();
        $('#expiration_date_year').html(text);
    })
    
    $('.three_digit_ccv_box').focus(function(){
        $('.flip-card-inner').css('transform', 'rotateY(180deg)');
    })

    $('.three_digit_ccv_box').blur(function(){
        $('.flip-card-inner').css('transform', 'rotateY(0deg)');
    })
    
    $('.three_digit_ccv_box').on('input', function(){
        var text = $(this).val();
        $('.ccv_number_input').html(text);
    })
    
})

