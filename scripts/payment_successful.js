firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        email = user.email.replace(/\./g, "+");
        user_orders_ref = firebase.firestore().collection("Orders").doc(email).collection("UserOrders");
        user_orders_ref.get().then(function(querySnaphsot){
            querySnaphsot.forEach(function(doc){
                var order_id = doc.id;
                var order_info = doc.data();
                if(!order_info.paymentAccepted){
                    order_info.paymentAccepted = true;
                    order_info.couponUsed = true;
                    firebase.firestore().collection("Orders").doc(email).collection("UserOrders").doc(order_id).set(order_info);
                    // empty the shopping cart
                    firebase.firestore().collection("Cart").doc(email).delete().then(function(){
                        console.log("Cart is empty");
                    })
                }
            })
        })
    } 
    else{
    // No user is signed in.
    }
})

function myFunction() {
    return "Write something clever here...";
}
