<?php
	$r = fgets(fopen("flights.json","r"));

	$decoded = json_decode($r,true);

	if($_POST["departing"])
		$decoded["ResultAvailabilityPlusValuationsShort"]["fechaIdaConsultada"] = $_POST["departing"];

	if($_POST["returning"])
		$decoded["ResultAvailabilityPlusValuationsShort"]["fechaVueltaConsultada"] = $_POST["returning"];

	echo json_encode($decoded);

	sleep(1);
?>