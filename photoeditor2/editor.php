<?php
$imageData = $_POST['image'];
$fp = fopen('test.png', w);
fwrite($fp,base64_decode($imageData));
fclose($fp);
$response = array(
    "text" => "完了しました。",
);
echo json_encode($response);
?>