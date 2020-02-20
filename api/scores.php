<?php
include('connection_string.php');
$manager = new MongoDB\Driver\Manager($CONNECTION_STRING);
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    $query = new MongoDB\Driver\Query(array(), array('limit' => 10, 'sort' => array('score' => -1), 'projection' => array('_id' => 0, 'date' => 0)));

    $cursor = $manager->executeQuery('coopdefender.scores', $query);

    header("Access-Control-Allow-Origin: *");
    header('Content-Type: application/json');
    echo(json_encode($cursor->toArray()));
} else if ($method == 'POST') {
    $score = $_GET['score'];
	$name = $_GET['name'];
	$level = $_GET['level'];
	$kills = $_GET['kills'];

    if (empty($score) || empty($name) || empty($level)) {
		header("Access-Control-Allow-Origin: *");
		http_response_code(400);
		die();
	} else {
		$date = substr(date('c', time()), 0, 19) . 'Z';
		
		$bulk = new MongoDB\Driver\BulkWrite;

		$doc = [
			'score' => (int)$score, 
			'name' => $name,
			'level' => (int)$level,
			'date' => array('$date' => $date),
			'kills' => (int)$kills
		];

		$bulk->insert($doc);

		$result = $manager->executeBulkWrite('coopdefender.scores', $bulk);
		
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