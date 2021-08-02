$(document).ready(function(){

    $("#cache-warning-jumbotron").load("helpers/warningMessageOnTop/warningMessageOnTop.html");

    const tax_rate = 0;
    const piping_price = 5;
    const standard_candle_price = 3;
    const number_candle_price = 5;
    const wish_card_price = 5;
    var subtotal = 0;
    var delivery_cost = 0; // free by default
    var tax = 0;
    var coupon_amount = 0;
    var total = 0;
    var piping_cost = 0;
    var standard_candle_cost = 0;
    var number_candle_cost = 0;
    var wish_card_cost = 0;
    var quantity_indicator;
    var products_prices;
    var products_sizes;
    var products_pipings;
    var piping_texts;
    var other_notes;
    var email;
    var product_names;
    var advance_notice_list = [];
    var delivery_selected = false;
    var pickup_selected = !delivery_selected;
    var coupon_code = "";
    var coupon_used = false;
    var orderContainsCake = false;

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            email = user.email.replace(/\./g, "+");
            retrieveProductsInUserCart(email);
            // setClearCacheWarning(email);
        }
    })

     // retrieves the number of products in the user's cart
     function retrieveProductsInUserCart(userEmail){
        var products_keys = [];
        var products_values = [];
        var k = 0;
        var price;
        user_cart_ref = firebase.firestore().collection("Cart").doc(userEmail);
        user_cart_ref.get().then(function(doc){
            if(doc.exists){
                products_keys = Object.keys(doc.data());
                products_values = Object.values(doc.data());
                var product_ref = firebase.firestore().collection('Products');
                product_ref.get().then(function(querySnapshot){
                    querySnapshot.forEach(function(doc) {
                        var key = doc.id;
                        for (var i = 0; i < products_keys.length; i++){
                            if (key == products_keys[i]){
                                var product_info = doc.data();
                                for(var j = 0; j < products_values[i].length; j++){
                                    createHTMLElements(key, product_info.type, products_values[i][j].id);
                                    advance_notice_list.push(product_info.advanceNotice);
                                    product_names = $('.item-name h5');
                                    quantity_indicator = $('.quantity-number');
                                    products_prices = $('.price');
                                    products_sizes = $('.size-number');
                                    other_notes = $('.other-notes');

                                    product_names.eq(k).html(product_info.name);
                                    if(product_info.type == "b"){
                                        if(products_values[i][j]["size"] === "7 inch"){
                                            price = product_info.price[0];
                                        }
                                        else if(products_values[i][j]["size"] === "9 inch"){
                                            price = product_info.price[1];
                                        }
                                    }
                                    else{
                                        price = product_info.price;
                                    }
                                    var dollar_amount = price.slice(0, -2);
                                    var cents_amount = price.slice(-2);
                                    products_prices.eq(k).html("$" + dollar_amount + cents_amount.sup() +  "<span class='currency'> CAD</span>");
                                    quantity_indicator.eq(k).html(products_values[i][j]["quantity"]);
                                    products_sizes.eq(k).html(products_values[i][j]["size"]);
                                    
                                    if(product_info.type == "b"){
                                        if(products_values[i][j]["decorationSelected"]){
                                            other_notes.eq(k).append("<strong>Text Piping - </strong> " + products_values[i][j]["decorationText"] + "</br>");
                                        }
                                    }
                                    if(product_info.type == "m"){
                                        var separator = "";
                                        other_notes.eq(k).append("<strong>Flavors - </strong>");
                                        $.each(products_values[i][j]["macaronFlavors"], function(key, value) {
                                            other_notes.eq(k).append(separator + key);
                                            separator = ", ";
                                        });
                                        other_notes.eq(k).append("</br>");
                                    }
                                    if(products_values[i][j]["numberCandleIsSelected"]){
                                        other_notes.eq(k).append("<strong>Number Candle - </strong> #" + products_values[i][j]["numberCandleNumber"] + "</br>");
                                    }
                                    if(products_values[i][j]["standardCandleIsSelected"]){
                                        other_notes.eq(k).append("<strong>Standard Candle Pack</strong>" + "</br>");
                                    }
                                    if(products_values[i][j]["wishCardIsSelected"]){
                                        other_notes.eq(k).append("<strong>Wish Card - </strong>" + products_values[i][j]["wishCardText"] + "</br>");
                                    }

                                    k++;

                                    if(products_values[i][j]["decorationSelected"]){
                                        piping_cost += piping_price;
                                    }
                                    if(products_values[i][j]["standardCandleIsSelected"]){
                                        standard_candle_cost += standard_candle_price;
                                    }
                                    if(products_values[i][j]["numberCandleIsSelected"]){
                                        number_candle_cost += number_candle_price;
                                    }
                                    if(products_values[i][j]["wishCardIsSelected"]){
                                        wish_card_cost += wish_card_price;
                                    }
                                    subtotal += (parseInt(price) * parseInt(products_values[i][j]["quantity"]))  / 100 ;
                                    delivery_cost = calculateDeliveryCost(subtotal);
                                    tax = calculateTax(tax_rate, subtotal);
                                    total = calculateTotal(subtotal, tax, delivery_cost, piping_cost, standard_candle_cost, number_candle_cost, wish_card_cost);
                                }
                                break;
                            }
                        }
                    });
                    buildOrderSummaryTable(subtotal, delivery_cost, tax, coupon_amount, total, piping_cost, standard_candle_cost, number_candle_cost, wish_card_cost);
                })
            }
            
            else{
                $('.items_container').remove();
            }
        })
    }

    function buildOrderSummaryTable(subtotal, delivery_cost, tax, coupon, total, piping_cost, standard_candle_cost, number_candle_cost, wish_card_cost){
        $('#subtotal-amount').html("$" + subtotal.toFixed(2) + " CAD");
        $('#piping-cost').html("$" + piping_cost.toFixed(2) + " CAD");
        $('#standard-candle-cost').html("$" + standard_candle_cost.toFixed(2) + " CAD");
        $('#number-candle-cost').html("$" + number_candle_cost.toFixed(2) + " CAD");
        $('#wish-card-cost').html("$" + wish_card_cost.toFixed(2) + " CAD");
        $('#delivery-cost').html("$" + delivery_cost.toFixed(2) + " CAD");
        $('#tax').html("$" + tax.toFixed(2) + " CAD");
        if(coupon != 0){
            $('#coupon').css("color", "#fd7762");
        }
        $('#coupon').html("$" + "-" + coupon.toFixed(2) + " CAD");
        $('#total-amount').html("$" + total.toFixed(2) + " CAD");
    }

    function createHTMLElements(productName, product_type, row_id){
        var $tr = $("<tr></tr>").attr("id", row_id);
                            
        var $th = $("<th scope='row'></th>");
        var $th_div = $("<div class='p-2'></div>");
        var $th_div_img = $("<img class='img-fluid rounded shadow-sm'>").addClass(productName);
        
        var $th_div_sub_div = $("<div class='d-inline-block align-middle item-name'></div>");
        var $th_div_sub_div_h5 = $("<h5 class='mb-0'></h5>");
        
        $th_div_sub_div.append($th_div_sub_div_h5);
        $th_div.append($th_div_img, $th_div_sub_div);
        $th.append($th_div);
        
        var $td1 = $("<td class='align-middle price'></td>");
        $td1.prepend($td2_minus);

        var $td2 = $("<td class='align-middle quantity'></td>");
        var $td2_minus = $("<i class='fa fa-minus'></i>").addClass(productName);
        var $td2_plus = $("<i class='fa fa-plus'></i>").addClass(productName);
        var $td2_quantity = $("<span class='quantity-number'></span>")
        $td2.append($td2_minus, $td2_quantity, $td2_plus);
        
        var $td3 = $("<td class='align-middle text-center'></td>");
        var $td3_icon = $("<i class='fa fa-trash remove-item'></i>").addClass(productName);
        $td3.append($td3_icon);

        var $td4 = $("<td class='align-middle size'></td>");
        var $td2_size = $("<span class='size-number'></span>")
        $td4.append($td2_size);

        var $td5 = $("<td class='align-middle other text-center'></td>");
        var $td5_piping = $("<span class='other-notes'></span>")
        $td5.append($td5_piping);
        
        $tr.append($th, $td1, $td2, $td3, $td4, $td5);
        
        $("tbody").append($tr);

        var temp = document.querySelectorAll("." + productName);
        for (i = 0; i < temp.length; i++) {
            if(product_type == "b"){
                temp[i].src = "../assets/images/cakes/cakes-b/originals/" + productName + ".jpg";
            }
            else if(product_type == "d"){
                temp[i].src = "../assets/images/desserts/originals/" + productName + ".jpg";
            }
            else if(product_type == "m"){
                temp[i].src = "../assets/images/macarons/originals/" + productName + ".jpg";
            }
            else if(product_type == "assortment"){
                temp[i].src = "../assets/images/assortment-boxes/originals/" + productName + ".jpg";
            }
        }
    }

    // delivery is free for orders over $150 CAD
    function calculateDeliveryCost(subtotal){
        if(!delivery_selected){
            delivery_cost = 0;
            $("#delivery-cost").css("color", "#fd7762");
        }
        else{
            if (subtotal > 0 && subtotal < 150 ){
                delivery_cost = 5;
                $("#delivery-cost").css("color", "#000");
            }
            else{
                delivery_cost = 0;
                $("#delivery-cost").css("color", "#fd7762");
            }
        }
        
        return delivery_cost;
    }

    function calculateTax(taxRate, subtotal){
        return subtotal * taxRate / 100;
    }

    function calculateTotal(subtotal, tax, deliveryCost, pipingCost, standardCandleCost, numberCandleCost, wishCardCost){
        var total = subtotal + tax + deliveryCost + pipingCost + standardCandleCost + numberCandleCost + wishCardCost;
        
        return total;
    }
    
    function restoreProductName(name){
        product_name = "";
        product_name_elements = name.match(/([A-Z]?[^A-Z]*)/g).slice(0,-1);
        for (var i = 0; i < product_name_elements.length; i++){
            product_name =  product_name + " " + (product_name_elements[i].charAt(0).toUpperCase() + product_name_elements[i].slice(1));
        }
        return product_name;
    }

    function showMinimumQuantityWarningBottomSnackBar(name, minQTY){
        var x = document.getElementById("snackbar");
        x.innerHTML = "Minimum quantity for " + name + ' is ' + minQTY;
        x.style.background = "#333";
        x.className = "show";
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 5000);
    }

    function getMaxAdvanceNotice(advNoticeDays){
        advNoticeDays = advNoticeDays.map(x => +x);
        var max_advance_notice = Math.max(...advNoticeDays);
        return max_advance_notice;
    }

    // takes the user entered date & time and converts it into a jQuery comparable date & time
    function convertEnteredDateTime(userEnteredDateTime){
        var date_time_elements = userEnteredDateTime.split(" ");
        var date = date_time_elements[0]; 
        var selected_date = new Date(date);
        return selected_date;
    }

    // check if the address field is filled out
    function deliveryAddressIsProvided(userEnteredAddress){
        if (userEnteredAddress == ""){
            return false;
        }
        return true;
    }

    // check if the user entered a time or left it blank
    function dateIsProvided(date){
        if (date == ""){
            return false;
        }
        return true;
    }

    function timeIsProvided(time){
        if (time == ""){
            return false;
        }
        return true;
    }

    // checks if the user entered date & time is in the past, it must be in the future
    function dateTimeIsInTheFuture(userEnteredDate){
        var selected_date = convertEnteredDateTime(userEnteredDate);
        var current_date = new Date();
        if (selected_date > current_date){
            return true;
        }
        return false;
    }

    function dateTimeIsInAugust(userEnteredDateTime){
        var month = userEnteredDateTime[0] + userEnteredDateTime[1];
        if(month === "08"){
            return true;
        }
        return false;
    }

    // checks for advance notice for delivery to be satisifed 
    // if there are multiple product in the order, the maximum advance notice must be satisfied
    // for example, if one product requires 3 and another one 7, then 7 days advance notice must be given 
    function requiredAdvanceNoticeIsSatisifed(userEnteredDateTime){
        var selected_date = convertEnteredDateTime(userEnteredDateTime);
        var current_date = new Date();
        var max_days = getMaxAdvanceNotice(advance_notice_list);
        var max_advance_notice_required = new Date(current_date.setDate(current_date.getDate() + max_days));
        if(selected_date > max_advance_notice_required){
            return true;
        }
        return false;
    }

    // this is a customizable warning message pop up for different warning messages
    function showWarningSnackBar(warningText){
        var x = document.getElementById("snackbar");
            x.innerHTML = warningText;
            x.style.background = "#fd7762";
            x.className = "show";
            setTimeout(function(){ x.className = x.className.replace("show", ""); }, 5000);
    }

    // checks if either Pick Up or Delivery option is selected
    function pickupOrDeliveryIsSelected(){
        var radioValue = $("input[name='inlineDefaultRadiosExample']:checked").val();
        if(radioValue == "delivery" || radioValue == "pick-up"){
            return true;
        }
        else{
            return false;
        }
    }

    function validateMobilePhoneNumber(number){
        var phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        if (phoneRegex.test(number)) {
            var formattedPhoneNumber = number.replace(phoneRegex, "($1) $2-$3");
            $("#phone-number").val(formattedPhoneNumber);
            return true;
        } else {
            return false;
        }
    }

    function preventOrders(date){
        var futureDate = new Date(new Date().getFullYear(), 6, 26);
        if (convertEnteredDateTime(date) < futureDate){
            return true;
        }
        else{
            return false;
        }
    }

    function applyCoupon(code){
        var percentage_coupon = false;
        var coupon_ref = null;
        var coupon_match = false;
        if(code.includes("$")){
            coupon_ref = firebase.firestore().collection("Coupons").doc(email).collection("DollarCoupons");
        }
        else if(code.includes("%")){
            percentage_coupon = true;
            coupon_ref = firebase.firestore().collection("Coupons").doc(email).collection("PercentageCoupons");
        }
        else{
            $("#coupon-code-exact-warning").html(code + " is not a valid coupone code!!!")
        }

        if(coupon_ref != null){
            coupon_ref.get().then(function(querySnapshot){
                querySnapshot.forEach(function(doc){
                    if(doc.id === code){
                        coupon_match = true;
                        var coupon_info = doc.data();
                        if(coupon_info.used){
                            $("#coupon-code-exact-warning").html("Coupon " + code + " has expired");
                        }
                        else{
                            $("#coupon-code-exact-warning").html("Coupon is good for use");
                            $("#coupon-code-exact-warning").css("color", "green");
                            coupon_amount = coupon_info.value;
                            if(percentage_coupon){
                                coupon_amount = subtotal * coupon_amount / 100;
                            }
                            coupon_used = true;
                            subtotal = subtotal - coupon_amount;
                            total = calculateTotal(subtotal, tax, delivery_cost, piping_cost);
                            buildOrderSummaryTable(subtotal, delivery_cost, tax, coupon_amount, total, piping_cost);
                        }
                    }
                })
                if(!coupon_match){
                    $("#coupon-code-exact-warning").html("There is no such coupon: " + code);
                }
            })
        }
    }
    
    $("#button-addon3").click(function(){
        coupon_code = $("#coupon-code").val();
        applyCoupon(coupon_code);
    })

    function updateDatabase(userEmail, productName, productRowId, operationName){
        firebase.firestore().collection("Products").doc(productName).get().then(function(doc){
            var product_info = doc.data();
            var products_keys = [];
            var products_values = [];
            var new_qty = "";
            var warning_message_shown = false;
            firebase.firestore().collection("Cart").doc(userEmail).get().then(function(doc){
                products_keys = Object.keys(doc.data());
                products_values = Object.values(doc.data());
                for (var i = 0; i < products_keys.length; i++){
                    if(products_keys[i] == productName){
                        var pr_obj_list = doc.data()[productName];
                        for(var j = 0; j < pr_obj_list.length; j++){
                            if(pr_obj_list[j]["id"] == productRowId){
                                if(operationName == "add"){
                                    new_qty = (parseInt(pr_obj_list[j]["quantity"]) + parseInt(product_info.minQTY)).toString();
                                    pr_obj_list[j]["quantity"] = new_qty;
                                    pr_obj_list.splice(j, 1, pr_obj_list[j]);
                                    firebase.firestore().collection("Cart").doc(userEmail).update({[productName]: pr_obj_list});
                                }
                                if(operationName == "reduce"){
                                    new_qty = (parseInt(pr_obj_list[j]["quantity"]) - parseInt(product_info.minQTY));
                                    if(new_qty < parseInt(product_info.minQTY)){
                                        showMinimumQuantityWarningBottomSnackBar(product_info.name, product_info.minQTY);
                                        new_qty = parseInt(pr_obj_list[j]["quantity"]).toString();
                                        warning_message_shown = true;
                                    }
                                    else{
                                        new_qty = new_qty.toString();
                                    }
                                    pr_obj_list[j]["quantity"] = new_qty;
                                    pr_obj_list.splice(j, 1, pr_obj_list[j]);
                                    firebase.firestore().collection("Cart").doc(userEmail).update({[productName]: pr_obj_list});
                                }
                                
                                if(operationName == "remove"){
                                    pr_obj_list.splice(j, 1);
                                    if(pr_obj_list.length == 0){
                                        firebase.firestore().collection("Cart").doc(userEmail).update({[productName]: firebase.firestore.FieldValue.delete()});
                                    }
                                    else{
                                        firebase.firestore().collection("Cart").doc(userEmail).update({[productName]: pr_obj_list});
                                    }
                                }
                                
                                break;
                            }
                        }
                        break;
                    }
                }
                if(!warning_message_shown){
                    setInterval(function(){
                        window.location.reload(true);
                    }, 1000);
                }
            })
        })
    }

    $(document).on("click", ".fa-plus", function(){
        var class_names = $(this).attr('class').split(" ");
        var product_name = class_names[2];
        var row_id = $(this).parent().parent().attr("id");
        var operation = "add";
        
        updateDatabase(email, product_name, row_id, operation);
        
    })

    $(document).on("click", ".fa-minus", function(){
        var class_names = $(this).attr('class').split(" ");
        var product_name = class_names[2];
        var row_id = $(this).parent().parent().attr("id");
        var operation = "reduce";

        updateDatabase(email, product_name, row_id, operation);
    })

    $(document).on("click", ".remove-item", function(){
        var class_names = $(this).attr('class').split(" ");
        var product_name = class_names[3];
        var row_id = $(this).parent().parent().attr("id");
        var operation = "remove";

        updateDatabase(email, product_name, row_id, operation);
    })

    function sendDataToStripe(total){
        $.post(
            'stripe-pay.php',
            {data: total},
            function(response) {
            session_id = response;
            var stripe = Stripe('hidden');
            stripe.redirectToCheckout({
                sessionId: session_id,
                }).then(function (result) {
                    alert(result.error.message);
                });
            },
        );
    }

    function createOrder(total, subtotal, delivery_cost, delivery_selected, pickup_selected, date_time, phone_number, delivery_address, coupon_used, coupon_code){
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        firebase.auth().onAuthStateChanged(function(user){
            if(user){
                email = user.email.replace(/\./g, "+");
                var date = new Date();
                var date_day = date.getDate();
                var date_month = months[date.getMonth()];
                var date_year = date.getFullYear();
                var additional_notes = $("#notes").val();
                
                var order_info = {
                    userEmail: email,
                    couponUsed: coupon_used,
                    couponCode: coupon_code,
                    orderDay: date_day,
                    orderMonth: date_month,
                    orderYear: date_year,
                    additionalNotes: additional_notes,
                    subtotal: subtotal,
                    total: total,
                    deliveryCost: delivery_cost,
                    deliverySelected: delivery_selected,
                    pickupSelected: pickup_selected,
                    deliveryOrPickupDate: date_time,
                    phoneNumber: phone_number,
                    deliveryAddress: delivery_address,
                    paymentAccepted: false,
                 };

                 var user_cart_ref = firebase.firestore().collection('Cart').doc(email);
                 user_cart_ref.get().then(function(doc){
                    var products_in_order = doc.data();
                    var product_names = [];
                    $.each(products_in_order, function(){
                        for (var i = 0; i < this.length; i++){
                            product_names.push(this[i]["name"]);
                        }
                    })
                    var prices = [];
                    var products = {};
                    for (var i = 0; i < product_names.length; i++){
                        firebase.firestore().collection("Products").doc(product_names[i]).get().then(function(productDoc){
                            prices = productDoc.data()["price"];
                            var type = productDoc.data()["type"];
                            var keyName = productDoc.id;
                            var x = products_in_order[keyName];
                            for (var j = 0; j < x.length; j++){
                                if(type != "b"){
                                    x[j]["price"] = prices;
                                }
                                else{
                                    if(x[j]["size"] == "7 inch"){
                                        x[j]["price"] = prices[0];
                                    }
                                    else{
                                        x[j]["price"] = prices[1];
                                    }
                                }
                                
                                x[j]["type"] = type;
                                x[j]["keyName"] = keyName;
                                x[j]["name"] = productDoc.data()["name"];
                            }
                            products[keyName] = x;
                        })
                    }
                    order_info["products"] = products;
                    var overwrite_occured = false;
                    var user_orders = firebase.firestore().collection("Orders").doc(email).collection("UserOrders");
                    user_orders.get().then(function(querySnapshot){
                        if(querySnapshot.docs.length > 0){
                            querySnapshot.forEach(function(doc){
                                var order_id = doc.id;
                                var order = doc.data(); 
                                if(!order.paymentAccepted){
                                    order_info["orderID"] = order_id;
                                    firebase.firestore().collection("Orders").doc(email).collection("UserOrders").doc(order_id).set(order_info);
                                    overwrite_occured = true;
                                }
                            })
                            if(!overwrite_occured){
                                var auto_id = user_orders.doc().id;
                                order_info["orderID"] = auto_id;
                                user_orders.doc(auto_id).set(order_info);
                            }
                        }
                        else{
                            var auto_id = user_orders.doc().id;
                            order_info["orderID"] = auto_id;
                            user_orders.doc(auto_id).set(order_info);
                        }
                    })
                 })
            }
        })
    }

    function validateData(){
        var warning = "";
        var date_time = $("#date-time-format").val();
        var date = $("#date-input").val();
        var time = $("#time-select option:selected").val();
        var delivery_address = $("#pac-input").val();
        var phone_number = $("#phone-number").val();

        // if(orderContainsCake){
        //     warning = "Your order contains a cake. Unfortunately we're fully booked for cake orders" + "<br>" + "until the year of 2021. Please contact us if you have any questions" ;
        //     showWarningSnackBar(warning);
        //     return;
        // }

        if(subtotal == 0){
            warning = "Your cart is empty" + "<br>" + "Add a product to place an order" ;
            showWarningSnackBar(warning);
            return;
        }

        // if(!dateTimeIsAfterFullyBookedDate(date_time)){
        //     warning = "We're fully booked until October 20th" + "<br>" + "Please contact us if you've got any questions" ;
        //     showWarningSnackBar(warning);
        //     return;
        // }

        if(dateTimeIsInAugust(date)){
            warning = "Unfortunately we're not taking any orders for August at this moment" ;
            showWarningSnackBar(warning);
            return;
        }
        
        if(!pickupOrDeliveryIsSelected()){
            warning = "Please choose either Pick Up or Delivery";
            showWarningSnackBar(warning);
            return;
        }

        if(delivery_selected){
            if (!deliveryAddressIsProvided(delivery_address)){
                warning = "Please provide a delivery address ";
                showWarningSnackBar(warning);
                return;
            }
        }            

        if (!dateIsProvided(date)){
            warning = "Please enter a date";
            showWarningSnackBar(warning);
            return;
        }

        if (!timeIsProvided(time)){
            warning = "Please select a time range";
            showWarningSnackBar(warning);
            return;
        }

        // if(!dateTimeIsInTheFuture(date_time)){
        //     warning = "You entered a date in the past. Please enter a future date";
        //     showWarningSnackBar(warning);
        //     return;
        // }

        // if(!requiredAdvanceNoticeIsSatisifed(date_time)){
        //     var max_days = (getMaxAdvanceNotice(advance_notice_list)).toString();
        //     warning = "The advance notice required for this order is " + max_days +  " days. " + "<br>" + "Please contact us for details";
        //     showWarningSnackBar(warning);
        //     return;
        // }

        // if(preventOrders(date_time)){
        //     warning = "Because we are fully booked until July 25th included" + "<br>" + "we take orders only for days after July 25th" + "<br>" + "Sorry for inconvenience";
        //     showWarningSnackBar(warning);
        //     return;
        // }

        if(!validateMobilePhoneNumber(phone_number)){
            warning = "Please enter a valid 10 digit phone number";
            showWarningSnackBar(warning);
            return;
        }

        else{
            createOrder(total, subtotal, delivery_cost, delivery_selected, pickup_selected, date_time, phone_number, delivery_address, coupon_used, coupon_code);
            sendDataToStripe(total);
        } 
    }

    $('#proceed-to-checkout-btn').click(function(){
        validateData();
    })
    
    $('#pickup-option-dropdown').hide();
    $('#delivery-option-dropdown').hide();
    $("#date").hide();
    $("#time").hide();
    $("#phone-number-block").hide();

    $('input:radio[name="inlineDefaultRadiosExample"]').change(
        function(){
            $("#pickup-delivery").css("height", "300");
            if ($(this).is(':checked') && $(this).val() == 'pick-up'){
                delivery_selected = false;
                pickup_selected = !delivery_selected;

                delivery_cost = calculateDeliveryCost(subtotal);
                tax = calculateTax(tax_rate, subtotal)
                total = calculateTotal(subtotal, tax, delivery_cost, piping_cost, standard_candle_cost, number_candle_cost, wish_card_cost);
                buildOrderSummaryTable(subtotal, delivery_cost, tax, coupon_amount, total, piping_cost, standard_candle_cost, number_candle_cost, wish_card_cost);

                $("#pickup-option-dropdown").show(600);
                $("#date").show(600);
                $("#time").show(600);
                $("#phone-number-block").show(600);
                $('#delivery-option-dropdown').hide();
            }
            if ($(this).is(':checked') && $(this).val() == 'delivery'){
                delivery_selected = true;

                delivery_cost = calculateDeliveryCost(subtotal);
                tax = calculateTax(tax_rate, subtotal)
                total = calculateTotal(subtotal, tax, delivery_cost, piping_cost, standard_candle_cost, number_candle_cost, wish_card_cost);
                buildOrderSummaryTable(subtotal, delivery_cost, tax, coupon_amount, total, piping_cost, standard_candle_cost, number_candle_cost, wish_card_cost);

                pickup_selected = !delivery_selected;
                $("#delivery-option-dropdown").show(600);
                $("#date").show(600);
                $("#time").show(600);
                $("#phone-number-block").show(600);
                $('#pickup-option-dropdown').hide();
            }
        });
})           