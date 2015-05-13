<?php
	$r = fgets(fopen("flights.json","r"));

	$decoded = json_decode($r,true);

	if($_POST["departing"])
		$decoded["ResultAvailabilityPlusValuationsShort"]["fechaIdaConsultada"] = $_POST["departing"];

	echo json_encode($decoded);

	sleep(1);
?>