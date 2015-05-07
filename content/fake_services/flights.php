<?php

	$r = fgets(fopen("flights.json","r"));

	$departing = $_POST	['departing'];

	$decoded = json_decode($r,true);

	$decoded["ResultAvailabilityPlusValuations"] = array('fechaIdaConsultada'=>$departing) + $decoded["ResultAvailabilityPlusValuations"];
	
	echo json_encode($decoded);

	// sleep(1);

?>