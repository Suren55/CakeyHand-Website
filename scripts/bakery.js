$(document).ready(function(){
     
    var items_list = [];
    var url = window.location.href;
    var page_title = "Our Product";

    if (url.toLowerCase().indexOf("cakes") >= 0){
        product_category_type = "b";
        page_title = "Our Cakes";
        $("#our-products-title").html(page_title.toUpperCase());
    }
    if (url.toLowerCase().indexOf("desserts") >= 0){
        product_category_type = "d";
        page_title = "Our Desserts";
        $("#our-products-title").html(page_title.toUpperCase());
    }
    if (url.toLowerCase().indexOf("macaron") >= 0){
        product_category_type = "m";
        page_title = "Our Macarons";
        $("#our-products-title").html(page_title.toUpperCase());
    }
    if (url.toLowerCase().indexOf("assortment") >= 0){
        product_category_type = "assortment";
        page_title = "Our Assortment Boxes";
        $("#our-products-title").html(page_title.toUpperCase());
    }

    firebase.firestore().collection("Products").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            var product_name = doc.id;
            var doc_data = doc.data();
            var product_type = doc_data["type"];

            if(product_type == product_category_type){
                items_list.push(doc_data);
                createHTMLElements(product_name, product_type);
                writeInformationForEveryProdcut(items_list);    
            }
        });
    });

    function createHTMLElements(productName, productType){
        var product_name = productName;
        var product_type = productType;
        var $card_div = $("<div class='card' data-toggle='popover'></div>").addClass(product_type);
                    
        var $card_card_body_link_img = $("<a class='item-link'></a>").addClass(product_name);
            $card_card_body_link_img.attr("href", "javascript:void(0);");
            $card_card_body_link_img.attr("onClick", "javascript:window.location.href='../single.html';");
        
        var $card_div_img = $("<img class='card-img-top'>").attr("id", product_name);

        var $card_card_body = $("<div class='card-body'></div>");
        var $card_card_body_h5 = $("<h5 class='card-title text-center'></h5>").addClass(product_name);
        var $card_card_body_link = $("<a class='item-name'></a>").addClass(product_name);
            $card_card_body_link.attr("href", "javascript:void(0);");
            $card_card_body_link.attr("onClick", "javascript:window.location.href='../single.html';");
        var $card_card_body_para = $("<p class='card-text text-center cake-price'></p>");

        var $heart_icon = $("<i id='add-to-favorites-icon' class='fa fa-heart-o heart-icon'></i>").addClass(product_name);

        var $add_to_cart_btn = $("<button class='btn btn-outline-danger view-details-btn'></button>").addClass(product_name);
            $add_to_cart_btn.attr("onClick", "javascript:window.location.href='../single.html';");

        $card_card_body_link_img.append($card_div_img);
        $card_card_body_h5.html($card_card_body_link);
        $card_card_body.append($card_card_body_h5, $card_card_body_para);

        $card_div.append($card_card_body_link_img, $card_card_body, $heart_icon, $add_to_cart_btn);

        $('.card-deck').append($card_div);
        
        if(product_type == "b"){
            document.querySelector("#" + product_name).src = "../../assets/images/cakes/cakes-b/220x250/" + product_name + ".jpg";
        }
        else if(product_type == "d"){
            document.querySelector("#" + product_name).src = "../../assets/images/desserts/220x250/" + product_name + ".jpg";
        }
        else if(product_type == "m"){
            document.querySelector("#" + product_name).src = "../../assets/images/macarons/220x250/" + product_name + ".jpg";
        }
        else if(product_type == "assortment"){
            document.querySelector("#" + product_name).src = "../../assets/images/assortment-boxes/220x250/" + product_name + ".jpg";
        }
    }

    function writeInformationForEveryProdcut(){
        var item_names = $('.card-body h5 a');
        var item_prices = $('.card-body .cake-price');
        var add_to_cart_btns = $('.card .view-details-btn');

        var dollar_amount;
        var cents_amount;
    

        for (var i = 0; i < items_list.length; i++ ){
            item_names.eq(i).html(items_list[i].name);
            if(items_list[i].type == "b"){
                dollar_amount = items_list[i].price[0].slice(0, -2);
                cents_amount = items_list[i].price[0].slice(-2);
            }
            else{
                dollar_amount = items_list[i].price.slice(0, -2);
                cents_amount = items_list[i].price.slice(-2);
            }
            item_prices.eq(i).html("$" + dollar_amount + cents_amount.sup() +  "<span class='currency'> CAD</span>");
            add_to_cart_btns.eq(i).html('View Details');
        }
    }

    // save the clicked item's ID/name to use in singe.html page
    $(document).on('click', ".item-name", function(event){
        var class_names = $(this).attr('class').split(" ");
        var product_name = class_names[1];
        localStorage.setItem('ItemID', product_name);
    })

    $(document).on('click', ".view-details-btn", function(event){
        var class_names = $(this).attr('class').split(" ");
        var product_name = class_names[3];
        localStorage.setItem('ItemID', product_name);
    })
})

