$(document).ready(function(){
    var items_list;
    var items_keys_list; 
    var items_count;
    var quantity_indicator;
    var quantities = [];
    var item_prices;
    var email = localStorage.getItem("Email");
    var y = [];

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            email = user.email.replace(/\./g, "+");
            retrieveOrders(email);
        } else {
        // No user is signed in.
        }
    })

    function retrieveOrders(email){
        var  at_least_one_order_exists = false;
        var user_orders_ref = firebase.firestore().collection("Orders").doc(email).collection("UserOrders");
        user_orders_ref.get().then(function(querySnapshot){
            if(querySnapshot.docs.length > 0){
                querySnapshot.forEach(function(doc){
                    var order_id = doc.id;
                    var order_info = doc.data();
                    if(order_info.paymentAccepted){
                        at_least_one_order_exists = true;
                        createHTMLElementsForEachOrder(order_id, order_info);
                    }
                });
                if(!at_least_one_order_exists){
                    $("#wrapper-for-inner-content").css("border", "none");
                    $("#wrapper-for-inner-content").html("You have no orders placed in the past!")
                }
            }
            else{
                $("#wrapper-for-inner-content").css("border", "none");
                $("#wrapper-for-inner-content").html("You have no orders placed in the past!")
            }
        })
    }

    function createHTMLElementsForEachOrder(order_id, order_info){
        order_products = order_info.products;

        var order_id = order_id;
        var day = order_info.orderDay;
        var month = order_info.orderMonth;
        var year = order_info.orderYear;
        var total = order_info.total;

        var $outer_row = $("<div class='row outer-row'></div>");
        var $outer_row_col = $("<div class='col outer-col'></div>");
        var $inner_wrapper = $("<div class='wrapper-for-inner-content'></div>");
        
        var $inner_row3 = $("<div class='row order-id-row'></div>");
        var $inner_row3_col = $("<div class='col '></div>");

        var $inner_row1 = $("<div class='row order-date-row'></div>");
        var $inner_row1_col = $("<div class='col '></div>");

        var $inner_row2 = $("<div class='row order-total-row'></div>");
        var $inner_row2_col = $("<div class='col'></div>");

        var $inner_row4 = $("<div class='row location-row'></div>");
        var $inner_row4_col = $("<div class='col'></div>");

        var $inner_row5 = $("<div class='row dateAndTime-row'></div>");
        var $inner_row5_col = $("<div class='col'></div>");
        
        $inner_row3.append($inner_row3_col.append("Order Id:  " + "<strong>" +  order_id + "</strong>"));
        $inner_row1.append($inner_row1_col.append("Order was placed on:  " + "<strong>" +  day + " " + month + ", " + year + "</strong>"));
        if(order_info.pickupSelected){
            $inner_row4.append($inner_row4_col.append("Pick up Location: " +  "<strong>" + "82 Thorburn rd" + "</strong>"));
            $inner_row5.append($inner_row5_col.append("Pick up Date & Time:  " + "<strong>" +  order_info.deliveryOrPickupDate + "</strong>"));
        }
        else{
            $inner_row4.append($inner_row4_col.append("Delivery Address: " +  "<strong>" + order_info.deliveryAddress + "</strong>"));
            $inner_row5.append($inner_row5_col.append("Scheduled Delivery Date & Time:  " + "<strong>" +  order_info.deliveryOrPickupDate + "</strong>"));
        }
        $inner_row2.append($inner_row2_col.append("Order Total is:  " + "<strong>" + "$" + total.toFixed(2) + " CAD" + "</strong>"));       
        
        $outer_row_col.append($inner_row3, $inner_row1, $inner_row2, $inner_row4, $inner_row5);
        $outer_row.append($outer_row_col);

        $.each(order_products, function(){    
            for (var i = 0; i < this.length; i++){
                var dollar_amount = this[i]["price"].slice(0, -2);;
                var cents_amount = this[i]["price"].slice(-2);;
                console.log(this);
                console.log(this[i]["price"]);                
    
                var $inner_row3 = $("<div class='row'></div>");
                var $inner_row3_col1 = $("<div class='col col-md-1'></div>");
                var $inner_row3_col1_img = $("<img>").addClass(this[i]["keyName"]);
    
                var $inner_row3_col2 = $("<div class='col col-md-6'></div>");
                var $inner_row3_col2_p1 = $("<h3 class='name mb-6'></h3>").append(this[i]["name"]);
                var $inner_row3_col2_p2 = $("<p class='price mb-1'></p>").append("<strong> Price: </strong>" + "$" + dollar_amount + cents_amount.sup() + " CAD");
                var $inner_row3_col2_p3 = $("<p class='quantity mb-1'></p>").append("<strong> Quantity: </strong>" + this[i]["quantity"]);
                var $inner_row3_col2_p4;
                if(this[i]["type"] == "b"){
                    $inner_row3_col2_p4 = $("<p class='size mb-1'></p>").append("<strong> Size: </strong>" + this[i]["size"]);
                    if(this[i]["decorationSelected"]){
                        $inner_row3_col2_p5 = $("<p class='piping mb-1'></p>").append("<strong> Piping: </strong>" + this[i]["decorationText"]);
                    }
                    else{
                        $inner_row3_col2_p5 = $("<p class='piping mb-1'></p>").append("<strong> Piping </strong>: None");
                    }
                }
                else{
                    $inner_row3_col2_p4 = $("<p class='size mb-1'></p>").append("<strong> Size: </strong>" + "n/a");
                    $inner_row3_col2_p5 = $("<p class='piping mb-1'></p>").append("<strong> Piping: </strong>" + "n/a");
                }
                
                $inner_row3_col1.append($inner_row3_col1_img);
                $inner_row3_col2.append($inner_row3_col2_p1, $inner_row3_col2_p2, $inner_row3_col2_p3, $inner_row3_col2_p4, $inner_row3_col2_p5);
        
                $inner_row3.append($inner_row3_col1, $inner_row3_col2);
                $inner_wrapper.append($inner_row3);
                $outer_row_col.append($inner_wrapper);
    
                $outer_row.append($outer_row_col);
    
                $("#order-jumbotron .container").append($outer_row);


                var img_elements = document.querySelectorAll("." + this[i]["keyName"]);
                for (var j = 0; j < img_elements.length; j++){
                    if(this[i]["type"] == "b"){
                        img_elements[j].src = "../assets/images/cakes/cakes-b/220x250/" + this[i]["keyName"] + ".jpg";                    
                    }
                    else if(this[i]["type"] == "d"){
                        img_elements[j].src = "../assets/images/desserts/220x250/" + this[i]["keyName"] + ".jpg";
                    }
                    else if(this[i]["type"] == "m"){
                        img_elements[j].src = "../assets/images/macarons/220x250/" + this[i]["keyName"] + ".jpg";
                    }
                    else if(this[i]["type"] == "assortment"){
                        img_elements[j].src = "../assets/images/assortment-boxes/220x250/" + this[i]["keyName"] + ".jpg";
                    }
                } 
                
                
            }
        })
    }

    $(document).on("click", ".not-functional", function(){
        alert("This functionality is not supported at this moment. They will be available soon")
    })
})     