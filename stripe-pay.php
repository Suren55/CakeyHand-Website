<?php 
    if ($_REQUEST["data"]){
        $total = round($_REQUEST["data"] * 100);
        require_once('/home3/knrmmhmy/public_html/cakeyhand/vendor/stripe/stripe-php/init.php');
        \Stripe\Stripe::setApiKey('hidden');

        $session = \Stripe\Checkout\Session::create([
          'payment_method_types' => ['card'],
          'line_items' => [[
              'name' => 'Your total is',
              'amount' => $total,
              'currency' => 'cad',
              'quantity' => 1,
          ]],
          'success_url' => 'https://cakeyhand.com/payment_successful.html',
          'cancel_url' => 'https://cakeyhand.com/payment_fail.html',
        ]); 

        $session_id = $session -> id;
        echo $session_id;
    }
?>