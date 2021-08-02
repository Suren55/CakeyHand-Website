var selected_cake_size = "7 inch";
var decorationSelected = false;
var decorationText = "";
var standardCandleIsSelected = false;
var numberCandleIsSelected = false;
var numberCandleNumber = "";
var wishCardIsSelected = false;
var wishCardText = "";
var macaronFlavors = {};

$(document).ready(function(){

    $('#text-piping-description-block').hide();
    $('#number-candle-description-block').hide();
    $('#wish-card-description-block').hide();
    $("#chooe-macaron-flavor-block").hide();

    var product_ID = localStorage.getItem('ItemID');
    var product_ref = firebase.firestore().collection('Products').doc(product_ID);
    var product;
    var product_type;
    var price;
    
    product_ref.get().then(function(doc){
        product = doc.data();
        product_type = product.type;       
        selected_cake_size = getSelectedCakeSize();
        if(product_type == "b"){
            price = setPriceBasedOnSize(selected_cake_size);
        }
        else{
            price = product.price;
        }
        
        setProductPrice(price);
        setProductName(product.name);
        setProductDescription(product.description);
        setProductMinQty(product.minQTY);
        setProductAdvanceNotice(product.advanceNotice + " days");
        setProductIngredients(product.ingredients);

        $("#add-button").addClass(product_ID);
        $(".heart-icon").addClass(product_ID);

        setProductImages(product_type, product_ID);

        // display size selection and text piping options for cakes only
        if(product_type != "b"){
            $(".show-for-cakes-only").css("display", "none");
            if(product_type == "m"){
                $("#chooe-macaron-flavor-block").show();
                populateMacaronFlavors(product.flavors);
                populateMacaronQuantity(product.maxFlavor);
            }
        }

        // change page title
        $(document).prop('title', product.name);
    })

    function populateMacaronFlavors(flavors){
        var $choose_flavor_div = $("<div id='choose-macaron-flavors'></div>");
        var $choose_flavor_title = $("<strong>Choose Macaron Flavors:</strong>");
        $choose_flavor_div.append($choose_flavor_title);
        $(".input-group").append($choose_flavor_div);
        
        for(var i = 0; i < flavors.length; i++){
            var $flavor_checkbox_div = $("<div class='input-group-addon1'></div>");

            var $flavor_name_span = $("<div class='input-group-addon2'></div>");
            var $flavor_name_label = $("<label for='tbox'></label>").html(flavors[i]);
            $flavor_name_span.append($flavor_name_label);

            var $flavor_quantity_select = $("<select class='select-quantity' class='form-control'></select>");

            var $block = $("<div class='block'></div>");
            $block.append($flavor_checkbox_div, $flavor_name_span, $flavor_quantity_select);

            
            $(".input-group").append($block);
        }
    }

    function populateMacaronQuantity(max_number_of_flavors){
        for(var i = 0; i <= max_number_of_flavors; i++){
            var option = new Option(i.toString(), i);
            $(option).html(i.toString());
            $(".select-quantity").append(option);
        }
    }

    function getSelectedFlavors(){
        var selects = $(".select-quantity");
        var labels = $(".input-group-addon2 label");
        for(var i = 0; i < selects.length; i++){
            console.log(selects[i]);
            if(parseInt($(selects[i]).find(":selected").text()) > 0){
                macaronFlavors[($(labels[i]).html())] = $(selects[i]).val();
            }
        }

        return macaronFlavors;
    }

    function flavorsQuantitySelectedByUser(){
       var quantity = 0 
       var selects = $(".select-quantity");
       selects.each(function(){ 
           quantity +=  +($(this).val()); 
            }
        );

       return quantity;
    }



    function getSelectedCakeSize(){
        var selected_option = $('#select-size-block option:selected').val();
        return selected_option;
    }

    function setPriceBasedOnSize(size){
        if(size == "7 inch"){
            price = product.price[0];
        }
        else if(size == "9 inch"){
            price = product.price[1];
        }

        return price
    }

    function setProductPrice(price){
        var dollar_amount = price.slice(0, -2);
        var cents_amount = price.slice(-2);
        $('#item-price').html("$" + dollar_amount + cents_amount.sup() + "<span class='currency'> CAD</span>");
    }

    function setProductName(name){
        $('#item-name').html(name);
    }

    function setProductDescription(description){
        $('#item-description').html(description);
    }

    function setProductMinQty(minQty){
        $('#item-min-qty').append("  " + minQty);
    }

    function setProductAdvanceNotice(days){
        $('#item-advance-notice').append("  " + days);
    }

    function setProductIngredients(ingredients){
        if(ingredients.length == 0){
            $('#collapseOne').append("Not available at the moment");
        }
        else{
            for (var i = 0; i < ingredients.length; i++){
                $('#collapseOne').append(i + 1 + ". " + ingredients[i] + "</br>");
            }
        }
    }

    function setProductImages(type, id){
        if(type == "b"){
            document.querySelector("#item-image img" ).src = "../assets/images/cakes/cakes-b/originals/" + id + ".jpg";
        }
        else if(type == "d"){
            document.querySelector("#item-image img" ).src = "../assets/images/desserts/originals/" + id + ".jpg";
        }
        else if(type == "m"){
            document.querySelector("#item-image img" ).src = "../assets/images/macarons/originals/" + id + ".jpg";
        }
        else if(type == "assortment"){
            document.querySelector("#item-image img" ).src = "../assets/images/assortment-boxes/originals/" + id + ".jpg";
        }
    }

    $( "#select-size").change(function(){
        selected_cake_size = getSelectedCakeSize();
        price = setPriceBasedOnSize(selected_cake_size);
        setProductPrice(price);
      }); 

    $(".add-to-cart-btn").click(function(){
        if(product_type == "b"){
            if($("#text-piping-checkbox").is(":checked")){
                decorationSelected = true;
                decorationText = $("#text-piping-description").val();
            }
            else{
                decorationSelected = false;
                decorationText = "";
            }
        }
        
        if(product_type == "m"){
            var quantity = flavorsQuantitySelectedByUser();
            if(quantity < product.maxFlavor){
                var amount_of_macarons_to_be_added = product.maxFlavor - quantity;
                alert("You chose only " + quantity + " macarons. Please add " + amount_of_macarons_to_be_added + " more.");
                return false;
            }
            else if(quantity > product.maxFlavor){
                var amount_of_macarons_to_be_removed = quantity - product.maxFlavor;
                alert("You chose more than " + product.maxFlavor + " macarons. Please remove " + amount_of_macarons_to_be_removed + " macaron(s)");
                return false;
            }
            else{
                getSelectedFlavors();
            }
        }

        if($("#standard-candle-checkbox").is(":checked")){
            standardCandleIsSelected = true;
        }
        else{
            standardCandleIsSelected = false;
        }

        if($("#number-candles-checkbox").is(":checked")){
            numberCandleIsSelected = true;
            numberCandleNumber = $("#number-candle-number").val();
        }
        else{
            numberCandleIsSelected = false;
            numberCandleNumber = "";
        }

        if($("#wish-card-checkbox").is(":checked")){
            wishCardIsSelected = true;
            wishCardText = $("#wish-card-text").val();
        }
        else{
            wishCardIsSelected = false;
            wishCardText = "";
        }
    })
      
    $('#text-piping-checkbox').change(function(){
        if(this.checked){
            $("#text-piping-description-block").show();
        }
        else{
            $("#text-piping-description-block").hide();
        }
    });

    $('#number-candles-checkbox').change(function(){
        if(this.checked){
            $("#number-candle-description-block").show();
        }
        else{
            $("#number-candle-description-block").hide();
        }
    });

    $('#wish-card-checkbox').change(function(){
        if(this.checked){
            $("#wish-card-description-block").show();
        }
        else{
            $("#wish-card-description-block").hide();
        }
    });
})

