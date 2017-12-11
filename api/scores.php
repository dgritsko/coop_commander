<?php
include('api_key.php');

// http://docs.mlab.com/data-api/

$method = $_SERVER['REQUEST_METHOD'];

$url = 'https://api.mlab.com/api/1/databases/coopdefender/collections/scores?apiKey=' . $API_KEY;

if ($method == 'GET') {
	$url = $url . '&f={"_id":0,"date":0}&s={"score":-1}&l=10';
		
	// Initiate curl
	$ch = curl_init();
	// Disable SSL verification
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	// Will return the response, if false it print the response
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);
	$result=curl_exec($ch);
	curl_close($ch);

	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');

	echo $result;
} else if ($method == 'POST') {
	$score = $_GET['score'];
	$name = $_GET['name'];
	$level = $_GET['level'];
		
	if (empty($score) || empty($name) || empty($level)) {
		header("Access-Control-Allow-Origin: *");
		http_response_code(400);
		die();
	} else {
		$date = substr(date('c', time()), 0, 19) . 'Z';
		
		$request = array(
			'score' => (int)$score, 
			'name' => $name,
			'level' => (int)$level,
			'date' => array('$date' => $date)
			);
		
		$json = json_encode($request);
		
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch, CURLOPT_POSTFIELDS, $json);  
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);                                                                      
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
			'Content-Type: application/json',                                                                                
			'Content-Length: ' . strlen($json))                                                                       
		); 
		
		curl_setopt($ch, CURLOPT_URL,$url);
		$result=curl_exec($ch);
		curl_close($ch);
		
		header("Access-Control-Allow-Origin: *");
		header('Content-Type: application/json');
		echo json_encode(array('result' => 'OK'));
	}
} else {
	header("Access-Control-Allow-Origin: *");
	http_response_code(405);
	die();
}

?>
